/*
  # Add Allow Preorder Column to Products Table

  1. Schema Changes
    - Add `allow_preorder` column to `products` table
    - Set default value to FALSE for existing products
    - Allow products to be visible on e-commerce even when out of stock

  2. Notes
    - This enables the pre-order functionality for e-commerce
    - Products with allow_preorder = TRUE will show on website even with 0 stock
*/

-- Add allow_preorder column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'allow_preorder'
  ) THEN
    ALTER TABLE products ADD COLUMN allow_preorder BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update existing products to have allow_preorder = FALSE by default
UPDATE products SET allow_preorder = FALSE WHERE allow_preorder IS NULL;