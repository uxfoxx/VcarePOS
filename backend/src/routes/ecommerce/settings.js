/**
 * Public ecommerce settings routes (no auth required)
 * Exposes read-only data needed by the ecommerce frontend (checkout page, etc.)
 */
const express = require('express');
const { pool } = require('../../utils/db');
const { handleRouteError } = require('../../utils/loggerUtils');

const router = express.Router();

/**
 * @swagger
 * /ecommerce/settings/bank-accounts:
 *   get:
 *     summary: Get all active bank accounts (public, no auth required)
 *     tags: [E-commerce]
 *     responses:
 *       200:
 *         description: List of bank accounts
 */
router.get('/settings/bank-accounts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, account_holder_name, account_number, bank_name, branch_name, is_default FROM bank_account_details ORDER BY is_default DESC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        handleRouteError(error, req, res, 'E-commerce - Get Bank Accounts');
    }
});

/**
 * @swagger
 * /ecommerce/settings/invoice-info:
 *   get:
 *     summary: Get public business contact info (public, no auth required)
 *     tags: [E-commerce]
 *     responses:
 *       200:
 *         description: Business name, address, phone and email from invoice settings
 */
router.get('/settings/invoice-info', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT business_name, business_address, phone_number, email_address, website FROM invoice_settings LIMIT 1'
        );

        if (result.rows.length === 0) {
            return res.json({
                business_name: null,
                business_address: null,
                phone_number: null,
                email_address: null,
                website: null,
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        handleRouteError(error, req, res, 'E-commerce - Get Invoice Info');
    }
});

module.exports = router;
