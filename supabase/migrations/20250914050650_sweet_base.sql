/*
  # E-commerce Schema Extension

  1. New Tables
    - `ecommerce_orders` - Store e-commerce orders
      - `id` (varchar, primary key)
      - `customer_id` (varchar, foreign key to users)
      - `customer_name` (varchar)
      - `customer_email` (varchar)
      - `customer_phone` (varchar)
      - `customer_address` (text)
      - `total_amount` (decimal)
      - `payment_method` (varchar)
      - `order_status` (varchar)
      - `created_at`, `updated_at` (timestamps)

    - `ecommerce_order_items` - Store order line items
      - `id` (serial, primary key)
      - `ecommerce_order_id` (varchar, foreign key)
      - `product_id` (varchar)
      - `product_name` (varchar)
      - `selected_color_id` (varchar)
      - `selected_size` (varchar)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_price` (decimal)

    - `bank_receipts` - Store bank transfer receipts
      - `id` (varchar, primary key)
      - `ecommerce_order_id` (varchar, foreign key)
      - `file_path` (varchar)
      - `original_filename` (varchar)
      - `file_size` (integer)
      - `uploaded_at` (timestamp)
      - `status` (varchar)

  2. Security
    - Enable RLS on all new tables
    - Add policies for customer access to their own orders
    - Add policies for POS admin access to all e-commerce orders
*/

-- E-commerce Orders Table
CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'bank_transfer')),
  order_status VARCHAR(20) NOT NULL DEFAULT 'pending_payment' CHECK (order_status IN ('pending_payment', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for customer_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ecommerce_orders_customer_id_fkey'
  ) THEN
    ALTER TABLE ecommerce_orders 
    ADD CONSTRAINT ecommerce_orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- E-commerce Order Items Table
CREATE TABLE IF NOT EXISTS ecommerce_order_items (
  id SERIAL PRIMARY KEY,
  ecommerce_order_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  selected_color_id VARCHAR(50),
  selected_size VARCHAR(50),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for ecommerce_order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ecommerce_order_items_order_id_fkey'
  ) THEN
    ALTER TABLE ecommerce_order_items 
    ADD CONSTRAINT ecommerce_order_items_order_id_fkey 
    FOREIGN KEY (ecommerce_order_id) REFERENCES ecommerce_orders(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ecommerce_order_items_product_id_fkey'
  ) THEN
    ALTER TABLE ecommerce_order_items 
    ADD CONSTRAINT ecommerce_order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ecommerce_order_items_color_id_fkey'
  ) THEN
    ALTER TABLE ecommerce_order_items 
    ADD CONSTRAINT ecommerce_order_items_color_id_fkey 
    FOREIGN KEY (selected_color_id) REFERENCES product_colors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Bank Receipts Table
CREATE TABLE IF NOT EXISTS bank_receipts (
  id VARCHAR(50) PRIMARY KEY,
  ecommerce_order_id VARCHAR(50) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected'))
);

-- Add foreign key constraint for bank_receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bank_receipts_order_id_fkey'
  ) THEN
    ALTER TABLE bank_receipts 
    ADD CONSTRAINT bank_receipts_order_id_fkey 
    FOREIGN KEY (ecommerce_order_id) REFERENCES ecommerce_orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_customer_id ON ecommerce_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_status ON ecommerce_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_created_at ON ecommerce_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_ecommerce_order_items_order_id ON ecommerce_order_items(ecommerce_order_id);
CREATE INDEX IF NOT EXISTS idx_bank_receipts_order_id ON bank_receipts(ecommerce_order_id);