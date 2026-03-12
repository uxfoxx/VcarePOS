/*
  # Rollback: Add size_image to product_sizes

  This file rolls back the changes made in the up migration.

  IMPORTANT: Write SQL that reverses the up migration:
  - Remove columns that were added
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_sizes' AND column_name = 'size_image'
  ) THEN
    ALTER TABLE product_sizes DROP COLUMN size_image;
  END IF;
END $$;
