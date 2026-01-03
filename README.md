# VCare POS System

A comprehensive Point of Sale (POS) system with inventory management, e-commerce integration, and multi-user support. Built with React, Node.js, Express, PostgreSQL (via Supabase), and modern web technologies.

## Overview

VCare POS System consists of three main applications:

1. **Backend API** - Node.js/Express REST API with PostgreSQL database
2. **POS Frontend** - React-based point of sale interface for in-store operations
3. **E-commerce Frontend** - Customer-facing online store

### Technology Stack

- **Frontend**: React 18, Redux Toolkit, Ant Design, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL (Supabase)
- **Authentication**: JWT-based authentication with email OTP verification
- **Process Management**: PM2 for production deployment
- **Documentation**: Swagger/OpenAPI

## Key Features

- Multi-user support with role-based permissions (Admin, Manager, Cashier)
- Product management with variants (colors, sizes)
- Inventory tracking and stock alerts
- Purchase order management
- Transaction processing with multiple payment methods
- E-commerce integration with customer orders
- Barcode scanning support
- Quotation generation
- Comprehensive audit trail
- Invoice generation with customizable settings
- Tax and coupon management
- Delivery charges configuration
- Real-time notifications

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vcare-pos-system
```

### 2. Setup Supabase Database

1. Create a Supabase account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Get your database credentials from Project Settings > Database
4. Note down:
   - Database host
   - Database password
   - Supabase URL
   - Supabase anon key

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file (see backend/.env.example)
cp .env.example .env
# Edit .env with your database credentials

# Initialize database (creates tables and seeds data)
node src/init-db.js

# Start backend in development mode
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. POS Frontend Setup

```bash
# From project root
npm install

# Create .env file (see .env.example)
cp .env.example .env
# Edit .env with your API and Supabase URLs

# Start frontend in development mode
npm run dev
```

The POS frontend will run on `http://localhost:5173`

### 5. E-commerce Frontend Setup

```bash
cd ecommerce-frontend
npm install

# Create .env file (see ecommerce-frontend/.env.example)
cp .env.example .env
# Edit .env with your API and Supabase URLs

# Start e-commerce frontend
npm run dev
```

The e-commerce frontend will run on `http://localhost:5174`

## Project Structure

```
vcare-pos-system/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Authentication, validation
│   │   ├── utils/       # Database, logging utilities
│   │   └── index.js     # Server entry point
│   ├── migrations/      # Database migration files
│   └── package.json
│
├── src/                 # POS Frontend (React)
│   ├── components/      # React components
│   ├── features/        # Redux slices and sagas
│   ├── utils/          # Utilities and helpers
│   └── App.jsx         # Main app component
│
├── ecommerce-frontend/  # E-commerce Frontend (React)
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── store/      # Redux store
│   └── package.json
│
├── supabase/
│   └── migrations/     # Supabase migration files
│
└── README.md           # This file
```

## Environment Variables

### Backend (.env)

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

# Email Configuration (Gmail or SendGrid)
MAIL_HOST=smtp.gmail.com
MAIL_PASSWORD=your-app-password
MAIL_EMAIL=your-email@gmail.com
MAIL_PORT=465

# Application URL
APP_URL=http://localhost:3000
```

### POS Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Barcode Scanner Configuration
VITE_BARCODE_SCANNER_ENABLED=true
VITE_BARCODE_END_KEYS=Enter,Tab
VITE_BARCODE_MIN_LENGTH=4
VITE_BARCODE_TIMEOUT_MS=80
```

### E-commerce Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Default Users

The system comes with three default users (created during database initialization):

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Permissions**: Full access to all modules

### Manager
- **Username**: `manager1`
- **Password**: `manager123`
- **Permissions**: Access to most operational modules

### Cashier
- **Username**: `cashier1`
- **Password**: `cashier123`
- **Permissions**: Limited access to POS and basic functions

**Important**: Change these default passwords in production!

## Database Setup

### Running Migrations

The system uses a migration system to manage database schema changes.

```bash
cd backend

# Run all pending migrations
npm run migrate

# Create a new migration
npm run make-migration "description_of_changes"
```

### Database Initialization

The `init-db.js` script creates all necessary tables and seeds initial data:

```bash
cd backend
node src/init-db.js
```

This creates:
- User tables with default users
- Product and category tables
- Transaction tables
- Purchase order tables
- Vendor tables
- Tax and coupon tables
- Audit trail tables

## Development Workflow

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - POS Frontend:**
```bash
npm run dev
```

**Terminal 3 - E-commerce Frontend:**
```bash
cd ecommerce-frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm install --production
```

**POS Frontend:**
```bash
npm run build
# Output: dist/
```

**E-commerce Frontend:**
```bash
cd ecommerce-frontend
npm run build
# Output: dist/
```

## Production Deployment with PM2

PM2 is used for process management in production environments.

### Backend Deployment

```bash
cd backend
npm install
npm run pm2:start:config  # Start using ecosystem.config.js
```

**Managing Backend:**
```bash
npm run pm2:stop         # Stop the backend
npm run pm2:restart      # Restart the backend
npm run pm2:status       # Check status
npm run pm2:logs         # View logs
npm run pm2:delete       # Remove from PM2
```

### POS Frontend Deployment

```bash
npm run build            # Build the frontend
npm run pm2:start:config # Serve using PM2
```

**Managing POS Frontend:**
```bash
npm run pm2:stop         # Stop the frontend
npm run pm2:restart      # Restart the frontend
npm run pm2:status       # Check status
npm run pm2:logs         # View logs
npm run pm2:delete       # Remove from PM2
```

### E-commerce Frontend Deployment

```bash
cd ecommerce-frontend
npm run build
npx pm2 start "npx serve -s dist -p 3002" --name vcare-ecommerce-frontend
```

## API Documentation

The backend includes interactive Swagger/OpenAPI documentation:

- **Development**: http://localhost:3000/api/docs
- **Production**: http://your-domain.com/api/docs

## Monitoring & Logging

### System Health Endpoints (Admin only)

- `GET /api/system/health` - Basic health check
- `GET /api/system/metrics` - System metrics (memory, CPU, uptime)
- `GET /api/system/logs` - List available log files
- `GET /api/system/logs/{filename}` - View specific log file

### Log Files

Logs are stored in `backend/logs/`:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only
- `http-YYYY-MM-DD.log` - HTTP request logs

### Configuring Log Level

```bash
LOG_LEVEL=debug npm run dev
```

Available levels: `error`, `warn`, `info`, `http`, `debug`

## Troubleshooting

### Database Connection Errors

**Error**: "Connection refused" or "ECONNREFUSED"

**Solution**:
1. Verify Supabase credentials in `.env`
2. Check if database host is correct
3. Ensure your IP is whitelisted in Supabase (Project Settings > Database > Connection Pooling)
4. Test connection: `psql -h YOUR_HOST -U postgres -d postgres`

### API Timeout Issues

**Error**: Request timeouts or slow responses

**Solution**:
1. Check `backend/logs/` for error messages
2. Verify database queries aren't slow
3. Increase timeout in `backend/src/middleware/timeoutMiddleware.js`
4. Check network latency to Supabase

### Build Errors

**Error**: "Module not found" or build failures

**Solution**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear build cache:
   ```bash
   npm run build -- --force
   ```
3. Check Node.js version: `node --version` (should be v18+)

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
1. Find and kill the process:
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change the port in `.env`:
   ```env
   PORT=3001
   ```

### Authentication Issues

**Error**: "Invalid token" or "Unauthorized"

**Solution**:
1. Check JWT_SECRET is set in backend `.env`
2. Clear browser localStorage and login again
3. Verify token expiration settings
4. Check system clock is synchronized

## Additional Documentation

- [Backend Documentation](backend/README.md) - Detailed backend setup and API reference
- [E-commerce Frontend Documentation](ecommerce-frontend/README.md) - E-commerce features and setup
- [Setup Guide](SETUP.md) - Complete step-by-step setup from scratch
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Features Documentation](FEATURES.md) - Comprehensive feature list
- [Migration Documentation](backend/docs/MIGRATIONS.md) - Database migration guide
- [Logging Documentation](backend/docs/LOGGING.md) - Logging system details

## Security Notes

1. **Change default passwords** for all default users in production
2. **Use strong JWT_SECRET** - Generate with: `openssl rand -hex 32`
3. **Enable HTTPS** in production environments
4. **Set NODE_ENV=production** for production deployments
5. **Configure CORS** appropriately for your domain
6. **Keep dependencies updated**: `npm audit fix`
7. **Never commit `.env` files** to version control

## Support & Contributing

For issues, feature requests, or contributions, please contact the development team.

## License

Proprietary - VCare POS System
