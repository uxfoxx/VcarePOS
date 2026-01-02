/*
  # Rollback: Remove Delivery and Notification Fields from E-commerce Orders

  This migration removes the delivery_location, delivery_charge, and notified_at columns
  that were added to the ecommerce_orders table.

  WARNING: This will permanently delete the data in these columns!
*/

-- Drop the index first
DROP INDEX IF EXISTS idx_ecommerce_orders_notified_at;

-- Remove notified_at column
ALTER TABLE ecommerce_orders DROP COLUMN IF EXISTS notified_at;

-- Remove delivery_charge column
ALTER TABLE ecommerce_orders DROP COLUMN IF EXISTS delivery_charge;

-- Remove delivery_location column
ALTER TABLE ecommerce_orders DROP COLUMN IF EXISTS delivery_location;
