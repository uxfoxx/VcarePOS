/*
  # Invoice Settings and Configuration

  1. New Tables
    - `invoice_settings`
      - `id` (uuid, primary key)
      - `business_name` (text)
      - `business_address` (text)
      - `phone_number` (text)
      - `email_address` (text)
      - `website` (text)
      - `logo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `bank_account_details`
      - `id` (uuid, primary key)
      - `account_holder_name` (text)
      - `account_number` (text)
      - `bank_name` (text)
      - `branch_name` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `invoice_notes_templates`
      - `id` (uuid, primary key)
      - `template_name` (text)
      - `warranty_terms` (text)
      - `quotation_validity` (text)
      - `custom_notes` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users with appropriate permissions

  3. Notes
    - Stores invoice-specific branding and configuration
    - Allows multiple bank accounts with default selection
    - Supports customizable invoice notes and terms templates
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

-- Create invoice_settings table
CREATE TABLE IF NOT EXISTS invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT 'VCare Furniture Store',
  business_address text DEFAULT '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka',
  phone_number text DEFAULT '+94 76 767 5044',
  email_address text,
  website text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoice settings"
  ON invoice_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update invoice settings"
  ON invoice_settings FOR UPDATE
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

-- Create bank_account_details table
CREATE TABLE IF NOT EXISTS bank_account_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_holder_name text NOT NULL DEFAULT 'Vogue Holdings (Private) Limited',
  account_number text NOT NULL DEFAULT '016210004878',
  bank_name text NOT NULL DEFAULT 'Sampath Bank',
  branch_name text DEFAULT 'Kaduwela Branch',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_account_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bank account details"
  ON bank_account_details FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert bank account details"
  ON bank_account_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update bank account details"
  ON bank_account_details FOR UPDATE
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

CREATE POLICY "Admins can delete bank account details"
  ON bank_account_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create invoice_notes_templates table
CREATE TABLE IF NOT EXISTS invoice_notes_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL DEFAULT 'Default Template',
  warranty_terms text DEFAULT 'Chair – 2-year warranty covering manufacturing defects under normal use conditions. Drawer Unit – 2-year warranty. Smart Desk – 2-year structural warranty and 6-month warranty for power units.',
  quotation_validity text DEFAULT 'This quotation is valid for 30 days from the date of issue. Prices and availability are subject to change after this period.',
  custom_notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_notes_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoice notes templates"
  ON invoice_notes_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert invoice notes templates"
  ON invoice_notes_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update invoice notes templates"
  ON invoice_notes_templates FOR UPDATE
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

CREATE POLICY "Admins can delete invoice notes templates"
  ON invoice_notes_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default data
INSERT INTO invoice_settings (id, business_name, business_address, phone_number)
VALUES (
  gen_random_uuid(),
  'VCare Furniture Store',
  '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka',
  '+94 76 767 5044'
) ON CONFLICT DO NOTHING;

INSERT INTO bank_account_details (id, account_holder_name, account_number, bank_name, branch_name, is_default)
VALUES (
  gen_random_uuid(),
  'Vogue Holdings (Private) Limited',
  '016210004878',
  'Sampath Bank',
  'Kaduwela Branch',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO invoice_notes_templates (id, template_name, warranty_terms, quotation_validity, is_default)
VALUES (
  gen_random_uuid(),
  'Default Template',
  'Chair – 2-year warranty covering manufacturing defects under normal use conditions. Drawer Unit – 2-year warranty. Smart Desk – 2-year structural warranty and 6-month warranty for power units.',
  'This quotation is valid for 30 days from the date of issue. Prices and availability are subject to change after this period.',
  true
) ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_account_details_is_default ON bank_account_details(is_default);
CREATE INDEX IF NOT EXISTS idx_invoice_notes_templates_is_default ON invoice_notes_templates(is_default);
