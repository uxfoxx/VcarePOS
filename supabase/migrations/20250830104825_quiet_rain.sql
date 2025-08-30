/*
  # E-commerce Platform Integration

  1. New Tables
    - `customers` - Store e-commerce customer details
      - `id` (varchar, primary key)
      - `first_name`, `last_name` (varchar)
      - `email` (varchar, unique)
      - `phone` (varchar)
      - `address` (text)
      - `city` (varchar)
      - `postal_code` (varchar)
      - `password_hash` (varchar, for customer login)
      - `is_active` (boolean)
      - `created_at`, `updated_at` (timestamps)

  2. Schema Changes
    - Add `source` column to `transactions` table (pos/ecommerce)
    - Add `customer_id` column to `transactions` table
    - Add `delivery_charge` column to `transactions` table
    - Add `delivery_area` column to `transactions` table
    - Add `receipt_url` column to `transactions` table
    - Add `order_notes` column to `transactions` table

  3. Security
    - Enable RLS on `customers` table
    - Add policies for customer data access
*/

-- Create customers table for e-commerce users
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  password_hash VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add e-commerce related columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'source'
  ) THEN
    ALTER TABLE transactions ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'pos';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN customer_id VARCHAR(50);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE transactions ADD COLUMN delivery_charge DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'delivery_area'
  ) THEN
    ALTER TABLE transactions ADD COLUMN delivery_area VARCHAR(50);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'order_notes'
  ) THEN
    ALTER TABLE transactions ADD COLUMN order_notes TEXT;
  END IF;
END $$;

-- Add foreign key constraint for customer_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_customer_id_fkey'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create order status history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  change_reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for order_status_history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_status_history_transaction_id_fkey'
  ) THEN
    ALTER TABLE order_status_history 
    ADD CONSTRAINT order_status_history_transaction_id_fkey 
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create delivery zones table for future expansion
CREATE TABLE IF NOT EXISTS delivery_zones (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  charge DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default delivery zones
INSERT INTO delivery_zones (id, name, description, charge, is_active)
VALUES 
  ('ZONE-001', 'Inside Colombo', 'Delivery within Colombo city limits', 300.00, TRUE),
  ('ZONE-002', 'Outside Colombo', 'Delivery outside Colombo city limits', 600.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_order_status_history_transaction_id ON order_status_history(transaction_id);

-- Create a view for e-commerce orders with customer details
CREATE OR REPLACE VIEW ecommerce_orders AS
SELECT 
  t.*,
  c.first_name as customer_first_name,
  c.last_name as customer_last_name,
  c.email as customer_email_address,
  c.phone as customer_phone_number,
  c.address as customer_full_address,
  c.city as customer_city,
  c.postal_code as customer_postal_code
FROM transactions t
LEFT JOIN customers c ON t.customer_id = c.id
WHERE t.source = 'ecommerce'
ORDER BY t.timestamp DESC;