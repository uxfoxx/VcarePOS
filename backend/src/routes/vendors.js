const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vendor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: VENDOR-123456
 *         name:
 *           type: string
 *           example: ABC Suppliers
 *         category:
 *           type: string
 *           example: Wood
 *         email:
 *           type: string
 *           example: vendor@example.com
 *         phone:
 *           type: string
 *           example: '+94112223344'
 *         address:
 *           type: string
 *           example: '123 Main St, City'
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       201:
 *         description: Vendor created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get a vendor by ID
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found
 *   put:
 *     summary: Update a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       200:
 *         description: Vendor updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Vendor not found
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vendor deleted successfully
 *       400:
 *         description: Cannot delete vendor (used in purchase orders)
 *       404:
 *         description: Vendor not found
 */

/**
 * @route   GET /api/vendors
 * @desc    Get all vendors
 * @access  Private
 */
router.get('/', authenticate, hasPermission('purchase-orders', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM vendors ORDER BY name');
    client.release();
    
    res.json(result.rows.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      isActive: vendor.is_active,
      createdAt: vendor.created_at
    })));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/vendors/:id
 * @desc    Get vendor by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('purchase-orders', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM vendors WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    
    res.json({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      isActive: vendor.is_active,
      createdAt: vendor.created_at
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/vendors
 * @desc    Create a new vendor
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('purchase-orders', 'edit'),
    body('name').notEmpty().withMessage('Vendor name is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category,
      email,
      phone,
      address,
      isActive = true
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Generate vendor ID
      const vendorId = req.body.id || `V${String(Date.now()).substring(7)}`;
      
      // Insert vendor
      const result = await client.query(
        `INSERT INTO vendors (
          id, name, category, email, phone, address, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          vendorId,
          name,
          category,
          email,
          phone,
          address,
          isActive
        ]
      );
      
      client.release();
      
      const vendor = result.rows[0];
      
      res.status(201).json({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        isActive: vendor.is_active,
        createdAt: vendor.created_at
      });
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/vendors/:id
 * @desc    Update a vendor
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('purchase-orders', 'edit'),
    param('id').notEmpty().withMessage('Vendor ID is required'),
    body('name').notEmpty().withMessage('Vendor name is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      category,
      email,
      phone,
      address,
      isActive
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if vendor exists
      const checkResult = await client.query(
        'SELECT * FROM vendors WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Vendor not found' });
      }
      
      // Update vendor
      const result = await client.query(
        `UPDATE vendors
         SET name = $1, category = $2, email = $3, phone = $4,
             address = $5, is_active = $6
         WHERE id = $7
         RETURNING *`,
        [
          name,
          category,
          email,
          phone,
          address,
          isActive,
          id
        ]
      );
      
      client.release();
      
      const vendor = result.rows[0];
      
      res.json({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        isActive: vendor.is_active,
        createdAt: vendor.created_at
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/vendors/:id
 * @desc    Delete a vendor
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('purchase-orders', 'delete'),
    param('id').notEmpty().withMessage('Vendor ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if vendor exists
      const checkResult = await client.query(
        'SELECT * FROM vendors WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Vendor not found' });
      }
      
      // Check if vendor is being used in purchase orders
      const ordersResult = await client.query(
        'SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = $1',
        [id]
      );
      
      if (parseInt(ordersResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({ 
          message: 'Cannot delete vendor. It is being used in purchase orders.' 
        });
      }
      
      // Delete vendor
      await client.query('DELETE FROM vendors WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;