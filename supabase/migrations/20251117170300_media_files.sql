-- /*
--   # Migration: Move product media to a separate table

--   - Remove `media` JSONB column from `products`
--   - Create new `product_media_files` table
--     - id
--     - product_id (FK to products)
--     - file_path (local storage path, NOT base64)
--     - media_type (image / video)
--     - file_name
--     - file_size
--     - created_at
-- */

-- -- 1. Create product_media_files table
-- CREATE TABLE IF NOT EXISTS product_media_files (
--   id VARCHAR(50) PRIMARY KEY,
--   product_id VARCHAR(50) NOT NULL,
--   file_path TEXT NOT NULL,
--   media_type VARCHAR(20) NOT NULL,  -- 'image' or 'video'
--   file_name TEXT,
--   file_size INTEGER,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 2. Add FK constraint if not exists
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.table_constraints
--     WHERE constraint_name = 'product_media_files_product_id_fkey'
--   ) THEN
--     ALTER TABLE product_media_files
--     ADD CONSTRAINT product_media_files_product_id_fkey
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
--   END IF;
-- END $$;


-- -- -- 3. Drop `media` column from products table
-- -- DO $$
-- -- BEGIN
-- --   IF EXISTS (
-- --     SELECT 1 FROM information_schema.columns
-- --     WHERE table_name='products' AND column_name='media'
-- --   ) THEN
-- --     ALTER TABLE products DROP COLUMN media;
-- --   END IF;
-- -- END $$;


/*
  # Migration: Store product media files without mandatory product_id
  - `product_id` becomes nullable
  - Media paths stored in local storage
*/

-- 1. Create product_media_files table
CREATE TABLE IF NOT EXISTS product_media_files (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50),               -- nullable now
  file_path TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL,      -- 'image' or 'video'
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add FK constraint if product_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints
    WHERE constraint_name = 'product_media_files_product_id_fkey'
  ) THEN
    ALTER TABLE product_media_files
    ADD CONSTRAINT product_media_files_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;


ALTER TABLE product_media_files
ALTER COLUMN product_id DROP NOT NULL;