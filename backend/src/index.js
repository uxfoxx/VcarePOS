const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Import middleware
const { logAction } = require('./middleware/auth');

// Import and configure Swagger
const setupSwagger = require('./swagger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
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

// Swagger docs
setupSwagger(app);

// Test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});