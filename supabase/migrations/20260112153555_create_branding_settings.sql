/*
  # Create Branding Settings Table

  1. New Tables
    - `branding_settings`
      - `id` (uuid, primary key) - Unique identifier for settings record
      - `business_name` (text) - Business name for branding
      - `tagline` (text) - Business tagline or slogan
      - `logo_path` (text) - Path to uploaded logo file
      - `primary_color` (varchar) - Primary brand color (hex)
      - `secondary_color` (varchar) - Secondary brand color (hex)
      - `accent_color` (varchar) - Accent brand color (hex)
      - `font_family` (varchar) - Font family for branding
      - `dark_mode_support` (boolean) - Whether dark mode is enabled
      - `receipt_footer` (text) - Custom footer text for receipts
      - `invoice_notes` (text) - Custom notes for invoices
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `branding_settings` table
    - Add policy for authenticated users to read branding settings
    - Add policy for users with 'settings:edit' permission to update branding settings

  3. Notes
    - Single row table (only one branding configuration per system)
    - Logo stored as file path, not Base64
    - Default color values provided
*/

-- Create branding_settings table
CREATE TABLE IF NOT EXISTS branding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT '',
  tagline text DEFAULT '',
  logo_path text,
  primary_color varchar(7) DEFAULT '#1890ff',
  secondary_color varchar(7) DEFAULT '#52c41a',
  accent_color varchar(7) DEFAULT '#fa8c16',
  font_family varchar(100) DEFAULT 'Inter',
  dark_mode_support boolean DEFAULT false,
  receipt_footer text DEFAULT '',
  invoice_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read branding settings
CREATE POLICY "Authenticated users can read branding settings"
  ON branding_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users with settings:edit permission can insert branding settings
CREATE POLICY "Users with settings permission can insert branding"
  ON branding_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.permissions->>'settings' = 'edit'
    )
  );

-- Policy: Users with settings:edit permission can update branding settings
CREATE POLICY "Users with settings permission can update branding"
  ON branding_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.permissions->>'settings' = 'edit'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.permissions->>'settings' = 'edit'
    )
  );

-- Insert default branding settings (if none exist)
INSERT INTO branding_settings (
  business_name,
  tagline,
  primary_color,
  secondary_color,
  accent_color,
  font_family,
  dark_mode_support
)
SELECT
  'My Business',
  'Your tagline here',
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  'Inter',
  false
WHERE NOT EXISTS (SELECT 1 FROM branding_settings LIMIT 1);
