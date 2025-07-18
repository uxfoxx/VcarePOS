const express = require('express');
const { pool } = require('../utils/db');
const { authenticate, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit trail management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: AUDIT-123456
 *         userId:
 *           type: string
 *           example: USER-123456
 *         userName:
 *           type: string
 *           example: John Doe
 *         action:
 *           type: string
 *           example: update
 *         module:
 *           type: string
 *           example: products
 *         description:
 *           type: string
 *           example: Updated product price
 *         details:
 *           type: string
 *           example: '{"oldPrice": 100, "newPrice": 120}'
 *         ipAddress:
 *           type: string
 *           example: '192.168.1.10'
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit trail
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditEntry'
 */

/**
 * @swagger
 * /api/audit/{id}:
 *   get:
 *     summary: Get audit entry by ID
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit entry ID
 *     responses:
 *       200:
 *         description: Audit entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditEntry'
 *       404:
 *         description: Audit entry not found
 */

/**
 * @swagger
 * /api/audit/user/{userId}:
 *   get:
 *     summary: Get audit trail for a specific user
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of audit entries for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditEntry'
 */

/**
 * @swagger
 * /api/audit/module/{module}:
 *   get:
 *     summary: Get audit trail for a specific module
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *         description: Module name
 *     responses:
 *       200:
 *         description: List of audit entries for the module
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditEntry'
 */

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