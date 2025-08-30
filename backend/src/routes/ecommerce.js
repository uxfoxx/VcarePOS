const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { handleRouteError } = require('../utils/loggerUtils');
const bcrypt = require('bcryptjs');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ecommerce
 *   description: E-commerce platform endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EcommerceProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         image:
 *           type: string
 *         colors:
 *           type: array
 *           items:
 *             type: object
 *         addons:
 *           type: array
 *           items:
 *             type: object
 *     EcommerceOrder:
 *       type: object
 *       properties:
 *         customer:
 *           type: object
 *         items:
 *           type: array
 *         deliveryArea:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         receiptUrl:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @route   GET /api/ecommerce/products
 * @desc    Get all products for e-commerce (public)
 * @access  Public
 */
router.get('/products', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get all products with their colors, sizes, and addons
    const productsResult = await client.query(`
      SELECT * FROM products 
      WHERE stock > 0 
      ORDER BY created_at DESC
    `);
    
    // Get all product colors
    const colorsResult = await client.query(`
      SELECT * FROM product_colors
    `);
    
    // Get all product sizes
    const sizesResult = await client.query(`
      SELECT * FROM product_sizes
    `);
    
    // Get all product addons
    const addonsResult = await client.query(`
      SELECT pa.*, rm.name as material_name, rm.unit
      FROM product_addons pa
      JOIN raw_materials rm ON pa.raw_material_id = rm.id
    `);
    
    client.release();
    
    // Map colors, sizes, and addons to their respective products
    const products = productsResult.rows.map(product => {
      // Get colors for this product
      const colors = colorsResult.rows
        .filter(color => color.product_id === product.id)
        .map(color => {
          // Get sizes for this color
          const colorSizes = sizesResult.rows
            .filter(size => size.product_color_id === color.id)
            .map(size => ({
              id: size.id,
              name: size.name,
              stock: size.stock,
              dimensions: size.dimensions,
              weight: parseFloat(size.weight || 0)
            }));
          
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
          name: addon.material_name,
          quantity: parseFloat(addon.quantity),
          price: parseFloat(addon.price),
          unit: addon.unit
        }));
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: totalStock,
        barcode: product.barcode,
        image: product.image,
        material: product.material,
        hasAddons: product.has_addons,
        colors,
        addons,
        createdAt: product.created_at
      };
    });
    
    res.json(products);
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Fetch Products');
  }
});

/**
 * @route   GET /api/ecommerce/categories
 * @desc    Get all active categories for e-commerce (public)
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, description FROM categories WHERE is_active = TRUE ORDER BY name'
    );
    client.release();
    
    res.json(result.rows);
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Fetch Categories');
  }
});

/**
 * @route   GET /api/ecommerce/taxes
 * @desc    Get all active taxes for e-commerce (public)
 * @access  Public
 */
router.get('/taxes', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, rate, tax_type, applicable_categories FROM taxes WHERE is_active = TRUE'
    );
    client.release();
    
    res.json(result.rows.map(tax => ({
      id: tax.id,
      name: tax.name,
      rate: parseFloat(tax.rate),
      taxType: tax.tax_type,
      applicableCategories: tax.applicable_categories
    })));
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Fetch Taxes');
  }
});

/**
 * @route   GET /api/ecommerce/delivery-zones
 * @desc    Get delivery zones and charges (public)
 * @access  Public
 */
router.get('/delivery-zones', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM delivery_zones WHERE is_active = TRUE ORDER BY charge ASC'
    );
    client.release();
    
    res.json(result.rows.map(zone => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      charge: parseFloat(zone.charge)
    })));
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Fetch Delivery Zones');
  }
});

/**
 * @route   GET /api/ecommerce/coupons/validate/:code
 * @desc    Validate a coupon code for e-commerce (public)
 * @access  Public
 */
router.get('/coupons/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { amount } = req.query;
    
    const client = await pool.connect();
    
    // Get coupon
    const result = await client.query(
      'SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE',
      [code.toUpperCase()]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Coupon not found or inactive' 
      });
    }
    
    const coupon = result.rows[0];
    
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
        message: `Minimum order amount is Rs.${parseFloat(coupon.minimum_amount).toFixed(2)}` 
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
        applicableCategories: coupon.applicable_categories
      },
      discount,
      message: 'Coupon is valid'
    });
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Validate Coupon');
  }
});

/**
 * @route   POST /api/ecommerce/customers/register
 * @desc    Register a new customer
 * @access  Public
 */
router.post(
  '/customers/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, address, city, postalCode } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if email already exists
      const existingCustomer = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      );
      
      if (existingCustomer.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Generate customer ID
      const customerId = `CUST-${Date.now()}`;
      
      // Insert customer
      const result = await client.query(
        `INSERT INTO customers (
          id, first_name, last_name, email, phone, address, city, postal_code, password_hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, first_name, last_name, email, phone, created_at`,
        [customerId, firstName, lastName, email, phone, address, city, postalCode, passwordHash]
      );
      
      client.release();
      
      const customer = result.rows[0];
      
      res.status(201).json({
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.created_at
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Ecommerce - Customer Registration');
    }
  }
);

/**
 * @route   POST /api/ecommerce/customers/login
 * @desc    Customer login
 * @access  Public
 */
router.post(
  '/customers/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const client = await pool.connect();
      
      // Get customer
      const result = await client.query(
        'SELECT * FROM customers WHERE email = $1 AND is_active = TRUE',
        [email]
      );
      
      if (result.rows.length === 0) {
        client.release();
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const customer = result.rows[0];
      
      // Check password
      const isMatch = await bcrypt.compare(password, customer.password_hash);
      if (!isMatch) {
        client.release();
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      client.release();
      
      res.json({
        success: true,
        customer: {
          id: customer.id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postal_code
        }
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Ecommerce - Customer Login');
    }
  }
);

/**
 * @route   POST /api/ecommerce/orders
 * @desc    Create a new e-commerce order
 * @access  Public
 */
router.post(
  '/orders',
  [
    body('customer.firstName').notEmpty().withMessage('Customer first name is required'),
    body('customer.lastName').notEmpty().withMessage('Customer last name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required'),
    body('customer.phone').notEmpty().withMessage('Phone number is required'),
    body('customer.address').notEmpty().withMessage('Address is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryArea').isIn(['inside_colombo', 'outside_colombo']).withMessage('Invalid delivery area'),
    body('paymentMethod').isIn(['cod', 'bank_transfer']).withMessage('Invalid payment method')
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
        customer: customerData,
        items,
        deliveryArea,
        paymentMethod,
        receiptUrl,
        appliedCoupon,
        notes
      } = req.body;
      
      // Check if customer exists or create new one
      let customerId;
      const existingCustomer = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [customerData.email]
      );
      
      if (existingCustomer.rows.length > 0) {
        customerId = existingCustomer.rows[0].id;
        
        // Update customer details
        await client.query(
          `UPDATE customers SET 
           first_name = $1, last_name = $2, phone = $3, address = $4, 
           city = $5, postal_code = $6, updated_at = CURRENT_TIMESTAMP
           WHERE id = $7`,
          [
            customerData.firstName,
            customerData.lastName,
            customerData.phone,
            customerData.address,
            customerData.city,
            customerData.postalCode,
            customerId
          ]
        );
      } else {
        // Create new customer
        customerId = `CUST-${Date.now()}`;
        await client.query(
          `INSERT INTO customers (
            id, first_name, last_name, email, phone, address, city, postal_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            customerId,
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.phone,
            customerData.address,
            customerData.city,
            customerData.postalCode
          ]
        );
      }
      
      // Get delivery charge
      const deliveryCharge = deliveryArea === 'inside_colombo' ? 300.00 : 600.00;
      
      // Calculate order totals
      let subtotal = 0;
      let categoryTaxTotal = 0;
      const processedItems = [];
      
      // Get active taxes
      const taxesResult = await client.query(
        'SELECT * FROM taxes WHERE is_active = TRUE'
      );
      const taxes = taxesResult.rows;
      
      // Process each item
      for (const item of items) {
        // Get product details
        const productResult = await client.query(
          'SELECT * FROM products WHERE id = $1',
          [item.productId]
        );
        
        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        const product = productResult.rows[0];
        
        // Check stock availability
        if (item.selectedColorId && item.selectedSize) {
          const sizeResult = await client.query(`
            SELECT ps.stock FROM product_sizes ps
            JOIN product_colors pc ON ps.product_color_id = pc.id
            WHERE pc.id = $1 AND ps.name = $2
          `, [item.selectedColorId, item.selectedSize]);
          
          if (sizeResult.rows.length === 0 || sizeResult.rows[0].stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name} - ${item.selectedSize}`);
          }
        } else if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        
        const itemPrice = parseFloat(product.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        
        // Calculate category taxes for this item
        const categoryTaxes = taxes.filter(tax =>
          tax.tax_type === 'category' &&
          Array.isArray(tax.applicable_categories) &&
          tax.applicable_categories.includes(product.category)
        );
        
        categoryTaxes.forEach(tax => {
          const taxAmount = (itemTotal * parseFloat(tax.rate)) / 100;
          categoryTaxTotal += taxAmount;
        });
        
        // Add addon prices if any
        let addonTotal = 0;
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            addonTotal += parseFloat(addon.price) * item.quantity;
          }
        }
        
        processedItems.push({
          product,
          quantity: item.quantity,
          selectedColorId: item.selectedColorId,
          selectedSize: item.selectedSize,
          addons: item.addons || [],
          itemTotal: itemTotal + addonTotal
        });
      }
      
      // Apply coupon discount
      let couponDiscount = 0;
      if (appliedCoupon) {
        const couponResult = await client.query(
          'SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE',
          [appliedCoupon]
        );
        
        if (couponResult.rows.length > 0) {
          const coupon = couponResult.rows[0];
          if (coupon.discount_type === 'percentage') {
            couponDiscount = (subtotal * parseFloat(coupon.discount_percent)) / 100;
            if (coupon.max_discount && couponDiscount > parseFloat(coupon.max_discount)) {
              couponDiscount = parseFloat(coupon.max_discount);
            }
          } else {
            couponDiscount = parseFloat(coupon.discount_amount);
          }
          
          // Update coupon usage
          await client.query(
            'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
            [coupon.id]
          );
        }
      }
      
      // Calculate full bill taxes
      const taxableAmount = subtotal + categoryTaxTotal - couponDiscount + deliveryCharge;
      const fullBillTaxes = taxes.filter(tax => tax.tax_type === 'full_bill');
      const fullBillTaxTotal = fullBillTaxes.reduce((sum, tax) => 
        sum + (taxableAmount * parseFloat(tax.rate)) / 100, 0
      );
      
      const totalTax = categoryTaxTotal + fullBillTaxTotal;
      const total = subtotal + totalTax - couponDiscount + deliveryCharge;
      
      // Generate transaction ID
      const transactionId = `TXN-EC-${Date.now()}`;
      
      // Create transaction
      const transactionResult = await client.query(`
        INSERT INTO transactions (
          id, source, customer_id, customer_name, customer_phone, customer_email, 
          customer_address, cashier, payment_method, subtotal, category_tax_total,
          full_bill_tax_total, total_tax, discount, delivery_charge, delivery_area,
          total, applied_coupon, notes, order_notes, status, receipt_url,
          applied_taxes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *
      `, [
        transactionId,
        'ecommerce',
        customerId,
        `${customerData.firstName} ${customerData.lastName}`,
        customerData.phone,
        customerData.email,
        customerData.address,
        'E-commerce System',
        paymentMethod,
        subtotal,
        categoryTaxTotal,
        fullBillTaxTotal,
        totalTax,
        couponDiscount,
        deliveryCharge,
        deliveryArea,
        total,
        appliedCoupon,
        notes,
        `Delivery Area: ${deliveryArea === 'inside_colombo' ? 'Inside Colombo' : 'Outside Colombo'}`,
        paymentMethod === 'bank_transfer' ? 'pending_payment' : 'confirmed',
        receiptUrl,
        JSON.stringify({
          categoryTaxes: taxes.filter(t => t.tax_type === 'category'),
          fullBillTaxes: fullBillTaxes
        })
      ]);
      
      // Insert transaction items and update stock
      for (const item of processedItems) {
        await client.query(`
          INSERT INTO transaction_items (
            transaction_id, product_id, product_name, product_price,
            product_barcode, product_category, quantity, selected_size,
            addons, selected_color_id
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
          JSON.stringify(item.addons),
          item.selectedColorId
        ]);
        
        // Update product stock
        if (item.selectedSize && item.selectedColorId) {
          // Update specific size stock
          await client.query(`
            UPDATE product_sizes
            SET stock = stock - $1
            WHERE id = (
              SELECT ps.id 
              FROM product_sizes ps
              JOIN product_colors pc ON ps.product_color_id = pc.id
              WHERE pc.id = $2 AND ps.name = $3
            )
          `, [item.quantity, item.selectedColorId, item.selectedSize]);
          
          // Update total product stock
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
          // Update regular product stock
          await client.query(`
            UPDATE products
            SET stock = GREATEST(0, stock - $1)
            WHERE id = $2
          `, [item.quantity, item.product.id]);
        }
        
        // Update raw material stock for addons
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            await client.query(`
              UPDATE raw_materials
              SET stock_quantity = GREATEST(0, stock_quantity - $1)
              WHERE id = $2
            `, [parseFloat(addon.quantity) * item.quantity, addon.id]);
          }
        }
      }
      
      await client.query('COMMIT');
      
      const transaction = transactionResult.rows[0];
      
      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail({
          ...transaction,
          customer: customerData,
          items: processedItems,
          deliveryCharge,
          deliveryArea
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
      }
      
      res.status(201).json({
        orderId: transaction.id,
        status: transaction.status,
        total: parseFloat(transaction.total),
        deliveryCharge: parseFloat(transaction.delivery_charge),
        message: 'Order placed successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      handleRouteError(error, req, res, 'Ecommerce - Create Order');
    } finally {
      client.release();
    }
  }
);

/**
 * @route   GET /api/ecommerce/orders/:customerId
 * @desc    Get customer orders
 * @access  Public (with customer validation)
 */
router.get('/orders/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const client = await pool.connect();
    
    // Get customer orders with items
    const ordersResult = await client.query(`
      SELECT t.*, ti.product_name, ti.quantity, ti.product_price, ti.selected_size, ti.addons
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.customer_id = $1 AND t.source = 'ecommerce'
      ORDER BY t.timestamp DESC
    `, [customerId]);
    
    client.release();
    
    // Group items by transaction
    const ordersMap = new Map();
    
    ordersResult.rows.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          customerName: row.customer_name,
          total: parseFloat(row.total),
          deliveryCharge: parseFloat(row.delivery_charge),
          deliveryArea: row.delivery_area,
          status: row.status,
          paymentMethod: row.payment_method,
          receiptUrl: row.receipt_url,
          timestamp: row.timestamp,
          items: []
        });
      }
      
      if (row.product_name) {
        ordersMap.get(row.id).items.push({
          productName: row.product_name,
          quantity: row.quantity,
          price: parseFloat(row.product_price),
          selectedSize: row.selected_size,
          addons: row.addons
        });
      }
    });
    
    res.json(Array.from(ordersMap.values()));
  } catch (error) {
    handleRouteError(error, req, res, 'Ecommerce - Get Customer Orders');
  }
});

module.exports = router;