const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');
const { handleRouteError } = require('../utils/loggerUtils');

const router = express.Router();

function generateQuotationId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QUOT-${timestamp}${random}`;
}

router.post(
  '/',
  authenticate,
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('subtotal').isNumeric().withMessage('Subtotal must be a number'),
    body('total').isNumeric().withMessage('Total must be a number'),
    body('validUntil').optional().isISO8601().withMessage('Valid until must be a valid date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        items,
        subtotal,
        discount = 0,
        totalTax = 0,
        total,
        notes,
        validUntil,
        appliedTaxes = {}
      } = req.body;

      const quotationId = generateQuotationId();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const quotationResult = await client.query(
          `INSERT INTO quotations (
            id, customer_name, customer_phone, customer_email, customer_address,
            subtotal, discount, total_tax, total, notes, valid_until,
            created_by, applied_taxes, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *`,
          [
            quotationId,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            subtotal,
            discount,
            totalTax,
            total,
            notes,
            validUntil,
            req.user.id,
            JSON.stringify(appliedTaxes),
            'draft'
          ]
        );

        const quotationItemsPromises = items.map(item =>
          client.query(
            `INSERT INTO quotation_items (
              quotation_id, product_id, product_name, product_barcode,
              selected_variant, selected_size, quantity, unit_price,
              total_price, description, invoice_description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
              quotationId,
              item.productId || item.product?.id,
              item.name || item.product?.name || item.productName,
              item.barcode || item.product?.barcode,
              item.selectedVariant,
              item.selectedSize,
              item.quantity,
              item.unitPrice || item.price || item.product?.price,
              (item.quantity * (item.unitPrice || item.price || item.product?.price)),
              item.description,
              item.invoiceDescription
            ]
          )
        );

        const quotationItemsResults = await Promise.all(quotationItemsPromises);

        await client.query('COMMIT');

        const quotation = {
          ...quotationResult.rows[0],
          items: quotationItemsResults.map(r => r.rows[0])
        };

        res.status(201).json(quotation);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      handleRouteError(error, req, res, 'Error creating quotation');
    }
  }
);

router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const { status, search, startDate, endDate, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let queryParams = [];
      let paramCount = 1;

      if (req.user.role !== 'admin') {
        whereConditions.push(`q.created_by = $${paramCount}`);
        queryParams.push(req.user.id);
        paramCount++;
      }

      if (status) {
        whereConditions.push(`q.status = $${paramCount}`);
        queryParams.push(status);
        paramCount++;
      }

      if (search) {
        whereConditions.push(`(
          q.id ILIKE $${paramCount} OR
          q.customer_name ILIKE $${paramCount} OR
          q.customer_phone ILIKE $${paramCount}
        )`);
        queryParams.push(`%${search}%`);
        paramCount++;
      }

      if (startDate) {
        whereConditions.push(`q.created_at >= $${paramCount}`);
        queryParams.push(startDate);
        paramCount++;
      }

      if (endDate) {
        whereConditions.push(`q.created_at <= $${paramCount}`);
        queryParams.push(endDate);
        paramCount++;
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const countQuery = `
        SELECT COUNT(*) as total
        FROM quotations q
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      queryParams.push(limit, offset);
      const dataQuery = `
        SELECT q.*, u.full_name as created_by_name
        FROM quotations q
        LEFT JOIN users u ON q.created_by = u.id
        ${whereClause}
        ORDER BY q.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      const quotationsResult = await pool.query(dataQuery, queryParams);

      const quotationIds = quotationsResult.rows.map(q => q.id);

      let itemsResult = { rows: [] };
      if (quotationIds.length > 0) {
        const itemsQuery = `
          SELECT qi.*
          FROM quotation_items qi
          WHERE qi.quotation_id = ANY($1)
          ORDER BY qi.created_at
        `;
        itemsResult = await pool.query(itemsQuery, [quotationIds]);
      }

      const quotationsWithItems = quotationsResult.rows.map(quotation => ({
        ...quotation,
        items: itemsResult.rows.filter(item => item.quotation_id === quotation.id)
      }));

      res.json({
        quotations: quotationsWithItems,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Error fetching quotations');
    }
  }
);

router.get(
  '/:id',
  authenticate,
  param('id').notEmpty().withMessage('Quotation ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      let whereClause = 'WHERE q.id = $1';
      const queryParams = [id];

      if (req.user.role !== 'admin') {
        whereClause += ' AND q.created_by = $2';
        queryParams.push(req.user.id);
      }

      const quotationQuery = `
        SELECT q.*, u.full_name as created_by_name
        FROM quotations q
        LEFT JOIN users u ON q.created_by = u.id
        ${whereClause}
      `;

      const quotationResult = await pool.query(quotationQuery, queryParams);

      if (quotationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Quotation not found' });
      }

      const itemsQuery = `
        SELECT * FROM quotation_items
        WHERE quotation_id = $1
        ORDER BY created_at
      `;

      const itemsResult = await pool.query(itemsQuery, [id]);

      const quotation = {
        ...quotationResult.rows[0],
        items: itemsResult.rows
      };

      res.json(quotation);
    } catch (error) {
      handleRouteError(error, req, res, 'Error fetching quotation');
    }
  }
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').notEmpty().withMessage('Quotation ID is required'),
    body('status').optional().isIn(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        notes,
        status,
        validUntil,
        convertedToTransactionId
      } = req.body;

      let whereClause = 'WHERE id = $1';
      let queryParams = [id];

      if (req.user.role !== 'admin') {
        whereClause += ' AND created_by = $2';
        queryParams.push(req.user.id);
      }

      const checkQuery = `SELECT * FROM quotations ${whereClause}`;
      const checkResult = await pool.query(checkQuery, queryParams);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Quotation not found' });
      }

      const updateFields = [];
      const updateParams = [id];
      let paramCount = 2;

      if (customerName !== undefined) {
        updateFields.push(`customer_name = $${paramCount}`);
        updateParams.push(customerName);
        paramCount++;
      }
      if (customerPhone !== undefined) {
        updateFields.push(`customer_phone = $${paramCount}`);
        updateParams.push(customerPhone);
        paramCount++;
      }
      if (customerEmail !== undefined) {
        updateFields.push(`customer_email = $${paramCount}`);
        updateParams.push(customerEmail);
        paramCount++;
      }
      if (customerAddress !== undefined) {
        updateFields.push(`customer_address = $${paramCount}`);
        updateParams.push(customerAddress);
        paramCount++;
      }
      if (notes !== undefined) {
        updateFields.push(`notes = $${paramCount}`);
        updateParams.push(notes);
        paramCount++;
      }
      if (status !== undefined) {
        updateFields.push(`status = $${paramCount}`);
        updateParams.push(status);
        paramCount++;
      }
      if (validUntil !== undefined) {
        updateFields.push(`valid_until = $${paramCount}`);
        updateParams.push(validUntil);
        paramCount++;
      }
      if (convertedToTransactionId !== undefined) {
        updateFields.push(`converted_to_transaction_id = $${paramCount}`);
        updateParams.push(convertedToTransactionId);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      const updateQuery = `
        UPDATE quotations
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, updateParams);

      res.json(updateResult.rows[0]);
    } catch (error) {
      handleRouteError(error, req, res, 'Error updating quotation');
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  param('id').notEmpty().withMessage('Quotation ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      let whereClause = 'WHERE id = $1';
      let queryParams = [id];

      if (req.user.role !== 'admin') {
        whereClause += ' AND created_by = $2 AND status = $3';
        queryParams.push(req.user.id, 'draft');
      }

      const deleteQuery = `DELETE FROM quotations ${whereClause} RETURNING *`;
      const deleteResult = await pool.query(deleteQuery, queryParams);

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Quotation not found or cannot be deleted'
        });
      }

      res.json({
        message: 'Quotation deleted successfully',
        deletedQuotation: deleteResult.rows[0]
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Error deleting quotation');
    }
  }
);

router.post(
  '/:id/convert',
  authenticate,
  param('id').notEmpty().withMessage('Quotation ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      let whereClause = 'WHERE q.id = $1';
      const queryParams = [id];

      if (req.user.role !== 'admin') {
        whereClause += ' AND q.created_by = $2';
        queryParams.push(req.user.id);
      }

      const quotationQuery = `
        SELECT q.*, qi.*
        FROM quotations q
        LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
        ${whereClause}
      `;

      const quotationResult = await pool.query(quotationQuery, queryParams);

      if (quotationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Quotation not found' });
      }

      const quotation = quotationResult.rows[0];

      if (quotation.status === 'converted') {
        return res.status(400).json({
          message: 'Quotation has already been converted',
          transactionId: quotation.converted_to_transaction_id
        });
      }

      const items = quotationResult.rows.map(row => ({
        productId: row.product_id,
        productName: row.product_name,
        barcode: row.product_barcode,
        selectedVariant: row.selected_variant,
        selectedSize: row.selected_size,
        quantity: row.quantity,
        price: row.unit_price,
        description: row.description,
        invoiceDescription: row.invoice_description
      }));

      res.json({
        quotation: {
          id: quotation.id,
          customerName: quotation.customer_name,
          customerPhone: quotation.customer_phone,
          customerEmail: quotation.customer_email,
          customerAddress: quotation.customer_address,
          subtotal: quotation.subtotal,
          discount: quotation.discount,
          totalTax: quotation.total_tax,
          total: quotation.total,
          notes: quotation.notes,
          appliedTaxes: quotation.applied_taxes
        },
        items
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Error converting quotation');
    }
  }
);

module.exports = router;
