const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, hasPermission } = require('../middleware/auth');
const { handleRouteError } = require('../utils/loggerUtils');
const { pool } = require('../utils/db');
const { brandingUpload } = require('../utils/brandingUpload');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings and configuration
 */

/**
 * @swagger
 * /settings/branding/upload-logo:
 *   post:
 *     summary: Upload branding logo
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 */
router.post('/branding/upload-logo',
  authenticate,
  hasPermission('settings', 'edit'),
  brandingUpload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      logger.info('Logo uploaded successfully', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: req.user.id
      });

      res.json({
        success: true,
        filePath: `/api/uploads/branding/${req.file.filename}`,
        originalFilename: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      handleRouteError(error, req, res, 'Settings - Upload Logo');
    }
  }
);

/**
 * @swagger
 * /settings/branding:
 *   get:
 *     summary: Get branding settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branding settings retrieved successfully
 */
router.get('/branding', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branding_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.json({
        businessName: '',
        tagline: '',
        logoPath: null,
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        accentColor: '#fa8c16',
        fontFamily: 'Inter',
        darkModeSupport: false,
        receiptFooter: '',
        invoiceNotes: ''
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Settings - Get Branding');
  }
});

/**
 * @swagger
 * /settings/branding:
 *   put:
 *     summary: Update branding settings
 *     tags: [Settings]
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
 *         description: Branding settings updated successfully
 */
router.put('/branding', [
  authenticate,
  hasPermission('settings', 'edit'),
  body('businessName').optional().trim(),
  body('tagline').optional().trim(),
  body('logoPath').optional().trim(),
  body('primaryColor').optional().trim(),
  body('secondaryColor').optional().trim(),
  body('accentColor').optional().trim(),
  body('fontFamily').optional().trim(),
  body('darkModeSupport').optional().isBoolean(),
  body('receiptFooter').optional().trim(),
  body('invoiceNotes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    businessName,
    tagline,
    logoPath,
    primaryColor,
    secondaryColor,
    accentColor,
    fontFamily,
    darkModeSupport,
    receiptFooter,
    invoiceNotes
  } = req.body;

  try {
    const checkResult = await pool.query('SELECT id FROM branding_settings LIMIT 1');

    let result;
    if (checkResult.rows.length === 0) {
      result = await pool.query(`
        INSERT INTO branding_settings (
          business_name, tagline, logo_path, primary_color, secondary_color,
          accent_color, font_family, dark_mode_support, receipt_footer, invoice_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        businessName, tagline, logoPath, primaryColor, secondaryColor,
        accentColor, fontFamily, darkModeSupport, receiptFooter, invoiceNotes
      ]);
    } else {
      result = await pool.query(`
        UPDATE branding_settings
        SET
          business_name = COALESCE($1, business_name),
          tagline = COALESCE($2, tagline),
          logo_path = COALESCE($3, logo_path),
          primary_color = COALESCE($4, primary_color),
          secondary_color = COALESCE($5, secondary_color),
          accent_color = COALESCE($6, accent_color),
          font_family = COALESCE($7, font_family),
          dark_mode_support = COALESCE($8, dark_mode_support),
          receipt_footer = COALESCE($9, receipt_footer),
          invoice_notes = COALESCE($10, invoice_notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `, [
        businessName, tagline, logoPath, primaryColor, secondaryColor,
        accentColor, fontFamily, darkModeSupport, receiptFooter, invoiceNotes,
        checkResult.rows[0].id
      ]);
    }

    logger.info('Branding settings updated', {
      updatedBy: req.user.id,
      settingsId: result.rows[0].id
    });

    res.json(result.rows[0]);
  } catch (error) {
    handleRouteError(error, req, res, 'Settings - Update Branding');
  }
});

/**
 * @swagger
 * /settings/branding/logo/{filename}:
 *   delete:
 *     summary: Delete branding logo file
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logo deleted successfully
 */
router.delete('/branding/logo/:filename',
  authenticate,
  hasPermission('settings', 'edit'),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads/branding', filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Logo file deleted', { filename, deletedBy: req.user.id });
        res.json({ message: 'Logo deleted successfully' });
      } else {
        res.status(404).json({ message: 'Logo file not found' });
      }
    } catch (error) {
      handleRouteError(error, req, res, 'Settings - Delete Logo');
    }
  }
);

module.exports = router;
