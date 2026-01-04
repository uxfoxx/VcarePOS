-- Fix delivery_charges table schema issue
-- Run this script to drop the existing table with wrong schema
-- and allow the migration to recreate it correctly

-- Drop the existing delivery_charges table
DROP TABLE IF EXISTS delivery_charges CASCADE;

-- Optional: If you want to also reset the migration tracking
-- (uncomment the line below if needed)
-- DELETE FROM migrations WHERE name = '20260102143500_create_delivery_charges_pos.sql';
