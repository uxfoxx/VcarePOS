# VCare POS System - Features Documentation

This document provides a comprehensive overview of all features available in the VCare POS System, organized by module and user role.

## Table of Contents

1. [User Management](#user-management)
2. [Product Management](#product-management)
3. [Point of Sale (POS)](#point-of-sale-pos)
4. [Inventory Management](#inventory-management)
5. [Purchase Orders](#purchase-orders)
6. [Quotations](#quotations)
7. [Transaction Management](#transaction-management)
8. [E-commerce](#e-commerce)
9. [Reporting & Analytics](#reporting--analytics)
10. [System Settings](#system-settings)
11. [Security & Audit](#security--audit)
12. [Integration Features](#integration-features)

---

## User Management

### User Roles

#### Administrator
**Full system access with all permissions:**
- User management (create, edit, delete users)
- System configuration and settings
- Financial reports and analytics
- Audit trail access
- Database management
- Invoice settings customization
- Tax and coupon management
- Delivery charges configuration

#### Manager
**Operational management with limited admin access:**
- Product management (create, edit products)
- Inventory oversight
- Transaction viewing and refunds
- Purchase order management
- Quotation generation
- Category management
- Vendor management
- Limited reporting access

#### Cashier
**Front-line sales operations:**
- POS transaction processing
- Product lookup and search
- Basic customer management
- Cart operations
- Payment processing
- Print receipts and invoices
- View own transaction history

#### Customer (E-commerce)
**Online shopping access:**
- Product browsing and search
- Shopping cart management
- Order placement
- Order history viewing
- Profile management
- Password management

### User Features

**User Creation and Management**
- Create users with specific roles
- Assign granular permissions
- Email-based authentication
- Password strength requirements
- Account activation/deactivation
- User activity logging

**Authentication**
- JWT-based secure authentication
- Email OTP verification (for customers)
- Session management
- Password change functionality
- Secure logout
- Rate-limited login attempts

---

## Product Management

### Product Features

**Basic Product Information**
- Product name and description
- SKU (Stock Keeping Unit)
- Barcode support
- Category assignment
- Pricing (retail and wholesale)
- Cost price tracking
- Product images (multiple images supported)
- Stock quantity tracking
- Low stock alerts

**Product Variants**
- Color variants with custom color codes
- Size variants (S, M, L, XL, etc.)
- Price variations per variant
- Stock tracking per variant
- Color selector images for e-commerce
- Variant-specific images

**Advanced Product Features**
- Custom product creation in POS
- Product add-ons and modifications
- Bulk product import/export
- Product search and filtering
- Product status (active/inactive)
- Tax applicability
- Discount eligibility

### Category Management

**Category Features**
- Hierarchical category structure
- Category images
- Category descriptions
- Active/inactive status
- Product count per category
- Category-based filtering
- E-commerce category display

### Color Management

**Color System**
- Predefined color palette
- Custom color creation
- Hex color code support
- Color names and labels
- Color assignment to products
- Visual color representation
- Color selector images for variants

---

## Point of Sale (POS)

### POS Interface

**Product Selection**
- Grid view with product images
- Quick product search
- Barcode scanning support
- Category filtering
- Recent products
- Favorites/frequently used products

**Cart Management**
- Add products to cart
- Adjust quantities
- Remove items
- Apply discounts
- Add custom products
- Product add-ons/modifications
- Color and size selection modal
- Real-time price calculation

**Checkout Process**
- Multiple payment methods:
  - Cash
  - Card (Credit/Debit)
  - Bank Transfer
  - Split payments
- Custom payment amounts
- Change calculation
- Tax calculation
- Coupon/discount application
- Delivery charge calculation (if applicable)
- Customer information capture

**Receipt & Invoice**
- Thermal printer support
- A4 invoice printing
- Customizable invoice templates
- Company logo and branding
- QR code generation
- Email receipt option
- Print duplicate copies

### Barcode Scanner Integration

**Barcode Features**
- USB barcode scanner support
- Configurable scan end keys
- Minimum barcode length validation
- Timeout between scans
- Prefix/suffix filtering
- Scan in input fields
- Visual barcode simulator (development)

---

## Inventory Management

### Stock Management

**Stock Tracking**
- Real-time stock levels
- Stock updates on sales
- Stock adjustments
- Low stock alerts
- Out of stock notifications
- Stock history tracking
- Variant-level stock tracking

**Stock Operations**
- Manual stock adjustments
- Bulk stock updates
- Stock transfer between locations (future)
- Stock take/physical inventory
- Damaged goods recording
- Stock level reports

### Raw Materials Management

**Raw Material Features**
- Raw material catalog
- SKU and barcode support
- Unit of measurement
- Supplier information
- Reorder level settings
- Cost tracking
- Stock quantity tracking
- Usage tracking in production

---

## Purchase Orders

### Purchase Order Management

**PO Creation**
- Create purchase orders for suppliers
- Add multiple products/raw materials
- Specify quantities and prices
- Color and size selection
- Expected delivery date
- Notes and special instructions
- PO number auto-generation

**PO Workflow**
- Draft status
- Sent to supplier
- Partially received
- Fully received
- Cancelled
- Status history tracking

**Goods Receive Note (GRN)**
- Receive items against PO
- Partial receiving support
- Quantity verification
- Quality inspection notes
- Automatic stock updates
- GRN PDF generation
- Batch/lot number tracking

### Vendor Management

**Vendor Information**
- Vendor name and contact
- Email and phone
- Address details
- Tax information
- Payment terms
- Credit limits
- Vendor rating/notes

**Vendor Operations**
- Create and edit vendors
- Vendor product catalog
- Purchase history
- Outstanding orders
- Payment history
- Vendor performance metrics

---

## Quotations

### Quotation Features

**Quotation Creation**
- Create quotes for customers
- Add products with quantities
- Pricing tiers (retail/wholesale)
- Tax calculations
- Discount application
- Validity period
- Terms and conditions

**Quotation Management**
- Draft quotations
- Send to customer via email
- Convert to sale
- Quotation versioning
- Quotation history
- PDF generation
- Quotation tracking

---

## Transaction Management

### Transaction Features

**Transaction Recording**
- Complete sale details
- Customer information
- Payment method tracking
- Tax breakdown
- Discount details
- Cashier information
- Timestamp and date

**Transaction Operations**
- View transaction history
- Search and filter transactions
- Transaction details modal
- Print duplicate receipts
- Email receipt to customer
- Transaction status tracking

### Refund Management

**Refund Features**
- Full or partial refunds
- Refund reason tracking
- Stock reversal
- Payment method selection
- Refund receipt generation
- Audit trail for refunds
- Refund approval workflow (for large amounts)

---

## E-commerce

### Customer-Facing Features

**Product Browsing**
- Responsive product catalog
- Category filtering
- Search functionality
- Product detail pages
- Image galleries
- Color and size selection
- Stock availability display
- Related products

**Shopping Cart**
- Add to cart functionality
- Cart persistence (localStorage)
- Quantity adjustments
- Remove items
- Real-time price updates
- Cart item count badge
- Save for later (future)

**Customer Registration**
- Email-based registration
- OTP verification via email
- Password requirements
- Profile creation
- Address management
- Order history access

**Checkout Process**
- Guest checkout (future)
- Delivery address input
- Delivery charge calculation
- Payment method selection:
  - Cash on Delivery
  - Bank Transfer (with receipt upload)
- Order summary
- Terms and conditions
- Order confirmation email

**Order Management**
- View order history
- Order status tracking:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- Order details view
- Invoice download (PDF)
- Order notifications via email

### Admin E-commerce Management

**Order Management**
- View all e-commerce orders
- Update order status
- Process payments
- Confirm bank transfers
- Shipping information
- Customer communication
- Order fulfillment workflow

**E-commerce Settings**
- Delivery charge rules
- Payment method configuration
- Email notification templates
- Terms and conditions
- Return policy
- Shipping zones

---

## Reporting & Analytics

### Available Reports

**Sales Reports**
- Daily sales summary
- Sales by period (weekly, monthly, yearly)
- Sales by product
- Sales by category
- Sales by cashier
- Top-selling products
- Revenue trends

**Inventory Reports**
- Current stock levels
- Low stock report
- Stock movement report
- Inventory valuation
- Stock aging report
- Reorder requirements

**Financial Reports**
- Revenue reports
- Expense tracking (purchase orders)
- Profit margin analysis
- Tax collected reports
- Payment method breakdown
- Refund reports

**Customer Reports** (E-commerce)
- Customer registration trends
- Order frequency
- Customer lifetime value
- Abandoned carts (future)
- Customer demographics

### Export Options

**Data Export**
- CSV export for all reports
- Excel format support
- PDF reports
- Custom date ranges
- Filtered exports
- Scheduled reports (future)

---

## System Settings

### Invoice Settings

**Invoice Customization**
- Company name and logo
- Address and contact details
- Tax registration numbers
- Invoice number format
- Custom terms and conditions
- Footer text
- Payment instructions
- Bank details for transfers

### Delivery Charges

**Delivery Configuration**
- Location-based charges
- Distance-based pricing
- Flat rate options
- Free delivery threshold
- POS delivery charges
- E-commerce delivery charges
- Delivery zone management

### Tax Management

**Tax Configuration**
- Multiple tax types (VAT, Sales Tax, etc.)
- Tax rates and percentages
- Tax applicability rules
- Inclusive/exclusive tax options
- Tax exemptions
- Tax reporting

### Coupon Management

**Coupon Features**
- Coupon code generation
- Discount types:
  - Percentage discount
  - Fixed amount discount
  - Free shipping
- Minimum order requirements
- Validity period
- Usage limits (total and per customer)
- Product/category restrictions
- Active/inactive status

### Branding Settings

**Brand Customization**
- Company logo upload
- Color scheme customization
- Receipt branding
- Email template branding
- Invoice header/footer
- Watermarks

---

## Security & Audit

### Security Features

**Authentication Security**
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Password strength requirements
- Session expiration
- Rate limiting on login attempts
- Email verification (OTP)

**Authorization**
- Role-based access control (RBAC)
- Granular permissions
- Module-level access control
- Operation-level permissions
- Permission inheritance

**Data Security**
- SQL injection prevention
- XSS protection
- CSRF protection
- Input validation and sanitization
- Secure file uploads
- Environment variable protection

**Rate Limiting**
- Login endpoint protection (5 requests per 15 min)
- Email check protection (10 requests per 15 min)
- E-commerce auth protection (5 requests per 15 min)
- Customizable rate limits

### Audit Trail

**Audit Features**
- User action logging
- Module-based audit trails
- Timestamp tracking
- IP address logging
- Before/after data capture
- Search and filter audit logs
- Export audit reports
- Retention policy

**Audited Actions**
- User login/logout
- Product create/update/delete
- Transaction processing
- Refunds
- Stock adjustments
- Settings changes
- User management actions
- Order status changes

---

## Integration Features

### Email Notifications

**Automated Emails**
- Order confirmation (customer)
- OTP verification codes
- Password reset
- Order status updates
- Low stock alerts (admin)
- New order notifications (admin)
- Refund notifications

**Email Configuration**
- SMTP support (Gmail, SendGrid)
- Custom email templates
- HTML email formatting
- Attachment support
- Email logging
- Failed email retry

### File Management

**File Upload Support**
- Product images
- Category images
- Company logo
- Color selector images
- Payment receipts (bank transfer)
- Maximum file size limits
- Supported formats (JPG, PNG, PDF)
- Image compression
- Secure file storage (Supabase)

### Barcode Generation

**Barcode Features**
- Auto-generate barcodes for products
- Multiple barcode formats:
  - CODE128
  - EAN13
  - UPC
- Print barcode labels
- Batch barcode generation
- Custom barcode ranges

---

## System Administration

### Logging & Monitoring

**Application Logging**
- Winston logging framework
- Log levels (error, warn, info, http, debug)
- Daily log rotation
- Separate error logs
- HTTP request logging
- Unhandled exception logging
- Database query logging

**System Monitoring**
- Health check endpoint
- System metrics (CPU, memory, uptime)
- Database connection status
- API response times
- Log file access via API
- PM2 process monitoring

### Database Management

**Database Features**
- PostgreSQL with Supabase
- Migration system
- Database initialization scripts
- Backup support
- Data seeding
- Connection pooling
- Query optimization

---

## Performance Features

### Optimization

**Frontend Performance**
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Minification and compression
- Tree shaking

**Backend Performance**
- Database indexing
- Query optimization
- Connection pooling
- Response caching
- Gzip compression
- PM2 cluster mode

---

## Upcoming Features (Roadmap)

### Planned Enhancements

**Customer Features**
- Wishlist functionality
- Product reviews and ratings
- Guest checkout
- Order cancellation
- Product recommendations
- Live chat support
- Loyalty points program

**Inventory Features**
- Multi-location inventory
- Stock transfer between locations
- Batch and expiry tracking
- Barcode label printing
- Inventory forecasting
- Automated reorder points

**Payment Features**
- Payment gateway integration (Stripe, PayPal)
- Recurring payments/subscriptions
- Gift cards
- Store credit
- Installment payments

**Analytics & Reporting**
- Advanced analytics dashboard
- Sales forecasting
- Customer segmentation
- Heatmaps and insights
- A/B testing
- Conversion tracking

**Mobile Features**
- Progressive Web App (PWA)
- Mobile app (iOS/Android)
- Push notifications
- Mobile POS

**Integration**
- Accounting software integration
- Shipping provider integration
- Marketing automation
- Social media integration
- Third-party marketplace sync

---

## Feature Comparison by Role

| Feature | Admin | Manager | Cashier | Customer |
|---------|-------|---------|---------|----------|
| POS Transactions | ✓ | ✓ | ✓ | ✗ |
| View Products | ✓ | ✓ | ✓ | ✓ (E-commerce) |
| Add/Edit Products | ✓ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ |
| View Reports | ✓ | ✓ (Limited) | ✗ | ✗ |
| Process Refunds | ✓ | ✓ | ✗ | ✗ |
| Purchase Orders | ✓ | ✓ | ✗ | ✗ |
| Quotations | ✓ | ✓ | ✗ | ✗ |
| System Settings | ✓ | ✗ | ✗ | ✗ |
| Audit Trail | ✓ | ✗ | ✗ | ✗ |
| E-commerce Orders | ✓ (Manage) | ✓ (View) | ✗ | ✓ (Own) |
| Place Orders Online | ✗ | ✗ | ✗ | ✓ |

---

## Getting Started with Features

To explore features by role:

1. **As Administrator**: Login with `admin` / `admin123`
2. **As Manager**: Login with `manager1` / `manager123`
3. **As Cashier**: Login with `cashier1` / `cashier123`
4. **As Customer**: Register via e-commerce frontend

## Feature Documentation

For detailed instructions on using specific features:
- [Main Documentation](README.md)
- [Backend API Documentation](backend/README.md)
- [E-commerce Documentation](ecommerce-frontend/README.md)
- [Setup Guide](SETUP.md)

---

## Support

For questions about features or to request new features:
- Check existing documentation
- Review API documentation at http://localhost:3000/api/docs
- Contact the development team
