-- Create Delivery Charges System for E-commerce

-- Create delivery_charges table
CREATE TABLE IF NOT EXISTS delivery_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text NOT NULL UNIQUE,
  charge_amount decimal(10, 2) NOT NULL CHECK (charge_amount >= 0),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on delivery_charges
ALTER TABLE delivery_charges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active delivery charges (needed for checkout)
CREATE POLICY "Anyone can view active delivery charges"
  ON delivery_charges
  FOR SELECT
  USING (is_active = true);

-- Policy: Admin users can manage delivery charges (for future admin panel)
CREATE POLICY "Authenticated users can manage delivery charges"
  ON delivery_charges
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on delivery_charges
DROP TRIGGER IF EXISTS update_delivery_charges_updated_at ON delivery_charges;
CREATE TRIGGER update_delivery_charges_updated_at
  BEFORE UPDATE ON delivery_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default delivery locations (Sri Lankan districts)
INSERT INTO delivery_charges (location_name, charge_amount, is_active) VALUES
('Colombo', 500.00, true),
('Gampaha', 750.00, true),
('Kalutara', 1000.00, true),
('Kandy', 1500.00, true),
('Galle', 2000.00, true),
('Matara', 2500.00, true),
('Jaffna', 3000.00, true),
('Anuradhapura', 2000.00, true),
('Kurunegala', 1500.00, true),
('Ratnapura', 1800.00, true)
ON CONFLICT (location_name) DO NOTHING;
