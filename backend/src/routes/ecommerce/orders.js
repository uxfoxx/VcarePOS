const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticate, hasPermission } = require('../../middleware/auth');
const { handleRouteError } = require('../../utils/loggerUtils');
const { pool } = require('../../utils/db');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../../helper/mail.helper');
const { generateOrderStatusEmailBody, generateOrderSummaryEmailBody } = require('../../utils/mailHelper');

const router = express.Router();

/**
 * @swagger
 * /ecommerce/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               customerAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post('/orders', [
  authenticate,
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('customerAddress').notEmpty().withMessage('Customer address is required'),
  body('paymentMethod').isIn(['cash_on_delivery', 'bank_transfer', 'store_pickup']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  // Conditional validation for bank transfer receipt
  body('receiptDetails').custom((value, { req }) => {
    if (req.body.paymentMethod === 'bank_transfer') {
      if (!value || !value.filePath || !value.originalFilename || !value.fileSize) {
        throw new Error('Receipt details are required for bank transfer orders');
      }
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    paymentMethod,
    items,
    receiptDetails,
    deliveryLocation,
    deliveryCharge
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculate total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Validate product exists and has stock
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
          SELECT ps.* FROM product_sizes ps
          JOIN product_colors pc ON ps.product_color_id = pc.id
          WHERE pc.id = $1 AND ps.name = $2
        `, [item.selectedColorId, item.selectedSize]);

        if (sizeResult.rows.length === 0) {
          throw new Error(`Size ${item.selectedSize} not found for product ${product.name}`);
        }

        const size = sizeResult.rows[0];
        if (size.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} - ${item.selectedSize}`);
        }
      } else {
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Find the color image if color is selected
      let productImage = product.image;
      let colorName = null;
      if (item.selectedColorId) {
        const colorResult = await client.query(`
          SELECT name, image FROM product_colors WHERE id = $1
        `, [item.selectedColorId]);
        if (colorResult.rows.length > 0) {
          if (colorResult.rows[0].image) productImage = colorResult.rows[0].image;
          colorName = colorResult.rows[0].name;
        }
      }

      // If still no color image, try first media
      if (!productImage && product.media) {
        try {
          const parsedMedia = typeof product.media === 'string' ? JSON.parse(product.media) : product.media;
          if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
            productImage = parsedMedia[0];
          }
        } catch (e) { }
      }

      validatedItems.push({
        productId: item.productId,
        productName: product.name,
        selectedColorId: item.selectedColorId,
        colorName: colorName,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        productImage: productImage
      });

      // Update raw material stock for the selected size (new relationship structure)
      if (item.selectedColorId && item.selectedSize) {
        const rawMaterialsResult = await client.query(`
            SELECT prm.raw_material_id, prm.quantity
            FROM product_raw_materials prm
            JOIN product_sizes ps ON prm.product_size_id = ps.id
            JOIN product_colors pc ON ps.product_color_id = pc.id
            WHERE pc.id = $1 AND ps.name = $2
          `, [item.selectedColorId, item.selectedSize]);

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
    }

    // Generate order ID
    const orderId = `ECOM-${Date.now()}`;

    // Add delivery charge to total
    const finalTotal = totalAmount + (parseFloat(deliveryCharge) || 0);

    // Insert order
    const orderResult = await client.query(`
      INSERT INTO ecommerce_orders (
        id, customer_id, customer_name, customer_email, customer_phone,
        customer_address, total_amount, payment_method, order_status,
        delivery_location, delivery_charge
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      orderId,
      req.user.id,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      finalTotal,
      paymentMethod,
      paymentMethod === 'bank_transfer' ? 'pending_payment' : 'processing',
      deliveryLocation || null,
      parseFloat(deliveryCharge) || 0
    ]);

    // Handle bank transfer receipt if provided
    if (paymentMethod === 'bank_transfer' && receiptDetails) {
      // Generate receipt ID
      const receiptId = `RECEIPT-${Date.now()}`;

      // Move file from temp location to permanent location
      const tempPath = receiptDetails.filePath;
      const permanentDir = path.join(__dirname, '../../../uploads/receipts');
      if (!fs.existsSync(permanentDir)) {
        fs.mkdirSync(permanentDir, { recursive: true });
      }

      const permanentFilename = `receipt-${orderId}-${Date.now()}${path.extname(receiptDetails.originalFilename)}`;
      const permanentPath = path.join(permanentDir, permanentFilename);

      // Move file from temp to permanent location
      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, permanentPath);
      }

      // Insert receipt record
      await client.query(`
        INSERT INTO bank_receipts (
          id, ecommerce_order_id, file_path, original_filename, file_size, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        receiptId,
        orderId,
        permanentPath,
        receiptDetails.originalFilename,
        receiptDetails.fileSize,
        'pending_verification'
      ]);
    }

    // Insert order items
    for (const item of validatedItems) {
      await client.query(`
        INSERT INTO ecommerce_order_items (
          ecommerce_order_id, product_id, product_name, selected_color_id,
          selected_size, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        orderId,
        item.productId,
        item.productName,
        item.selectedColorId,
        item.selectedSize,
        item.quantity,
        item.unitPrice,
        item.totalPrice
      ]);

      // Update product stock
      if (item.selectedColorId && item.selectedSize) {
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
        `, [item.productId]);
      } else {
        await client.query(`
          UPDATE products
          SET stock = GREATEST(0, stock - $1)
          WHERE id = $2
        `, [item.quantity, item.productId]);
      }
    }

    await client.query('COMMIT');

    const order = orderResult.rows[0];

    // Insert initial status into timeline
    await client.query(`
      INSERT INTO ecommerce_order_timeline (order_id, status, notes)
      VALUES ($1, $2, $3)
    `, [order.id, order.order_status, 'Order placed']);

    // Send order confirmation & summary emails
    try {
      const confirmationBody = generateOrderStatusEmailBody(
        order.id,
        order.customer_name,
        order.order_status,
        [{ status: order.order_status, updated_at: order.created_at }], // Initial timeline
        '' // notes
      );

      const summaryBody = generateOrderSummaryEmailBody(order, validatedItems);

      // Fire both emails concurrently
      await Promise.all([
        sendEmail(order.customer_email, `Your Order #${order.id} Confirmation`, confirmationBody),
        sendEmail(order.customer_email, `Your Order #${order.id} Details`, summaryBody)
      ]);
    } catch (emailError) {
      console.error('Failed to send order emails:', emailError);
    }

    res.status(201).json({
      id: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      totalAmount: parseFloat(order.total_amount),
      paymentMethod: order.payment_method,
      orderStatus: order.order_status,
      createdAt: order.created_at,
      items: validatedItems
    });
  } catch (error) {
    await client.query('ROLLBACK');

    // Clean up temporary file if it exists
    if (req.body.receiptDetails && req.body.receiptDetails.filePath) {
      try {
        if (fs.existsSync(req.body.receiptDetails.filePath)) {
          fs.unlinkSync(req.body.receiptDetails.filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }

    handleRouteError(error, req, res, 'E-commerce - Create Order');
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /ecommerce/users/{userId}/orders:
 *   get:
 *     summary: Get customer order history
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer orders
 *       403:
 *         description: Access denied
 */
router.get('/users/:userId/orders', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure customer can only view their own orders
    if (req.user.role === 'customer' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const client = await pool.connect();

    // Get customer orders
    const ordersResult = await client.query(`
      SELECT * FROM ecommerce_orders 
      WHERE customer_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    // Get order items with product and color details
    const itemsResult = await client.query(`
      SELECT eoi.*,
             p.image as product_primary_image,
             pc.name as color_name,
             pc.color_code as color_code,
             pc.image as color_image
      FROM ecommerce_order_items eoi
      LEFT JOIN products p ON p.id = eoi.product_id
      LEFT JOIN product_colors pc ON pc.id = eoi.selected_color_id
      WHERE eoi.ecommerce_order_id IN (
        SELECT id FROM ecommerce_orders WHERE customer_id = $1
      )
    `, [userId]);

    client.release();

    // Map items to orders
    const orders = ordersResult.rows.map(order => {
      const orderItems = itemsResult.rows
        .filter(item => item.ecommerce_order_id === order.id)
        .map(item => {
          let firstMediaImage = null;
          try {
            if (item.product_media) {
              const parsedMedia = typeof item.product_media === 'string' ? JSON.parse(item.product_media) : item.product_media;
              if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
                firstMediaImage = parsedMedia[0];
              }
            }
          } catch (e) { }

          return {
            productId: item.product_id,
            productName: item.product_name,
            productImage: item.color_image || firstMediaImage || item.product_primary_image || null,
            selectedColorId: item.selected_color_id,
            colorName: item.color_name || null,
            colorCode: item.color_code || null,
            selectedSize: item.selected_size,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            totalPrice: parseFloat(item.total_price)
          };
        });

      return {
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        totalAmount: parseFloat(order.total_amount),
        paymentMethod: order.payment_method,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: orderItems
      };
    });

    res.json(orders);
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Get Customer Orders');
  }
});

// ============= POS ADMIN ENDPOINTS (Authentication Required) =============

/**
 * @swagger
 * /ecommerce/orders:
 *   get:
 *     summary: Get all e-commerce orders (POS Admin)
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all e-commerce orders
 */
router.get('/orders', authenticate, hasPermission('ecommerce-orders', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();

    // Get all e-commerce orders
    const ordersResult = await client.query(`
      SELECT * FROM ecommerce_orders 
      ORDER BY created_at DESC
    `);

    // Get all order items
    const itemsResult = await client.query(`
      SELECT * FROM ecommerce_order_items
    `);

    // Get all bank receipts
    const receiptsResult = await client.query(`
      SELECT * FROM bank_receipts
    `);

    client.release();

    // Map items and receipts to orders
    const orders = ordersResult.rows.map(order => {
      const orderItems = itemsResult.rows
        .filter(item => item.ecommerce_order_id === order.id)
        .map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          selectedColorId: item.selected_color_id,
          selectedSize: item.selected_size,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price)
        }));

      const bankReceipt = receiptsResult.rows.find(receipt => receipt.ecommerce_order_id === order.id);

      return {
        id: order.id,
        customerId: order.customer_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        totalAmount: parseFloat(order.total_amount),
        paymentMethod: order.payment_method,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: orderItems,
        bankReceipt: bankReceipt ? {
          id: bankReceipt.id,
          filePath: bankReceipt.file_path,
          originalFilename: bankReceipt.original_filename,
          fileSize: bankReceipt.file_size,
          uploadedAt: bankReceipt.uploaded_at,
          status: bankReceipt.status
        } : null
      };
    });

    res.json(orders);
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Get All Orders (POS)');
  }
});

/**
 * @swagger
 * /ecommerce/orders/new:
 *   get:
 *     summary: Get new unread e-commerce orders
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New unread orders
 */
router.get('/orders/new', [authenticate, hasPermission('ecommerce', 'view')], async (req, res) => {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        o.*,
        COUNT(*) OVER() as total_count
      FROM ecommerce_orders o
      WHERE o.notified_at IS NULL
      ORDER BY o.created_at DESC
    `);

    client.release();

    res.json({
      orders: result.rows,
      count: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Get New Orders');
  }
});

/**
 * @swagger
 * /ecommerce/orders/{orderId}:
 *   get:
 *     summary: Get e-commerce order details (POS Admin)
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', authenticate, hasPermission('ecommerce', 'view'), async (req, res) => {
  try {
    const { orderId } = req.params;

    const client = await pool.connect();

    // if req.user.role === customer and req.user.id !== order.customer_id, return 403
    if (req.user.role === 'customer') {
      const orderCheckResult = await client.query(`
        SELECT * FROM ecommerce_orders WHERE id = $1
      `, [orderId]);

      if (orderCheckResult.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = orderCheckResult.rows[0];
      if (order.customer_id !== req.user.id) {
        client.release();
        return res.status(403).json({ message: 'Access denied' });
      }
    }


    // Get order
    const orderResult = await client.query(`
      SELECT * FROM ecommerce_orders WHERE id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items with product and color details
    const itemsResult = await client.query(`
      SELECT eoi.*,
             p.image as product_primary_image,
             p.media as product_media,
             pc.name as color_name,
             pc.color_code as color_code,
             pc.image as color_image
      FROM ecommerce_order_items eoi
      LEFT JOIN products p ON p.id = eoi.product_id
      LEFT JOIN product_colors pc ON pc.id = eoi.selected_color_id
      WHERE eoi.ecommerce_order_id = $1
    `, [orderId]);

    // Get bank receipt if exists
    const receiptResult = await client.query(`
      SELECT * FROM bank_receipts WHERE ecommerce_order_id = $1
    `, [orderId]);

    client.release();

    const orderItems = itemsResult.rows.map(item => {
      let firstMediaImage = null;
      try {
        if (item.product_media) {
          const parsedMedia = typeof item.product_media === 'string' ? JSON.parse(item.product_media) : item.product_media;
          if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
            firstMediaImage = parsedMedia[0];
          }
        }
      } catch (e) { }

      return {
        productId: item.product_id,
        productName: item.product_name,
        productImage: item.color_image || firstMediaImage || item.product_primary_image || null,
        selectedColorId: item.selected_color_id,
        colorName: item.color_name || null,
        colorCode: item.color_code || null,
        selectedSize: item.selected_size,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price)
      };
    });

    const bankReceipt = receiptResult.rows.length > 0 ? {
      id: receiptResult.rows[0].id,
      filePath: receiptResult.rows[0].file_path,
      originalFilename: receiptResult.rows[0].original_filename,
      fileSize: receiptResult.rows[0].file_size,
      uploadedAt: receiptResult.rows[0].uploaded_at,
      status: receiptResult.rows[0].status
    } : null;

    res.json({
      id: order.id,
      customerId: order.customer_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      totalAmount: parseFloat(order.total_amount),
      paymentMethod: order.payment_method,
      orderStatus: order.order_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: orderItems,
      bankReceipt
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Get Order Details (POS)');
  }
});

/**
 * @swagger
 * /ecommerce/orders/{orderId}/receipt-status:
 *   put:
 *     summary: Verify or reject a bank transfer receipt
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receipt status updated
 *       400:
 *         description: Validations failed or invalid order
 *       404:
 *         description: Order or receipt not found
 */
router.put('/orders/:orderId/receipt-status', [
  authenticate,
  hasPermission('ecommerce-orders', 'edit'),
  param('orderId').notEmpty().withMessage('Order ID is required'),
  body('status').isIn(['verified', 'rejected']).withMessage('Invalid receipt status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId } = req.params;
  const { status, notes } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if order exists and is bank transfer
    const orderResult = await client.query(
      'SELECT * FROM ecommerce_orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];

    if (order.payment_method !== 'bank_transfer') {
      return res.status(400).json({ message: 'Only bank transfer orders have receipts' });
    }

    // Check if receipt exists
    const receiptResult = await client.query(
      'SELECT id FROM bank_receipts WHERE ecommerce_order_id = $1',
      [orderId]
    );

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ message: 'No bank receipt found for this order' });
    }

    // Update the receipt status specifically
    await client.query(
      'UPDATE bank_receipts SET status = $1 WHERE ecommerce_order_id = $2',
      [status, orderId]
    );

    let finalOrderStatus = order.order_status;
    let timelineMessage = notes || `Bank receipt marked as ${status}.`;

    // Only progress the order if it was successfully verified. 
    // If it was rejected, we leave the order in 'pending_payment'.
    if (status === 'verified' && order.order_status === 'pending_payment') {
      finalOrderStatus = 'processing';

      // Upgrade the order
      await client.query(
        'UPDATE ecommerce_orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [finalOrderStatus, orderId]
      );

      // Log the processing stage to timeline
      await client.query(
        'INSERT INTO ecommerce_order_timeline (order_id, status, notes) VALUES ($1, $2, $3)',
        [orderId, finalOrderStatus, timelineMessage]
      );

      // Fetch the full timeline array
      const timelineData = await client.query(
        'SELECT status, timestamp as updated_at FROM ecommerce_order_timeline WHERE order_id = $1 ORDER BY timestamp ASC',
        [orderId]
      );

      // Fire off the visual email update
      const emailBody = generateOrderStatusEmailBody(
        order.id,
        order.customer_name,
        finalOrderStatus,
        timelineData.rows,
        notes
      );
      await sendEmail(order.customer_email, `Your Order #${order.id} Status Updated`, emailBody);
    } else {
      // Just drop a note in the timeline that the receipt was rejected/verified but order unchanged
      await client.query(
        'INSERT INTO ecommerce_order_timeline (order_id, status, notes) VALUES ($1, $2, $3)',
        [orderId, order.order_status, timelineMessage]
      );
    }

    await client.query('COMMIT');

    res.json({
      id: orderId,
      orderStatus: finalOrderStatus,
      receiptStatus: status,
      message: `Receipt ${status} successfully`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    handleRouteError(error, req, res, 'E-commerce - Update Receipt Status');
  } finally {
    client.release();
  }
});


/**
 * @swagger
 * /ecommerce/orders/{orderId}/status:
 *   put:
 *     summary: Update e-commerce order status (POS Admin)
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */

router.put('/orders/:orderId/status', [
  authenticate,
  hasPermission('ecommerce-orders', 'edit'),
  param('orderId').notEmpty().withMessage('Order ID is required'),
  body('status').isIn(['pending_payment', 'processing', 'shipped', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId } = req.params;
  const { status, notes } = req.body;

  try {
    const client = await pool.connect();

    // Check if order exists
    const checkResult = await client.query(
      'SELECT * FROM ecommerce_orders WHERE id = $1',
      [orderId]
    );

    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = checkResult.rows[0];

    // Only handle bank receipts if payment method is bank_transfer
    if (order.payment_method === 'bank_transfer') {
      let updatedBankStatus = status;

      // If order moves to processing, shipped, or completed: the receipt is implicitly verified
      if (['processing', 'shipped', 'completed'].includes(status)) {
        updatedBankStatus = 'verified';
      } else if (status === 'pending_payment') {
        updatedBankStatus = 'pending_verification';
      } else if (status === 'cancelled') {
        updatedBankStatus = 'rejected';
      }

      if (['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
        const receiptResult = await client.query(
          'SELECT * FROM bank_receipts WHERE ecommerce_order_id = $1',
          [orderId]
        );
        if (receiptResult.rows.length > 0) {
          await client.query(
            'UPDATE bank_receipts SET status = $1 WHERE ecommerce_order_id = $2',
            [updatedBankStatus, orderId]
          );
        } else if (status !== 'cancelled') {
          client.release();
          return res.status(400).json({ message: 'Cannot update to this status without a bank receipt' });
        }
      }
    }

    // Update order status
    const result = await client.query(
      'UPDATE ecommerce_orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    // Insert into timeline table
    await client.query(
      'INSERT INTO ecommerce_order_timeline (order_id, status, notes) VALUES ($1, $2, $3)',
      [orderId, status, notes || null]
    );

    // Fetch the full timeline array
    const timelineResult = await client.query(
      'SELECT status, timestamp as updated_at FROM ecommerce_order_timeline WHERE order_id = $1 ORDER BY timestamp ASC',
      [orderId]
    );

    client.release();

    const updatedOrder = result.rows[0];

    // Send email to customer
    const emailBody = generateOrderStatusEmailBody(
      updatedOrder.id,
      updatedOrder.customer_name,
      updatedOrder.order_status,
      timelineResult.rows,
      notes
    );
    await sendEmail(updatedOrder.customer_email, `Your Order #${updatedOrder.id} Status Updated`, emailBody);

    res.json({
      id: updatedOrder.id,
      orderStatus: updatedOrder.order_status,
      updatedAt: updatedOrder.updated_at
    });

  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Update Order Status');
  }
});



router.post('/orders/:orderId/mark-notified', authenticate, async (req, res) => {
  const { orderId } = req.params;

  try {
    const client = await pool.connect();

    const result = await client.query(
      'UPDATE ecommerce_orders SET notified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [orderId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    client.release();

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Mark Order Notified');
  }
});

router.post('/orders/:orderId/mark-sound-played', authenticate, async (req, res) => {
  const { orderId } = req.params;

  try {
    const client = await pool.connect();

    const result = await client.query(
      'UPDATE ecommerce_orders SET sound_played_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [orderId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    client.release();

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Mark Sound Played');
  }
});


module.exports = router;