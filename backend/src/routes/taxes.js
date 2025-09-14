const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');
const { handleRouteError } = require('../utils/loggerUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Taxes
 *   description: Tax management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tax:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: TAX-123456
 *         name:
 *           type: string
 *           example: VAT
 *         description:
 *           type: string
 *           example: Value Added Tax
 *         rate:
 *           type: number
 *           example: 15
 *         taxType:
 *           type: string
 *           enum: [full_bill, category]
 *           example: full_bill
 *         isActive:
 *           type: boolean
 *           example: true
 *         applicableCategories:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Furniture", "Electronics"]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /taxes:
 *   get:
 *     summary: Get all taxes
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of taxes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tax'
 *   post:
 *     summary: Create a new tax
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tax'
 *     responses:
 *       201:
 *         description: Tax created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tax'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /taxes/{id}:
 *   get:
 *     summary: Get a tax by ID
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax ID
 *     responses:
 *       200:
 *         description: Tax found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tax'
 *       404:
 *         description: Tax not found
 *   put:
 *     summary: Update a tax
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tax'
 *     responses:
 *       200:
 *         description: Tax updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tax'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Tax not found
 *   delete:
 *     summary: Delete a tax
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax ID
 *     responses:
 *       200:
 *         description: Tax deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tax deleted successfully
 *       404:
 *         description: Tax not found
 */

/**
 * @swagger
 * /taxes/bulk-status:
 *   patch:
 *     summary: Bulk enable/disable taxes
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [enable, disable]
 *                 example: enable
 *               taxIds:
 *                 oneOf:
 *                   - type: string
 *                     enum: [all]
 *                     example: all
 *                   - type: array
 *                     items:
 *                       type: string
 *                     example: ["TAX-123", "TAX-456"]
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "5 taxes enabled successfully"
 *                 affectedCount:
 *                   type: number
 *                   example: 5
 *                 updatedTaxes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tax'
 *       400:
 *         description: Validation error
 *       404:
 *         description: No taxes found to update
 */

/**
 * @swagger
 * /taxes/bulk:
 *   delete:
 *     summary: Bulk delete taxes
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taxIds
 *             properties:
 *               taxIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["TAX-123", "TAX-456"]
 *     responses:
 *       200:
 *         description: Bulk deletion completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "3 taxes deleted successfully"
 *                 deletedCount:
 *                   type: number
 *                   example: 3
 *       400:
 *         description: Validation error
 *       404:
 *         description: No taxes found to delete
 */

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
    handleRouteError(error, req, res, 'Taxes - Fetching taxes:');
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
    handleRouteError(error, req, res, 'Taxes - Fetching tax:');
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
      handleRouteError(error, req, res, 'Taxes - Creating tax:');
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
      handleRouteError(error, req, res, 'Taxes - Updating tax:');
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
      handleRouteError(error, req, res, 'Taxes - Deleting tax:');
    }
  }
);

/**
 * @route   PATCH /api/taxes/bulk-status
 * @desc    Bulk enable/disable taxes
 * @access  Private
 */
router.patch(
  '/bulk-status',
  [
    authenticate,
    hasPermission('tax', 'edit'),
    body('action').isIn(['enable', 'disable']).withMessage('Action must be either "enable" or "disable"'),
    body('taxIds').custom((value) => {
      if (value === 'all') return true;
      if (Array.isArray(value) && value.length > 0) return true;
      throw new Error('taxIds must be "all" or a non-empty array of tax IDs');
    })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, taxIds } = req.body;
    const isActive = action === 'enable';

    try {
      const client = await pool.connect();
      
      let query;
      let params;
      
      if (taxIds === 'all') {
        // Update all taxes
        query = 'UPDATE taxes SET is_active = $1 RETURNING *';
        params = [isActive];
      } else {
        // Update specific taxes
        const placeholders = taxIds.map((_, index) => `$${index + 2}`).join(',');
        query = `UPDATE taxes SET is_active = $1 WHERE id IN (${placeholders}) RETURNING *`;
        params = [isActive, ...taxIds];
      }
      
      const result = await client.query(query, params);
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'No taxes found to update',
          affectedCount: 0
        });
      }
      
      const updatedTaxes = result.rows.map(tax => ({
        id: tax.id,
        name: tax.name,
        description: tax.description,
        rate: parseFloat(tax.rate),
        taxType: tax.tax_type,
        isActive: tax.is_active,
        applicableCategories: tax.applicable_categories,
        createdAt: tax.created_at
      }));
      
      res.json({
        message: `${result.rows.length} taxes ${action}d successfully`,
        affectedCount: result.rows.length,
        updatedTaxes
      });
    } catch (error) {
      handleRouteError(error, req, res, `Taxes - Bulk ${action}:`, { action, taxIds });
    }
  }
);

/**
 * @route   DELETE /api/taxes/bulk
 * @desc    Bulk delete taxes
 * @access  Private
 */
router.delete(
  '/bulk',
  [
    authenticate,
    hasPermission('tax', 'delete'),
    body('taxIds').isArray({ min: 1 }).withMessage('taxIds must be a non-empty array of tax IDs')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taxIds } = req.body;

    try {
      const client = await pool.connect();
      
      // First check if all taxes exist
      const checkPlaceholders = taxIds.map((_, index) => `$${index + 1}`).join(',');
      const checkQuery = `SELECT id FROM taxes WHERE id IN (${checkPlaceholders})`;
      const checkResult = await client.query(checkQuery, taxIds);
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ 
          message: 'No taxes found to delete',
          deletedCount: 0
        });
      }
      
      // Delete the taxes
      const deletePlaceholders = taxIds.map((_, index) => `$${index + 1}`).join(',');
      const deleteQuery = `DELETE FROM taxes WHERE id IN (${deletePlaceholders})`;
      const deleteResult = await client.query(deleteQuery, taxIds);
      
      client.release();
      
      const deletedCount = deleteResult.rowCount;
      const notFoundCount = taxIds.length - deletedCount;
      
      let message = `${deletedCount} taxes deleted successfully`;
      if (notFoundCount > 0) {
        message += ` (${notFoundCount} taxes were not found)`;
      }
      
      res.json({
        message,
        deletedCount,
        requestedCount: taxIds.length,
        notFoundCount
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Taxes - Bulk delete:', { taxIds });
    }
  }
);

module.exports = router;