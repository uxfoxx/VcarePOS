/*
  # Seed Data for VCare POS System
  
  1. New Data
    - Admin user with hardcoded credentials
    - Sample products
    - Sample raw materials
    - Sample categories
    - Sample taxes
    - Sample coupons
  
  2. Security
    - Includes password hash for admin user
*/

-- Insert default admin user with hardcoded credentials
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) VALUES (
  'USER-ADMIN-001',
  'admin',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: admin123
  'admin@vcarefurniture.com',
  'Admin',
  'User',
  'admin',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":true},"transactions":{"view":true,"edit":true,"delete":true},"reports":{"view":true,"edit":true,"delete":true},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":true},"purchase-orders":{"view":true,"edit":true,"delete":true},"settings":{"view":true,"edit":true,"delete":true},"user-management":{"view":true,"edit":true,"delete":true},"audit-trail":{"view":true,"edit":true,"delete":true}}'
) ON CONFLICT (username) DO NOTHING;

-- Insert default manager user
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) VALUES (
  'USER-MANAGER-001',
  'manager',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: admin123
  'manager@vcarefurniture.com',
  'Manager',
  'User',
  'manager',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":false},"transactions":{"view":true,"edit":true,"delete":false},"reports":{"view":true,"edit":false,"delete":false},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":false},"purchase-orders":{"view":true,"edit":true,"delete":false},"settings":{"view":true,"edit":false,"delete":false},"user-management":{"view":true,"edit":false,"delete":false},"audit-trail":{"view":true,"edit":false,"delete":false}}'
) ON CONFLICT (username) DO NOTHING;

-- Insert default cashier user
INSERT INTO users (
  id, username, password, email, first_name, last_name, role, is_active, permissions
) VALUES (
  'USER-CASHIER-001',
  'cashier',
  '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', -- password: admin123
  'cashier@vcarefurniture.com',
  'Cashier',
  'User',
  'cashier',
  TRUE,
  '{"pos":{"view":true,"edit":true,"delete":false},"products":{"view":true,"edit":false,"delete":false},"raw-materials":{"view":false,"edit":false,"delete":false},"transactions":{"view":true,"edit":false,"delete":false},"reports":{"view":false,"edit":false,"delete":false},"coupons":{"view":true,"edit":false,"delete":false},"tax":{"view":false,"edit":false,"delete":false},"purchase-orders":{"view":false,"edit":false,"delete":false},"settings":{"view":false,"edit":false,"delete":false},"user-management":{"view":false,"edit":false,"delete":false},"audit-trail":{"view":false,"edit":false,"delete":false}}'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample raw materials
INSERT INTO raw_materials (
  id, name, category, unit, stock_quantity, unit_price, supplier, minimum_stock, description
) VALUES
  ('RM-001', 'Oak Wood Planks', 'Wood', 'sq ft', 500, 12.50, 'Premium Wood Co.', 50, 'High-quality oak wood planks for table making'),
  ('RM-002', 'Pine Wood Boards', 'Wood', 'sq ft', 750, 8.75, 'Forest Materials Ltd.', 100, 'Sustainable pine wood boards for chairs'),
  ('RM-003', 'Steel Hinges', 'Hardware', 'pieces', 200, 3.25, 'MetalWorks Inc.', 25, 'Heavy-duty steel hinges for table extensions'),
  ('RM-004', 'Wood Screws', 'Hardware', 'pieces', 1000, 0.15, 'FastenRight Co.', 100, 'Premium wood screws for furniture assembly'),
  ('RM-005', 'Foam Padding', 'Upholstery', 'sq ft', 300, 4.50, 'Comfort Materials', 50, 'High-density foam for chair cushions'),
  ('RM-006', 'Leather Fabric', 'Upholstery', 'sq ft', 150, 25.00, 'Premium Leather Co.', 20, 'Genuine leather fabric for premium chairs'),
  ('RM-007', 'Wood Stain - Walnut', 'Finishing', 'liters', 50, 18.00, 'ColorCraft Finishes', 10, 'Professional walnut wood stain for tables'),
  ('RM-008', 'Polyurethane Finish', 'Finishing', 'liters', 40, 22.50, 'ProtectCoat Ltd.', 8, 'Clear polyurethane protective finish')
ON CONFLICT (id) DO NOTHING;

-- Insert sample categories if they don't exist
INSERT INTO categories (id, name, description, is_active)
VALUES
  ('CAT-001', 'Tables', 'All types of tables including dining, coffee, and office tables', TRUE),
  ('CAT-002', 'Chairs', 'Seating furniture including office chairs, dining chairs, and accent chairs', TRUE),
  ('CAT-003', 'Storage', 'Storage solutions including cabinets, shelves, and wardrobes', TRUE),
  ('CAT-004', 'Sofas & Seating', 'Comfortable seating including sofas, loveseats, and recliners', TRUE),
  ('CAT-005', 'Bedroom', 'Bedroom furniture including beds, nightstands, and dressers', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (
  id, name, description, category, price, stock, barcode, image, 
  weight, color, material, dimensions, has_sizes, has_variants, has_addons
) VALUES
  (
    'PROD-001', 
    'Executive Dining Table', 
    'Premium oak dining table with elegant design', 
    'Tables', 
    899.99, 
    15, 
    'TE01MZ', 
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    55.0,
    'Natural Oak',
    'Oak Wood',
    '{"length": 200, "width": 100, "height": 75, "unit": "cm"}',
    TRUE,
    FALSE,
    FALSE
  ),
  (
    'PROD-002', 
    'Executive Office Chair', 
    'Ergonomic executive chair with premium upholstery', 
    'Chairs', 
    399.99, 
    25, 
    'CE01Q2', 
    'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    18.5,
    'Black',
    'Leather',
    '{"length": 65, "width": 65, "height": 120, "unit": "cm"}',
    TRUE,
    FALSE,
    FALSE
  ),
  (
    'PROD-003', 
    'Rustic Farmhouse Table', 
    'Handcrafted pine farmhouse dining table', 
    'Tables', 
    649.99, 
    6, 
    'TF03U6', 
    'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=300',
    45.0,
    'Natural Pine',
    'Pine Wood',
    '{"length": 180, "width": 90, "height": 75, "unit": "cm"}',
    FALSE,
    FALSE,
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- Insert product sizes for products with sizes
INSERT INTO product_sizes (
  id, product_id, name, price, stock, weight, dimensions
) VALUES
  (
    'SIZE-001-1',
    'PROD-001',
    'Small',
    799.99,
    5,
    40.0,
    '{"length": 150, "width": 80, "height": 75, "unit": "cm"}'
  ),
  (
    'SIZE-001-2',
    'PROD-001',
    'Medium',
    899.99,
    6,
    50.0,
    '{"length": 180, "width": 90, "height": 75, "unit": "cm"}'
  ),
  (
    'SIZE-001-3',
    'PROD-001',
    'Large',
    1099.99,
    4,
    55.0,
    '{"length": 200, "width": 100, "height": 75, "unit": "cm"}'
  ),
  (
    'SIZE-002-1',
    'PROD-002',
    'Standard',
    399.99,
    12,
    18.5,
    '{"length": 65, "width": 65, "height": 120, "unit": "cm"}'
  ),
  (
    'SIZE-002-2',
    'PROD-002',
    'Large',
    449.99,
    8,
    20.0,
    '{"length": 70, "width": 70, "height": 125, "unit": "cm"}'
  ),
  (
    'SIZE-002-3',
    'PROD-002',
    'Extra Large',
    499.99,
    5,
    22.0,
    '{"length": 75, "width": 75, "height": 130, "unit": "cm"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert product raw materials
INSERT INTO product_raw_materials (
  product_id, raw_material_id, quantity
) VALUES
  ('PROD-001', 'RM-001', 25),
  ('PROD-001', 'RM-004', 50),
  ('PROD-001', 'RM-007', 1.5),
  ('PROD-001', 'RM-008', 1),
  ('PROD-002', 'RM-006', 3),
  ('PROD-002', 'RM-005', 2),
  ('PROD-003', 'RM-002', 25),
  ('PROD-003', 'RM-004', 50),
  ('PROD-003', 'RM-007', 2),
  ('PROD-003', 'RM-008', 1)
ON CONFLICT (product_id, raw_material_id) DO NOTHING;

-- Insert sample taxes
INSERT INTO taxes (
  id, name, description, rate, tax_type, is_active, applicable_categories
) VALUES
  ('TAX-001', 'Sales Tax', 'Standard sales tax applied to all orders', 8.0, 'full_bill', TRUE, '[]'::jsonb),
  ('TAX-002', 'Luxury Furniture Tax', 'Additional tax for luxury furniture items', 5.0, 'category', TRUE, '["Tables"]'::jsonb),
  ('TAX-003', 'Premium Seating Tax', 'Tax for premium seating products', 3.0, 'category', TRUE, '["Chairs"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (
  id, code, description, discount_type, discount_percent, discount_amount, 
  minimum_amount, max_discount, usage_limit, used_count, valid_from, 
  valid_to, is_active, applicable_categories
) VALUES
  (
    'COUPON-001', 
    'WELCOME10', 
    'Welcome discount for new customers', 
    'percentage', 
    10, 
    0, 
    100, 
    50, 
    100, 
    16, 
    '2024-01-01', 
    '2024-12-31', 
    TRUE, 
    '[]'::jsonb
  ),
  (
    'COUPON-002', 
    'FURNITURE20', 
    '20% off on all furniture items', 
    'percentage', 
    20, 
    0, 
    500, 
    200, 
    50, 
    8, 
    '2024-01-15', 
    '2024-12-15', 
    TRUE, 
    '["Tables", "Chairs"]'::jsonb
  ),
  (
    'COUPON-003', 
    'CHAIRS15', 
    '15% discount on all chairs', 
    'percentage', 
    15, 
    0, 
    200, 
    100, 
    NULL, 
    25, 
    '2024-01-01', 
    NULL, 
    TRUE, 
    '["Chairs"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample vendors
INSERT INTO vendors (
  id, name, category, email, phone, address, is_active
) VALUES
  (
    'V001', 
    'Premium Wood Co.', 
    'Wood', 
    'orders@premiumwood.com', 
    '123-456-7890', 
    '123 Wood Lane, Timber City', 
    TRUE
  ),
  (
    'V002', 
    'MetalWorks Inc.', 
    'Hardware', 
    'sales@metalworks.com', 
    '234-567-8901', 
    '456 Steel Ave, Metal Town', 
    TRUE
  ),
  (
    'V003', 
    'Luxury Fabrics Inc.', 
    'Upholstery', 
    'orders@luxuryfabrics.com', 
    '345-678-9012', 
    '789 Textile Blvd, Fabric City', 
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (
  id, customer_name, customer_phone, customer_email, cashier, payment_method,
  subtotal, total_tax, total, status, timestamp
) VALUES
  (
    'TXN-001',
    'John Smith',
    '+1-555-0123',
    'john.smith@email.com',
    'Admin User',
    'card',
    1299.98,
    104.00,
    1403.98,
    'completed',
    NOW() - INTERVAL '3 days'
  ),
  (
    'TXN-002',
    'Emily Johnson',
    '+1-555-4567',
    'emily.j@email.com',
    'Admin User',
    'cash',
    649.99,
    52.00,
    701.99,
    'completed',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert transaction items
INSERT INTO transaction_items (
  transaction_id, product_id, product_name, product_price, product_barcode,
  product_category, quantity
) VALUES
  ('TXN-001', 'PROD-001', 'Executive Dining Table', 899.99, 'TE01MZ', 'Tables', 1),
  ('TXN-001', 'PROD-002', 'Executive Office Chair', 399.99, 'CE01Q2', 'Chairs', 1),
  ('TXN-002', 'PROD-003', 'Rustic Farmhouse Table', 649.99, 'TF03U6', 'Tables', 1)
ON CONFLICT DO NOTHING;