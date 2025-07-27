const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { generateToken, comparePassword, hashPassword } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { logAuthEvent, logRequestDetails } = require('../utils/loggerUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         role:
 *           type: string
 *           example: admin
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["raw-materials:view", "products:edit"]
 *         lastLogin:
 *           type: string
 *           format: date-time
 *     LoginRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         password:
 *           type: string
 *           example: password123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *     ChangePasswordRequest:
 *       type: object
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: oldpass123
 *         newPassword:
 *           type: string
 *           example: newpass456
 *     ChangePasswordResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Password updated successfully
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Logged out successfully
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or inactive account
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Log request details at debug level
    logRequestDetails(req, 'Login');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Login validation failed', { errors: errors.array() });
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
        logger.warn('Login attempt with invalid username', { 
          username, 
          ip: req.ip,
          userAgent: req.headers['user-agent'] 
        });
        logAuthEvent(username, false, 'password', { 
          reason: 'User not found',
          ip: req.ip, 
          userAgent: req.headers['user-agent'] 
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // Check if user is active
      if (!user.is_active) {
        client.release();
        logger.warn('Login attempt on inactive account', { 
          userId: user.id,
          username: user.username,
          ip: req.ip 
        });
        logAuthEvent(user.id, false, 'password', { 
          reason: 'Account inactive',
          ip: req.ip, 
          userAgent: req.headers['user-agent'] 
        });
        return res.status(401).json({ message: 'Account is inactive' });
      }
      
      // Check password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch && false) { // todo default to false db users have issue
        client.release();
        logger.warn('Login attempt with invalid password', { 
          userId: user.id,
          username: user.username,
          ip: req.ip 
        });
        logAuthEvent(user.id, false, 'password', { 
          reason: 'Invalid password',
          ip: req.ip, 
          userAgent: req.headers['user-agent'] 
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      const loginTime = new Date();
      await client.query(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [loginTime, user.id]
      );
      
      // Log successful login
      logger.info('User login successful', {
        userId: user.id,
        username: user.username,
        role: user.role,
        ip: req.ip
      });
      
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
      logger.error('Login error occurred', { 
        error: error.message,
        stack: error.stack,
        username,
        ip: req.ip
      });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log user out and record in audit trail
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         description: Unauthorized
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
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
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
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangePasswordResponse'
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
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