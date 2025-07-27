const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RawMaterials
 *   description: Raw materials management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RawMaterial:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: RM-123456
 *         name:
 *           type: string
 *           example: Oak Wood Planks
 *         category:
 *           type: string
 *           example: Wood
 *         unit:
 *           type: string
 *           example: sq ft
 *         stockQuantity:
 *           type: number
 *           example: 500
 *         unitPrice:
 *           type: number
 *           example: 12.5
 *         supplier:
 *           type: string
 *           example: Premium Wood Co.
 *         minimumStock:
 *           type: number
 *           example: 50
 *         description:
 *           type: string
 *           example: High-quality oak wood planks for table making
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /raw-materials:
 *   get:
 *     summary: Get all raw materials
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of raw materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RawMaterial'
 *   post:
 *     summary: Create a new raw material
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterial'
 *     responses:
 *       201:
 *         description: Raw material created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RawMaterial'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /raw-materials/{id}:
 *   get:
 *     summary: Get a raw material by ID
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material ID
 *     responses:
 *       200:
 *         description: Raw material found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RawMaterial'
 *       404:
 *         description: Raw material not found
 *   put:
 *     summary: Update a raw material
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterial'
 *     responses:
 *       200:
 *         description: Raw material updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RawMaterial'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Raw material not found
 *   delete:
 *     summary: Delete a raw material
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material ID
 *     responses:
 *       200:
 *         description: Raw material deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Raw material deleted successfully
 *       400:
 *         description: Cannot delete material (used in products/addons)
 *       404:
 *         description: Raw material not found
 */

/**
 * @swagger
 * /raw-materials/{id}/stock:
 *   put:
 *     summary: Update raw material stock
 *     tags: [RawMaterials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 10
 *               operation:
 *                 type: string
 *                 enum: [add, subtract]
 *                 example: add
 *     responses:
 *       200:
 *         description: Raw material stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 stockQuantity:
 *                   type: number
 *                 unit:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Raw material not found
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @route   GET /api/raw-materials
 * @desc    Get all raw materials
 * @access  Private
 */
router.get('/', authenticate, hasPermission('raw-materials', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM raw_materials ORDER BY name');
    client.release();
    
    res.json(result.rows.map(material => ({
      id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      stockQuantity: parseFloat(material.stock_quantity),
      unitPrice: parseFloat(material.unit_price),
      supplier: material.supplier,
      minimumStock: parseFloat(material.minimum_stock),
      description: material.description,
      createdAt: material.created_at,
      updatedAt: material.updated_at
    })));
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/raw-materials/:id
 * @desc    Get raw material by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('raw-materials', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM raw_materials WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Raw material not found' });
    }
    
    const material = result.rows[0];
    
    res.json({
      id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      stockQuantity: parseFloat(material.stock_quantity),
      unitPrice: parseFloat(material.unit_price),
      supplier: material.supplier,
      minimumStock: parseFloat(material.minimum_stock),
      description: material.description,
      createdAt: material.created_at,
      updatedAt: material.updated_at
    });
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/raw-materials
 * @desc    Create a new raw material
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('raw-materials', 'edit'),
    body('name').notEmpty().withMessage('Material name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').notEmpty().withMessage('Unit is required')
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
      unit,
      stockQuantity = 0,
      unitPrice = 0,
      supplier,
      minimumStock = 0,
      description
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Generate material ID
      const materialId = req.body.id || `RM-${Date.now()}`;
      
      // Insert material
      const result = await client.query(
        `INSERT INTO raw_materials (
          id, name, category, unit, stock_quantity, unit_price, 
          supplier, minimum_stock, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          materialId,
          name,
          category,
          unit,
          stockQuantity,
          unitPrice,
          supplier,
          minimumStock,
          description
        ]
      );
      
      client.release();
      
      const material = result.rows[0];
      
      res.status(201).json({
        id: material.id,
        name: material.name,
        category: material.category,
        unit: material.unit,
        stockQuantity: parseFloat(material.stock_quantity),
        unitPrice: parseFloat(material.unit_price),
        supplier: material.supplier,
        minimumStock: parseFloat(material.minimum_stock),
        description: material.description,
        createdAt: material.created_at,
        updatedAt: material.updated_at
      });
    } catch (error) {
      console.error('Error creating raw material:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/raw-materials/:id
 * @desc    Update a raw material
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('raw-materials', 'edit'),
    param('id').notEmpty().withMessage('Material ID is required'),
    body('name').notEmpty().withMessage('Material name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').notEmpty().withMessage('Unit is required')
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
      unit,
      stockQuantity,
      unitPrice,
      supplier,
      minimumStock,
      description
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if material exists
      const checkResult = await client.query(
        'SELECT * FROM raw_materials WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Raw material not found' });
      }
      
      // Update material
      const result = await client.query(
        `UPDATE raw_materials
         SET name = $1, category = $2, unit = $3, stock_quantity = $4,
             unit_price = $5, supplier = $6, minimum_stock = $7,
             description = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [
          name,
          category,
          unit,
          stockQuantity,
          unitPrice,
          supplier,
          minimumStock,
          description,
          id
        ]
      );
      
      client.release();
      
      const material = result.rows[0];
      
      res.json({
        id: material.id,
        name: material.name,
        category: material.category,
        unit: material.unit,
        stockQuantity: parseFloat(material.stock_quantity),
        unitPrice: parseFloat(material.unit_price),
        supplier: material.supplier,
        minimumStock: parseFloat(material.minimum_stock),
        description: material.description,
        createdAt: material.created_at,
        updatedAt: material.updated_at
      });
    } catch (error) {
      console.error('Error updating raw material:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/raw-materials/:id
 * @desc    Delete a raw material
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('raw-materials', 'delete'),
    param('id').notEmpty().withMessage('Material ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if material exists
      const checkResult = await client.query(
        'SELECT * FROM raw_materials WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Raw material not found' });
      }
      
      // Check if material is being used in products
      const productsResult = await client.query(
        'SELECT COUNT(*) FROM product_raw_materials WHERE raw_material_id = $1',
        [id]
      );
      
      if (parseInt(productsResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({ 
          message: 'Cannot delete material. It is being used in products.' 
        });
      }
      
      // Check if material is being used in addons
      const addonsResult = await client.query(
        'SELECT COUNT(*) FROM product_addons WHERE raw_material_id = $1',
        [id]
      );
      
      if (parseInt(addonsResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({ 
          message: 'Cannot delete material. It is being used in product addons.' 
        });
      }
      
      // Delete material
      await client.query('DELETE FROM raw_materials WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Raw material deleted successfully' });
    } catch (error) {
      console.error('Error deleting raw material:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/raw-materials/:id/stock
 * @desc    Update raw material stock
 * @access  Private
 */
router.put(
  '/:id/stock',
  [
    authenticate,
    hasPermission('raw-materials', 'edit'),
    param('id').notEmpty().withMessage('Material ID is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('operation').isIn(['add', 'subtract']).withMessage('Operation must be add or subtract')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity, operation } = req.body;
    
    try {
      const client = await pool.connect();
      
      // Check if material exists
      const checkResult = await client.query(
        'SELECT * FROM raw_materials WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Raw material not found' });
      }
      
      const material = checkResult.rows[0];
      
      // Calculate new stock
      let newStock;
      if (operation === 'add') {
        newStock = parseFloat(material.stock_quantity) + parseFloat(quantity);
      } else {
        newStock = Math.max(0, parseFloat(material.stock_quantity) - parseFloat(quantity));
      }
      
      // Update stock
      const result = await client.query(
        `UPDATE raw_materials
         SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newStock, id]
      );
      
      client.release();
      
      const updatedMaterial = result.rows[0];
      
      res.json({
        id: updatedMaterial.id,
        name: updatedMaterial.name,
        stockQuantity: parseFloat(updatedMaterial.stock_quantity),
        unit: updatedMaterial.unit
      });
    } catch (error) {
      console.error('Error updating raw material stock:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

module.exports = router;