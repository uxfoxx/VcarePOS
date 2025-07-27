const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { pool } = require('../utils/db');
const { authenticate, authorize, hasPermission } = require('../middleware/auth');
const { hashPassword } = require('../utils/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: USER-123456
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         role:
 *           type: string
 *           enum: [admin, manager, cashier]
 *           example: admin
 *         isActive:
 *           type: boolean
 *           example: true
 *         permissions:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLogin:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin and Manager only)
 */
router.get(
  '/',
  authenticate,
  hasPermission('user-management', 'view'),
  async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, username, email, first_name, last_name, role, is_active, permissions, created_at, last_login FROM users ORDER BY created_at DESC'
      );
      client.release();
      
      const users = result.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        permissions: user.permissions,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }));
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin and Manager only)
 */
router.get(
  '/:id',
  authenticate,
  hasPermission('user-management', 'view'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, username, email, first_name, last_name, role, is_active, permissions, created_at, last_login FROM users WHERE id = $1',
        [id]
      );
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = result.rows[0];
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        permissions: user.permissions,
        createdAt: user.created_at,
        lastLogin: user.last_login
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    authenticate,
    hasPermission('user-management', 'edit'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Valid role is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      password,
      email,
      firstName,
      lastName,
      role,
      isActive = true,
      permissions
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if username already exists
      const usernameCheck = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (usernameCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      const emailCheck = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (emailCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate user ID
      const userId = req.body.id || `USER-${Date.now()}`;
      
      // Insert user
      const result = await client.query(
        `INSERT INTO users (
          id, username, password, email, first_name, last_name, role, is_active, permissions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, username, email, first_name, last_name, role, is_active, permissions, created_at`,
        [
          userId,
          username,
          hashedPassword,
          email,
          firstName,
          lastName,
          role,
          isActive,
          JSON.stringify(permissions)
        ]
      );
      
      client.release();
      
      const user = result.rows[0];
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        permissions: user.permissions,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    authenticate,
    hasPermission('user-management', 'edit'),
    param('id').notEmpty().withMessage('User ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Valid role is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      role,
      isActive,
      permissions,
      password
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (userCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email already exists for another user
      if (email) {
        const emailCheck = await client.query(
          'SELECT * FROM users WHERE email = $1 AND id != $2',
          [email, id]
        );
        
        if (emailCheck.rows.length > 0) {
          client.release();
          return res.status(400).json({ message: 'Email already in use by another user' });
        }
      }
      
      // Prepare update query
      let query = `
        UPDATE users SET
          email = $1,
          first_name = $2,
          last_name = $3,
          role = $4,
          is_active = $5,
          permissions = $6
      `;
      
      let params = [
        email,
        firstName,
        lastName,
        role,
        isActive,
        JSON.stringify(permissions)
      ];
      
      // If password is provided, hash it and add to update
      if (password) {
        const hashedPassword = await hashPassword(password);
        query += `, password = $${params.length + 1}`;
        params.push(hashedPassword);
      }
      
      // Add WHERE clause and RETURNING
      query += ` WHERE id = $${params.length + 1} RETURNING id, username, email, first_name, last_name, role, is_active, permissions, created_at, last_login`;
      params.push(id);
      
      // Execute update
      const result = await client.query(query, params);
      client.release();
      
      const user = result.rows[0];
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        permissions: user.permissions,
        createdAt: user.created_at,
        lastLogin: user.last_login
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  [
    authenticate,
    hasPermission('user-management', 'delete'),
    param('id').notEmpty().withMessage('User ID is required')
  ],
  async (req, res) => {
    const { id } = req.params;
    
    try {
      // Prevent deleting own account
      if (id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      const client = await pool.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (userCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      client.release();
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;