/*
  # Product Color Variations System

  1. New Tables
    - `product_colors` - Store color variations for each product
      - `id` (varchar, primary key)
      - `product_id` (varchar, foreign key to products)
      - `name` (varchar, color name like "Red", "Blue")
      - `color_code` (varchar, hex or rgb color code)
      - `image` (text, color-specific product image URL)
      - `created_at`, `updated_at` (timestamps)

  2. Schema Changes
    - Remove variation-related columns from `products` table
    - Modify `product_sizes` to link to `product_colors` instead of `products`
    - Modify `product_raw_materials` to link to `product_colors` instead of `products`
    - Add `selected_color_id` to `transaction_items` table

  3. Data Migration
    - Existing products will need to be migrated to the new structure
    - Default colors will be created for existing products
*/

-- Create product_colors table
CREATE TABLE IF NOT EXISTS product_colors (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color_code VARCHAR(20),
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for product_colors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_colors_product_id_fkey'
  ) THEN
    ALTER TABLE product_colors 
    ADD CONSTRAINT product_colors_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add selected_color_id to transaction_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transaction_items' AND column_name = 'selected_color_id'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN selected_color_id VARCHAR(50);
  END IF;
END $$;

-- Create new product_sizes table with color reference
CREATE TABLE IF NOT EXISTS product_sizes_new (
  id VARCHAR(50) PRIMARY KEY,
  product_color_id VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(10, 2),
  dimensions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for new product_sizes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_sizes_new_product_color_id_fkey'
  ) THEN
    ALTER TABLE product_sizes_new 
    ADD CONSTRAINT product_sizes_new_product_color_id_fkey 
    FOREIGN KEY (product_color_id) REFERENCES product_colors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create new product_raw_materials table with color reference
CREATE TABLE IF NOT EXISTS product_raw_materials_new (
  id SERIAL PRIMARY KEY,
  product_color_id VARCHAR(50) NOT NULL,
  raw_material_id VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for new product_raw_materials
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_new_product_color_id_fkey'
  ) THEN
    ALTER TABLE product_raw_materials_new 
    ADD CONSTRAINT product_raw_materials_new_product_color_id_fkey 
    FOREIGN KEY (product_color_id) REFERENCES product_colors(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_new_raw_material_id_fkey'
  ) THEN
    ALTER TABLE product_raw_materials_new 
    ADD CONSTRAINT product_raw_materials_new_raw_material_id_fkey 
    FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint for new product_raw_materials
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_new_unique'
  ) THEN
    ALTER TABLE product_raw_materials_new 
    ADD CONSTRAINT product_raw_materials_new_unique 
    UNIQUE(product_color_id, raw_material_id);
  END IF;
END $$;

-- Migrate existing data to new structure
-- Create default colors for existing products
INSERT INTO product_colors (id, product_id, name, color_code, image)
SELECT 
  CONCAT('COLOR-', p.id, '-DEFAULT'),
  p.id,
  COALESCE(p.color, 'Default'),
  '#000000',
  p.image
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id
);

-- Migrate existing product_sizes to new structure
INSERT INTO product_sizes_new (id, product_color_id, name, price, stock, weight, dimensions)
SELECT 
  ps.id,
  CONCAT('COLOR-', ps.product_id, '-DEFAULT'),
  ps.name,
  ps.price,
  ps.stock,
  ps.weight,
  ps.dimensions
FROM product_sizes ps
WHERE EXISTS (
  SELECT 1 FROM product_colors pc 
  WHERE pc.id = CONCAT('COLOR-', ps.product_id, '-DEFAULT')
)
AND NOT EXISTS (
  SELECT 1 FROM product_sizes_new psn WHERE psn.id = ps.id
);

-- Migrate existing product_raw_materials to new structure
INSERT INTO product_raw_materials_new (product_color_id, raw_material_id, quantity)
SELECT 
  CONCAT('COLOR-', prm.product_id, '-DEFAULT'),
  prm.raw_material_id,
  prm.quantity
FROM product_raw_materials prm
WHERE EXISTS (
  SELECT 1 FROM product_colors pc 
  WHERE pc.id = CONCAT('COLOR-', prm.product_id, '-DEFAULT')
)
AND NOT EXISTS (
  SELECT 1 FROM product_raw_materials_new prmn 
  WHERE prmn.product_color_id = CONCAT('COLOR-', prm.product_id, '-DEFAULT')
  AND prmn.raw_material_id = prm.raw_material_id
);

-- Drop old tables and rename new ones
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS product_raw_materials CASCADE;

ALTER TABLE product_sizes_new RENAME TO product_sizes;
ALTER TABLE product_raw_materials_new RENAME TO product_raw_materials;

-- Remove old variation columns from products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_sizes'
  ) THEN
    ALTER TABLE products DROP COLUMN has_sizes;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_variants'
  ) THEN
    ALTER TABLE products DROP COLUMN has_variants;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_addons'
  ) THEN
    ALTER TABLE products DROP COLUMN has_addons;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_variant'
  ) THEN
    ALTER TABLE products DROP COLUMN is_variant;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_custom'
  ) THEN
    ALTER TABLE products DROP COLUMN is_custom;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'parent_product_id'
  ) THEN
    ALTER TABLE products DROP COLUMN parent_product_id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'variant_name'
  ) THEN
    ALTER TABLE products DROP COLUMN variant_name;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'parent_product_name'
  ) THEN
    ALTER TABLE products DROP COLUMN parent_product_name;
  END IF;
END $$;

-- Add default_color_id to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'default_color_id'
  ) THEN
    ALTER TABLE products ADD COLUMN default_color_id VARCHAR(50);
  END IF;
END $$;

-- Add foreign key constraint for default_color_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_default_color_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_default_color_id_fkey 
    FOREIGN KEY (default_color_id) REFERENCES product_colors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update products to reference their default color
UPDATE products 
SET default_color_id = CONCAT('COLOR-', id, '-DEFAULT')
WHERE EXISTS (
  SELECT 1 FROM product_colors pc 
  WHERE pc.id = CONCAT('COLOR-', products.id, '-DEFAULT')
);

-- Add foreign key constraint for transaction_items.selected_color_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transaction_items_selected_color_id_fkey'
  ) THEN
    ALTER TABLE transaction_items 
    ADD CONSTRAINT transaction_items_selected_color_id_fkey 
    FOREIGN KEY (selected_color_id) REFERENCES product_colors(id) ON DELETE SET NULL;
  END IF;
END $$;