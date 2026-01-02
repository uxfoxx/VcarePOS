-- Create Delivery Charges System for POS

-- Create delivery_charges table
CREATE TABLE IF NOT EXISTS delivery_charges (
  id VARCHAR(50) PRIMARY KEY,
  location_name VARCHAR(100) NOT NULL UNIQUE,
  charge_amount DECIMAL(10, 2) NOT NULL CHECK (charge_amount >= 0),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add delivery fields to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'delivery_location'
  ) THEN
    ALTER TABLE transactions ADD COLUMN delivery_location VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE transactions ADD COLUMN delivery_charge DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Insert default delivery locations (Sri Lankan districts)
INSERT INTO delivery_charges (id, location_name, charge_amount, is_active) VALUES
('DELIV-001', 'Colombo', 500.00, TRUE),
('DELIV-002', 'Gampaha', 750.00, TRUE),
('DELIV-003', 'Kalutara', 1000.00, TRUE),
('DELIV-004', 'Kandy', 1500.00, TRUE),
('DELIV-005', 'Galle', 2000.00, TRUE),
('DELIV-006', 'Matara', 2500.00, TRUE),
('DELIV-007', 'Jaffna', 3000.00, TRUE),
('DELIV-008', 'Anuradhapura', 2000.00, TRUE),
('DELIV-009', 'Kurunegala', 1500.00, TRUE),
('DELIV-010', 'Ratnapura', 1800.00, TRUE)
ON CONFLICT (location_name) DO NOTHING;
