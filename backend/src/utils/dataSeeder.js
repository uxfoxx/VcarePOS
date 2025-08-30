const { pool } = require('./db');
const { hashPassword } = require('./auth');
const fs = require('fs');
const path = require('path');

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');
    // Remove schema.sql logic and assume migrations have already created tables
    
    // Check if users table is empty
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(usersResult.rows[0].count) === 0) {
      console.log('Seeding users...');
      
      // Create admin user
      const adminPassword = await hashPassword('admin123');
      await client.query(`
        INSERT INTO users (
          id, username, password, email, first_name, last_name, role, is_active, permissions
        ) VALUES (
          'USER-001',
          'admin',
          $1,
          'admin@vcarefurniture.com',
          'Sarah',
          'Wilson',
          'admin',
          TRUE,
          '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":true},"transactions":{"view":true,"edit":true,"delete":true},"reports":{"view":true,"edit":true,"delete":true},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":true},"purchase-orders":{"view":true,"edit":true,"delete":true},"settings":{"view":true,"edit":true,"delete":true},"user-management":{"view":true,"edit":true,"delete":true},"audit-trail":{"view":true,"edit":true,"delete":true}}'
        )
      `, [adminPassword]);
      
      // Create cashier user
      const cashierPassword = await hashPassword('cashier123');
      await client.query(`
        INSERT INTO users (
          id, username, password, email, first_name, last_name, role, is_active, permissions
        ) VALUES (
          'USER-002',
          'cashier1',
          $1,
          'john.doe@vcarefurniture.com',
          'John',
          'Doe',
          'cashier',
          TRUE,
          '{"pos":{"view":true,"edit":true,"delete":false},"products":{"view":true,"edit":false,"delete":false},"raw-materials":{"view":false,"edit":false,"delete":false},"transactions":{"view":true,"edit":false,"delete":false},"reports":{"view":false,"edit":false,"delete":false},"coupons":{"view":true,"edit":false,"delete":false},"tax":{"view":false,"edit":false,"delete":false},"purchase-orders":{"view":false,"edit":false,"delete":false},"settings":{"view":false,"edit":false,"delete":false},"user-management":{"view":false,"edit":false,"delete":false},"audit-trail":{"view":false,"edit":false,"delete":false}}'
        )
      `, [cashierPassword]);
      
      // Create manager user
      const managerPassword = await hashPassword('manager123');
      await client.query(`
        INSERT INTO users (
          id, username, password, email, first_name, last_name, role, is_active, permissions
        ) VALUES (
          'USER-003',
          'manager1',
          $1,
          'jane.smith@vcarefurniture.com',
          'Jane',
          'Smith',
          'manager',
          TRUE,
          '{"pos":{"view":true,"edit":true,"delete":true},"products":{"view":true,"edit":true,"delete":true},"raw-materials":{"view":true,"edit":true,"delete":false},"transactions":{"view":true,"edit":true,"delete":false},"reports":{"view":true,"edit":false,"delete":false},"coupons":{"view":true,"edit":true,"delete":true},"tax":{"view":true,"edit":true,"delete":false},"purchase-orders":{"view":true,"edit":true,"delete":false},"settings":{"view":true,"edit":false,"delete":false},"user-management":{"view":true,"edit":false,"delete":false},"audit-trail":{"view":true,"edit":false,"delete":false}}'
        )
      `, [managerPassword]);
      
      console.log('Users seeded successfully');
    }
    
    // Check if categories table is empty
    const categoriesResult = await client.query('SELECT COUNT(*) FROM categories');
    
    if (parseInt(categoriesResult.rows[0].count) === 0) {
      console.log('Seeding categories...');
      
      // Insert categories
      await client.query(`
        INSERT INTO categories (id, name, description, is_active) VALUES
        ('CAT-001', 'Tables', 'All types of tables including dining, coffee, and office tables', TRUE),
        ('CAT-002', 'Chairs', 'Seating furniture including office chairs, dining chairs, and accent chairs', TRUE),
        ('CAT-003', 'Storage', 'Storage solutions including cabinets, shelves, and wardrobes', TRUE),
        ('CAT-004', 'Sofas & Seating', 'Comfortable seating including sofas, loveseats, and recliners', TRUE),
        ('CAT-005', 'Bedroom', 'Bedroom furniture including beds, nightstands, and dressers', TRUE),
        ('CAT-006', 'Office Furniture', 'Professional office furniture and accessories', FALSE)
      `);
      
      console.log('Categories seeded successfully');
    }
    
    // Check if products table is empty
    const productsResult = await client.query('SELECT COUNT(*) FROM products');
    
    if (parseInt(productsResult.rows[0].count) === 0) {
      console.log('Seeding products...');
      
      // Insert sample products with colors and sizes
      
      // Product 1: Executive Dining Table (with colors and sizes)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-001',
        'Executive Dining Table',
        'Premium oak dining table with elegant design perfect for formal dining rooms',
        'Tables',
        899.99,
        0, // Will be calculated from sizes
        'EDT001',
        'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Natural Oak',
        'Oak Wood',
        true,
        false
      ]);
      
      // Add colors for Executive Dining Table
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-001-1', 'PROD-001', 'Natural Oak', '#D2B48C', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400'),
        ('COLOR-001-2', 'PROD-001', 'Dark Walnut', '#654321', 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Natural Oak color
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-001-1-1', 'COLOR-001-1', 'Small', 5, 40.0, '{"length": 150, "width": 80, "height": 75, "unit": "cm"}'),
        ('SIZE-001-1-2', 'COLOR-001-1', 'Medium', 3, 50.0, '{"length": 180, "width": 90, "height": 75, "unit": "cm"}'),
        ('SIZE-001-1-3', 'COLOR-001-1', 'Large', 2, 60.0, '{"length": 200, "width": 100, "height": 75, "unit": "cm"}')
      `);
      
      // Add sizes for Dark Walnut color
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-001-2-1', 'COLOR-001-2', 'Small', 3, 40.0, '{"length": 150, "width": 80, "height": 75, "unit": "cm"}'),
        ('SIZE-001-2-2', 'COLOR-001-2', 'Medium', 2, 50.0, '{"length": 180, "width": 90, "height": 75, "unit": "cm"}'),
        ('SIZE-001-2-3', 'COLOR-001-2', 'Large', 1, 60.0, '{"length": 200, "width": 100, "height": 75, "unit": "cm"}')
      `);
      
      // Product 2: Executive Office Chair (with colors and sizes)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-002',
        'Executive Office Chair',
        'Ergonomic executive chair with premium leather upholstery and adjustable features',
        'Chairs',
        399.99,
        0, // Will be calculated from sizes
        'EOC002',
        'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Black',
        'Leather',
        true,
        false
      ]);
      
      // Add colors for Executive Office Chair
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-002-1', 'PROD-002', 'Black', '#000000', 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'),
        ('COLOR-002-2', 'PROD-002', 'Brown', '#8B4513', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Black color
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-002-1-1', 'COLOR-002-1', 'Standard', 8, 18.5, '{"length": 65, "width": 65, "height": 120, "unit": "cm"}'),
        ('SIZE-002-1-2', 'COLOR-002-1', 'Large', 5, 20.0, '{"length": 70, "width": 70, "height": 125, "unit": "cm"}')
      `);
      
      // Add sizes for Brown color
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-002-2-1', 'COLOR-002-2', 'Standard', 4, 18.5, '{"length": 65, "width": 65, "height": 120, "unit": "cm"}'),
        ('SIZE-002-2-2', 'COLOR-002-2', 'Large', 3, 20.0, '{"length": 70, "width": 70, "height": 125, "unit": "cm"}')
      `);
      
      // Product 3: Modern Coffee Table (PRE-ORDER ENABLED - OUT OF STOCK)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-003',
        'Modern Coffee Table',
        'Sleek modern coffee table with storage compartment - Coming Soon! Available for Pre-order',
        'Tables',
        349.99,
        0, // Out of stock but pre-order enabled
        'MCT003',
        'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Dark Walnut',
        'Walnut & Metal',
        false,
        true // PRE-ORDER ENABLED
      ]);
      
      // Add colors for Modern Coffee Table (pre-order product)
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-003-1', 'PROD-003', 'Dark Walnut', '#654321', 'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=400'),
        ('COLOR-003-2', 'PROD-003', 'Light Oak', '#D2B48C', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Dark Walnut color (all out of stock for pre-order testing)
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-003-1-1', 'COLOR-003-1', 'Standard', 0, 25.0, '{"length": 120, "width": 60, "height": 45, "unit": "cm"}'),
        ('SIZE-003-1-2', 'COLOR-003-1', 'Large', 0, 30.0, '{"length": 140, "width": 70, "height": 45, "unit": "cm"}')
      `);
      
      // Add sizes for Light Oak color (all out of stock for pre-order testing)
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-003-2-1', 'COLOR-003-2', 'Standard', 0, 25.0, '{"length": 120, "width": 60, "height": 45, "unit": "cm"}'),
        ('SIZE-003-2-2', 'COLOR-003-2', 'Large', 0, 30.0, '{"length": 140, "width": 70, "height": 45, "unit": "cm"}')
      `);
      
      // Product 4: Bookshelf (regular product with stock)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-004',
        'Wooden Bookshelf',
        'Spacious bookshelf with adjustable shelves for your home library',
        'Storage',
        299.99,
        0, // Will be calculated from sizes
        'WBS004',
        'https://images.pexels.com/photos/696407/pexels-photo-696407.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Natural Oak',
        'Oak Wood',
        false,
        false
      ]);
      
      // Add colors for Bookshelf
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-004-1', 'PROD-004', 'Natural Oak', '#D2B48C', 'https://images.pexels.com/photos/696407/pexels-photo-696407.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Bookshelf
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-004-1-1', 'COLOR-004-1', 'Small', 5, 30.0, '{"length": 60, "width": 30, "height": 150, "unit": "cm"}'),
        ('SIZE-004-1-2', 'COLOR-004-1', 'Medium', 3, 40.0, '{"length": 80, "width": 30, "height": 180, "unit": "cm"}'),
        ('SIZE-004-1-3', 'COLOR-004-1', 'Large', 2, 50.0, '{"length": 100, "width": 30, "height": 200, "unit": "cm"}')
      `);
      
      // Product 5: Premium Sofa (PRE-ORDER ENABLED - OUT OF STOCK)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-005',
        'Premium Leather Sofa',
        'Luxurious leather sofa with premium comfort - Coming Soon! Available for Pre-order',
        'Sofas & Seating',
        1299.99,
        0, // Out of stock but pre-order enabled
        'PLS005',
        'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Brown',
        'Leather & Hardwood',
        false,
        true // PRE-ORDER ENABLED
      ]);
      
      // Product 6: Simple Dining Chair (regular product with stock)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-006',
        'Simple Dining Chair',
        'Comfortable dining chair with modern design',
        'Chairs',
        149.99,
        0, // Will be calculated from sizes
        'SDC006',
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Beige',
        'Oak Wood & Fabric',
        false,
        false
      ]);
      
      // Add colors for Simple Dining Chair
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-006-1', 'PROD-006', 'Beige', '#F5F5DC', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Simple Dining Chair
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-006-1-1', 'COLOR-006-1', 'Standard', 12, 8.5, '{"length": 45, "width": 45, "height": 85, "unit": "cm"}')
      `);
      
      // Product 7: Test Pre-order Table (ZERO STOCK + PRE-ORDER for testing)
      await client.query(`
        INSERT INTO products (
          id, name, description, category, price, stock, barcode, image, 
          color, material, has_addons, allow_preorder
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'PROD-007',
        'Designer Glass Table',
        'Elegant glass dining table with chrome legs - Pre-order now for next month delivery!',
        'Tables',
        799.99,
        0, // Out of stock but pre-order enabled
        'DGT007',
        'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
        'Clear',
        'Glass & Chrome',
        false,
        true // PRE-ORDER ENABLED
      ]);
      
      // Add colors for Designer Glass Table (pre-order product)
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-007-1', 'PROD-007', 'Clear', '#FFFFFF', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Designer Glass Table (all zero stock for pre-order testing)
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-007-1-1', 'COLOR-007-1', 'Standard', 0, 35.0, '{"length": 160, "width": 90, "height": 75, "unit": "cm"}'),
        ('SIZE-007-1-2', 'COLOR-007-1', 'Large', 0, 45.0, '{"length": 200, "width": 100, "height": 75, "unit": "cm"}')
      `);
      
      // Add colors for Premium Sofa (pre-order product)
      await client.query(`
        INSERT INTO product_colors (id, product_id, name, color_code, image) VALUES
        ('COLOR-005-1', 'PROD-005', 'Brown', '#8B4513', 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400'),
        ('COLOR-005-2', 'PROD-005', 'Black', '#000000', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400')
      `);
      
      // Add sizes for Premium Sofa (all out of stock for pre-order testing)
      await client.query(`
        INSERT INTO product_sizes (id, product_color_id, name, stock, weight, dimensions) VALUES
        ('SIZE-005-1-1', 'COLOR-005-1', '2-Seater', 0, 70.0, '{"length": 180, "width": 90, "height": 85, "unit": "cm"}'),
        ('SIZE-005-1-2', 'COLOR-005-1', '3-Seater', 0, 85.0, '{"length": 220, "width": 90, "height": 85, "unit": "cm"}'),
        ('SIZE-005-2-1', 'COLOR-005-2', '2-Seater', 0, 70.0, '{"length": 180, "width": 90, "height": 85, "unit": "cm"}'),
        ('SIZE-005-2-2', 'COLOR-005-2', '3-Seater', 0, 85.0, '{"length": 220, "width": 90, "height": 85, "unit": "cm"}')
      `);
      
      // Update total stock for all products (sum of all sizes)
      await client.query(`
        UPDATE products SET stock = (
          SELECT COALESCE(SUM(ps.stock), 0)
          FROM product_sizes ps
          JOIN product_colors pc ON ps.product_color_id = pc.id
          WHERE pc.product_id = products.id
        )
      `);
      
      console.log('Products seeded successfully');
    }
    
    // Import mock data from frontend if needed
    // This would involve reading the mock data files and inserting the data into the database
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { seedDatabase };