/*
  # Rollback: Add Color and Size Columns to Purchase Order Items

  This migration removes the color_id and size_id columns from purchase_order_items table.
*/

-- Drop indexes
DROP INDEX IF EXISTS idx_purchase_order_items_size_id;
DROP INDEX IF EXISTS idx_purchase_order_items_color_id;

-- Drop foreign key constraints
ALTER TABLE purchase_order_items
DROP CONSTRAINT IF EXISTS purchase_order_items_size_id_fkey;

ALTER TABLE purchase_order_items
DROP CONSTRAINT IF EXISTS purchase_order_items_color_id_fkey;

-- Drop columns
ALTER TABLE purchase_order_items
DROP COLUMN IF EXISTS size_id,
DROP COLUMN IF EXISTS color_id;
