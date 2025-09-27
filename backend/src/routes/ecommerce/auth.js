const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../utils/db');
const { authenticate } = require('../../middleware/auth');
const { generateToken, hashPassword, comparePassword } = require('../../utils/auth');
const { handleRouteError } = require('../../utils/loggerUtils');
const crypto = require('crypto');
const generateOtpEmailBody = require('../../utils/mailHelper.js'); // or separate file if needed
const { sendEmail } = require('../../helper/mail.helper.js');

const router = express.Router();

/**
 * @swagger
 * /ecommerce/auth/register:
 *   post:
 *     summary: Register new customer
 *     tags: [E-commerce]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post('/auth/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const client = await pool.connect();

    // Check if email already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate customer ID
    const customerId = `CUSTOMER-${Date.now()}`;

    // Create customer permissions (limited to viewing their own orders)
    const customerPermissions = {
      "ecommerce": { "view": true, "edit": false, "delete": false }
    };

    // Insert new customer
    const result = await client.query(`
      INSERT INTO users (
        id, username, password, email, first_name, last_name, role, is_active, permissions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, username, email, first_name, last_name, role, created_at
    `, [
      customerId,
      email, // Use email as username for customers
      hashedPassword,
      email,
      firstName,
      lastName,
      'customer',
      true,
      JSON.stringify(customerPermissions)
    ]);

    client.release();

    const customer = result.rows[0];

    // Generate JWT token
    const token = generateToken(customer);

    res.status(201).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        role: customer.role,
        createdAt: customer.created_at
      }
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Customer Registration');
  }
});

/**
 * @swagger
 * /ecommerce/auth/login:
 *   post:
 *     summary: Customer login
 *     tags: [E-commerce]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const client = await pool.connect();

    // Find customer by email
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, 'customer']
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const customer = result.rows[0];

    // Check if customer is active
    if (!customer.is_active) {
      client.release();
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check password
    const isMatch = await comparePassword(password, customer.password);
    if (!isMatch) {
      client.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await client.query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date(), customer.id]
    );

    client.release();

    // Generate JWT token
    const token = generateToken(customer);

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        role: customer.role,
        lastLogin: new Date()
      }
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Customer Login');
  }
});

/**
 * @swagger
 * /ecommerce/auth/me:
 *   get:
 *     summary: Get current customer profile
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, first_name, last_name, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = result.rows[0];

    res.json({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      role: customer.role,
      createdAt: customer.created_at,
      lastLogin: customer.last_login
    });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Get Customer Profile');
  }
});

// otp send for verify email (60 seconds cooldown)

router.post('/auth/otp/send', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, name } = req.body; // optional name for personalized email

  try {
    const client = await pool.connect();

    // Check last OTP (60 sec cooldown)
    const lastOtp = await client.query(
      `SELECT created_at FROM otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (lastOtp.rows.length > 0) {
      const diffSec = (Date.now() - new Date(lastOtp.rows[0].created_at).getTime()) / 1000;
      if (diffSec < 60) {
        client.release();
        return res.status(429).json({
          message: `Please wait ${60 - Math.floor(diffSec)} seconds before requesting a new OTP.`,
          remainingTime: 60 - Math.floor(diffSec)
        });
      }
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Insert OTP record
    await client.query(
      `INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)`,
      [email, otp, expiresAt]
    );

    client.release();

    // Send OTP via email
    const subject = 'Your OTP for Email Verification';
    const emailBody = generateOtpEmailBody(otp, name);
    await sendEmail(email, subject, emailBody);

    res.json({ success: true, message: 'OTP sent successfully', cooldown: 60 });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Send OTP');
  }
});


// otp verify
router.post('/auth/otp/verify', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isNumeric().withMessage('Valid OTP is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;

  try {
    const client = await pool.connect();

    // Find latest OTP for this email
    const result = await client.query(
      `SELECT id, otp, expires_at, is_verified 
       FROM otp_verifications 
       WHERE email = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'No OTP found. Please request again.' });
    }

    const record = result.rows[0];

    if (record.is_verified) {
      client.release();
      return res.status(400).json({ message: 'OTP already used.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      client.release();
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }

    if (record.otp !== otp) {
      client.release();
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark OTP as verified
    await client.query(
      `UPDATE otp_verifications SET is_verified = TRUE WHERE id = $1`,
      [record.id]
    );

    client.release();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    handleRouteError(error, req, res, 'E-commerce - Verify OTP');
  }
});


module.exports = router;