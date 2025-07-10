const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./utils/db');

// Import routes
const productRoutes = require('./routes/products');
const rawMaterialRoutes = require('./routes/rawMaterials');
const transactionRoutes = require('./routes/transactions');
const couponRoutes = require('./routes/coupons');
const taxRoutes = require('./routes/taxes');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audit');
const purchaseOrderRoutes = require('./routes/purchaseOrders');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});