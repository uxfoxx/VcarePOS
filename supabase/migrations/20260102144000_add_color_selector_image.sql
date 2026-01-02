/*
  # Add Color Selector Image to Product Colors

  1. Schema Changes
    - Add `color_selector_image` column to `product_colors` table for small thumbnails
    - The existing `image` field remains for full product images in that color
  
  2. Purpose
    - `color_selector_image`: Small thumbnail shown in color selector buttons
    - `image`: Full-size product image displayed in gallery when color is selected
  
  3. Migration Notes
    - Column is nullable (existing records can be updated later)
    - Backward compatible with existing data
*/

-- Add color_selector_image column to product_colors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_colors' AND column_name = 'color_selector_image'
  ) THEN
    ALTER TABLE product_colors ADD COLUMN color_selector_image TEXT;
  END IF;
END $$;
