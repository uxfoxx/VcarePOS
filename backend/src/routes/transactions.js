const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Sales transaction management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: TXN-123456
 *         customerName:
 *           type: string
 *           example: John Doe
 *         customerPhone:
 *           type: string
 *           example: '+94112223344'
 *         customerEmail:
 *           type: string
 *           example: johndoe@example.com
 *         customerAddress:
 *           type: string
 *           example: '123 Main St, City'
 *         cashier:
 *           type: string
 *           example: Jane Smith
 *         salesperson:
 *           type: string
 *           example: Alex Brown
 *         salespersonId:
 *           type: string
 *           example: USER-123456
 *         paymentMethod:
 *           type: string
 *           example: cash
 *         subtotal:
 *           type: number
 *           example: 1000.00
 *         categoryTaxTotal:
 *           type: number
 *           example: 50.00
 *         fullBillTaxTotal:
 *           type: number
 *           example: 25.00
 *         totalTax:
 *           type: number
 *           example: 75.00
 *         discount:
 *           type: number
 *           example: 100.00
 *         total:
 *           type: number
 *           example: 975.00
 *         appliedCoupon:
 *           type: string
 *           example: SAVE10
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *           example: completed
 *         timestamp:
 *           type: string
 *           format: date-time
 *         appliedTaxes:
 *           type: object
 *         items:
 *           type: array
 *           items:
 *             type: object
 *         refunds:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /transactions/{id}/status:
 *   put:
 *     summary: Update transaction status
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, refunded, partially-refunded]
 *                 example: refunded
 *     responses:
 *       200:
 *         description: Transaction status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /transactions/{id}/refund:
 *   post:
 *     summary: Process a refund for a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundType:
 *                 type: string
 *                 enum: [full, partial, items]
 *                 example: full
 *               refundAmount:
 *                 type: number
 *                 example: 100.00
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *               refundMethod:
 *                 type: string
 *                 example: cash
 *               refundItems:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Refund processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Transaction not found
 */

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Private
 */
router.get('/', authenticate, hasPermission('transactions', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get all transactions
    const transactionsResult = await client.query(`
      SELECT * FROM transactions
      ORDER BY timestamp DESC
    `);
    
    // Get all transaction items
    const itemsResult = await client.query(`
      SELECT ti.*, p.image
      FROM transaction_items ti
      LEFT JOIN products p ON ti.product_id = p.id
    `);
    
    // Get all refunds
    const refundsResult = await client.query(`
      SELECT r.*, ri.*
      FROM refunds r
      LEFT JOIN refund_items ri ON r.id = ri.refund_id
    `);
    
    client.release();
    
    // Map items and refunds to their respective transactions
    const transactions = transactionsResult.rows.map(transaction => {
      const items = itemsResult.rows
        .filter(item => item.transaction_id === transaction.id)
        .map(item => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: parseFloat(item.product_price),
            barcode: item.product_barcode,
            category: item.product_category,
            image: item.image
          },
          quantity: item.quantity,
          selectedSize: item.selected_size,
          selectedVariant: item.selected_variant,
          addons: item.addons
        }));
      
      const refunds = refundsResult.rows
        .filter(refund => refund.transaction_id === transaction.id)
        .reduce((acc, refund) => {
          // Find existing refund or create new one
          const existingRefund = acc.find(r => r.id === refund.id);
          if (existingRefund) {
            // Add refund item to existing refund
            if (refund.refund_id) {
              existingRefund.refundItems.push({
                productId: refund.product_id,
                productName: refund.product_name,
                refundQuantity: refund.refund_quantity,
                refundAmount: parseFloat(refund.refund_amount)
              });
            }
            return acc;
          } else {
            // Create new refund
            return [...acc, {
              id: refund.id,
              transactionId: refund.transaction_id,
              refundType: refund.refund_type,
              refundAmount: parseFloat(refund.refund_amount),
              reason: refund.reason,
              notes: refund.notes,
              refundMethod: refund.refund_method,
              processedBy: refund.processed_by,
              status: refund.status,
              timestamp: refund.timestamp,
              refundItems: refund.refund_id ? [{
                productId: refund.product_id,
                productName: refund.product_name,
                refundQuantity: refund.refund_quantity,
                refundAmount: parseFloat(refund.refund_amount)
              }] : []
            }];
          }
        }, []);
      
      return {
        id: transaction.id,
        customerName: transaction.customer_name,
        customerPhone: transaction.customer_phone,
        customerEmail: transaction.customer_email,
        customerAddress: transaction.customer_address,
        cashier: transaction.cashier,
        salesperson: transaction.salesperson,
        salespersonId: transaction.salesperson_id,
        paymentMethod: transaction.payment_method,
        subtotal: parseFloat(transaction.subtotal),
        categoryTaxTotal: parseFloat(transaction.category_tax_total),
        fullBillTaxTotal: parseFloat(transaction.full_bill_tax_total),
        totalTax: parseFloat(transaction.total_tax),
        discount: parseFloat(transaction.discount),
        total: parseFloat(transaction.total),
        appliedCoupon: transaction.applied_coupon,
        notes: transaction.notes,
        status: transaction.status,
        timestamp: transaction.timestamp,
        appliedTaxes: transaction.applied_taxes,
        items,
        refunds
      };
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('transactions', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    // Get transaction
    const transactionResult = await client.query(`
      SELECT * FROM transactions WHERE id = $1
    `, [id]);
    
    if (transactionResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const transaction = transactionResult.rows[0];
    
    // Get transaction items
    const itemsResult = await client.query(`
      SELECT ti.*, p.image
      FROM transaction_items ti
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = $1
    `, [id]);
    
    // Get refunds
    const refundsResult = await client.query(`
      SELECT r.*, ri.*
      FROM refunds r
      LEFT JOIN refund_items ri ON r.id = ri.refund_id
      WHERE r.transaction_id = $1
    `, [id]);
    
    client.release();
    
    // Format items
    const items = itemsResult.rows.map(item => ({
      product: {
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.product_price),
        barcode: item.product_barcode,
        category: item.product_category,
        image: item.image
      },
      quantity: item.quantity,
      selectedSize: item.selected_size,
      selectedVariant: item.selected_variant,
      addons: item.addons
    }));
    
    // Format refunds
    const refunds = refundsResult.rows.reduce((acc, refund) => {
      // Find existing refund or create new one
      const existingRefund = acc.find(r => r.id === refund.id);
      if (existingRefund) {
        // Add refund item to existing refund
        if (refund.refund_id) {
          existingRefund.refundItems.push({
            productId: refund.product_id,
            productName: refund.product_name,
            refundQuantity: refund.refund_quantity,
            refundAmount: parseFloat(refund.refund_amount)
          });
        }
        return acc;
      } else {
        // Create new refund
        return [...acc, {
          id: refund.id,
          transactionId: refund.transaction_id,
          refundType: refund.refund_type,
          refundAmount: parseFloat(refund.refund_amount),
          reason: refund.reason,
          notes: refund.notes,
          refundMethod: refund.refund_method,
          processedBy: refund.processed_by,
          status: refund.status,
          timestamp: refund.timestamp,
          refundItems: refund.refund_id ? [{
            productId: refund.product_id,
            productName: refund.product_name,
            refundQuantity: refund.refund_quantity,
            refundAmount: parseFloat(refund.refund_amount)
          }] : []
        }];
      }
    }, []);
    
    // Format response
    const formattedTransaction = {
      id: transaction.id,
      customerName: transaction.customer_name,
      customerPhone: transaction.customer_phone,
      customerEmail: transaction.customer_email,
      customerAddress: transaction.customer_address,
      cashier: transaction.cashier,
      salesperson: transaction.salesperson,
      salespersonId: transaction.salesperson_id,
      paymentMethod: transaction.payment_method,
      subtotal: parseFloat(transaction.subtotal),
      categoryTaxTotal: parseFloat(transaction.category_tax_total),
      fullBillTaxTotal: parseFloat(transaction.full_bill_tax_total),
      totalTax: parseFloat(transaction.total_tax),
      discount: parseFloat(transaction.discount),
      total: parseFloat(transaction.total),
      appliedCoupon: transaction.applied_coupon,
      notes: transaction.notes,
      status: transaction.status,
      timestamp: transaction.timestamp,
      appliedTaxes: transaction.applied_taxes,
      items,
      refunds
    };
    
    res.json(formattedTransaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('transactions', 'edit'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product.id').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('total').isNumeric().withMessage('Total must be a number')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        items,
        subtotal,
        categoryTaxTotal = 0,
        fullBillTaxTotal = 0,
        totalTax = 0,
        discount = 0,
        total,
        paymentMethod,
        customerName = 'Walk-in Customer',
        customerPhone,
        customerEmail,
        customerAddress,
        appliedCoupon,
        notes,
        status = 'completed',
        appliedTaxes,
        cashier,
        salesperson,
        salespersonId
      } = req.body;
      
      // Generate transaction ID
      const transactionId = req.body.id || `TXN-${Date.now()}`;
      
      // Insert transaction
      const transactionResult = await client.query(`
        INSERT INTO transactions (
          id, customer_name, customer_phone, customer_email, customer_address,
          cashier, salesperson, salesperson_id, payment_method, subtotal,
          category_tax_total, full_bill_tax_total, total_tax, discount, total,
          applied_coupon, notes, status, applied_taxes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `, [
        transactionId,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        cashier || `${req.user.firstName} ${req.user.lastName}`,
        salesperson,
        salespersonId,
        paymentMethod,
        subtotal,
        categoryTaxTotal,
        fullBillTaxTotal,
        totalTax,
        discount,
        total,
        appliedCoupon,
        notes,
        status,
        JSON.stringify(appliedTaxes)
      ]);
      
      // Insert transaction items
      for (const item of items) {
        await client.query(`
          INSERT INTO transaction_items (
            transaction_id, product_id, product_name, product_price,
            product_barcode, product_category, quantity, selected_size,
            selected_variant, addons
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          transactionId,
          item.product.id,
          item.product.name,
          item.product.price,
          item.product.barcode,
          item.product.category,
          item.quantity,
          item.selectedSize,
          item.selectedVariant,
          JSON.stringify(item.product.addons || null)
        ]);
        
        // Update product stock
        if (item.selectedSize) {
          // Update size stock
          await client.query(`
            UPDATE product_sizes
            SET stock = stock - $1
            WHERE product_id = $2 AND name = $3
          `, [
            item.quantity,
            item.product.id,
            item.selectedSize
          ]);
          
          // Update total product stock (sum of all sizes)
          await client.query(`
            UPDATE products
            SET stock = (
              SELECT COALESCE(SUM(stock), 0)
              FROM product_sizes
              WHERE product_id = $1
            )
            WHERE id = $1
          `, [item.product.id]);
        } else {
          // Update regular product stock
          await client.query(`
            UPDATE products
            SET stock = GREATEST(0, stock - $1)
            WHERE id = $2
          `, [
            item.quantity,
            item.product.id
          ]);
        }
        
        // Update raw material stock for the selected color
        if (item.selectedColorId) {
          const rawMaterialsResult = await client.query(`
            SELECT prm.raw_material_id, prm.quantity
            FROM product_raw_materials prm
            WHERE prm.product_color_id = $1
          `, [item.selectedColorId]);
          
          for (const material of rawMaterialsResult.rows) {
            await client.query(`
              UPDATE raw_materials
              SET stock_quantity = GREATEST(0, stock_quantity - $1)
              WHERE id = $2
            `, [
              parseFloat(material.quantity) * item.quantity,
              material.raw_material_id
            ]);
          }
        }
        
        // Update raw material stock for addons
        if (item.product.addons && item.product.addons.length > 0) {
          for (const addon of item.product.addons) {
            await client.query(`
              UPDATE raw_materials
              SET stock_quantity = GREATEST(0, stock_quantity - $1)
              WHERE id = $2
            `, [
              parseFloat(addon.quantity) * item.quantity,
              addon.id
            ]);
          }
        }
      }
      
      // Update coupon usage if applied
      if (appliedCoupon) {
        await client.query(`
          UPDATE coupons
          SET used_count = used_count + 1
          WHERE code = $1
        `, [appliedCoupon]);
      }
      
      await client.query('COMMIT');
      
      // Return the created transaction
      const transaction = transactionResult.rows[0];
      
      res.status(201).json({
        id: transaction.id,
        customerName: transaction.customer_name,
        customerPhone: transaction.customer_phone,
        customerEmail: transaction.customer_email,
        customerAddress: transaction.customer_address,
        cashier: transaction.cashier,
        salesperson: transaction.salesperson,
        salespersonId: transaction.salesperson_id,
        paymentMethod: transaction.payment_method,
        subtotal: parseFloat(transaction.subtotal),
        categoryTaxTotal: parseFloat(transaction.category_tax_total),
        fullBillTaxTotal: parseFloat(transaction.full_bill_tax_total),
        totalTax: parseFloat(transaction.total_tax),
        discount: parseFloat(transaction.discount),
        total: parseFloat(transaction.total),
        appliedCoupon: transaction.applied_coupon,
        notes: transaction.notes,
        status: transaction.status,
        timestamp: transaction.timestamp,
        appliedTaxes: transaction.applied_taxes,
        items
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      client.release();
    }
  }
);

/**
 * @route   PUT /api/transactions/:id/status
 * @desc    Update transaction status
 * @access  Private
 */
router.put(
  '/:id/status',
  [
    authenticate,
    hasPermission('transactions', 'edit'),
    param('id').notEmpty().withMessage('Transaction ID is required'),
    body('status').isIn(['completed', 'refunded', 'partially-refunded']).withMessage('Invalid status')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    try {
      const client = await pool.connect();
      
      // Check if transaction exists
      const checkResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      // Update transaction status
      const result = await client.query(
        'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      client.release();
      
      const transaction = result.rows[0];
      
      res.json({
        id: transaction.id,
        status: transaction.status
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/transactions/:id/refund
 * @desc    Process a refund for a transaction
 * @access  Private
 */
router.post(
  '/:id/refund',
  [
    authenticate,
    hasPermission('transactions', 'edit'),
    param('id').notEmpty().withMessage('Transaction ID is required'),
    body('refundType').isIn(['full', 'partial', 'items']).withMessage('Invalid refund type'),
    body('refundAmount').isNumeric().withMessage('Refund amount must be a number'),
    body('reason').notEmpty().withMessage('Refund reason is required'),
    body('refundMethod').notEmpty().withMessage('Refund method is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      refundType,
      refundAmount,
      reason,
      notes,
      refundMethod,
      refundItems
    } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if transaction exists
      const transactionResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );
      
      if (transactionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const transaction = transactionResult.rows[0];
      
      // Check if refund amount is valid
      if (parseFloat(refundAmount) > parseFloat(transaction.total)) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ 
          message: 'Refund amount cannot exceed transaction total' 
        });
      }
      
      // Generate refund ID
      const refundId = `REFUND-${Date.now()}`;
      
      // Insert refund
      const refundResult = await client.query(`
        INSERT INTO refunds (
          id, transaction_id, refund_type, refund_amount, reason,
          notes, refund_method, processed_by, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        refundId,
        id,
        refundType,
        refundAmount,
        reason,
        notes,
        refundMethod,
        `${req.user.firstName} ${req.user.lastName}`,
        'processed'
      ]);
      
      // Insert refund items if applicable
      if (refundType === 'items' && refundItems && refundItems.length > 0) {
        for (const item of refundItems) {
          await client.query(`
            INSERT INTO refund_items (
              selected_color_id, addons
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            refundId,
            item.product.id,
            item.product.name,
            item.selectedColorId,
            item.refundAmount
          ]);
          
          // Restore product stock
          if (item.selectedColorId && item.selectedSize) {
            // Update specific color/size stock
            await client.query(`
              UPDATE product_sizes 
              SET stock = stock + $1
              WHERE product_color_id = $2 AND name = $3
            `, [
              item.refundQuantity,
              item.selectedColorId,
              item.selectedSize
            ]);
            
            // Update total product stock (sum of all sizes across all colors)
            await client.query(`
              UPDATE products
              SET stock = (
                SELECT COALESCE(SUM(ps.stock), 0)
                FROM product_sizes ps
                JOIN product_colors pc ON ps.product_color_id = pc.id
                WHERE pc.product_id = $1
              )
              WHERE id = $1
            `, [item.product.id]);
          } else {
            // Restore regular product stock
            await client.query(`
              UPDATE products
              SET stock = stock + $1
              WHERE id = $2
            `, [
              item.refundQuantity,
              item.product.id
            ]);
          }
        }
      } else if (refundType === 'full') {
        // For full refunds, restore all product stock
        const itemsResult = await client.query(`
          SELECT * FROM transaction_items WHERE transaction_id = $1
        `, [id]);
        
        for (const item of itemsResult.rows) {
          if (item.selected_size) {
            // Restore size stock
            await client.query(`
              UPDATE product_sizes 
              SET stock = stock + $1
              WHERE product_color_id = $2 AND name = $3
            `, [
              item.quantity,
              item.selected_color_id,
              item.selected_size
            ]);
            
            // Update total product stock (sum of all sizes across all colors)
            await client.query(`
              UPDATE products
              SET stock = (
                SELECT COALESCE(SUM(ps.stock), 0)
                FROM product_sizes ps
                JOIN product_colors pc ON ps.product_color_id = pc.id
                WHERE pc.product_id = $1
                WHERE pc.product_id = $1
              )
              WHERE id = $1
            `, [item.product_id]);
          } else {
            // Restore regular product stock
            await client.query(`
              UPDATE products
              SET stock = stock + $1
              WHERE id = $2
            `, [
              item.quantity,
              item.product_id
            ]);
          }
        }
      }
      
      // Update transaction status
      const newStatus = refundType === 'full' ? 'refunded' : 'partially-refunded';
      await client.query(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        [newStatus, id]
      );
      
      await client.query('COMMIT');
      
      // Return the created refund
      const refund = refundResult.rows[0];
      
      res.status(201).json({
        id: refund.id,
        transactionId: refund.transaction_id,
        refundType: refund.refund_type,
        refundAmount: parseFloat(refund.refund_amount),
        reason: refund.reason,
        notes: refund.notes,
        refundMethod: refund.refund_method,
        processedBy: refund.processed_by,
        status: refund.status,
        timestamp: refund.timestamp,
        refundItems: refundItems || []
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing refund:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;