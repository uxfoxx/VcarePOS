const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import route modules
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const rawMaterialsRoutes = require('./routes/rawMaterials');
const transactionsRoutes = require('./routes/transactions');
const couponsRoutes = require('./routes/coupons');
const taxesRoutes = require('./routes/taxes');
const categoriesRoutes = require('./routes/categories');
const purchaseOrdersRoutes = require('./routes/purchaseOrders');
const vendorsRoutes = require('./routes/vendors');
const usersRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const systemRoutes = require('./routes/system');
const ecommerceRoutes = require('./routes/ecommerce');
const invoiceSettingsRoutes = require('./routes/invoiceSettings');
const quotationsRoutes = require('./routes/quotations');
const deliveryChargesRoutes = require('./routes/deliveryCharges');
const settingsRoutes = require('./routes/settings');

// Import middleware
const { logAction } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { timeoutMiddleware } = require('./middleware/timeoutMiddleware');
const { logger, requestLogger } = require('./utils/logger');

// Import and configure Swagger
const setupSwagger = require('./swagger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ------------------ CORS Setup ------------------
const allowedOrigins = [
  'https://pos.vcaresl.com',
  'https://vcaresl.com',
  'https://www.vcaresl.com',
  'https://www.pos.vcaresl.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Optional: Explicitly set the headers again for extra safety
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request quickly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Body parser middleware with increased limits for image uploads
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));
// Serve uploads folder
// app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use(timeoutMiddleware(60000)); // 60 second timeout for all requests
app.use(requestLogger); // Add request logging before other middleware
app.use(logAction);

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/raw-materials', rawMaterialsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/taxes', taxesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/invoice-settings', invoiceSettingsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/delivery-charges', deliveryChargesRoutes);
app.use('/api/settings', settingsRoutes);

// Swagger docs
setupSwagger(app);

// Test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// Error handling middleware - should be after all routes
app.use(notFound);
app.use(errorHandler);

// Create a static directory for logs if we want to expose them
app.use('/logs', (req, res, next) => {
  // Check if requester is authenticated as admin
  if (req.user && req.user.role === 'admin') {
    express.static(path.join(__dirname, '../logs'))(req, res, next);
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

// Serve the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global exception handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.stack || error.toString() });
  // Give logger time to write before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason.stack || reason.toString(),
    promise: promise.toString()
  });
});

// Import system metrics logger
const { logSystemMetrics } = require('./utils/loggerUtils');

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);

  // Log initial system metrics
  logSystemMetrics(true);

  // Schedule periodic system metrics logging (every 15 minutes)
  setInterval(() => {
    logSystemMetrics(false);
  }, 15 * 60 * 1000);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);