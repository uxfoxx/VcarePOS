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
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSql);
    console.log('Schema created successfully');
    
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