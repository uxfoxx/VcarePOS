const express = require('express');
const { pool } = require('../utils/db');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const {
  getActiveDeliverySettings,
  calculateDeliveryCharge,
  calculateTotalWeight
} = require('../utils/deliveryCalculator');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { source } = req.query;

  let query = 'SELECT * FROM delivery_charge_settings ORDER BY type';
  const values = [];

  if (source === 'pos' || source === 'ecommerce') {
    query = 'SELECT * FROM delivery_charge_settings WHERE enabled_for_' + source + ' = true ORDER BY type';
  }

  const result = await pool.query(query, values);
  res.json(result.rows);
}));

router.get('/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;

  const validTypes = ['free_delivery', 'inside_colombo', 'out_of_colombo'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid delivery type' });
  }

  const result = await pool.query(
    'SELECT * FROM delivery_charge_settings WHERE type = $1',
    [type]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Delivery setting not found' });
  }

  res.json(result.rows[0]);
}));

router.post('/calculate', asyncHandler(async (req, res) => {
  const { weight, deliveryType, source, items } = req.body;

  let totalWeight = weight;

  if (items && Array.isArray(items)) {
    totalWeight = calculateTotalWeight(items);
  }

  if (!totalWeight || totalWeight <= 0) {
    return res.status(400).json({ error: 'Invalid weight' });
  }

  if (!deliveryType) {
    return res.status(400).json({ error: 'Delivery type is required' });
  }

  const settings = await getActiveDeliverySettings(source);

  const result = calculateDeliveryCharge(totalWeight, deliveryType, settings);

  res.json(result);
}));

router.put('/free-delivery', authenticate, asyncHandler(async (req, res) => {
  const { is_active, enabled_for_pos, enabled_for_ecommerce } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  if (enabled_for_pos !== undefined) {
    updates.push(`enabled_for_pos = $${paramCount++}`);
    values.push(enabled_for_pos);
  }

  if (enabled_for_ecommerce !== undefined) {
    updates.push(`enabled_for_ecommerce = $${paramCount++}`);
    values.push(enabled_for_ecommerce);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await pool.query(
    `UPDATE delivery_charge_settings
     SET ${updates.join(', ')}
     WHERE type = 'free_delivery'
     RETURNING *`,
    values
  );

  res.json(result.rows[0]);
}));

router.put('/inside-colombo', authenticate, asyncHandler(async (req, res) => {
  const { is_active, enabled_for_pos, enabled_for_ecommerce, inside_colombo_amount } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  if (enabled_for_pos !== undefined) {
    updates.push(`enabled_for_pos = $${paramCount++}`);
    values.push(enabled_for_pos);
  }

  if (enabled_for_ecommerce !== undefined) {
    updates.push(`enabled_for_ecommerce = $${paramCount++}`);
    values.push(enabled_for_ecommerce);
  }

  if (inside_colombo_amount !== undefined) {
    if (inside_colombo_amount < 0) {
      return res.status(400).json({ error: 'Amount cannot be negative' });
    }
    updates.push(`inside_colombo_amount = $${paramCount++}`);
    values.push(inside_colombo_amount);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await pool.query(
    `UPDATE delivery_charge_settings
     SET ${updates.join(', ')}
     WHERE type = 'inside_colombo'
     RETURNING *`,
    values
  );

  res.json(result.rows[0]);
}));

router.put('/out-of-colombo', authenticate, asyncHandler(async (req, res) => {
  const {
    is_active,
    enabled_for_pos,
    enabled_for_ecommerce,
    out_of_colombo_base_weight,
    out_of_colombo_base_amount,
    out_of_colombo_per_kg_amount
  } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  if (enabled_for_pos !== undefined) {
    updates.push(`enabled_for_pos = $${paramCount++}`);
    values.push(enabled_for_pos);
  }

  if (enabled_for_ecommerce !== undefined) {
    updates.push(`enabled_for_ecommerce = $${paramCount++}`);
    values.push(enabled_for_ecommerce);
  }

  if (out_of_colombo_base_weight !== undefined) {
    if (out_of_colombo_base_weight < 0) {
      return res.status(400).json({ error: 'Base weight cannot be negative' });
    }
    updates.push(`out_of_colombo_base_weight = $${paramCount++}`);
    values.push(out_of_colombo_base_weight);
  }

  if (out_of_colombo_base_amount !== undefined) {
    if (out_of_colombo_base_amount < 0) {
      return res.status(400).json({ error: 'Base amount cannot be negative' });
    }
    updates.push(`out_of_colombo_base_amount = $${paramCount++}`);
    values.push(out_of_colombo_base_amount);
  }

  if (out_of_colombo_per_kg_amount !== undefined) {
    if (out_of_colombo_per_kg_amount < 0) {
      return res.status(400).json({ error: 'Per kg amount cannot be negative' });
    }
    updates.push(`out_of_colombo_per_kg_amount = $${paramCount++}`);
    values.push(out_of_colombo_per_kg_amount);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await pool.query(
    `UPDATE delivery_charge_settings
     SET ${updates.join(', ')}
     WHERE type = 'out_of_colombo'
     RETURNING *`,
    values
  );

  res.json(result.rows[0]);
}));

module.exports = router;
