/*
  # Add size_image to product_sizes

  1. Description
    - Adds size_image column to product_sizes table to store size-specific images.

  2. Changes
    - Add size_image column text

  3. Security
    - N/A
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_sizes' AND column_name = 'size_image'
  ) THEN
    ALTER TABLE product_sizes ADD COLUMN size_image TEXT;
  END IF;
END $$;
