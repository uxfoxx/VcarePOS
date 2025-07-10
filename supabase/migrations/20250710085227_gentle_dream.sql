-- Seed data for VCare POS System

-- Insert default admin user if not exists
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) 
SELECT 
  'USER-001',
  'admin',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: admin123
  'admin@vcarefurniture.com',
  'Sarah',
  'Wilson',
  'admin',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":true},"transactions":{"view":true,"edit":true,"delete":true},"reports":{"view":true,"edit":true,"delete":true},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":true},"purchase-orders":{"view":true,"edit":true,"delete":true},"settings":{"view":true,"edit":true,"delete":true},"user-management":{"view":true,"edit":true,"delete":true},"audit-trail":{"view":true,"edit":true,"delete":true}}'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin'
);

-- Insert default cashier user if not exists
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) 
SELECT 
  'USER-002',
  'cashier1',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: cashier123
  'john.doe@vcarefurniture.com',
  'John',
  'Doe',
  'cashier',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":false},"products":{"view":true,"edit":false,"delete":false},"raw-materials":{"view":false,"edit":false,"delete":false},"transactions":{"view":true,"edit":false,"delete":false},"reports":{"view":false,"edit":false,"delete":false},"coupons":{"view":true,"edit":false,"delete":false},"tax":{"view":false,"edit":false,"delete":false},"purchase-orders":{"view":false,"edit":false,"delete":false},"settings":{"view":false,"edit":false,"delete":false},"user-management":{"view":false,"edit":false,"delete":false},"audit-trail":{"view":false,"edit":false,"delete":false}}'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'cashier1'
);

-- Insert default manager user if not exists
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) 
SELECT 
  'USER-003',
  'manager1',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: manager123
  'jane.smith@vcarefurniture.com',
  'Jane',
  'Smith',
  'manager',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":false},"transactions":{"view":true,"edit":true,"delete":false},"reports":{"view":true,"edit":false,"delete":false},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":false},"purchase-orders":{"view":true,"edit":true,"delete":false},"settings":{"view":true,"edit":false,"delete":false},"user-management":{"view":true,"edit":false,"delete":false},"audit-trail":{"view":true,"edit":false,"delete":false}}'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'manager1'
);

-- Insert default categories if not exists
INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-001', 'Tables', 'All types of tables including dining, coffee, and office tables', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tables');

INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-002', 'Chairs', 'Seating furniture including office chairs, dining chairs, and accent chairs', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Chairs');

INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-003', 'Storage', 'Storage solutions including cabinets, shelves, and wardrobes', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Storage');

INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-004', 'Sofas & Seating', 'Comfortable seating including sofas, loveseats, and recliners', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sofas & Seating');

INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-005', 'Bedroom', 'Bedroom furniture including beds, nightstands, and dressers', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bedroom');

INSERT INTO categories (id, name, description, is_active)
SELECT 'CAT-006', 'Office Furniture', 'Professional office furniture and accessories', FALSE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Office Furniture');

-- Insert default raw materials if not exists
INSERT INTO raw_materials (
  id, name, category, unit, stock_quantity, unit_price, supplier, minimum_stock, description
)
SELECT 
  '1', 'Oak Wood Planks', 'Wood', 'sq ft', 500, 12.50, 'Premium Wood Co.', 50, 'High-quality oak wood planks for table making'
WHERE NOT EXISTS (
  SELECT 1 FROM raw_materials WHERE id = '1'
);

INSERT INTO raw_materials (
  id, name, category, unit, stock_quantity, unit_price, supplier, minimum_stock, description
)
SELECT 
  '2', 'Pine Wood Boards', 'Wood', 'sq ft', 750, 8.75, 'Forest Materials Ltd.', 100, 'Sustainable pine wood boards for chairs'
WHERE NOT EXISTS (
  SELECT 1 FROM raw_materials WHERE id = '2'
);

INSERT INTO raw_materials (
  id, name, category, unit, stock_quantity, unit_price, supplier, minimum_stock, description
)
SELECT 
  '3', 'Steel Hinges', 'Hardware', 'pieces', 200, 3.25, 'MetalWorks Inc.', 25, 'Heavy-duty steel hinges for table extensions'
WHERE NOT EXISTS (
  SELECT 1 FROM raw_materials WHERE id = '3'
);

-- Insert default taxes if not exists
INSERT INTO taxes (
  id, name, description, rate, tax_type, is_active, applicable_categories
)
SELECT 
  'TAX-001', 'Sales Tax', 'Standard sales tax applied to all orders', 8.0, 'full_bill', TRUE, '[]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM taxes WHERE id = 'TAX-001'
);

INSERT INTO taxes (
  id, name, description, rate, tax_type, is_active, applicable_categories
)
SELECT 
  'TAX-002', 'Luxury Furniture Tax', 'Additional tax for luxury furniture items over $500', 5.0, 'category', TRUE, '["Tables"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM taxes WHERE id = 'TAX-002'
);

-- Insert default coupons if not exists
INSERT INTO coupons (
  id, code, description, discount_type, discount_percent, discount_amount, 
  minimum_amount, max_discount, usage_limit, used_count, valid_from, 
  valid_to, is_active, applicable_categories
)
SELECT 
  'COUPON-001', 'WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 0,
  100, 50, 100, 16, '2024-01-01', '2024-12-31', TRUE, '[]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM coupons WHERE id = 'COUPON-001'
);