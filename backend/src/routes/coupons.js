const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons
 * @access  Private
 */
router.get('/', authenticate, hasPermission('coupons', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM coupons ORDER BY created_at DESC');
    client.release();
    
    res.json(result.rows.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountPercent: parseFloat(coupon.discount_percent),
      discountAmount: parseFloat(coupon.discount_amount),
      minimumAmount: parseFloat(coupon.minimum_amount),
      maxDiscount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
      usageLimit: coupon.usage_limit,
      usedCount: coupon.used_count,
      validFrom: coupon.valid_from,
      validTo: coupon.valid_to,
      isActive: coupon.is_active,
      applicableCategories: coupon.applicable_categories,
      createdAt: coupon.created_at
    })));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/coupons/:id
 * @desc    Get coupon by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('coupons', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM coupons WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    const coupon = result.rows[0];
    
    res.json({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountPercent: parseFloat(coupon.discount_percent),
      discountAmount: parseFloat(coupon.discount_amount),
      minimumAmount: parseFloat(coupon.minimum_amount),
      maxDiscount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
      usageLimit: coupon.usage_limit,
      usedCount: coupon.used_count,
      validFrom: coupon.valid_from,
      validTo: coupon.valid_to,
      isActive: coupon.is_active,
      applicableCategories: coupon.applicable_categories,
      createdAt: coupon.created_at
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/coupons
 * @desc    Create a new coupon
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('coupons', 'edit'),
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('validFrom').notEmpty().withMessage('Valid from date is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      code,
      description,
      discountType,
      discountPercent = 0,
      discountAmount = 0,
      minimumAmount = 0,
      maxDiscount,
      usageLimit,
      validFrom,
      validTo,
      isActive = true,
      applicableCategories = []
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if coupon code already exists
      const checkResult = await client.query(
        'SELECT * FROM coupons WHERE code = $1',
        [code]
      );
      
      if (checkResult.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      
      // Generate coupon ID
      const couponId = req.body.id || `COUPON-${Date.now()}`;
      
      // Insert coupon
      const result = await client.query(
        `INSERT INTO coupons (
          id, code, description, discount_type, discount_percent,
          discount_amount, minimum_amount, max_discount, usage_limit,
          valid_from, valid_to, is_active, applicable_categories
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          couponId,
          code.toUpperCase(),
          description,
          discountType,
          discountPercent,
          discountAmount,
          minimumAmount,
          maxDiscount,
          usageLimit,
          new Date(validFrom),
          validTo ? new Date(validTo) : null,
          isActive,
          JSON.stringify(applicableCategories)
        ]
      );
      
      client.release();
      
      const coupon = result.rows[0];
      
      res.status(201).json({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountPercent: parseFloat(coupon.discount_percent),
        discountAmount: parseFloat(coupon.discount_amount),
        minimumAmount: parseFloat(coupon.minimum_amount),
        maxDiscount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
        usageLimit: coupon.usage_limit,
        usedCount: coupon.used_count,
        validFrom: coupon.valid_from,
        validTo: coupon.valid_to,
        isActive: coupon.is_active,
        applicableCategories: coupon.applicable_categories,
        createdAt: coupon.created_at
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update a coupon
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('coupons', 'edit'),
    param('id').notEmpty().withMessage('Coupon ID is required'),
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('validFrom').notEmpty().withMessage('Valid from date is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountPercent = 0,
      discountAmount = 0,
      minimumAmount = 0,
      maxDiscount,
      usageLimit,
      usedCount,
      validFrom,
      validTo,
      isActive,
      applicableCategories = []
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if coupon exists
      const checkResult = await client.query(
        'SELECT * FROM coupons WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      // Check if coupon code already exists for another coupon
      const codeCheckResult = await client.query(
        'SELECT * FROM coupons WHERE code = $1 AND id != $2',
        [code, id]
      );
      
      if (codeCheckResult.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      
      // Update coupon
      const result = await client.query(
        `UPDATE coupons
         SET code = $1, description = $2, discount_type = $3,
             discount_percent = $4, discount_amount = $5, minimum_amount = $6,
             max_discount = $7, usage_limit = $8, used_count = $9,
             valid_from = $10, valid_to = $11, is_active = $12,
             applicable_categories = $13
         WHERE id = $14
         RETURNING *`,
        [
          code.toUpperCase(),
          description,
          discountType,
          discountPercent,
          discountAmount,
          minimumAmount,
          maxDiscount,
          usageLimit,
          usedCount,
          new Date(validFrom),
          validTo ? new Date(validTo) : null,
          isActive,
          JSON.stringify(applicableCategories),
          id
        ]
      );
      
      client.release();
      
      const coupon = result.rows[0];
      
      res.json({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountPercent: parseFloat(coupon.discount_percent),
        discountAmount: parseFloat(coupon.discount_amount),
        minimumAmount: parseFloat(coupon.minimum_amount),
        maxDiscount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
        usageLimit: coupon.usage_limit,
        usedCount: coupon.used_count,
        validFrom: coupon.valid_from,
        validTo: coupon.valid_to,
        isActive: coupon.is_active,
        applicableCategories: coupon.applicable_categories,
        createdAt: coupon.created_at
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete a coupon
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('coupons', 'delete'),
    param('id').notEmpty().withMessage('Coupon ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if coupon exists
      const checkResult = await client.query(
        'SELECT * FROM coupons WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      // Delete coupon
      await client.query('DELETE FROM coupons WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/coupons/validate/:code
 * @desc    Validate a coupon code
 * @access  Private
 */
router.get(
  '/validate/:code',
  [
    authenticate,
    param('code').notEmpty().withMessage('Coupon code is required')
  ],
  async (req, res) => {
    const { code } = req.params;
    const { amount } = req.query;
    
    try {
      const client = await pool.connect();
      
      // Get coupon
      const result = await client.query(
        'SELECT * FROM coupons WHERE code = $1',
        [code.toUpperCase()]
      );
      
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          valid: false, 
          message: 'Coupon not found' 
        });
      }
      
      const coupon = result.rows[0];
      
      // Check if coupon is active
      if (!coupon.is_active) {
        return res.json({ 
          valid: false, 
          message: 'Coupon is inactive' 
        });
      }
      
      // Check if coupon is expired
      const now = new Date();
      if (coupon.valid_to && new Date(coupon.valid_to) < now) {
        return res.json({ 
          valid: false, 
          message: 'Coupon has expired' 
        });
      }
      
      // Check if coupon has reached usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return res.json({ 
          valid: false, 
          message: 'Coupon usage limit reached' 
        });
      }
      
      // Check if minimum amount is met
      if (amount && parseFloat(coupon.minimum_amount) > 0 && parseFloat(amount) < parseFloat(coupon.minimum_amount)) {
        return res.json({ 
          valid: false, 
          message: `Minimum order amount is $${parseFloat(coupon.minimum_amount).toFixed(2)}` 
        });
      }
      
      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = amount ? (parseFloat(amount) * parseFloat(coupon.discount_percent) / 100) : parseFloat(coupon.discount_percent);
        
        // Apply max discount if set
        if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
          discount = parseFloat(coupon.max_discount);
        }
      } else {
        discount = parseFloat(coupon.discount_amount);
      }
      
      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountPercent: parseFloat(coupon.discount_percent),
          discountAmount: parseFloat(coupon.discount_amount),
          minimumAmount: parseFloat(coupon.minimum_amount),
          maxDiscount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
          usageLimit: coupon.usage_limit,
          usedCount: coupon.used_count,
          validFrom: coupon.valid_from,
          validTo: coupon.valid_to,
          isActive: coupon.is_active,
          applicableCategories: coupon.applicable_categories
        },
        discount,
        message: 'Coupon is valid'
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;