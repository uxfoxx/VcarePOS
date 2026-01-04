-- Create Delivery Charges System for E-commerce

-- Create delivery_charges table
CREATE TABLE IF NOT EXISTS delivery_charges (
  id text PRIMARY KEY,
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
INSERT INTO delivery_charges (id, location_name, charge_amount, is_active) VALUES
('DELIV-001', 'Colombo', 500.00, true),
('DELIV-002', 'Gampaha', 750.00, true),
('DELIV-003', 'Kalutara', 1000.00, true),
('DELIV-004', 'Kandy', 1500.00, true),
('DELIV-005', 'Galle', 2000.00, true),
('DELIV-006', 'Matara', 2500.00, true),
('DELIV-007', 'Jaffna', 3000.00, true),
('DELIV-008', 'Anuradhapura', 2000.00, true),
('DELIV-009', 'Kurunegala', 1500.00, true),
('DELIV-010', 'Ratnapura', 1800.00, true)
ON CONFLICT (location_name) DO NOTHING;
