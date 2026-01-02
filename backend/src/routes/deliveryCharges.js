const express = require('express');
const { pool } = require('../utils/db');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { is_active } = req.query;

  let query = 'SELECT * FROM delivery_charges';
  const values = [];

  if (is_active !== undefined) {
    query += ' WHERE is_active = $1';
    values.push(is_active === 'true');
  }

  query += ' ORDER BY location_name ASC';

  const result = await pool.query(query, values);

  res.json(result.rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT * FROM delivery_charges WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Delivery charge not found' });
  }

  res.json(result.rows[0]);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { location_name, charge_amount, is_active = true } = req.body;

  if (!location_name || charge_amount === undefined) {
    return res.status(400).json({ error: 'Location name and charge amount are required' });
  }

  if (charge_amount < 0) {
    return res.status(400).json({ error: 'Charge amount cannot be negative' });
  }

  const checkExisting = await pool.query(
    'SELECT id FROM delivery_charges WHERE LOWER(location_name) = LOWER($1)',
    [location_name]
  );

  if (checkExisting.rows.length > 0) {
    return res.status(409).json({ error: 'A delivery charge for this location already exists' });
  }

  const id = `DELIV-${uuidv4().substring(0, 8).toUpperCase()}`;

  const result = await pool.query(
    `INSERT INTO delivery_charges (id, location_name, charge_amount, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [id, location_name, charge_amount, is_active]
  );

  res.status(201).json(result.rows[0]);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { location_name, charge_amount, is_active } = req.body;

  const checkExisting = await pool.query(
    'SELECT id FROM delivery_charges WHERE id = $1',
    [id]
  );

  if (checkExisting.rows.length === 0) {
    return res.status(404).json({ error: 'Delivery charge not found' });
  }

  if (charge_amount !== undefined && charge_amount < 0) {
    return res.status(400).json({ error: 'Charge amount cannot be negative' });
  }

  if (location_name) {
    const checkDuplicate = await pool.query(
      'SELECT id FROM delivery_charges WHERE LOWER(location_name) = LOWER($1) AND id != $2',
      [location_name, id]
    );

    if (checkDuplicate.rows.length > 0) {
      return res.status(409).json({ error: 'A delivery charge for this location already exists' });
    }
  }

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (location_name !== undefined) {
    updates.push(`location_name = $${paramCount++}`);
    values.push(location_name);
  }

  if (charge_amount !== undefined) {
    updates.push(`charge_amount = $${paramCount++}`);
    values.push(charge_amount);
  }

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  const result = await pool.query(
    `UPDATE delivery_charges
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  res.json(result.rows[0]);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM delivery_charges WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Delivery charge not found' });
  }

  res.json({ message: 'Delivery charge deleted successfully', deleted: result.rows[0] });
}));

module.exports = router;
