const express = require('express');

const productsRouter = require('./products');
const authRouter = require('./auth');
const uploadsRouter = require('./uploads');
const ordersRouter = require('./orders');
const settingsRouter = require('./settings');

const router = express.Router();

// Mount all sub-routers
router.use('/', productsRouter);
router.use('/', authRouter);
router.use('/', uploadsRouter);
router.use('/', ordersRouter);
router.use('/', settingsRouter);

module.exports = router;