const logger = require('./logger');

/**
 * Comprehensive Validation Utilities
 *
 * Provides reusable validation functions for business logic, data integrity,
 * and request validation throughout the application.
 *
 * @author VcarePOS System
 * @created 2025-11-17
 */

/**
 * Validation error class for structured error handling
 */
class ValidationError extends Error {
  constructor(message, field = null, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.statusCode = 400;
  }
}

/**
 * Business logic error class
 */
class BusinessLogicError extends Error {
  constructor(message, code = 'BUSINESS_LOGIC_ERROR') {
    super(message);
    this.name = 'BusinessLogicError';
    this.code = code;
    this.statusCode = 422;
  }
}

/**
 * Validates stock availability for a product
 *
 * @param {Object} client - Database client
 * @param {string} productId - Product ID
 * @param {number} requestedQuantity - Quantity requested
 * @param {Object} options - Additional options (colorId, size)
 * @returns {Promise<Object>} Validation result
 */
async function validateStockAvailability(client, productId, requestedQuantity, options = {}) {
  try {
    logger.debug('Validating stock availability', {
      productId,
      requestedQuantity,
      ...options
    });

    let availableStock = 0;
    let query;
    let params;

    // Check if product has size/color variants
    if (options.colorId && options.size) {
      // Query specific variant stock
      query = `
        SELECT ps.stock, ps.name as size_name, pc.name as color_name
        FROM product_sizes ps
        JOIN product_colors pc ON ps.product_color_id = pc.id
        WHERE pc.id = $1 AND ps.name = $2
      `;
      params = [options.colorId, options.size];
    } else {
      // Query regular product stock
      query = `SELECT stock, name FROM products WHERE id = $1`;
      params = [productId];
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      throw new ValidationError(
        'Product or variant not found',
        'productId',
        'PRODUCT_NOT_FOUND'
      );
    }

    availableStock = parseInt(result.rows[0].stock) || 0;
    const productName = result.rows[0].name ||
      `${result.rows[0].color_name || ''} ${result.rows[0].size_name || ''}`.trim();

    // Validate sufficient stock
    if (availableStock < requestedQuantity) {
      const message = options.colorId && options.size
        ? `Insufficient stock for ${productName}. Available: ${availableStock}, Requested: ${requestedQuantity}`
        : `Insufficient stock for ${productName}. Available: ${availableStock}, Requested: ${requestedQuantity}`;

      throw new BusinessLogicError(message, 'INSUFFICIENT_STOCK');
    }

    logger.debug('Stock validation passed', {
      productId,
      availableStock,
      requestedQuantity
    });

    return {
      valid: true,
      availableStock,
      requestedQuantity,
      productName
    };

  } catch (error) {
    if (error instanceof ValidationError || error instanceof BusinessLogicError) {
      throw error;
    }

    logger.error('Stock validation error', {
      productId,
      requestedQuantity,
      error: error.message
    });

    throw new Error(`Stock validation failed: ${error.message}`);
  }
}

/**
 * Validates multiple items' stock availability (for cart/bulk operations)
 *
 * @param {Object} client - Database client
 * @param {Array} items - Array of items to validate
 * @returns {Promise<Object>} Validation result
 */
async function validateBulkStockAvailability(client, items) {
  try {
    logger.info('Validating bulk stock availability', { itemCount: items.length });

    const validationResults = [];
    const errors = [];

    for (const item of items) {
      try {
        const result = await validateStockAvailability(
          client,
          item.product.id,
          item.quantity,
          {
            colorId: item.selectedColorId,
            size: item.selectedSize
          }
        );
        validationResults.push({ ...result, itemId: item.product.id });
      } catch (error) {
        errors.push({
          itemId: item.product.id,
          itemName: item.product.name,
          error: error.message,
          code: error.code
        });
      }
    }

    if (errors.length > 0) {
      const errorMessage = `Stock validation failed for ${errors.length} item(s): ${
        errors.map(e => `${e.itemName} (${e.error})`).join(', ')
      }`;

      throw new BusinessLogicError(errorMessage, 'BULK_STOCK_VALIDATION_FAILED');
    }

    logger.info('Bulk stock validation passed', { itemCount: items.length });

    return {
      valid: true,
      validatedItems: validationResults
    };

  } catch (error) {
    logger.error('Bulk stock validation error', {
      itemCount: items.length,
      error: error.message
    });
    throw error;
  }
}

/**
 * Validates purchase order data
 *
 * @param {Object} poData - Purchase order data
 * @returns {Object} Validation result
 */
function validatePurchaseOrder(poData) {
  const errors = [];

  // Validate vendor
  if (!poData.vendorId) {
    errors.push({ field: 'vendorId', message: 'Vendor is required' });
  }

  // Validate items
  if (!poData.items || !Array.isArray(poData.items) || poData.items.length === 0) {
    errors.push({ field: 'items', message: 'At least one item is required' });
  } else {
    poData.items.forEach((item, index) => {
      if (!item.itemId) {
        errors.push({ field: `items[${index}].itemId`, message: 'Item ID is required' });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be greater than 0' });
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push({ field: `items[${index}].unitPrice`, message: 'Unit price must be 0 or greater' });
      }
    });
  }

  // Validate dates
  if (poData.expectedDeliveryDate) {
    const deliveryDate = new Date(poData.expectedDeliveryDate);
    const orderDate = new Date(poData.orderDate || Date.now());

    if (deliveryDate < orderDate) {
      errors.push({
        field: 'expectedDeliveryDate',
        message: 'Expected delivery date cannot be before order date'
      });
    }
  }

  if (errors.length > 0) {
    const error = new ValidationError('Purchase order validation failed');
    error.details = errors;
    throw error;
  }

  return { valid: true };
}

/**
 * Validates goods receive note against purchase order
 *
 * @param {Object} client - Database client
 * @param {string} purchaseOrderId - Purchase order ID
 * @param {Array} grnItems - Items being received
 * @returns {Promise<Object>} Validation result
 */
async function validateGoodsReceiveNote(client, purchaseOrderId, grnItems) {
  try {
    logger.debug('Validating GRN against PO', { purchaseOrderId });

    // Get purchase order items
    const poResult = await client.query(`
      SELECT poi.*, po.status
      FROM purchase_order_items poi
      JOIN purchase_orders po ON poi.purchase_order_id = po.id
      WHERE poi.purchase_order_id = $1
    `, [purchaseOrderId]);

    if (poResult.rows.length === 0) {
      throw new ValidationError(
        'Purchase order not found or has no items',
        'purchaseOrderId',
        'PO_NOT_FOUND'
      );
    }

    const poStatus = poResult.rows[0].status;
    if (poStatus === 'cancelled') {
      throw new BusinessLogicError(
        'Cannot receive goods for cancelled purchase order',
        'PO_CANCELLED'
      );
    }

    // Get already received quantities
    const receivedResult = await client.query(`
      SELECT item_id, SUM(received_quantity) as total_received
      FROM goods_receive_note_items grni
      JOIN goods_receive_notes grn ON grni.grn_id = grn.id
      WHERE grn.purchase_order_id = $1
      GROUP BY item_id
    `, [purchaseOrderId]);

    const receivedQuantities = {};
    receivedResult.rows.forEach(row => {
      receivedQuantities[row.item_id] = parseInt(row.total_received) || 0;
    });

    // Validate each GRN item
    const errors = [];
    grnItems.forEach((grnItem, index) => {
      const poItem = poResult.rows.find(po => po.item_id === grnItem.itemId);

      if (!poItem) {
        errors.push({
          field: `items[${index}].itemId`,
          message: `Item ${grnItem.itemId} not found in purchase order`
        });
        return;
      }

      const orderedQuantity = parseFloat(poItem.quantity);
      const alreadyReceived = receivedQuantities[grnItem.itemId] || 0;
      const receivingNow = parseFloat(grnItem.receivedQuantity);
      const totalReceived = alreadyReceived + receivingNow;

      if (totalReceived > orderedQuantity) {
        errors.push({
          field: `items[${index}].receivedQuantity`,
          message: `Cannot receive more than ordered. Ordered: ${orderedQuantity}, Already received: ${alreadyReceived}, Attempting: ${receivingNow}`
        });
      }

      if (receivingNow <= 0) {
        errors.push({
          field: `items[${index}].receivedQuantity`,
          message: 'Received quantity must be greater than 0'
        });
      }
    });

    if (errors.length > 0) {
      const error = new ValidationError('GRN validation failed');
      error.details = errors;
      throw error;
    }

    logger.debug('GRN validation passed', { purchaseOrderId });

    return { valid: true };

  } catch (error) {
    if (error instanceof ValidationError || error instanceof BusinessLogicError) {
      throw error;
    }

    logger.error('GRN validation error', {
      purchaseOrderId,
      error: error.message
    });
    throw new Error(`GRN validation failed: ${error.message}`);
  }
}

/**
 * Validates refund request
 *
 * @param {Object} client - Database client
 * @param {string} transactionId - Transaction ID
 * @param {Object} refundData - Refund data
 * @returns {Promise<Object>} Validation result
 */
async function validateRefund(client, transactionId, refundData) {
  try {
    logger.debug('Validating refund', { transactionId, refundData });

    // Get transaction
    const txnResult = await client.query(`
      SELECT * FROM transactions WHERE id = $1
    `, [transactionId]);

    if (txnResult.rows.length === 0) {
      throw new ValidationError(
        'Transaction not found',
        'transactionId',
        'TRANSACTION_NOT_FOUND'
      );
    }

    const transaction = txnResult.rows[0];

    // Check if transaction can be refunded
    if (transaction.status === 'refunded') {
      throw new BusinessLogicError(
        'Transaction has already been fully refunded',
        'ALREADY_REFUNDED'
      );
    }

    // Get existing refunds
    const refundsResult = await client.query(`
      SELECT COALESCE(SUM(refund_amount), 0) as total_refunded
      FROM refunds
      WHERE transaction_id = $1 AND status = 'completed'
    `, [transactionId]);

    const totalRefunded = parseFloat(refundsResult.rows[0].total_refunded) || 0;
    const transactionTotal = parseFloat(transaction.total);
    const refundAmount = parseFloat(refundData.refundAmount);

    // Validate refund amount
    if (refundAmount <= 0) {
      throw new ValidationError(
        'Refund amount must be greater than 0',
        'refundAmount',
        'INVALID_AMOUNT'
      );
    }

    if (totalRefunded + refundAmount > transactionTotal) {
      throw new BusinessLogicError(
        `Refund amount exceeds remaining refundable amount. Transaction total: ${transactionTotal}, Already refunded: ${totalRefunded}, Attempting: ${refundAmount}`,
        'REFUND_EXCEEDS_TOTAL'
      );
    }

    // Validate refund items if provided
    if (refundData.refundType === 'items' && refundData.refundItems) {
      const itemsResult = await client.query(`
        SELECT * FROM transaction_items WHERE transaction_id = $1
      `, [transactionId]);

      const transactionItems = itemsResult.rows;

      refundData.refundItems.forEach((refundItem, index) => {
        const txnItem = transactionItems.find(ti => ti.product_id === refundItem.productId);

        if (!txnItem) {
          throw new ValidationError(
            `Item ${refundItem.productId} not found in transaction`,
            `refundItems[${index}].productId`,
            'ITEM_NOT_FOUND'
          );
        }

        if (refundItem.refundQuantity > txnItem.quantity) {
          throw new ValidationError(
            `Cannot refund more than purchased quantity for item ${refundItem.productId}`,
            `refundItems[${index}].refundQuantity`,
            'QUANTITY_EXCEEDS_PURCHASED'
          );
        }
      });
    }

    logger.debug('Refund validation passed', { transactionId });

    return {
      valid: true,
      transaction,
      remainingRefundable: transactionTotal - totalRefunded
    };

  } catch (error) {
    if (error instanceof ValidationError || error instanceof BusinessLogicError) {
      throw error;
    }

    logger.error('Refund validation error', {
      transactionId,
      error: error.message
    });
    throw new Error(`Refund validation failed: ${error.message}`);
  }
}

/**
 * Validates numeric value
 *
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {Object} options - Validation options
 * @returns {number} Validated number
 */
function validateNumber(value, fieldName, options = {}) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName,
      'INVALID_NUMBER'
    );
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      fieldName,
      'VALUE_TOO_LOW'
    );
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      fieldName,
      'VALUE_TOO_HIGH'
    );
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(
      `${fieldName} must be an integer`,
      fieldName,
      'MUST_BE_INTEGER'
    );
  }

  return num;
}

/**
 * Validates required field
 *
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name
 * @returns {any} Value if valid
 */
function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(
      `${fieldName} is required`,
      fieldName,
      'FIELD_REQUIRED'
    );
  }
  return value;
}

/**
 * Validates email format
 *
 * @param {string} email - Email to validate
 * @param {string} fieldName - Field name
 * @returns {string} Email if valid
 */
function validateEmail(email, fieldName = 'email') {
  if (!email) return null; // Email is optional in most cases

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      'Invalid email format',
      fieldName,
      'INVALID_EMAIL'
    );
  }

  return email;
}

/**
 * Validates phone number format
 *
 * @param {string} phone - Phone number to validate
 * @param {string} fieldName - Field name
 * @returns {string} Phone if valid
 */
function validatePhone(phone, fieldName = 'phone') {
  if (!phone) return null; // Phone is optional in most cases

  // Basic phone validation (can be enhanced for specific formats)
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError(
      'Invalid phone number format',
      fieldName,
      'INVALID_PHONE'
    );
  }

  return phone;
}

module.exports = {
  // Error classes
  ValidationError,
  BusinessLogicError,

  // Stock validation
  validateStockAvailability,
  validateBulkStockAvailability,

  // Business logic validation
  validatePurchaseOrder,
  validateGoodsReceiveNote,
  validateRefund,

  // Field validation
  validateNumber,
  validateRequired,
  validateEmail,
  validatePhone
};
