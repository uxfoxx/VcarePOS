-- Initial database schema for VCare POS System

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) REFERENCES categories(name) ON UPDATE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  barcode VARCHAR(50),
  image TEXT,
  weight DECIMAL(10, 2),
  color VARCHAR(50),
  material VARCHAR(50),
  dimensions JSONB,
  has_sizes BOOLEAN DEFAULT FALSE,
  has_variants BOOLEAN DEFAULT FALSE,
  has_addons BOOLEAN DEFAULT FALSE,
  is_variant BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  parent_product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(50),
  parent_product_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Sizes Table
CREATE TABLE IF NOT EXISTS product_sizes (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(10, 2),
  dimensions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw Materials Table
CREATE TABLE IF NOT EXISTS raw_materials (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier VARCHAR(100),
  minimum_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Raw Materials (Many-to-Many)
CREATE TABLE IF NOT EXISTS product_raw_materials (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id VARCHAR(50) REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, raw_material_id)
);

-- Product Addons
CREATE TABLE IF NOT EXISTS product_addons (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id VARCHAR(50) REFERENCES raw_materials(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  customer_address TEXT,
  cashier VARCHAR(100) NOT NULL,
  salesperson VARCHAR(100),
  salesperson_id VARCHAR(50),
  payment_method VARCHAR(20) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  category_tax_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  full_bill_tax_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  applied_coupon VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_taxes JSONB
);

-- Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(50) REFERENCES transactions(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_barcode VARCHAR(50),
  product_category VARCHAR(50),
  quantity INTEGER NOT NULL,
  selected_size VARCHAR(50),
  selected_variant VARCHAR(50),
  addons JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(50) REFERENCES transactions(id) ON DELETE CASCADE,
  refund_type VARCHAR(20) NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  notes TEXT,
  refund_method VARCHAR(20) NOT NULL,
  processed_by VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'processed',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund Items Table
CREATE TABLE IF NOT EXISTS refund_items (
  id SERIAL PRIMARY KEY,
  refund_id VARCHAR(50) REFERENCES refunds(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  refund_quantity INTEGER NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  minimum_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_categories JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taxes Table
CREATE TABLE IF NOT EXISTS taxes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rate DECIMAL(5, 2) NOT NULL,
  tax_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_categories JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(50) PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id),
  vendor_name VARCHAR(100) NOT NULL,
  vendor_email VARCHAR(100),
  vendor_phone VARCHAR(20),
  vendor_address TEXT,
  order_date TIMESTAMP NOT NULL,
  expected_delivery_date TIMESTAMP,
  shipping_address TEXT NOT NULL,
  payment_terms VARCHAR(50),
  shipping_method VARCHAR(50),
  notes TEXT,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id VARCHAR(50) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50),
  category VARCHAR(50),
  unit VARCHAR(20),
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Timeline Table
CREATE TABLE IF NOT EXISTS purchase_order_timeline (
  id SERIAL PRIMARY KEY,
  purchase_order_id VARCHAR(50) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_name VARCHAR(100) NOT NULL,
  notes TEXT
);

-- Goods Receive Notes Table
CREATE TABLE IF NOT EXISTS goods_receive_notes (
  id VARCHAR(50) PRIMARY KEY,
  purchase_order_id VARCHAR(50) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  vendor_name VARCHAR(100) NOT NULL,
  vendor_id VARCHAR(50),
  received_date TIMESTAMP NOT NULL,
  received_by VARCHAR(100) NOT NULL,
  checked_by VARCHAR(100) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receive Note Items Table
CREATE TABLE IF NOT EXISTS goods_receive_note_items (
  id SERIAL PRIMARY KEY,
  grn_id VARCHAR(50) REFERENCES goods_receive_notes(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50),
  category VARCHAR(50),
  unit VARCHAR(20),
  quantity DECIMAL(10, 2) NOT NULL,
  received_quantity DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  user_name VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);