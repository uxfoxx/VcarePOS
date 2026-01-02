-- Rollback Delivery Charges System

-- Remove delivery fields from transactions table
ALTER TABLE transactions DROP COLUMN IF EXISTS delivery_location;
ALTER TABLE transactions DROP COLUMN IF EXISTS delivery_charge;

-- Drop delivery_charges table
DROP TABLE IF EXISTS delivery_charges CASCADE;
