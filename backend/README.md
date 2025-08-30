# VCare POS System Backend

This is the backend API for the VCare POS System, built with Node.js, Express, and PostgreSQL.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vcare_pos
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info  # Use 'debug' for more verbose logging
   ```

3. Initialize the database:
   ```
   node src/init-db.js
   ```

4. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

5. Access the API documentation at:
   ```
   http://localhost:3000/api/docs
   ```

## Logging System

The backend includes a comprehensive logging system built with Winston:

### Log Levels

- **error**: Critical issues that need immediate attention
- **warn**: Issues that should be reviewed but aren't critical
- **info**: Important application events (default in production)
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information (use in development)

### Log Files

Log files are stored in the `logs` directory:

- **combined-YYYY-MM-DD.log**: All logs
- **error-YYYY-MM-DD.log**: Error logs only
- **http-YYYY-MM-DD.log**: HTTP request logs
- **exceptions-YYYY-MM-DD.log**: Unhandled exceptions
- **rejections-YYYY-MM-DD.log**: Unhandled promise rejections

### Configuring Log Level

To change the logging verbosity, set the `LOG_LEVEL` environment variable:

```
LOG_LEVEL=debug npm run dev
```

### Monitoring Endpoints

Admin users can access system monitoring endpoints:

- **GET /api/system/health**: Basic health check
- **GET /api/system/metrics**: System metrics (memory, CPU, uptime)
- **GET /api/system/logs**: List available log files
- **GET /api/system/logs/{filename}**: View specific log file content

### Using the Logger

The logger is available throughout the application:

```javascript
const { logger } = require('./utils/logger');

// Different log levels
logger.error('Critical error', { userId: '123', error: err.message });
logger.warn('Something suspicious', { userId: '123' });
logger.info('Operation successful', { operation: 'create' });
logger.debug('Detailed debug info', { data: someData });
```

For more details, see the [Logging Documentation](./docs/LOGGING.md)
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout (requires authentication)
- `GET /api/auth/me` - Get current user (requires authentication)
- `PUT /api/auth/change-password` - Change password (requires authentication)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `PUT /api/products/:id/stock` - Update product stock

### Raw Materials
- `GET /api/raw-materials` - Get all raw materials
- `GET /api/raw-materials/:id` - Get raw material by ID
- `POST /api/raw-materials` - Create a new raw material
- `PUT /api/raw-materials/:id` - Update a raw material
- `DELETE /api/raw-materials/:id` - Delete a raw material
- `PUT /api/raw-materials/:id/stock` - Update raw material stock

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id/status` - Update transaction status
- `POST /api/transactions/:id/refund` - Process a refund

### Coupons
- `GET /api/coupons` - Get all coupons
- `GET /api/coupons/:id` - Get coupon by ID
- `POST /api/coupons` - Create a new coupon
- `PUT /api/coupons/:id` - Update a coupon
- `DELETE /api/coupons/:id` - Delete a coupon
- `GET /api/coupons/validate/:code` - Validate a coupon code

### Taxes
- `GET /api/taxes` - Get all taxes
- `GET /api/taxes/:id` - Get tax by ID
- `POST /api/taxes` - Create a new tax
- `PUT /api/taxes/:id` - Update a tax
- `DELETE /api/taxes/:id` - Delete a tax

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Audit Trail
- `GET /api/audit` - Get audit trail
- `GET /api/audit/:id` - Get audit entry by ID
- `GET /api/audit/user/:userId` - Get audit trail for a specific user
- `GET /api/audit/module/:module` - Get audit trail for a specific module

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get purchase order by ID
- `POST /api/purchase-orders` - Create a new purchase order
- `PUT /api/purchase-orders/:id` - Update a purchase order
- `DELETE /api/purchase-orders/:id` - Delete a purchase order
- `PUT /api/purchase-orders/:id/status` - Update purchase order status
- `POST /api/purchase-orders/:id/receive` - Create a goods receive note

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create a new vendor
- `PUT /api/vendors/:id` - Update a vendor
- `DELETE /api/vendors/:id` - Delete a vendor

### System Monitoring
- `GET /api/system/health` - Basic health check
- `GET /api/system/metrics` - System metrics (admin only)
- `GET /api/system/logs` - List available log files (admin only)
- `GET /api/system/logs/:filename` - View specific log file content (admin only)

## Database Schema

The system uses PostgreSQL with the following main tables:

### Core Tables
- **users** - System users (POS staff)
- **customers** - E-commerce customers
- **categories** - Product categories
- **products** - Product catalog
- **product_colors** - Color variations for products
- **product_sizes** - Size variations for each color
- **product_raw_materials** - Raw materials required for each size
- **product_addons** - Optional add-ons for products
- **raw_materials** - Raw materials inventory
- **transactions** - All sales transactions (POS and e-commerce)
- **transaction_items** - Items within each transaction
- **refunds** - Refund records
- **refund_items** - Items within each refund

### Configuration Tables
- **coupons** - Discount coupons
- **taxes** - Tax rules and rates
- **vendors** - Supplier information
- **delivery_zones** - Delivery areas and charges

### Management Tables
- **purchase_orders** - Purchase orders to vendors
- **purchase_order_items** - Items within purchase orders
- **purchase_order_timeline** - Status history for purchase orders
- **goods_receive_notes** - Goods receiving documentation
- **goods_receive_note_items** - Items received
- **order_status_history** - E-commerce order status changes
- **audit_trail** - System activity logging

## Default Users

The system comes with three default users:

1. **Administrator**
   - Username: admin
   - Password: admin123
   - Full access to all modules

2. **Manager**
   - Username: manager1
   - Password: manager123
   - Access to most operational modules

3. **Cashier**
   - Username: cashier1
   - Password: cashier123
   - Limited access to POS and basic functions

## E-commerce Integration

The system now supports e-commerce integration with the following features:

### Database Schema
- **customers** table for e-commerce user management
- **Enhanced transactions** table with source tracking (pos/ecommerce)
- **delivery_zones** table for delivery charge management
- **order_status_history** table for tracking status changes

### Email Notifications
The system includes email notifications for e-commerce orders:
- Order confirmation emails with payment instructions
- Status update emails when orders are modified in POS
- Bank transfer details for payment processing

### Configuration
Add these environment variables to your `.env` file for email functionality:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BUSINESS_NAME=VCare Furniture Store
BUSINESS_EMAIL=orders@vcarefurniture.com
BUSINESS_PHONE=(555) 123-4567
BUSINESS_ADDRESS=123 Main Street, City, State 12345
BUSINESS_WEBSITE=www.vcarefurniture.com
```

### Delivery Zones
- **Inside Colombo**: Rs. 300 delivery charge
- **Outside Colombo**: Rs. 600 delivery charge

### Payment Methods
- **Cash on Delivery (COD)**: Orders confirmed immediately
- **Bank Transfer**: Orders pending until receipt uploaded

### Order Sources
- **POS Orders**: Created through the point of sale interface
- **E-commerce Orders**: Created through the public API endpoints

Both order types are managed through the same POS interface with clear source identification.