# VCare POS System - Complete Setup Guide

This guide will walk you through setting up the VCare POS System from scratch. Follow each step carefully to ensure a successful installation.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Supabase Database Setup](#supabase-database-setup)
4. [Project Setup](#project-setup)
5. [Backend Configuration](#backend-configuration)
6. [POS Frontend Configuration](#pos-frontend-configuration)
7. [E-commerce Frontend Configuration](#ecommerce-frontend-configuration)
8. [First-Time Initialization](#first-time-initialization)
9. [Verification](#verification)
10. [Post-Setup Configuration](#post-setup-configuration)
11. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable internet connection for Supabase

### Software Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Text Editor**: VS Code, Sublime Text, or similar

---

## Prerequisites Installation

### 1. Install Node.js

#### Windows/macOS:
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Follow the installation wizard

#### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Verify Installation:
```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output 9.x.x or higher
```

### 2. Install Git

#### Windows:
1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run installer with default settings

#### macOS:
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Linux:
```bash
sudo apt-get update
sudo apt-get install git
```

#### Verify Installation:
```bash
git --version  # Should output git version 2.x.x
```

---

## Supabase Database Setup

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub, Google, or Email
4. Verify your email address

### Step 2: Create New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in project details:
   - **Name**: `vcare-pos` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free (sufficient for development)
3. Click "Create new project"
4. Wait 2-3 minutes for project initialization

### Step 3: Get Database Credentials

1. In your project dashboard, click **Settings** (gear icon)
2. Navigate to **Database** section
3. Note down these credentials (you'll need them later):

```
Host: db.XXXXXXXXXXXXX.supabase.co
Database name: postgres
User: postgres
Password: [the password you created]
Port: 5432
```

### Step 4: Get Supabase API Credentials

1. In project settings, go to **API** section
2. Note down:
   - **Project URL**: `https://XXXXXXXXXXXXX.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### Step 5: Configure Connection Pooling (Optional but Recommended)

1. In **Database** settings, find **Connection Pooling**
2. Enable connection pooling
3. Note the pooler host (format: `db.XXXXXXXXXXXXX.pooler.supabase.co`)

---

## Project Setup

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd ~/projects  # or C:\projects on Windows

# Clone the repository
git clone <repository-url> vcare-pos-system
cd vcare-pos-system
```

If you don't have a repository URL, you can extract from a ZIP file:
```bash
# If you have a ZIP file
unzip vcare-pos-system.zip
cd vcare-pos-system
```

### Step 2: Verify Project Structure

Ensure you have these directories:
```bash
ls -la
# Should see:
# - backend/
# - ecommerce-frontend/
# - src/
# - package.json
# - README.md
```

---

## Backend Configuration

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will take 2-5 minutes depending on your internet speed.

### Step 3: Create Environment File

Create a `.env` file:

```bash
# Linux/macOS
touch .env

# Windows
type nul > .env
```

### Step 4: Configure Environment Variables

Open the `.env` file in your text editor and add:

```env
# Database Configuration (Supabase)
DB_HOST=db.XXXXXXXXXXXXX.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password_here

# JWT Authentication
JWT_SECRET=your_generated_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_EMAIL=your_email@gmail.com
MAIL_PORT=465

# Application URL
APP_URL=http://localhost:3000
```

### Step 5: Generate JWT Secret

Run one of these commands to generate a secure secret:

```bash
# Option 1: Using OpenSSL
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` value.

### Step 6: Configure Email (Gmail)

To enable email notifications:

1. **Enable 2-Factor Authentication** on your Google account
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Navigate to Security > 2-Step Verification
   - Turn it on

2. **Generate App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Name it "VCare POS System"
   - Click "Generate"
   - Copy the 16-character password (remove spaces)
   - Use this as your `MAIL_PASSWORD`

### Step 7: Initialize Database

Run the initialization script:

```bash
node src/init-db.js
```

Expected output:
```
Connected to database successfully
Creating tables...
✓ Users table created
✓ Products table created
✓ Categories table created
... (more tables)
Seeding initial data...
✓ Default users created
✓ Sample categories created
Database initialization complete!
```

### Step 8: Start Backend Server

```bash
npm run dev
```

Expected output:
```
[INFO] Server starting...
[INFO] Database connected successfully
[INFO] Server running on http://localhost:3000
[INFO] API Documentation: http://localhost:3000/api/docs
```

**Keep this terminal window open!**

---

## POS Frontend Configuration

Open a **new terminal window/tab**.

### Step 1: Navigate to Project Root

```bash
cd ~/projects/vcare-pos-system  # Adjust path as needed
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Linux/macOS
touch .env

# Windows
type nul > .env
```

### Step 4: Configure Environment Variables

Open the `.env` file and add:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://XXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Barcode Scanner Configuration
VITE_BARCODE_SCANNER_ENABLED=true
VITE_BARCODE_END_KEYS=Enter,Tab
VITE_BARCODE_MIN_LENGTH=4
VITE_BARCODE_TIMEOUT_MS=80
VITE_BARCODE_ALLOW_IN_INPUTS=true
VITE_BARCODE_PREFIX=
VITE_BARCODE_SUFFIX=
VITE_BARCODE_SIMULATOR_VISIBLE=true
```

Replace `XXXXXXXXXXXXX` with your Supabase project reference.

### Step 5: Start POS Frontend

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Keep this terminal window open!**

---

## E-commerce Frontend Configuration

Open a **third terminal window/tab**.

### Step 1: Navigate to E-commerce Directory

```bash
cd ~/projects/vcare-pos-system/ecommerce-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Linux/macOS
touch .env

# Windows
type nul > .env
```

### Step 4: Configure Environment Variables

Open the `.env` file and add:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://XXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Start E-commerce Frontend

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: http://192.168.x.x:5174/
```

---

## First-Time Initialization

### Summary of Running Services

You should now have three services running:

1. **Backend API**: http://localhost:3000
2. **POS Frontend**: http://localhost:5173
3. **E-commerce Frontend**: http://localhost:5174

---

## Verification

### Step 1: Verify Backend

Open your browser and navigate to:
- API Health Check: http://localhost:3000/api/system/health
- API Documentation: http://localhost:3000/api/docs

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 2: Verify POS Frontend

1. Navigate to http://localhost:5173
2. You should see the VCare POS login page
3. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
4. You should be redirected to the dashboard

### Step 3: Verify E-commerce Frontend

1. Navigate to http://localhost:5174
2. You should see the e-commerce home page
3. Click "Products" to view the product catalog
4. Try clicking "Login/Register" to test authentication

### Step 4: Test Database Connection

In the POS system:
1. Go to "Products" menu
2. You should see sample products loaded
3. Click "Add Product" to test create functionality
4. Fill in product details and save
5. Verify the product appears in the list

### Step 5: Test API Endpoints

Using curl or Postman:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Expected: Returns JWT token and user info
```

---

## Post-Setup Configuration

### 1. Change Default Passwords

For security, change all default user passwords:

1. Login to POS as admin
2. Go to **User Management**
3. Change passwords for:
   - admin
   - manager1
   - cashier1

### 2. Configure Invoice Settings

1. Go to **Settings** > **Invoice Settings**
2. Configure:
   - Company name
   - Address
   - Phone number
   - Email
   - Logo (optional)
   - Tax information

### 3. Add Categories

1. Go to **Products** > **Categories**
2. Add your product categories:
   - Clothing
   - Electronics
   - Home & Garden
   - etc.

### 4. Add Products

1. Go to **Products** > **Product Management**
2. Click "Add Product"
3. Fill in product details:
   - Name, SKU, barcode
   - Category
   - Price
   - Stock quantity
   - Colors and sizes (if applicable)
   - Images

### 5. Configure Delivery Charges (E-commerce)

1. Go to **Settings** > **Delivery Charges**
2. Add delivery zones and charges:
   - Location/region
   - Charge amount
   - Minimum order value

### 6. Add Tax Rules

1. Go to **Settings** > **Tax Management**
2. Add applicable taxes:
   - VAT
   - Sales tax
   - etc.

---

## Troubleshooting

### Backend Won't Start

**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Find and kill process on port 3000
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in backend/.env:
PORT=3001
```

### Database Connection Failed

**Error**: "Connection refused" or "ECONNREFUSED"

**Solutions**:
1. Verify Supabase credentials in `backend/.env`
2. Check internet connection
3. Ensure Supabase project is active
4. Test connection with psql:
   ```bash
   psql -h YOUR_HOST -U postgres -d postgres
   ```

### Frontend Shows "Network Error"

**Solutions**:
1. Ensure backend is running on http://localhost:3000
2. Check `VITE_API_URL` in `.env` files
3. Check browser console for CORS errors
4. Clear browser cache and reload

### Email Not Sending

**Solutions**:
1. Verify Gmail App Password is correct
2. Check 2FA is enabled on Google account
3. Test email sending:
   ```bash
   cd backend
   node -e "require('./src/utils/mailHelper').testEmail('test@example.com')"
   ```

### "Module not found" Errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Tables Missing

**Solution**:
```bash
cd backend
node src/init-db.js  # Re-run initialization
```

### Can't Login to POS

**Solutions**:
1. Verify default user was created:
   - Check backend logs
   - Re-run `node src/init-db.js`
2. Ensure JWT_SECRET is set in `backend/.env`
3. Clear browser localStorage
4. Check browser console for errors

---

## Next Steps

Now that your system is set up:

1. **Explore the Documentation**:
   - [Features Documentation](FEATURES.md)
   - [Backend API Documentation](backend/README.md)
   - [E-commerce Documentation](ecommerce-frontend/README.md)

2. **Production Deployment**:
   - See [Deployment Guide](DEPLOYMENT.md)

3. **Customize Your System**:
   - Add your products
   - Configure branding
   - Set up email templates
   - Configure payment methods

4. **Test Everything**:
   - Create test transactions
   - Test e-commerce checkout
   - Generate reports
   - Test on different devices

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs in `backend/logs/`
3. Check browser console (F12) for errors
4. Review API documentation at http://localhost:3000/api/docs
5. Contact the development team

---

## Security Checklist

Before going to production:

- [ ] Changed all default passwords
- [ ] Generated new JWT_SECRET
- [ ] Configured HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Restricted database access
- [ ] Configured firewall rules
- [ ] Set up regular backups
- [ ] Reviewed user permissions
- [ ] Tested authentication flows
- [ ] Enabled rate limiting

---

## Congratulations!

Your VCare POS System is now fully set up and ready to use. Happy selling!
