const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/taxes
 * @desc    Get all taxes
 * @access  Private
 */
router.get('/', authenticate, hasPermission('tax', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM taxes ORDER BY created_at DESC');
    client.release();
    
    res.json(result.rows.map(tax => ({
      id: tax.id,
      name: tax.name,
      description: tax.description,
      rate: parseFloat(tax.rate),
      taxType: tax.tax_type,
      isActive: tax.is_active,
      applicableCategories: tax.applicable_categories,
      createdAt: tax.created_at
    })));
  } catch (error) {
    console.error('Error fetching taxes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/taxes/:id
 * @desc    Get tax by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('tax', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM taxes WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tax not found' });
    }
    
    const tax = result.rows[0];
    
    res.json({
      id: tax.id,
      name: tax.name,
      description: tax.description,
      rate: parseFloat(tax.rate),
      taxType: tax.tax_type,
      isActive: tax.is_active,
      applicableCategories: tax.applicable_categories,
      createdAt: tax.created_at
    });
  } catch (error) {
    console.error('Error fetching tax:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/taxes
 * @desc    Create a new tax
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('tax', 'edit'),
    body('name').notEmpty().withMessage('Tax name is required'),
    body('rate').isNumeric().withMessage('Tax rate must be a number'),
    body('taxType').isIn(['full_bill', 'category']).withMessage('Invalid tax type')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      rate,
      taxType,
      isActive = true,
      applicableCategories = []
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Generate tax ID
      const taxId = req.body.id || `TAX-${Date.now()}`;
      
      // Insert tax
      const result = await client.query(
        `INSERT INTO taxes (
          id, name, description, rate, tax_type, is_active, applicable_categories
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          taxId,
          name,
          description,
          rate,
          taxType,
          isActive,
          JSON.stringify(applicableCategories)
        ]
      );
      
      client.release();
      
      const tax = result.rows[0];
      
      res.status(201).json({
        id: tax.id,
        name: tax.name,
        description: tax.description,
        rate: parseFloat(tax.rate),
        taxType: tax.tax_type,
        isActive: tax.is_active,
        applicableCategories: tax.applicable_categories,
        createdAt: tax.created_at
      });
    } catch (error) {
      console.error('Error creating tax:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/taxes/:id
 * @desc    Update a tax
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('tax', 'edit'),
    param('id').notEmpty().withMessage('Tax ID is required'),
    body('name').notEmpty().withMessage('Tax name is required'),
    body('rate').isNumeric().withMessage('Tax rate must be a number'),
    body('taxType').isIn(['full_bill', 'category']).withMessage('Invalid tax type')
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
      description,
      rate,
      taxType,
      isActive,
      applicableCategories = []
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if tax exists
      const checkResult = await client.query(
        'SELECT * FROM taxes WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Tax not found' });
      }
      
      // Update tax
      const result = await client.query(
        `UPDATE taxes
         SET name = $1, description = $2, rate = $3, tax_type = $4,
             is_active = $5, applicable_categories = $6
         WHERE id = $7
         RETURNING *`,
        [
          name,
          description,
          rate,
          taxType,
          isActive,
          JSON.stringify(applicableCategories),
          id
        ]
      );
      
      client.release();
      
      const tax = result.rows[0];
      
      res.json({
        id: tax.id,
        name: tax.name,
        description: tax.description,
        rate: parseFloat(tax.rate),
        taxType: tax.tax_type,
        isActive: tax.is_active,
        applicableCategories: tax.applicable_categories,
        createdAt: tax.created_at
      });
    } catch (error) {
      console.error('Error updating tax:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/taxes/:id
 * @desc    Delete a tax
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('tax', 'delete'),
    param('id').notEmpty().withMessage('Tax ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if tax exists
      const checkResult = await client.query(
        'SELECT * FROM taxes WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Tax not found' });
      }
      
      // Delete tax
      await client.query('DELETE FROM taxes WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Tax deleted successfully' });
    } catch (error) {
      console.error('Error deleting tax:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;