/*
  # Create Quotations System

  ## Overview
  This migration creates a comprehensive quotations system for the POS, allowing users to create,
  manage, and convert quotations to sales without affecting inventory until conversion.

  ## New Tables

  ### `quotations`
  Main quotations table storing quotation headers
  - `id` (text, primary key) - Quotation ID in format QUOT-XXXXXX
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone number
  - `customer_email` (text) - Customer email address
  - `customer_address` (text) - Customer address
  - `subtotal` (numeric) - Subtotal amount before discounts and taxes
  - `discount` (numeric, default 0) - Discount amount applied
  - `total_tax` (numeric, default 0) - Total tax amount
  - `total` (numeric) - Final total amount
  - `status` (text, default 'draft') - Status: draft, sent, accepted, rejected, expired, converted
  - `notes` (text) - Additional notes or special instructions
  - `valid_until` (timestamptz) - Quotation expiry date
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp
  - `created_by` (text, references users) - User who created the quotation
  - `converted_to_transaction_id` (text) - Transaction ID if converted to sale
  - `applied_taxes` (jsonb) - Tax details in JSON format

  ### `quotation_items`
  Stores individual line items for each quotation
  - `id` (uuid, primary key) - Unique item identifier
  - `quotation_id` (text, references quotations) - Parent quotation reference
  - `product_id` (text, references products) - Product reference
  - `product_name` (text) - Product name snapshot
  - `product_barcode` (text) - Product barcode/SKU snapshot
  - `selected_variant` (text) - Selected color variant
  - `selected_size` (text) - Selected size option
  - `quantity` (integer) - Quantity quoted
  - `unit_price` (numeric) - Unit price at time of quotation
  - `total_price` (numeric) - Total line item price (quantity × unit_price)
  - `description` (text) - Additional item description
  - `created_at` (timestamptz, default now()) - Creation timestamp

  ## Security
  - Enable RLS on both tables
  - Policies allow authenticated users to:
    - View their own quotations
    - Create new quotations
    - Update their own draft quotations
    - Delete their own draft quotations
  - Admin users can view and manage all quotations

  ## Indexes
  - Index on quotation status for filtering
  - Index on customer phone for quick lookups
  - Index on valid_until date for expiry checks
  - Index on created_by for user-specific queries
  - Index on quotation_id in quotation_items for joins

  ## Notes
  - Quotations do not affect inventory until converted to sales
  - Expiry dates are tracked but not automatically enforced
  - Status transitions should be handled by application logic
  - Converted quotations retain reference to the original transaction
*/

-- Create auth schema and functions for compatibility with regular PostgreSQL
CREATE SCHEMA IF NOT EXISTS auth;

-- Create stub auth.uid() function for regular PostgreSQL
-- This returns NULL since authentication is handled at the application level via JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS text AS $$
BEGIN
  -- Return NULL as auth is handled by the application layer
  -- Application uses JWT tokens for authentication
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  customer_address text,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  total_tax numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  notes text,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text REFERENCES users(id),
  converted_to_transaction_id text,
  applied_taxes jsonb DEFAULT '{}'::jsonb
);

-- Create quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id text NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id),
  product_name text NOT NULL,
  product_barcode text,
  selected_variant text,
  selected_size text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_phone ON quotations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);
CREATE INDEX IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_product_id ON quotation_items(product_id);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations table

-- Allow users to view their own quotations
CREATE POLICY "Users can view own quotations"
  ON quotations
  FOR SELECT
  USING (auth.uid() = created_by);

-- Allow admins to view all quotations
CREATE POLICY "Admins can view all quotations"
  ON quotations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow users to create quotations
CREATE POLICY "Users can create quotations"
  ON quotations
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own draft quotations
CREATE POLICY "Users can update own draft quotations"
  ON quotations
  FOR UPDATE
  USING (auth.uid() = created_by AND status = 'draft')
  WITH CHECK (auth.uid() = created_by);

-- Allow admins to update all quotations
CREATE POLICY "Admins can update all quotations"
  ON quotations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow users to delete their own draft quotations
CREATE POLICY "Users can delete own draft quotations"
  ON quotations
  FOR DELETE
  USING (auth.uid() = created_by AND status = 'draft');

-- Allow admins to delete any quotation
CREATE POLICY "Admins can delete all quotations"
  ON quotations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for quotation_items table

-- Allow users to view items of their quotations
CREATE POLICY "Users can view own quotation items"
  ON quotation_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.created_by = auth.uid()
    )
  );

-- Allow admins to view all quotation items
CREATE POLICY "Admins can view all quotation items"
  ON quotation_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow users to insert items for their quotations
CREATE POLICY "Users can insert own quotation items"
  ON quotation_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.created_by = auth.uid()
    )
  );

-- Allow users to update items of their draft quotations
CREATE POLICY "Users can update own draft quotation items"
  ON quotation_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.created_by = auth.uid()
      AND quotations.status = 'draft'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.created_by = auth.uid()
      AND quotations.status = 'draft'
    )
  );

-- Allow admins to update all quotation items
CREATE POLICY "Admins can update all quotation items"
  ON quotation_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow users to delete items from their draft quotations
CREATE POLICY "Users can delete own draft quotation items"
  ON quotation_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.created_by = auth.uid()
      AND quotations.status = 'draft'
    )
  );

-- Allow admins to delete any quotation items
CREATE POLICY "Admins can delete all quotation items"
  ON quotation_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_quotation_updated_at ON quotations;
CREATE TRIGGER trigger_update_quotation_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_quotation_updated_at();
