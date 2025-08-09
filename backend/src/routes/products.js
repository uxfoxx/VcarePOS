const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission, logAction } = require('../middleware/auth');

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
 *         isCustom:
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
      SELECT * FROM product_colors ORDER BY created_at
    `);
    
    // Get all product sizes (now linked to colors)
    const sizesResult = await client.query(`
      SELECT * FROM product_sizes
    `);
    
    // Get all product raw materials
    const materialsResult = await client.query(`
      SELECT prm.*, rm.name, rm.unit, rm.unit_price, pc.product_id
      FROM product_raw_materials prm
      JOIN raw_materials rm ON prm.raw_material_id = rm.id
      JOIN product_colors pc ON prm.product_color_id = pc.id
    `);
    
    // Get all product addons
    const addonsResult = await client.query(`
      SELECT * FROM product_addons
    `);
    
    client.release();
    
    // Map colors, sizes, materials, and addons to their respective products
    const products = productsResult.rows.map(product => {
      const colors = colorsResult.rows
        .filter(color => color.product_id === product.id)
        .map(color => {
          const colorSizes = sizesResult.rows
            .filter(size => size.product_color_id === color.id)
            .map(size => ({
              id: size.id,
              name: size.name,
              price: parseFloat(size.price),
              stock: size.stock,
              dimensions: size.dimensions,
              weight: parseFloat(size.weight)
            }));
          
          const colorMaterials = materialsResult.rows
            .filter(material => material.product_color_id === color.id)
            .map(material => ({
              rawMaterialId: material.raw_material_id,
              quantity: parseFloat(material.quantity),
              name: material.name,
              unit: material.unit,
              unitPrice: parseFloat(material.unit_price)
            }));
          
          return {
            id: color.id,
            name: color.name,
            colorCode: color.color_code,
            image: color.image,
            sizes: colorSizes,
            rawMaterials: colorMaterials
          };
        });
      
      const addons = addonsResult.rows
        .filter(addon => addon.product_id === product.id)
        .map(addon => ({
          id: addon.raw_material_id,
          name: addon.name,
          quantity: parseFloat(addon.quantity),
          price: parseFloat(addon.price)
        }));
      
      // Calculate total stock from all color-size combinations
      const totalStock = colors.reduce((sum, color) => 
        sum + color.sizes.reduce((colorSum, size) => colorSum + size.stock, 0), 0
      );
      
      // Calculate price range from all color-size combinations
      const allPrices = colors.flatMap(color => color.sizes.map(size => size.price));
      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : product.price;
      const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : product.price;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: colors.length > 0 ? minPrice : parseFloat(product.price),
        maxPrice: colors.length > 0 && minPrice !== maxPrice ? maxPrice : null,
        stock: colors.length > 0 ? totalStock : product.stock,
        barcode: product.barcode,
        image: product.image,
        weight: product.weight ? parseFloat(product.weight) : null,
        color: product.color,
        material: product.material,
        dimensions: product.dimensions,
        hasColors: colors.length > 0,
        colors,
        addons,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
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
    
    // Get product sizes
    const sizesResult = await client.query(`
      SELECT * FROM product_sizes WHERE product_id = $1
    `, [id]);
    
    // Get product raw materials
    const materialsResult = await client.query(`
      SELECT prm.*, rm.name, rm.unit, rm.unit_price 
      FROM product_raw_materials prm
      JOIN raw_materials rm ON prm.raw_material_id = rm.id
      WHERE prm.product_id = $1
    `, [id]);
    
    // Get product addons
    const addonsResult = await client.query(`
      SELECT * FROM product_addons WHERE product_id = $1
    `, [id]);
    
    // Get variants if this is a parent product
    let variants = [];
    if (product.has_variants) {
      const variantsResult = await client.query(`
        SELECT * FROM products WHERE parent_product_id = $1
      `, [id]);
      
      // For each variant, get its sizes and raw materials
      for (const variant of variantsResult.rows) {
        const variantSizesResult = await client.query(`
          SELECT * FROM product_sizes WHERE product_id = $1
        `, [variant.id]);
        
        const variantMaterialsResult = await client.query(`
          SELECT prm.*, rm.name, rm.unit, rm.unit_price 
          FROM product_raw_materials prm
          JOIN raw_materials rm ON prm.raw_material_id = rm.id
          WHERE prm.product_id = $1
        `, [variant.id]);
        
        variants.push({
          id: variant.id,
          name: variant.name,
          description: variant.description,
          price: parseFloat(variant.price),
          stock: variant.stock,
          sku: variant.barcode,
          image: variant.image,
          color: variant.color,
          material: variant.material,
          hasSizes: variant.has_sizes,
          sizes: variantSizesResult.rows.map(size => ({
            id: size.id,
            name: size.name,
            price: parseFloat(size.price),
            stock: size.stock,
            dimensions: size.dimensions,
            weight: parseFloat(size.weight)
          })),
          rawMaterials: variantMaterialsResult.rows.map(material => ({
            rawMaterialId: material.raw_material_id,
            quantity: parseFloat(material.quantity),
            name: material.name,
            unit: material.unit,
            unitPrice: parseFloat(material.unit_price)
          }))
        });
      }
    }
    
    client.release();
    
    // Format response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: parseFloat(product.price),
      stock: product.stock,
      barcode: product.barcode,
      image: product.image,
      weight: product.weight ? parseFloat(product.weight) : null,
      color: product.color,
      material: product.material,
      dimensions: product.dimensions,
      hasSizes: product.has_sizes,
      hasVariants: product.has_variants,
      hasAddons: product.has_addons,
      isVariant: product.is_variant,
      isCustom: product.is_custom,
      parentProductId: product.parent_product_id,
      variantName: product.variant_name,
      parentProductName: product.parent_product_name,
      sizes: sizesResult.rows.map(size => ({
        id: size.id,
        name: size.name,
        price: parseFloat(size.price),
        stock: size.stock,
        dimensions: size.dimensions,
        weight: parseFloat(size.weight)
      })),
      rawMaterials: materialsResult.rows.map(material => ({
        rawMaterialId: material.raw_material_id,
        quantity: parseFloat(material.quantity),
        name: material.name,
        unit: material.unit,
        unitPrice: parseFloat(material.unit_price)
      })),
      addons: addonsResult.rows.map(addon => ({
        id: addon.raw_material_id,
        name: addon.name,
        quantity: parseFloat(addon.quantity),
        price: parseFloat(addon.price)
      })),
      variants,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
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
    body('price').isNumeric().withMessage('Price must be a number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
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
        stock,
        barcode,
        image,
        weight,
        color,
        material,
        dimensions,
        colors,
        addons,
        isCustom
      } = req.body;
      
      // Generate product ID if not provided
      const productId = req.body.id || `PROD-${Date.now()}`;
      
      // Insert product
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          weight, color, material, dimensions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        productId, name, description, category, price, stock, barcode, image,
        weight, color, material, JSON.stringify(dimensions)
      ]);
      
      const product = productResult.rows[0];
      
      // Insert colors if any
      if (colors && colors.length > 0) {
        for (const color of colors) {
          const colorId = color.id || `COLOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          // Insert color
          await client.query(`
            INSERT INTO product_colors (
              id, product_id, name, color_code, image
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            colorId,
            productId,
            color.name,
            color.colorCode,
            color.image
          ]);
          
          // Insert sizes for this color
          if (color.sizes && color.sizes.length > 0) {
            for (const size of color.sizes) {
              await client.query(`
                INSERT INTO product_sizes (
                  id, product_color_id, name, price, stock, weight, dimensions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [
                size.id || `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                colorId,
                size.name,
                size.price,
                size.stock,
                size.weight,
                JSON.stringify(size.dimensions)
              ]);
            }
          }
          
          // Insert raw materials for this color
          if (color.rawMaterials && color.rawMaterials.length > 0) {
            for (const material of color.rawMaterials) {
              await client.query(`
                INSERT INTO product_raw_materials (
                  product_color_id, raw_material_id, quantity
                ) VALUES ($1, $2, $3)
              `, [
                colorId,
                material.rawMaterialId,
                material.quantity
              ]);
            }
          }
        }
        
        // Set default color if specified
        if (colors.length > 0) {
          const defaultColorId = colors[0].id || `COLOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          await client.query(`
            UPDATE products SET default_color_id = $1 WHERE id = $2
          `, [defaultColorId, productId]);
        }
      } else {
        // For products without colors, create a default color
        const defaultColorId = `COLOR-${productId}-DEFAULT`;
        await client.query(`
          INSERT INTO product_colors (
            id, product_id, name, color_code, image
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          defaultColorId,
          productId,
          color || 'Default',
          '#000000',
          image
        ]);
        
        await client.query(`
          UPDATE products SET default_color_id = $1 WHERE id = $2
        `, [defaultColorId, productId]);
      }
      
      // Insert addons if any
      if (addons && addons.length > 0) {
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
        price: colors && colors.length > 0 ? 
          Math.min(...colors.flatMap(c => c.sizes?.map(s => s.price) || [product.price])) : 
          parseFloat(product.price),
        stock: colors && colors.length > 0 ? 
          colors.reduce((sum, c) => sum + (c.sizes?.reduce((sSum, s) => sSum + s.stock, 0) || 0), 0) : 
          product.stock,
        barcode: product.barcode,
        image: product.image,
        weight: product.weight ? parseFloat(product.weight) : null,
        color: product.color,
        material: product.material,
        dimensions: product.dimensions,
        hasColors: colors && colors.length > 0,
        colors: colors || [],
        addons,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error' });
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
    body('price').isNumeric().withMessage('Price must be a number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
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
        stock,
        barcode,
        image,
        weight,
        color,
        material,
        dimensions,
        hasSizes,
        hasVariants,
        hasAddons,
        isVariant,
        isCustom,
        parentProductId,
        variantName,
        parentProductName,
        sizes,
        rawMaterials,
        addons,
        variants
      } = req.body;
      
      // Update product
      const productResult = await client.query(`
        UPDATE products SET
          name = $1,
          description = $2,
          category = $3,
          price = $4,
          stock = $5,
          barcode = $6,
          image = $7,
          weight = $8,
          color = $9,
          material = $10,
          dimensions = $11,
          has_sizes = $12,
          has_variants = $13,
          has_addons = $14,
          is_variant = $15,
          is_custom = $16,
          parent_product_id = $17,
          variant_name = $18,
          parent_product_name = $19,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $20
        RETURNING *
      `, [
        name, description, category, price, stock, barcode, image,
        weight, color, material, JSON.stringify(dimensions), hasSizes, hasVariants,
        hasAddons, isVariant, isCustom, parentProductId, variantName, parentProductName,
        id
      ]);
      
      const product = productResult.rows[0];
      
      // Update sizes
      if (hasSizes && sizes) {
        // Delete existing sizes
        await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id]);
        
        // Insert new sizes
        for (const size of sizes) {
          await client.query(`
            INSERT INTO product_sizes (
              id, product_id, name, price, stock, weight, dimensions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            size.id || `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            id,
            size.name,
            size.price,
            size.stock,
            size.weight,
            JSON.stringify(size.dimensions)
          ]);
        }
      } else if (!hasSizes) {
        // If product no longer has sizes, delete all sizes
        await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id]);
      }
      
      // Update raw materials
      if (rawMaterials) {
        // Delete existing raw materials
        await client.query('DELETE FROM product_raw_materials WHERE product_id = $1', [id]);
        
        // Insert new raw materials
        for (const material of rawMaterials) {
          await client.query(`
            INSERT INTO product_raw_materials (
              product_id, raw_material_id, quantity
            ) VALUES ($1, $2, $3)
          `, [
            id,
            material.rawMaterialId,
            material.quantity
          ]);
        }
      }
      
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
      
      // Update variants
      if (hasVariants && variants) {
        // Delete existing variants
        await client.query('DELETE FROM products WHERE parent_product_id = $1', [id]);
        
        // Insert new variants
        for (const variant of variants) {
          // Insert variant as a product
          const variantId = variant.id || `VARIANT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          await client.query(`
            INSERT INTO products (
              id, name, description, category, price, stock, barcode, image, 
              weight, color, material, dimensions, has_sizes, has_variants, 
              has_addons, is_variant, is_custom, parent_product_id, 
              variant_name, parent_product_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          `, [
            variantId,
            `${name} - ${variant.name}`,
            variant.description || description,
            category,
            variant.price || price,
            variant.stock || 0,
            variant.sku || `${barcode}-${variant.name.substring(0, 2).toUpperCase()}`,
            variant.image || image,
            variant.weight || weight,
            variant.color || color,
            variant.material || material,
            JSON.stringify(variant.dimensions || dimensions),
            variant.hasSizes || false,
            false, // Variants can't have variants
            false, // Variants don't have addons
            true, // This is a variant
            false, // Not a custom product
            id, // Parent product ID
            variant.name,
            name
          ]);
          
          // Insert variant sizes if any
          if (variant.hasSizes && variant.sizes && variant.sizes.length > 0) {
            for (const size of variant.sizes) {
              await client.query(`
                INSERT INTO product_sizes (
                  id, product_id, name, price, stock, weight, dimensions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [
                size.id || `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                variantId,
                size.name,
                size.price,
                size.stock,
                size.weight,
                JSON.stringify(size.dimensions)
              ]);
            }
          }
          
          // Insert variant raw materials if any
          if (variant.rawMaterials && variant.rawMaterials.length > 0) {
            for (const material of variant.rawMaterials) {
              await client.query(`
                INSERT INTO product_raw_materials (
                  product_id, raw_material_id, quantity
                ) VALUES ($1, $2, $3)
              `, [
                variantId,
                material.rawMaterialId,
                material.quantity
              ]);
            }
          }
        }
      } else if (!hasVariants) {
        // If product no longer has variants, delete all variants
        await client.query('DELETE FROM products WHERE parent_product_id = $1', [id]);
      }
      
      await client.query('COMMIT');
      
      // Return the updated product
      res.json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: product.stock,
        barcode: product.barcode,
        image: product.image,
        weight: product.weight ? parseFloat(product.weight) : null,
        color: product.color,
        material: product.material,
        dimensions: product.dimensions,
        hasSizes: product.has_sizes,
        hasVariants: product.has_variants,
        hasAddons: product.has_addons,
        isVariant: product.is_variant,
        isCustom: product.is_custom,
        parentProductId: product.parent_product_id,
        variantName: product.variant_name,
        parentProductName: product.parent_product_name,
        sizes,
        rawMaterials,
        addons,
        variants,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Server error' });
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
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error' });
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
    body('colorId').notEmpty().withMessage('Color ID is required'),
    body('sizeId').notEmpty().withMessage('Size ID is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity, operation, colorId, sizeId } = req.body;
    
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
      
      // Check if color exists for this product
      const colorResult = await client.query(
        'SELECT * FROM product_colors WHERE id = $1 AND product_id = $2',
        [colorId, id]
      );
      
      if (colorResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Color not found for this product' });
      }
      
      // Update specific size stock
      const sizeResult = await client.query(
        'SELECT * FROM product_sizes WHERE id = $1 AND product_color_id = $2',
        [sizeId, colorId]
      );
      
      if (sizeResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Size not found for this color' });
      }
      
      const size = sizeResult.rows[0];
      const newStock = operation === 'add' 
        ? size.stock + quantity 
        : Math.max(0, size.stock - quantity);
      
      await client.query(
        'UPDATE product_sizes SET stock = $1 WHERE id = $2',
        [newStock, sizeId]
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
      
      // Get updated colors and sizes
      const colorsResult = await client.query(`
        SELECT pc.*, ps.id as size_id, ps.name as size_name, ps.price as size_price, 
               ps.stock as size_stock, ps.weight as size_weight, ps.dimensions as size_dimensions
        FROM product_colors pc
        LEFT JOIN product_sizes ps ON pc.id = ps.product_color_id
        WHERE pc.product_id = $1
        ORDER BY pc.created_at, ps.name
      `, [id]);
      
      const colors = [];
      const colorMap = new Map();
      
      colorsResult.rows.forEach(row => {
        if (!colorMap.has(row.id)) {
          colorMap.set(row.id, {
            id: row.id,
            name: row.name,
            colorCode: row.color_code,
            image: row.image,
            sizes: []
          });
          colors.push(colorMap.get(row.id));
        }
        
        if (row.size_id) {
          colorMap.get(row.id).sizes.push({
            id: row.size_id,
            name: row.size_name,
            price: parseFloat(row.size_price),
            stock: row.size_stock,
            dimensions: row.size_dimensions,
            weight: parseFloat(row.size_weight)
          });
        }
      });
      
      client.release();
      
      res.json({
        id: updatedProduct.id,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        hasColors: colors.length > 0,
        colors
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      res.status(500).json({ message: 'Server error' });
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