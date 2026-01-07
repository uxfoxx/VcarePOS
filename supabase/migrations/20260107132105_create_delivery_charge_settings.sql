/*
  # Create Delivery Charge Settings Table

  1. New Tables
    - `delivery_charge_settings`
      - `id` (serial, primary key)
      - `type` (text, unique) - Delivery type: 'free_delivery', 'inside_colombo', 'out_of_colombo'
      - `is_active` (boolean, default true) - Whether this delivery option is active
      - `enabled_for_pos` (boolean, default true) - Whether enabled for POS system
      - `enabled_for_ecommerce` (boolean, default true) - Whether enabled for e-commerce
      - `inside_colombo_amount` (numeric) - Flat rate for inside Colombo delivery
      - `out_of_colombo_base_weight` (numeric) - Base weight in kg for out of Colombo
      - `out_of_colombo_base_amount` (numeric) - Base amount for out of Colombo
      - `out_of_colombo_per_kg_amount` (numeric) - Per kg charge for out of Colombo
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `delivery_charge_settings` table
    - Add policy for public to read active settings
    - Add policy for all users to manage settings (auth handled at app level)

  3. Default Data
    - Insert default settings for all three delivery types
*/

-- Create delivery_charge_settings table
CREATE TABLE IF NOT EXISTS delivery_charge_settings (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('free_delivery', 'inside_colombo', 'out_of_colombo')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  enabled_for_pos BOOLEAN DEFAULT true NOT NULL,
  enabled_for_ecommerce BOOLEAN DEFAULT true NOT NULL,
  inside_colombo_amount NUMERIC(10, 2) DEFAULT 0,
  out_of_colombo_base_weight NUMERIC(10, 2) DEFAULT 0,
  out_of_colombo_base_amount NUMERIC(10, 2) DEFAULT 0,
  out_of_colombo_per_kg_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on delivery_charge_settings
ALTER TABLE delivery_charge_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view delivery settings (needed for checkout)
CREATE POLICY "Anyone can view delivery settings"
  ON delivery_charge_settings
  FOR SELECT
  USING (true);

-- Policy: All users can manage delivery settings (auth handled at app level)
CREATE POLICY "All users can manage delivery settings"
  ON delivery_charge_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_delivery_charge_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on delivery_charge_settings
DROP TRIGGER IF EXISTS update_delivery_charge_settings_updated_at ON delivery_charge_settings;
CREATE TRIGGER update_delivery_charge_settings_updated_at
  BEFORE UPDATE ON delivery_charge_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_charge_settings_updated_at();

-- Insert default delivery settings (let SERIAL generate id)
INSERT INTO delivery_charge_settings (
  type,
  is_active,
  enabled_for_pos,
  enabled_for_ecommerce,
  inside_colombo_amount,
  out_of_colombo_base_weight,
  out_of_colombo_base_amount,
  out_of_colombo_per_kg_amount
) 
SELECT * FROM (VALUES
  -- Free Delivery Option
  (
    'free_delivery',
    false,
    false,
    false,
    0::numeric,
    0::numeric,
    0::numeric,
    0::numeric
  ),
  -- Inside Colombo Flat Rate
  (
    'inside_colombo',
    true,
    true,
    true,
    500.00::numeric,
    0::numeric,
    0::numeric,
    0::numeric
  ),
  -- Out of Colombo Weight-based
  (
    'out_of_colombo',
    true,
    true,
    true,
    0::numeric,
    5.0::numeric,
    600.00::numeric,
    100.00::numeric
  )
) AS v(type, is_active, enabled_for_pos, enabled_for_ecommerce, inside_colombo_amount, out_of_colombo_base_weight, out_of_colombo_base_amount, out_of_colombo_per_kg_amount)
WHERE NOT EXISTS (SELECT 1 FROM delivery_charge_settings WHERE delivery_charge_settings.type = v.type);