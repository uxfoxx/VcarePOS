/**
 * Invoice settings and configuration routes
 */
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticate, hasPermission } = require('../middleware/auth');
const { handleRouteError } = require('../utils/loggerUtils');
const { pool } = require('../utils/db');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoice Settings
 *   description: Invoice configuration and settings management
 */

/**
 * @swagger
 * /invoice-settings:
 *   get:
 *     summary: Get invoice settings
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice settings retrieved successfully
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoice_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice settings not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Settings');
  }
});

/**
 * @swagger
 * /invoice-settings:
 *   put:
 *     summary: Update invoice settings
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Invoice settings updated successfully
 */
router.put('/', [
  authenticate,
  hasPermission('settings', 'edit'),
  body('businessName').optional().trim(),
  body('businessAddress').optional().trim(),
  body('phoneNumber').optional().trim(),
  body('emailAddress').optional().isEmail().withMessage('Invalid email address'),
  body('website').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    businessName,
    businessAddress,
    phoneNumber,
    emailAddress,
    website,
    logoUrl
  } = req.body;

  try {
    // Check if settings exist
    const checkResult = await pool.query('SELECT id FROM invoice_settings LIMIT 1');

    let result;
    if (checkResult.rows.length === 0) {
      // Insert new settings
      result = await pool.query(`
        INSERT INTO invoice_settings (
          business_name, business_address, phone_number, email_address, website, logo_url
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [businessName, businessAddress, phoneNumber, emailAddress, website, logoUrl]);
    } else {
      // Update existing settings
      result = await pool.query(`
        UPDATE invoice_settings
        SET
          business_name = COALESCE($1, business_name),
          business_address = COALESCE($2, business_address),
          phone_number = COALESCE($3, phone_number),
          email_address = COALESCE($4, email_address),
          website = COALESCE($5, website),
          logo_url = COALESCE($6, logo_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [businessName, businessAddress, phoneNumber, emailAddress, website, logoUrl, checkResult.rows[0].id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Update Settings');
  }
});

// ============= BANK ACCOUNT DETAILS =============

/**
 * @swagger
 * /invoice-settings/bank-accounts:
 *   get:
 *     summary: Get all bank account details
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank accounts retrieved successfully
 */
router.get('/bank-accounts', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bank_account_details ORDER BY is_default DESC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Bank Accounts');
  }
});

/**
 * @swagger
 * /invoice-settings/bank-accounts/default:
 *   get:
 *     summary: Get default bank account details
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default bank account retrieved successfully
 */
router.get('/bank-accounts/default', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bank_account_details WHERE is_default = true LIMIT 1');

    if (result.rows.length === 0) {
      // Return first bank account if no default is set
      const fallbackResult = await pool.query('SELECT * FROM bank_account_details LIMIT 1');
      if (fallbackResult.rows.length === 0) {
        return res.status(404).json({ message: 'No bank account details found' });
      }
      return res.json(fallbackResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Default Bank Account');
  }
});

/**
 * @swagger
 * /invoice-settings/bank-accounts:
 *   post:
 *     summary: Create new bank account details
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Bank account created successfully
 */
router.post('/bank-accounts', [
  authenticate,
  hasPermission('settings', 'edit'),
  body('accountHolderName').notEmpty().withMessage('Account holder name is required'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('bankName').notEmpty().withMessage('Bank name is required'),
  body('branchName').optional().trim(),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    accountHolderName,
    accountNumber,
    bankName,
    branchName,
    isDefault
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await client.query('UPDATE bank_account_details SET is_default = false');
    }

    const result = await client.query(`
      INSERT INTO bank_account_details (
        account_holder_name, account_number, bank_name, branch_name, is_default
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [accountHolderName, accountNumber, bankName, branchName, isDefault || false]);

    await client.query('COMMIT');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    handleRouteError(error, req, res, 'Invoice Settings - Create Bank Account');
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /invoice-settings/bank-accounts/{id}:
 *   put:
 *     summary: Update bank account details
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Bank account updated successfully
 */
router.put('/bank-accounts/:id', [
  authenticate,
  hasPermission('settings', 'edit'),
  param('id').isUUID().withMessage('Invalid bank account ID'),
  body('accountHolderName').optional().trim(),
  body('accountNumber').optional().trim(),
  body('bankName').optional().trim(),
  body('branchName').optional().trim(),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    accountHolderName,
    accountNumber,
    bankName,
    branchName,
    isDefault
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await client.query('UPDATE bank_account_details SET is_default = false WHERE id != $1', [id]);
    }

    const result = await client.query(`
      UPDATE bank_account_details
      SET
        account_holder_name = COALESCE($1, account_holder_name),
        account_number = COALESCE($2, account_number),
        bank_name = COALESCE($3, bank_name),
        branch_name = COALESCE($4, branch_name),
        is_default = COALESCE($5, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [accountHolderName, accountNumber, bankName, branchName, isDefault, id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Bank account not found' });
    }

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    handleRouteError(error, req, res, 'Invoice Settings - Update Bank Account');
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /invoice-settings/bank-accounts/{id}:
 *   delete:
 *     summary: Delete bank account details
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
 */
router.delete('/bank-accounts/:id', [
  authenticate,
  hasPermission('settings', 'edit'),
  param('id').isUUID().withMessage('Invalid bank account ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM bank_account_details WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Delete Bank Account');
  }
});

// ============= INVOICE NOTES TEMPLATES =============

/**
 * @swagger
 * /invoice-settings/notes-templates:
 *   get:
 *     summary: Get all invoice notes templates
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice notes templates retrieved successfully
 */
router.get('/notes-templates', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoice_notes_templates ORDER BY is_default DESC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Notes Templates');
  }
});

/**
 * @swagger
 * /invoice-settings/notes-templates/default:
 *   get:
 *     summary: Get default invoice notes template
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default notes template retrieved successfully
 */
router.get('/notes-templates/default', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoice_notes_templates WHERE is_default = true LIMIT 1');

    if (result.rows.length === 0) {
      // Return first template if no default is set
      const fallbackResult = await pool.query('SELECT * FROM invoice_notes_templates LIMIT 1');
      if (fallbackResult.rows.length === 0) {
        return res.status(404).json({ message: 'No invoice notes templates found' });
      }
      return res.json(fallbackResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Default Notes Template');
  }
});

/**
 * @swagger
 * /invoice-settings/notes-templates:
 *   post:
 *     summary: Create new invoice notes template
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Notes template created successfully
 */
router.post('/notes-templates', [
  authenticate,
  hasPermission('settings', 'edit'),
  body('templateName').notEmpty().withMessage('Template name is required'),
  body('warrantyTerms').optional().trim(),
  body('quotationValidity').optional().trim(),
  body('customNotes').optional().trim(),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    templateName,
    warrantyTerms,
    quotationValidity,
    customNotes,
    isDefault
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await client.query('UPDATE invoice_notes_templates SET is_default = false');
    }

    const result = await client.query(`
      INSERT INTO invoice_notes_templates (
        template_name, warranty_terms, quotation_validity, custom_notes, is_default
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [templateName, warrantyTerms, quotationValidity, customNotes, isDefault || false]);

    await client.query('COMMIT');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    handleRouteError(error, req, res, 'Invoice Settings - Create Notes Template');
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /invoice-settings/notes-templates/{id}:
 *   put:
 *     summary: Update invoice notes template
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notes template updated successfully
 */
router.put('/notes-templates/:id', [
  authenticate,
  hasPermission('settings', 'edit'),
  param('id').isUUID().withMessage('Invalid template ID'),
  body('templateName').optional().trim(),
  body('warrantyTerms').optional().trim(),
  body('quotationValidity').optional().trim(),
  body('customNotes').optional().trim(),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    templateName,
    warrantyTerms,
    quotationValidity,
    customNotes,
    isDefault
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await client.query('UPDATE invoice_notes_templates SET is_default = false WHERE id != $1', [id]);
    }

    const result = await client.query(`
      UPDATE invoice_notes_templates
      SET
        template_name = COALESCE($1, template_name),
        warranty_terms = COALESCE($2, warranty_terms),
        quotation_validity = COALESCE($3, quotation_validity),
        custom_notes = COALESCE($4, custom_notes),
        is_default = COALESCE($5, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [templateName, warrantyTerms, quotationValidity, customNotes, isDefault, id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Notes template not found' });
    }

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    handleRouteError(error, req, res, 'Invoice Settings - Update Notes Template');
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /invoice-settings/notes-templates/{id}:
 *   delete:
 *     summary: Delete invoice notes template
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notes template deleted successfully
 */
router.delete('/notes-templates/:id', [
  authenticate,
  hasPermission('settings', 'edit'),
  param('id').isUUID().withMessage('Invalid template ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM invoice_notes_templates WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notes template not found' });
    }

    res.json({ message: 'Notes template deleted successfully' });
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Delete Notes Template');
  }
});

// ============= COMPLETE INVOICE CONFIGURATION =============

/**
 * @swagger
 * /invoice-settings/complete:
 *   get:
 *     summary: Get complete invoice configuration
 *     tags: [Invoice Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complete invoice configuration retrieved successfully
 */
router.get('/complete', authenticate, async (req, res) => {
  try {
    const settingsResult = await pool.query('SELECT * FROM invoice_settings LIMIT 1');
    const bankAccountResult = await pool.query('SELECT * FROM bank_account_details WHERE is_default = true LIMIT 1');
    const notesTemplateResult = await pool.query('SELECT * FROM invoice_notes_templates WHERE is_default = true LIMIT 1');

    // Fallback to first record if no default is set
    const bankAccount = bankAccountResult.rows.length > 0
      ? bankAccountResult.rows[0]
      : (await pool.query('SELECT * FROM bank_account_details LIMIT 1')).rows[0];

    const notesTemplate = notesTemplateResult.rows.length > 0
      ? notesTemplateResult.rows[0]
      : (await pool.query('SELECT * FROM invoice_notes_templates LIMIT 1')).rows[0];

    res.json({
      settings: settingsResult.rows[0] || null,
      bankAccount: bankAccount || null,
      notesTemplate: notesTemplate || null
    });
  } catch (error) {
    handleRouteError(error, req, res, 'Invoice Settings - Get Complete Configuration');
  }
});

module.exports = router;
