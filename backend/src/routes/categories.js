const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: CAT-123456
 *         name:
 *           type: string
 *           example: Furniture
 *         description:
 *           type: string
 *           example: All types of furniture
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Cannot delete category (used by products)
 *       404:
 *         description: Category not found
 */

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM categories ORDER BY name');
    client.release();
    
    res.json(result.rows.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.is_active,
      createdAt: category.created_at
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM categories WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = result.rows[0];
    
    res.json({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.is_active,
      createdAt: category.created_at
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('products', 'edit'),
    body('name').notEmpty().withMessage('Category name is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isActive = true } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if category name already exists
      const checkResult = await client.query(
        'SELECT * FROM categories WHERE name = $1',
        [name]
      );
      
      if (checkResult.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Category name already exists' });
      }
      
      // Generate category ID
      const categoryId = req.body.id || `CAT-${Date.now()}`;
      
      // Insert category
      const result = await client.query(
        `INSERT INTO categories (id, name, description, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [categoryId, name, description, isActive]
      );
      
      client.release();
      
      const category = result.rows[0];
      
      res.status(201).json({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.is_active,
        createdAt: category.created_at
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('products', 'edit'),
    param('id').notEmpty().withMessage('Category ID is required'),
    body('name').notEmpty().withMessage('Category name is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, isActive } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if category exists
      const checkResult = await client.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if category name already exists for another category
      const nameCheckResult = await client.query(
        'SELECT * FROM categories WHERE name = $1 AND id != $2',
        [name, id]
      );
      
      if (nameCheckResult.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Category name already exists' });
      }
      
      // Update category
      const result = await client.query(
        `UPDATE categories
         SET name = $1, description = $2, is_active = $3
         WHERE id = $4
         RETURNING *`,
        [name, description, isActive, id]
      );
      
      // If category name changed, update product categories
      if (name !== checkResult.rows[0].name) {
        await client.query(
          'UPDATE products SET category = $1 WHERE category = $2',
          [name, checkResult.rows[0].name]
        );
      }
      
      client.release();
      
      const category = result.rows[0];
      
      res.json({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.is_active,
        createdAt: category.created_at
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('products', 'delete'),
    param('id').notEmpty().withMessage('Category ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if category exists
      const checkResult = await client.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if category is being used by products
      const productsResult = await client.query(
        'SELECT COUNT(*) FROM products WHERE category = $1',
        [checkResult.rows[0].name]
      );
      
      if (parseInt(productsResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({ 
          message: 'Cannot delete category. It is being used by products.' 
        });
      }
      
      // Delete category
      await client.query('DELETE FROM categories WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;