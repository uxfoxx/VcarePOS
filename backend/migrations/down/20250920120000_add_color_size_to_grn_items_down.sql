/*
  # Rollback: Add Color and Size Columns to GRN Items

  This migration removes the color_id and size_id columns from goods_receive_note_items table.
*/

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_grn_items_size_id;
DROP INDEX IF EXISTS idx_grn_items_color_id;

-- Drop foreign key constraints
ALTER TABLE goods_receive_note_items
DROP CONSTRAINT IF EXISTS grn_items_size_id_fkey;

ALTER TABLE goods_receive_note_items
DROP CONSTRAINT IF EXISTS grn_items_color_id_fkey;

-- Drop columns
ALTER TABLE goods_receive_note_items
DROP COLUMN IF EXISTS size_id,
DROP COLUMN IF EXISTS color_id;
