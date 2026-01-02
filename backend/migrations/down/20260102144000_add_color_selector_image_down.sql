-- Rollback Color Selector Image Addition

-- Remove color_selector_image column from product_colors table
ALTER TABLE product_colors DROP COLUMN IF EXISTS color_selector_image;
