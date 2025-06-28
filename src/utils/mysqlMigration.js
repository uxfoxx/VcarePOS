// MySQL migration utilities
export class MySQLMigrationHelper {
  constructor() {
    this.tables = [
      'products',
      'product_variations',
      'raw_materials',
      'transactions',
      'transaction_items',
      'users',
      'categories',
      'coupons',
      'taxes',
      'audit_trail'
    ];
  }

  // Generate MySQL schema
  generateSchema() {
    return {
      // Products table
      products: `
        CREATE TABLE products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT,
          image TEXT,
          base_price DECIMAL(10,2),
          price DECIMAL(10,2),
          stock INT DEFAULT 0,
          barcode VARCHAR(100) UNIQUE,
          has_variations BOOLEAN DEFAULT FALSE,
          base_dimensions JSON,
          dimensions JSON,
          base_weight DECIMAL(8,2),
          weight DECIMAL(8,2),
          base_material VARCHAR(100),
          material VARCHAR(100),
          base_color VARCHAR(50),
          color VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_name (name),
          INDEX idx_barcode (barcode),
          INDEX idx_stock (stock)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Product variations table
      product_variations: `
        CREATE TABLE product_variations (
          id VARCHAR(255) PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          sku VARCHAR(100) UNIQUE NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          stock INT DEFAULT 0,
          dimensions JSON,
          weight DECIMAL(8,2),
          material VARCHAR(100),
          color VARCHAR(50),
          description TEXT,
          image TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id),
          INDEX idx_sku (sku),
          INDEX idx_stock (stock)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Raw materials table
      raw_materials: `
        CREATE TABLE raw_materials (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          stock_quantity DECIMAL(10,2) DEFAULT 0,
          unit_price DECIMAL(10,2) NOT NULL,
          supplier VARCHAR(255),
          minimum_stock DECIMAL(10,2) DEFAULT 0,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_name (name),
          INDEX idx_stock (stock_quantity),
          INDEX idx_supplier (supplier)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Product raw materials junction table
      product_raw_materials: `
        CREATE TABLE product_raw_materials (
          id VARCHAR(255) PRIMARY KEY,
          product_id VARCHAR(255),
          variation_id VARCHAR(255),
          raw_material_id VARCHAR(255) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
          FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id),
          INDEX idx_variation_id (variation_id),
          INDEX idx_raw_material_id (raw_material_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Transactions table
      transactions: `
        CREATE TABLE transactions (
          id VARCHAR(255) PRIMARY KEY,
          subtotal DECIMAL(10,2) NOT NULL,
          category_tax_total DECIMAL(10,2) DEFAULT 0,
          full_bill_tax_total DECIMAL(10,2) DEFAULT 0,
          total_tax DECIMAL(10,2) DEFAULT 0,
          discount DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          payment_method ENUM('cash', 'card', 'digital') NOT NULL,
          cashier VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255),
          customer_phone VARCHAR(50),
          customer_email VARCHAR(255),
          customer_address TEXT,
          applied_coupon VARCHAR(100),
          notes TEXT,
          status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'completed',
          applied_taxes JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_cashier (cashier),
          INDEX idx_customer_name (customer_name),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at),
          INDEX idx_payment_method (payment_method)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Transaction items table
      transaction_items: `
        CREATE TABLE transaction_items (
          id VARCHAR(255) PRIMARY KEY,
          transaction_id VARCHAR(255) NOT NULL,
          product_id VARCHAR(255) NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10,2) NOT NULL,
          quantity INT NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
          INDEX idx_transaction_id (transaction_id),
          INDEX idx_product_id (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Users table
      users: `
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role ENUM('admin', 'manager', 'cashier') NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          permissions JSON,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_role (role),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Categories table
      categories: `
        CREATE TABLE categories (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Coupons table
      coupons: `
        CREATE TABLE coupons (
          id VARCHAR(255) PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          discount_type ENUM('percentage', 'fixed') NOT NULL,
          discount_percent DECIMAL(5,2),
          discount_amount DECIMAL(10,2),
          minimum_amount DECIMAL(10,2) DEFAULT 0,
          max_discount DECIMAL(10,2),
          usage_limit INT,
          used_count INT DEFAULT 0,
          valid_from TIMESTAMP NOT NULL,
          valid_to TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          applicable_categories JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_code (code),
          INDEX idx_is_active (is_active),
          INDEX idx_valid_from (valid_from),
          INDEX idx_valid_to (valid_to)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Taxes table
      taxes: `
        CREATE TABLE taxes (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          rate DECIMAL(5,2) NOT NULL,
          tax_type ENUM('full_bill', 'category') NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          is_default BOOLEAN DEFAULT FALSE,
          applicable_categories JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_is_active (is_active),
          INDEX idx_is_default (is_default),
          INDEX idx_tax_type (tax_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,

      // Audit trail table
      audit_trail: `
        CREATE TABLE audit_trail (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          action ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
          module VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          details JSON,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_module (module),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    };
  }

  // Generate migration script
  generateMigrationScript(data) {
    const schema = this.generateSchema();
    let script = `-- VCare POS System MySQL Migration Script
-- Generated on: ${new Date().toISOString()}

SET FOREIGN_KEY_CHECKS = 0;

`;

    // Add table creation
    Object.entries(schema).forEach(([tableName, createStatement]) => {
      script += `-- Create ${tableName} table\n`;
      script += `DROP TABLE IF EXISTS ${tableName};\n`;
      script += createStatement + '\n\n';
    });

    script += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;

    // Add data insertion
    if (data) {
      script += this.generateInsertStatements(data);
    }

    return script;
  }

  // Generate insert statements
  generateInsertStatements(data) {
    let script = '-- Insert data\n\n';

    // Insert categories
    if (data.categories && data.categories.length > 0) {
      script += 'INSERT INTO categories (id, name, description, is_active, created_at) VALUES\n';
      const categoryValues = data.categories.map(cat => 
        `('${cat.id}', '${this.escapeString(cat.name)}', '${this.escapeString(cat.description || '')}', ${cat.isActive}, '${cat.createdAt}')`
      ).join(',\n');
      script += categoryValues + ';\n\n';
    }

    // Insert raw materials
    if (data.rawMaterials && data.rawMaterials.length > 0) {
      script += 'INSERT INTO raw_materials (id, name, category, unit, stock_quantity, unit_price, supplier, minimum_stock, description, created_at) VALUES\n';
      const materialValues = data.rawMaterials.map(material => 
        `('${material.id}', '${this.escapeString(material.name)}', '${material.category}', '${material.unit}', ${material.stockQuantity}, ${material.unitPrice}, '${this.escapeString(material.supplier || '')}', ${material.minimumStock}, '${this.escapeString(material.description || '')}', NOW())`
      ).join(',\n');
      script += materialValues + ';\n\n';
    }

    // Insert products and variations
    if (data.products && data.products.length > 0) {
      script += this.generateProductInserts(data.products);
    }

    return script;
  }

  generateProductInserts(products) {
    let script = '';
    const productValues = [];
    const variationValues = [];
    const rawMaterialValues = [];

    products.forEach(product => {
      // Main product
      productValues.push(
        `('${product.id}', '${this.escapeString(product.name)}', '${product.category}', '${this.escapeString(product.description || '')}', '${this.escapeString(product.image || '')}', ${product.basePrice || 'NULL'}, ${product.price || 'NULL'}, ${product.stock || 0}, '${product.barcode || ''}', ${product.hasVariations || false}, '${JSON.stringify(product.baseDimensions || {})}', '${JSON.stringify(product.dimensions || {})}', ${product.baseWeight || 'NULL'}, ${product.weight || 'NULL'}, '${product.baseMaterial || ''}', '${product.material || ''}', '${product.baseColor || ''}', '${product.color || ''}', NOW(), NOW())`
      );

      // Product variations
      if (product.hasVariations && product.variations) {
        product.variations.forEach(variation => {
          variationValues.push(
            `('${variation.id}', '${product.id}', '${this.escapeString(variation.name)}', '${variation.sku}', ${variation.price}, ${variation.stock}, '${JSON.stringify(variation.dimensions || {})}', ${variation.weight || 'NULL'}, '${variation.material || ''}', '${variation.color || ''}', '${this.escapeString(variation.description || '')}', '${this.escapeString(variation.image || '')}', NOW(), NOW())`
          );

          // Raw materials for variations
          if (variation.rawMaterials) {
            variation.rawMaterials.forEach(rm => {
              rawMaterialValues.push(
                `('${this.generateId()}', NULL, '${variation.id}', '${rm.rawMaterialId}', ${rm.quantity}, NOW())`
              );
            });
          }
        });
      } else {
        // Raw materials for regular products
        if (product.rawMaterials) {
          product.rawMaterials.forEach(rm => {
            rawMaterialValues.push(
              `('${this.generateId()}', '${product.id}', NULL, '${rm.rawMaterialId}', ${rm.quantity}, NOW())`
            );
          });
        }
      }
    });

    if (productValues.length > 0) {
      script += 'INSERT INTO products (id, name, category, description, image, base_price, price, stock, barcode, has_variations, base_dimensions, dimensions, base_weight, weight, base_material, material, base_color, color, created_at, updated_at) VALUES\n';
      script += productValues.join(',\n') + ';\n\n';
    }

    if (variationValues.length > 0) {
      script += 'INSERT INTO product_variations (id, product_id, name, sku, price, stock, dimensions, weight, material, color, description, image, created_at, updated_at) VALUES\n';
      script += variationValues.join(',\n') + ';\n\n';
    }

    if (rawMaterialValues.length > 0) {
      script += 'INSERT INTO product_raw_materials (id, product_id, variation_id, raw_material_id, quantity, created_at) VALUES\n';
      script += rawMaterialValues.join(',\n') + ';\n\n';
    }

    return script;
  }

  escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate connection configuration
  generateConnectionConfig() {
    return {
      host: 'localhost',
      port: 3306,
      database: 'vcare_pos',
      username: 'vcare_user',
      password: 'your_password_here',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      charset: 'utf8mb4'
    };
  }

  // Generate environment variables
  generateEnvVariables() {
    return `# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vcare_pos
DB_USER=vcare_user
DB_PASSWORD=your_password_here
DB_CONNECTION_LIMIT=10
DB_CHARSET=utf8mb4

# Redis Cache Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
`;
  }
}

export const mysqlMigration = new MySQLMigrationHelper();