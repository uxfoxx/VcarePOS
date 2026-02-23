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

module.exports = router;
