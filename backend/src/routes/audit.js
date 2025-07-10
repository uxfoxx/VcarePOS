const express = require('express');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/audit
 * @desc    Get audit trail
 * @access  Private (Admin only)
 */
router.get('/', authenticate, hasPermission('audit-trail', 'view'), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM audit_trail ORDER BY timestamp DESC LIMIT 1000'
    );
    client.release();
    
    res.json(result.rows.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      userName: entry.user_name,
      action: entry.action,
      module: entry.module,
      description: entry.description,
      details: entry.details,
      ipAddress: entry.ip_address,
      timestamp: entry.timestamp
    })));
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/audit/:id
 * @desc    Get audit entry by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticate, hasPermission('audit-trail', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM audit_trail WHERE id = $1',
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Audit entry not found' });
    }
    
    const entry = result.rows[0];
    
    res.json({
      id: entry.id,
      userId: entry.user_id,
      userName: entry.user_name,
      action: entry.action,
      module: entry.module,
      description: entry.description,
      details: entry.details,
      ipAddress: entry.ip_address,
      timestamp: entry.timestamp
    });
  } catch (error) {
    console.error('Error fetching audit entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get audit trail for a specific user
 * @access  Private (Admin only)
 */
router.get('/user/:userId', authenticate, hasPermission('audit-trail', 'view'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM audit_trail WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    client.release();
    
    res.json(result.rows.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      userName: entry.user_name,
      action: entry.action,
      module: entry.module,
      description: entry.description,
      details: entry.details,
      ipAddress: entry.ip_address,
      timestamp: entry.timestamp
    })));
  } catch (error) {
    console.error('Error fetching user audit trail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/audit/module/:module
 * @desc    Get audit trail for a specific module
 * @access  Private (Admin only)
 */
router.get('/module/:module', authenticate, hasPermission('audit-trail', 'view'), async (req, res) => {
  try {
    const { module } = req.params;
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM audit_trail WHERE module = $1 ORDER BY timestamp DESC',
      [module]
    );
    client.release();
    
    res.json(result.rows.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      userName: entry.user_name,
      action: entry.action,
      module: entry.module,
      description: entry.description,
      details: entry.details,
      ipAddress: entry.ip_address,
      timestamp: entry.timestamp
    })));
  } catch (error) {
    console.error('Error fetching module audit trail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;