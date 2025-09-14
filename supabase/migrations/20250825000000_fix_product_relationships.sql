/*
  # Fix Product Relationships

  This migration corrects the product data relationships to follow the logical hierarchy:
  Product → Colors → Sizes → Raw Materials

  1. Current (incorrect) structure:
     - product_raw_materials links to product_color_id
     
  2. Correct structure:
     - product_raw_materials should link to product_size_id
     - product_sizes links to product_color_id  
     - product_colors links to product_id
     
  This allows different sizes of the same color to have different material quantities.
*/

-- Create corrected product_raw_materials table
CREATE TABLE IF NOT EXISTS product_raw_materials_corrected (
  id SERIAL PRIMARY KEY,
  product_size_id VARCHAR(50) NOT NULL,
  raw_material_id VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for corrected table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_corrected_product_size_id_fkey'
  ) THEN
    ALTER TABLE product_raw_materials_corrected 
    ADD CONSTRAINT product_raw_materials_corrected_product_size_id_fkey 
    FOREIGN KEY (product_size_id) REFERENCES product_sizes(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_corrected_raw_material_id_fkey'
  ) THEN
    ALTER TABLE product_raw_materials_corrected 
    ADD CONSTRAINT product_raw_materials_corrected_raw_material_id_fkey 
    FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_raw_materials_corrected_unique'
  ) THEN
    ALTER TABLE product_raw_materials_corrected 
    ADD CONSTRAINT product_raw_materials_corrected_unique 
    UNIQUE(product_size_id, raw_material_id);
  END IF;
END $$;

-- Migrate existing data from the incorrect structure
-- For each existing raw material linked to a color, create entries for all sizes of that color
INSERT INTO product_raw_materials_corrected (product_size_id, raw_material_id, quantity)
SELECT 
  ps.id as product_size_id,
  prm.raw_material_id,
  prm.quantity
FROM product_raw_materials prm
JOIN product_colors pc ON prm.product_color_id = pc.id
JOIN product_sizes ps ON ps.product_color_id = pc.id
WHERE NOT EXISTS (
  SELECT 1 FROM product_raw_materials_corrected prmc 
  WHERE prmc.product_size_id = ps.id 
  AND prmc.raw_material_id = prm.raw_material_id
);

-- Drop the old table and rename the corrected one
DROP TABLE IF EXISTS product_raw_materials CASCADE;
ALTER TABLE product_raw_materials_corrected RENAME TO product_raw_materials;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_raw_materials_product_size_id 
ON product_raw_materials(product_size_id);

CREATE INDEX IF NOT EXISTS idx_product_raw_materials_raw_material_id 
ON product_raw_materials(raw_material_id);

-- Create a view to easily get the complete product hierarchy
CREATE OR REPLACE VIEW product_hierarchy AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.description,
  p.image as product_image,
  p.barcode,
  p.price as base_price,
  pc.id as color_id,
  pc.name as color_name,
  pc.color_code,
  pc.image as color_image,
  ps.id as size_id,
  ps.name as size_name,
  ps.price as size_price,
  ps.stock as size_stock,
  ps.weight as size_weight,
  ps.dimensions as size_dimensions,
  prm.id as material_id,
  prm.raw_material_id,
  prm.quantity as material_quantity,
  rm.name as material_name,
  rm.unit as material_unit,
  rm.unit_price as material_unit_price
FROM products p
LEFT JOIN product_colors pc ON p.id = pc.product_id
LEFT JOIN product_sizes ps ON pc.id = ps.product_color_id
LEFT JOIN product_raw_materials prm ON ps.id = prm.product_size_id
LEFT JOIN raw_materials rm ON prm.raw_material_id = rm.id
ORDER BY p.name, pc.name, ps.name;
