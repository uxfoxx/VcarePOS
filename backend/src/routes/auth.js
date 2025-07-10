const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { generateToken, comparePassword, hashPassword } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        client.release();
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // Check if user is active
      if (!user.is_active) {
        client.release();
        return res.status(401).json({ message: 'Account is inactive' });
      }
      
      // Check password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        client.release();
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      const loginTime = new Date();
      await client.query(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [loginTime, user.id]
      );
      
      // Log login action to audit trail
      await client.query(
        `INSERT INTO audit_trail 
        (id, user_id, user_name, action, module, description, ip_address) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          `AUDIT-${Date.now()}`,
          user.id,
          `${user.first_name} ${user.last_name}`,
          'LOGIN',
          'authentication',
          'User logged in',
          req.ip
        ]
      );
      
      client.release();
      
      // Create and return JWT token
      const token = generateToken(user);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          lastLogin: loginTime
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Log user out and record in audit trail
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Log logout action to audit trail
    const client = await pool.connect();
    await client.query(
      `INSERT INTO audit_trail 
      (id, user_id, user_name, action, module, description, ip_address) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        `AUDIT-${Date.now()}`,
        req.user.id,
        `${req.user.firstName} ${req.user.lastName}`,
        'LOGOUT',
        'authentication',
        'User logged out',
        req.ip
      ]
    );
    client.release();
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, first_name, last_name, role, is_active, permissions, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      permissions: user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  [
    authenticate,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Get user from database
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = result.rows[0];
      
      // Check current password
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        client.release();
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password in database
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, req.user.id]
      );
      
      // Log password change to audit trail
      await client.query(
        `INSERT INTO audit_trail 
        (id, user_id, user_name, action, module, description, ip_address) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          `AUDIT-${Date.now()}`,
          req.user.id,
          `${req.user.firstName} ${req.user.lastName}`,
          'UPDATE',
          'authentication',
          'User changed password',
          req.ip
        ]
      );
      
      client.release();
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;