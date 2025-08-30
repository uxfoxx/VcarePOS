# VcarePOS

VcarePOS is a comprehensive point of sale system for managing retail operations with integrated e-commerce platform support.

## Features

### Core POS System
- Point of Sale interface with product selection and cart management
- Product management with color variations, sizes, and add-ons
- Raw materials inventory tracking and management
- Transaction processing with multiple payment methods
- Tax management with category-specific and full-bill taxes
- Coupon system with percentage and fixed amount discounts
- Purchase order management with vendor integration
- User management with role-based permissions
- Comprehensive reporting and analytics
- Audit trail for all system activities

### E-commerce Integration
- Separate customer management for online orders
- Public API endpoints for e-commerce frontend integration
- Delivery charge calculation (Inside Colombo: Rs.300, Outside Colombo: Rs.600)
- Bank transfer receipt handling for online payments
- Email notifications for order confirmations and status updates
- Order source tracking (POS vs E-commerce)
- Unified inventory management across both channels

## Running the Application

### Backend

The backend is a Node.js application that can be run in development mode or production mode using PM2.

#### Development Mode

```bash
cd backend
npm install
npm run dev
```

#### Production Mode with PM2

PM2 allows the backend to run continuously in the background:

```bash
cd backend
npm install
npm run pm2:start        # Basic start with PM2
```

Or using the ecosystem configuration:

```bash
npm run pm2:start:config  # Start using ecosystem.config.js
npm run pm2:start:prod    # Start in production environment
```

#### Managing the Backend with PM2

```bash
npm run pm2:stop         # Stop the backend
npm run pm2:restart      # Restart the backend
npm run pm2:status       # Check backend status
npm run pm2:logs         # View backend logs
npm run pm2:delete       # Remove from PM2
```

### Frontend

The frontend is a React application built with Vite that can be run in development mode or production mode.

#### Development Mode

```bash
npm install
npm run dev
```

#### Production Mode with PM2

```bash
npm install
npm run start:prod       # Build and serve with PM2
```

Or using the ecosystem configuration:

```bash
npm run build            # Build the frontend
npm run pm2:start:config # Serve using ecosystem.config.js
```

#### Managing the Frontend with PM2

```bash
npm run pm2:stop         # Stop the frontend
npm run pm2:restart      # Restart the frontend
npm run pm2:status       # Check frontend status
npm run pm2:logs         # View frontend logs
npm run pm2:delete       # Remove from PM2
```

## PM2 Configuration

Both the frontend and backend use PM2 for process management in production:

### Backend PM2 Features
- Auto-restart on crashes
- Memory limit of 1GB
- Environment-specific configuration

### Frontend PM2 Features
- Serves static files from the `dist` directory
- Runs on port 3001 by default
- Single-page application (SPA) mode enabled
- Auto-restart on crashes

## API Documentation

The API documentation is available at:
- Development: http://localhost:3000/api/docs
- Production: http://68.183.182.142/api/docs

## E-commerce Integration

The system now supports e-commerce integration with the following capabilities:

### Customer Management
- Separate customer database for e-commerce users
- Customer registration and authentication
- Order history tracking per customer
- POS staff can view and manage e-commerce customers

### Order Processing
- Public API endpoints for e-commerce frontend integration
- Delivery charge calculation based on location
- Bank transfer receipt handling for online payments
- Email notifications for order confirmations and status updates
- Unified inventory management across POS and e-commerce channels

### Delivery Zones
- **Inside Colombo**: Rs. 300 delivery charge
- **Outside Colombo**: Rs. 600 delivery charge

### Payment Methods
- **Cash on Delivery (COD)**: Orders confirmed immediately
- **Bank Transfer**: Orders pending until receipt uploaded

### Email Notifications
Configure email settings in `backend/.env`:
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

//