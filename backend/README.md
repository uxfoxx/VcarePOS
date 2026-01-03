# VCare POS System Backend

This is the backend API for the VCare POS System, built with Node.js, Express, and PostgreSQL (via Supabase).

## Features

- RESTful API with comprehensive endpoints
- JWT-based authentication with email OTP verification
- Role-based access control (Admin, Manager, Cashier, Customer)
- PostgreSQL database with Supabase
- Swagger/OpenAPI documentation
- Comprehensive logging system with Winston
- Rate limiting on authentication endpoints
- Database migration system
- Email notifications (Gmail/SendGrid)
- File upload support
- Audit trail for all operations
- Health monitoring endpoints

## Prerequisites

- Node.js v18 or higher
- Supabase account with PostgreSQL database
- npm or yarn package manager
- Gmail or SendGrid account (for email functionality)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration (Supabase)
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PASSWORD=your-app-password
MAIL_EMAIL=your-email@gmail.com
MAIL_PORT=465

# Alternative: SendGrid Configuration
# MAIL_HOST=smtp.sendgrid.net
# MAIL_PASSWORD=your-sendgrid-api-key
# MAIL_EMAIL=your-verified-sender@example.com
# MAIL_PORT=2525
# MAIL_USER=apikey

# Application URL
APP_URL=http://localhost:3000
```

#### Getting Supabase Credentials

1. Create a Supabase account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Navigate to **Project Settings** > **Database**
4. Find your connection details:
   - Host: `db.YOUR_PROJECT_REF.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: Your database password (set during project creation)

#### Generating JWT Secret

Generate a secure random secret:

```bash
openssl rand -hex 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Email Configuration

**For Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the app password in `MAIL_PASSWORD`

**For SendGrid:**
1. Create a SendGrid account
2. Generate an API key
3. Verify a sender email address
4. Use the API key in `MAIL_PASSWORD` and set `MAIL_USER=apikey`

### 3. Initialize the Database

Run the database initialization script to create all tables and seed initial data:

```bash
node src/init-db.js
```

This script will:
- Create all necessary database tables
- Set up relationships and indexes
- Create default users (admin, manager1, cashier1)
- Seed sample categories and products
- Set up audit trail tables

**Default Users Created:**
- **admin** / admin123 (Administrator)
- **manager1** / manager123 (Manager)
- **cashier1** / cashier123 (Cashier)

### 4. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

**With PM2** (recommended for production):
```bash
npm run pm2:start:config
```

### 5. Access API Documentation

Once the server is running, access the interactive API documentation:

- Development: http://localhost:3000/api/docs
- Production: http://your-domain.com/api/docs

## Database Migrations

The backend includes a comprehensive migration system for managing database schema changes.

### Running Migrations

Apply all pending migrations:

```bash
npm run migrate
```

### Creating New Migrations

Generate a new migration file:

```bash
npm run make-migration "description_of_changes"
```

This creates two files:
- `migrations/up/TIMESTAMP_description_of_changes_up.sql` - Changes to apply
- `migrations/down/TIMESTAMP_description_of_changes_down.sql` - Rollback changes

### Migration Documentation

For detailed migration information, see:
- [Migration Guide](./docs/MIGRATIONS.md)
- [Migration Quickstart](./MIGRATIONS_QUICKSTART.md)

## Logging System

The backend includes a comprehensive logging system built with Winston.

### Log Levels

- **error**: Critical issues that need immediate attention
- **warn**: Issues that should be reviewed but aren't critical
- **info**: Important application events (default in production)
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information (use in development)

### Log Files

Log files are stored in the `logs` directory with daily rotation:

- **combined-YYYY-MM-DD.log**: All logs
- **error-YYYY-MM-DD.log**: Error logs only
- **http-YYYY-MM-DD.log**: HTTP request logs
- **exceptions-YYYY-MM-DD.log**: Unhandled exceptions
- **rejections-YYYY-MM-DD.log**: Unhandled promise rejections

### Configuring Log Level

Set the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug npm run dev
```

### Viewing Logs

**Via API** (Admin only):
- List logs: `GET /api/system/logs`
- View specific log: `GET /api/system/logs/{filename}`

**Via Command Line**:
```bash
# View all logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# View error logs only
tail -f logs/error-$(date +%Y-%m-%d).log

# View HTTP requests
tail -f logs/http-$(date +%Y-%m-%d).log
```

For more details, see [Logging Documentation](./docs/LOGGING.md)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout (requires authentication)
- `GET /api/auth/me` - Get current user (requires authentication)
- `PUT /api/auth/change-password` - Change password (requires authentication)
- `POST /api/auth/check-email` - Check if email exists (rate limited)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `PUT /api/products/:id/stock` - Update product stock
- `POST /api/products/upload` - Upload product image

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

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

### Quotations
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/:id` - Get quotation by ID
- `POST /api/quotations` - Create a new quotation
- `PUT /api/quotations/:id` - Update a quotation
- `DELETE /api/quotations/:id` - Delete a quotation

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

### Delivery Charges
- `GET /api/delivery-charges` - Get all delivery charges
- `GET /api/delivery-charges/calculate` - Calculate delivery charge
- `POST /api/delivery-charges` - Create delivery charge rule
- `PUT /api/delivery-charges/:id` - Update delivery charge rule
- `DELETE /api/delivery-charges/:id` - Delete delivery charge rule

### Invoice Settings
- `GET /api/invoice-settings` - Get invoice settings
- `PUT /api/invoice-settings` - Update invoice settings

### E-commerce Orders
- `GET /api/ecommerce/orders` - Get all e-commerce orders
- `GET /api/ecommerce/orders/:id` - Get order by ID
- `POST /api/ecommerce/orders` - Create new order (public)
- `PUT /api/ecommerce/orders/:id/status` - Update order status
- `GET /api/ecommerce/orders/customer/:email` - Get orders by customer email

### E-commerce Products (Public)
- `GET /api/ecommerce/products` - Get all products (public)
- `GET /api/ecommerce/products/:id` - Get product details (public)
- `GET /api/ecommerce/categories` - Get all categories (public)

### E-commerce Authentication
- `POST /api/ecommerce/auth/register` - Register new customer
- `POST /api/ecommerce/auth/verify-otp` - Verify OTP code
- `POST /api/ecommerce/auth/resend-otp` - Resend OTP code

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

### System Monitoring (Admin Only)
- `GET /api/system/health` - Basic health check
- `GET /api/system/metrics` - System metrics (memory, CPU, uptime)
- `GET /api/system/logs` - List available log files
- `GET /api/system/logs/{filename}` - View specific log file content

## Security Features

### Rate Limiting

Rate limiting is implemented on authentication endpoints to prevent brute force attacks:

- `/api/auth/login` - 5 requests per 15 minutes
- `/api/auth/check-email` - 10 requests per 15 minutes
- `/api/ecommerce/auth/*` - 5 requests per 15 minutes

### Authentication & Authorization

- JWT tokens for authentication
- Role-based access control (RBAC)
- Permission-based endpoint access
- Token expiration and refresh

### Input Validation

- Request validation middleware
- SQL injection prevention
- XSS protection
- File upload validation

## PM2 Process Management

### Starting with PM2

**Using ecosystem config:**
```bash
npm run pm2:start:config
```

**Using package.json script:**
```bash
npm run pm2:start
```

**For production environment:**
```bash
npm run pm2:start:prod
```

### Managing the Process

```bash
# Stop the backend
npm run pm2:stop

# Restart the backend
npm run pm2:restart

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Remove from PM2
npm run pm2:delete
```

### PM2 Features

- Auto-restart on crashes
- Memory limit of 1GB
- Environment-specific configuration
- Log management
- Cluster mode support

## Development Tools

### Database Seeding

Seed sample data for testing:

```bash
node src/utils/dataSeeder.js
```

### Database Backup

Create a backup of the database:

```bash
npm run backup
```

### Testing API Endpoints

Use the Swagger UI at `/api/docs` or use curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Get products (with token)
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Database Connection Issues

**Error**: "Connection refused" or "ECONNREFUSED"

**Solutions**:
1. Verify Supabase credentials in `.env`
2. Check if your IP is whitelisted in Supabase
3. Test connection with psql:
   ```bash
   psql -h YOUR_HOST -U postgres -d postgres
   ```
4. Ensure port 5432 is accessible

### Migration Errors

**Error**: Migration fails or tables don't exist

**Solutions**:
1. Check migration files for syntax errors
2. Run migrations manually:
   ```bash
   npm run migrate
   ```
3. Re-initialize database:
   ```bash
   node src/init-db.js
   ```

### Email Sending Issues

**Error**: Email not sending or authentication failures

**Solutions**:
1. For Gmail, ensure App Password is used (not regular password)
2. Check MAIL_* environment variables
3. Test email configuration:
   ```bash
   node -e "require('./src/utils/mailHelper').testEmail('test@example.com')"
   ```
4. Check firewall/network allows SMTP connections

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solutions**:
1. Find and kill the process:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```
2. Change port in `.env`:
   ```env
   PORT=3001
   ```

### High Memory Usage

**Solution**:
1. Check PM2 memory limit in `ecosystem.config.js`
2. Monitor with `npm run pm2:status`
3. Restart process: `npm run pm2:restart`
4. Review logs for memory leaks

## Project Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.js      # Authentication routes
│   │   ├── products.js  # Product management
│   │   ├── ecommerce/   # E-commerce specific routes
│   │   └── ...
│   ├── middleware/       # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── rateLimiter.js # Rate limiting
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── db.js        # Database connection
│   │   ├── logger.js    # Logging system
│   │   ├── mailHelper.js # Email functionality
│   │   └── ...
│   ├── cli/             # CLI tools
│   │   ├── migrate.js   # Migration runner
│   │   ├── backup.js    # Database backup
│   │   └── ...
│   ├── index.js         # Server entry point
│   ├── init-db.js       # Database initialization
│   └── swagger.js       # API documentation
├── migrations/
│   ├── up/              # Migration files
│   └── down/            # Rollback files
├── logs/                # Log files (auto-generated)
├── docs/                # Documentation
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
├── package.json
└── README.md           # This file
```

## Additional Documentation

- [Migration Guide](./docs/MIGRATIONS.md)
- [Migration Quickstart](./MIGRATIONS_QUICKSTART.md)
- [Logging Documentation](./docs/LOGGING.md)
- [Purchase Order Variant System](./docs/PURCHASE_ORDER_VARIANT_SYSTEM.md)
- [Verification Complete](./VERIFICATION_COMPLETE.md)

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| DB_HOST | PostgreSQL host | localhost | Yes |
| DB_PORT | PostgreSQL port | 5432 | Yes |
| DB_NAME | Database name | postgres | Yes |
| DB_USER | Database user | postgres | Yes |
| DB_PASSWORD | Database password | - | Yes |
| JWT_SECRET | JWT signing secret | - | Yes |
| PORT | Server port | 3000 | No |
| NODE_ENV | Environment | development | No |
| LOG_LEVEL | Logging level | info | No |
| MAIL_HOST | SMTP host | - | Yes (for emails) |
| MAIL_PORT | SMTP port | 465 | Yes (for emails) |
| MAIL_EMAIL | Sender email | - | Yes (for emails) |
| MAIL_PASSWORD | SMTP password | - | Yes (for emails) |
| APP_URL | Application URL | http://localhost:3000 | No |

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Documentation](http://localhost:3000/api/docs)
3. Check logs in `backend/logs/`
4. Contact the development team

## License

Proprietary - VCare POS System
