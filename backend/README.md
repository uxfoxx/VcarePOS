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
   ```

3. Initialize the database:
   ```
   node src/init-db.js
   ```

4. Start the server:
   ```
   npm start
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