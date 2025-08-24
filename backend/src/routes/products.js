const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission, logAction } = require('../middleware/auth');
const { handleRouteError, asyncHandler, logDatabaseOperation } = require('../utils/loggerUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: PROD-123456
 *         name:
 *           type: string
 *           example: Wooden Table
 *         description:
 *           type: string
 *           example: Premium oak wood dining table
 *         category:
 *           type: string
 *           example: Furniture
 *         price:
 *           type: number
 *           example: 199.99
 *         stock:
 *           type: integer
 *           example: 50
 *         barcode:
 *           type: string
 *           example: 1234567890123
 *         image:
 *           type: string
 *           example: https://example.com/image.jpg
 *         weight:
 *           type: number
 *           example: 12.5
 *         color:
 *           type: string
 *           example: Brown
 *         material:
 *           type: string
 *           example: Oak Wood
 *         dimensions:
 *           type: object
 *           example: { length: 120, width: 60, height: 75 }
 *         hasSizes:
 *           type: boolean
 *         hasVariants:
 *           type: boolean
 *         hasAddons:
 *           type: boolean
 *         isVariant:
 *           type: boolean
 *         parentProductId:
 *           type: string
 *           example: PROD-654321
 *         variantName:
 *           type: string
 *           example: Large
 *         parentProductName:
 *           type: string
 *           example: Wooden Table
 *         sizes:
 *           type: array
 *           items:
 *             type: object
 *         rawMaterials:
 *           type: array
 *           items:
 *             type: object
 *         addons:
 *           type: array
 *           items:
 *             type: object
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               operation:
 *                 type: string
 *                 enum: [add, subtract]
 *                 example: add
 *               selectedSize:
 *                 type: string
 *                 example: Large
 *     responses:
 *       200:
 *         description: Product stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 stock:
 *                   type: integer
 *                 hasSizes:
 *                   type: boolean
 *                 sizes:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product or size not found
 */

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Private
 */
router.get('/', authenticate, hasPermission('products', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get all products
    const productsResult = await client.query(`
      SELECT * FROM products ORDER BY created_at DESC
    `);
    
    // Get all product colors
    const colorsResult = await client.query(`
      SELECT * FROM product_colors
    `);
    
    // Get all product sizes (now linked to colors)
    const sizesResult = await client.query(`
      SELECT * FROM product_sizes
    `);
    
    // Get all product raw materials (now linked to sizes)
    // const materialsResult = await client.query(`
    //   SELECT prm.*, rm.name, rm.unit, rm.unit_price, ps.id as size_id
    //   FROM product_raw_materials prm
    //   JOIN raw_materials rm ON prm.raw_material_id = rm.id
    //   JOIN product_sizes ps ON prm.product_size_id = ps.id
    // `);

        // Get all product raw materials (now linked to sizes)
    const materialsResult = await client.query(`
      SELECT prm.*, rm.name, rm.unit, rm.unit_price
      FROM product_raw_materials prm
      JOIN raw_materials rm ON prm.raw_material_id = rm.id
      
    `);
    
    // Get all product addons
    const addonsResult = await client.query(`
      SELECT * FROM product_addons
    `);
    
    client.release();
    
    // Map colors, sizes, materials, and addons to their respective products
    const products = productsResult.rows.map(product => {
      // Get colors for this product
      const colors = colorsResult.rows
        .filter(color => color.product_id === product.id)
        .map(color => {
          // Get sizes for this color
          const colorSizes = sizesResult.rows
            .filter(size => size.product_color_id === color.id)
            .map(size => {
              // Get raw materials for this size
              const sizeMaterials = materialsResult.rows
                .filter(material => material.size_id === size.id)
                .map(material => ({
                  rawMaterialId: material.raw_material_id,
                  quantity: parseFloat(material.quantity),
                  name: material.name,
                  unit: material.unit,
                  unitPrice: parseFloat(material.unit_price)
                }));
              
              return {
                id: size.id,
                name: size.name,
                stock: size.stock,
                dimensions: size.dimensions,
                weight: parseFloat(size.weight || 0),
                rawMaterials: sizeMaterials
              };
            });
          
          return {
            id: color.id,
            name: color.name,
            colorCode: color.color_code,
            image: color.image,
            sizes: colorSizes
          };
        });
      
      // Calculate total stock from all color sizes
      const totalStock = colors.reduce((total, color) => 
        total + color.sizes.reduce((colorTotal, size) => colorTotal + (size.stock || 0), 0), 0
      );
      
      const addons = addonsResult.rows
        .filter(addon => addon.product_id === product.id)
        .map(addon => ({
          id: addon.raw_material_id,
          name: addon.name,
          quantity: parseFloat(addon.quantity),
          price: parseFloat(addon.price)
        }));
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: totalStock, // Use calculated total stock
        barcode: product.barcode,
        image: product.image,
        color: product.color,
        material: product.material,
        hasAddons: product.has_addons,
        colors,
        addons,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    });
    
    res.json(products);
  } catch (error) {
    handleRouteError(error, req, res, 'Products - Fetch All');
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', authenticate, hasPermission('products', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    // Get product
    const productResult = await client.query(`
      SELECT * FROM products WHERE id = $1
    `, [id]);
    
    if (productResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Get product colors
    const colorsResult = await client.query(`
      SELECT * FROM product_colors WHERE product_id = $1
    `, [id]);
    
    // Get all sizes for this product's colors
    const sizesResult = await client.query(`
      SELECT ps.*, pc.id as color_id, pc.product_id
      FROM product_sizes ps
      JOIN product_colors pc ON ps.product_color_id = pc.id
      WHERE pc.product_id = $1
    `, [id]);
    
    // Get all raw materials for this product's sizes
    const materialsResult = await client.query(`
      SELECT prm.*, rm.name, rm.unit, rm.unit_price, ps.id as size_id
      FROM product_raw_materials prm
      JOIN raw_materials rm ON prm.raw_material_id = rm.id
      JOIN product_sizes ps ON prm.product_size_id = ps.id
      JOIN product_colors pc ON ps.product_color_id = pc.id
      WHERE pc.product_id = $1
    `, [id]);
    
    // Get product addons
    const addonsResult = await client.query(`
      SELECT * FROM product_addons WHERE product_id = $1
    `, [id]);
    
    client.release();
    
    // Build colors with their sizes and materials
    const colors = colorsResult.rows.map(color => {
      const colorSizes = sizesResult.rows
        .filter(size => size.color_id === color.id)
        .map(size => {
          // Get raw materials for this size
          const sizeMaterials = materialsResult.rows
            .filter(material => material.size_id === size.id)
            .map(material => ({
              rawMaterialId: material.raw_material_id,
              quantity: parseFloat(material.quantity),
              name: material.name,
              unit: material.unit,
              unitPrice: parseFloat(material.unit_price)
            }));
          
          return {
            id: size.id,
            name: size.name,
            stock: size.stock,
            dimensions: size.dimensions,
            weight: parseFloat(size.weight || 0),
            rawMaterials: sizeMaterials
          };
        });
      
      return {
        id: color.id,
        name: color.name,
        colorCode: color.color_code,
        image: color.image,
        sizes: colorSizes
      };
    });
    
    // Calculate total stock from all color sizes
    const totalStock = colors.reduce((total, color) => 
      total + color.sizes.reduce((colorTotal, size) => colorTotal + (size.stock || 0), 0), 0
    );
    
    // Format response with new structure
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: parseFloat(product.price),
      stock: totalStock,
      barcode: product.barcode,
      image: product.image,
      color: product.color,
      material: product.material,
       hasAddons: product.has_addons,
      colors,
      addons: addonsResult.rows.map(addon => ({
        id: addon.raw_material_id,
        name: addon.name,
        quantity: parseFloat(addon.quantity),
        price: parseFloat(addon.price)
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
    
    res.json(formattedProduct);
  } catch (error) {
    handleRouteError(error, req, res, 'Products - Fetch By ID');
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('products', 'edit'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number')
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
        name,
        description,
        category,
        price,
        barcode,
        image,
        color,
        material,
        hasAddons,
        colors,
        addons
      } = req.body;
      
      // Generate product ID if not provided
      const productId = req.body.id || `PROD-${Date.now()}`;
      
      // Insert product
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        productId, name, description, category, price, 0, barcode, image,
        color, material, hasAddons
      ]);
      
      const product = productResult.rows[0];
      
      // Insert colors and their associated sizes and materials
      let totalStock = 0;
      if (colors && colors.length > 0) {
        for (const color of colors) {
          // Insert color
          const colorResult = await client.query(`
            INSERT INTO product_colors (
              id, product_id, name, color_code, image
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `, [
            color.id || `COLOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            productId,
            color.name,
            color.colorCode,
            color.image
          ]);
          
          const insertedColor = colorResult.rows[0];
          
          // Insert sizes for this color
          if (color.sizes && color.sizes.length > 0) {
            for (const size of color.sizes) {
              const sizeResult = await client.query(`
                INSERT INTO product_sizes (
                  id, product_color_id, name, stock, weight, dimensions
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
              `, [
                size.id || `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                insertedColor.id,
                size.name,
                size.stock,
                size.weight,
                JSON.stringify(size.dimensions)
              ]);
              
              const insertedSize = sizeResult.rows[0];
              totalStock += size.stock || 0;
              
              // Insert raw materials for this size
              if (size.rawMaterials && size.rawMaterials.length > 0) {
                for (const material of size.rawMaterials) {
                  await client.query(`
                    INSERT INTO product_raw_materials (
                      product_size_id, raw_material_id, quantity
                    ) VALUES ($1, $2, $3)
                  `, [
                    insertedSize.id,
                    material.rawMaterialId,
                    material.quantity
                  ]);
                }
              }
            }
          }
        }
      }
      
      // Update total stock in products table
      await client.query(`
        UPDATE products SET stock = $1 WHERE id = $2
      `, [totalStock, productId]);
      
      // Insert addons (now always available)
      if (hasAddons && addons && addons.length > 0) {
        for (const addon of addons) {
          await client.query(`
            INSERT INTO product_addons (
              product_id, raw_material_id, name, quantity, price
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            productId,
            addon.id,
            addon.name,
            addon.quantity,
            addon.price
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Return the created product with all related data
      res.status(201).json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: totalStock,
        barcode: product.barcode,
        image: product.image,
        color: product.color,
        material: product.material,
        hasAddons: product.has_addons,
        colors,
        addons,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      handleRouteError(error, req, res, 'Products - Create');
    } finally {
      client.release();
    }
  }
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('products', 'edit'),
    param('id').notEmpty().withMessage('Product ID is required'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if product exists
      const checkResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const {
        name,
        description,
        category,
        price,
        barcode,
        image,
        color,
        material,
        hasAddons,
        colors,
        addons
      } = req.body;
      
      // Update product
      const productResult = await client.query(`
        UPDATE products SET
          name = $1,
          description = $2,
          category = $3,
          price = $4,
          barcode = $5,
          image = $6,
          color = $7,
          material = $8,
          has_addons = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `, [
        name, description, category, price, barcode, image,
        color, material, hasAddons,
        id
      ]);
      
      const product = productResult.rows[0];
      
      // Update colors, sizes, and materials
      let totalStock = 0;
      if (colors) {
        // Delete existing colors (cascade will delete sizes and materials)
        await client.query('DELETE FROM product_colors WHERE product_id = $1', [id]);
        
        // Insert new colors
        for (const color of colors) {
          // Insert color
          const colorResult = await client.query(`
            INSERT INTO product_colors (
              id, product_id, name, color_code, image
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `, [
            color.id || `COLOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            id,
            color.name,
            color.colorCode,
            color.image
          ]);
          
          const insertedColor = colorResult.rows[0];
          
          // Insert sizes for this color
          if (color.sizes && color.sizes.length > 0) {
            for (const size of color.sizes) {
              const sizeResult = await client.query(`
                INSERT INTO product_sizes (
                  id, product_color_id, name, stock, weight, dimensions
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
              `, [
                size.id || `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                insertedColor.id,
                size.name,
                size.stock,
                size.weight,
                JSON.stringify(size.dimensions)
              ]);
              
              const insertedSize = sizeResult.rows[0];
              totalStock += size.stock || 0;
              
              // Insert raw materials for this size
              if (size.rawMaterials && size.rawMaterials.length > 0) {
                for (const material of size.rawMaterials) {
                  await client.query(`
                    INSERT INTO product_raw_materials (
                      product_size_id, raw_material_id, quantity
                    ) VALUES ($1, $2, $3)
                  `, [
                    insertedSize.id,
                    material.rawMaterialId,
                    material.quantity
                  ]);
                }
              }
            }
          }
        }
      }
      
      // Update total stock in products table
      await client.query(`
        UPDATE products SET stock = $1 WHERE id = $2
      `, [totalStock, id]);
      
      // Update addons
      if (hasAddons && addons) {
        // Delete existing addons
        await client.query('DELETE FROM product_addons WHERE product_id = $1', [id]);
        
        // Insert new addons
        for (const addon of addons) {
          await client.query(`
            INSERT INTO product_addons (
              product_id, raw_material_id, name, quantity, price
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            id,
            addon.id,
            addon.name,
            addon.quantity,
            addon.price
          ]);
        }
      } else if (!hasAddons) {
        // If product no longer has addons, delete all addons
        await client.query('DELETE FROM product_addons WHERE product_id = $1', [id]);
      }
      
      await client.query('COMMIT');
      
      // Return the updated product
      res.json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: totalStock,
        barcode: product.barcode,
        image: product.image,
        color: product.color,
        material: product.material,
        hasAddons: product.has_addons,
        colors,
        addons,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      handleRouteError(error, req, res, 'Products - Update');
    } finally {
      client.release();
    }
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('products', 'delete'),
    param('id').notEmpty().withMessage('Product ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      const client = await pool.connect();
      
      // Check if product exists
      const checkResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete product (cascade will delete related sizes, raw materials, and addons)
      await client.query('DELETE FROM products WHERE id = $1', [id]);
      
      client.release();
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      handleRouteError(error, req, res, 'Products - Delete');
    }
  }
);

/**
 * @route   PUT /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private
 */
router.put(
  '/:id/stock',
  [
    authenticate,
    hasPermission('products', 'edit'),
    param('id').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt().withMessage('Quantity must be an integer'),
    body('operation').isIn(['add', 'subtract']).withMessage('Operation must be add or subtract'),
    body('selectedColorId').notEmpty().withMessage('Color ID is required'),
    body('selectedSize').notEmpty().withMessage('Size name is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity, operation, selectedColorId, selectedSize } = req.body;
    
    try {
      const client = await pool.connect();
      
      // Check if product exists
      const checkResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const product = checkResult.rows[0];
      
      // Update specific color/size stock
      const sizeResult = await client.query(`
        SELECT ps.*, pc.product_id FROM product_sizes ps
        JOIN product_colors pc ON ps.product_color_id = pc.id
        WHERE pc.id = $1 AND ps.name = $2
      `, [selectedColorId, selectedSize]);
      
      if (sizeResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Color/Size combination not found' });
      }
      
      const size = sizeResult.rows[0];
      const newStock = operation === 'add' 
        ? size.stock + quantity 
        : Math.max(0, size.stock - quantity);
      
      await client.query(
        'UPDATE product_sizes SET stock = $1 WHERE id = $2',
        [newStock, size.id]
      );
      
      // Update total product stock (sum of all sizes across all colors)
      const totalStockResult = await client.query(`
        SELECT SUM(ps.stock) as total_stock 
        FROM product_sizes ps
        JOIN product_colors pc ON ps.product_color_id = pc.id
        WHERE pc.product_id = $1
      `, [id]);
      
      const totalStock = parseInt(totalStockResult.rows[0].total_stock) || 0;
      
      await client.query(
        'UPDATE products SET stock = $1 WHERE id = $2',
        [totalStock, id]
      );
      
      // Get updated product
      const updatedResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      
      const updatedProduct = updatedResult.rows[0];
      
      // Get updated colors with sizes
      const colorsResult = await client.query(`
        SELECT * FROM product_colors WHERE product_id = $1
      `, [id]);
      
      const colors = await Promise.all(colorsResult.rows.map(async (color) => {
        const sizesResult = await client.query(`
          SELECT * FROM product_sizes WHERE product_color_id = $1
        `, [color.id]);
        
        return {
          id: color.id,
          name: color.name,
          colorCode: color.color_code,
          image: color.image,
          sizes: sizesResult.rows.map(size => ({
            id: size.id,
            name: size.name,
            stock: size.stock,
            dimensions: size.dimensions,
            weight: parseFloat(size.weight || 0)
          }))
        };
      }));
      
      client.release();
      
      res.json({
        id: updatedProduct.id,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        colors
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Products - Update Stock');
    }
  }
);

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