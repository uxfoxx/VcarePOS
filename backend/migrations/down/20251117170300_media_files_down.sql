/*
  # Rollback: Product Media Files Table

  This migration removes the product_media_files table.
*/

-- Drop foreign key constraint first
ALTER TABLE product_media_files
DROP CONSTRAINT IF EXISTS product_media_files_product_id_fkey;

-- Drop the table
DROP TABLE IF EXISTS product_media_files CASCADE;
