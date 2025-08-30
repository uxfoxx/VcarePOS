const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');
const { handleRouteError } = require('../utils/loggerUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: E-commerce customer management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: CUST-123456
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john.doe@email.com
 *         phone:
 *           type: string
 *           example: +94771234567
 *         address:
 *           type: string
 *           example: 123 Main Street
 *         city:
 *           type: string
 *           example: Colombo
 *         postalCode:
 *           type: string
 *           example: 00100
 *         isActive:
 *           type: boolean
 *           example: true
 *         emailVerified:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 * @access  Private (Admin/Manager only)
 */
router.get('/', authenticate, hasPermission('user-management', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id, first_name, last_name, email, phone, address, city, postal_code,
        is_active, email_verified, created_at, updated_at
      FROM customers 
      ORDER BY created_at DESC
    `);
    client.release();
    
    res.json(result.rows.map(customer => ({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postal_code,
      isActive: customer.is_active,
      emailVerified: customer.email_verified,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    })));
  } catch (error) {
    handleRouteError(error, req, res, 'Customers - Fetching customers');
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private (Admin/Manager only)
 */
router.get('/:id', authenticate, hasPermission('user-management', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    // Get customer details
    const customerResult = await client.query(`
      SELECT 
        id, first_name, last_name, email, phone, address, city, postal_code,
        is_active, email_verified, created_at, updated_at
      FROM customers 
      WHERE id = $1
    `, [id]);
    
    if (customerResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get customer's order history
    const ordersResult = await client.query(`
      SELECT 
        id, total, delivery_charge, delivery_area, status, payment_method,
        timestamp, applied_coupon
      FROM transactions 
      WHERE customer_id = $1 AND source = 'ecommerce'
      ORDER BY timestamp DESC
    `, [id]);
    
    client.release();
    
    const customer = customerResult.rows[0];
    const orders = ordersResult.rows.map(order => ({
      id: order.id,
      total: parseFloat(order.total),
      deliveryCharge: parseFloat(order.delivery_charge),
      deliveryArea: order.delivery_area,
      status: order.status,
      paymentMethod: order.payment_method,
      timestamp: order.timestamp,
      appliedCoupon: order.applied_coupon
    }));
    
    res.json({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postal_code,
      isActive: customer.is_active,
      emailVerified: customer.email_verified,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      orders,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0)
    });
  } catch (error) {
    handleRouteError(error, req, res, 'Customers - Fetching customer');
  }
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Private (Admin/Manager only)
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('user-management', 'edit'),
    param('id').notEmpty().withMessage('Customer ID is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      isActive
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if customer exists
      const checkResult = await client.query(
        'SELECT * FROM customers WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Check if email already exists for another customer
      const emailCheck = await client.query(
        'SELECT * FROM customers WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Email already in use by another customer' });
      }
      
      // Update customer
      const result = await client.query(
        `UPDATE customers SET
          first_name = $1, last_name = $2, email = $3, phone = $4,
          address = $5, city = $6, postal_code = $7, is_active = $8,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING id, first_name, last_name, email, phone, address, city, postal_code, is_active, created_at, updated_at`,
        [firstName, lastName, email, phone, address, city, postalCode, isActive, id]
      );
      
      client.release();
      
      const customer = result.rows[0];
      
      res.json({
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postal_code,
        isActive: customer.is_active,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Customers - Updating customer');
    }
  }
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('user-management', 'delete'),
    param('id').notEmpty().withMessage('Customer ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if customer exists
      const checkResult = await client.query(
        'SELECT * FROM customers WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Check if customer has orders
      const ordersResult = await client.query(
        'SELECT COUNT(*) FROM transactions WHERE customer_id = $1',
        [id]
      );
      
      if (parseInt(ordersResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({ 
          message: 'Cannot delete customer with existing orders. Consider deactivating instead.' 
        });
      }
      
      // Delete customer
      await client.query('DELETE FROM customers WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      handleRouteError(error, req, res, 'Customers - Deleting customer');
    }
  }
);

module.exports = router;