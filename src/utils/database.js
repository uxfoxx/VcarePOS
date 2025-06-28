// Database abstraction layer for easy MySQL migration
export class DatabaseAdapter {
  constructor(type = 'localStorage') {
    this.type = type;
    this.cache = new Map();
    this.indexes = new Map();
  }

  // Generic CRUD operations
  async create(table, data) {
    const id = data.id || this.generateId();
    const record = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    
    if (this.type === 'localStorage') {
      const records = this.getTable(table);
      records.push(record);
      this.setTable(table, records);
      this.updateIndexes(table, record);
    }
    
    return record;
  }

  async read(table, id = null) {
    if (this.type === 'localStorage') {
      const records = this.getTable(table);
      return id ? records.find(r => r.id === id) : records;
    }
  }

  async update(table, id, data) {
    if (this.type === 'localStorage') {
      const records = this.getTable(table);
      const index = records.findIndex(r => r.id === id);
      if (index !== -1) {
        records[index] = { ...records[index], ...data, updatedAt: new Date() };
        this.setTable(table, records);
        this.updateIndexes(table, records[index]);
        return records[index];
      }
    }
    return null;
  }

  async delete(table, id) {
    if (this.type === 'localStorage') {
      const records = this.getTable(table);
      const filtered = records.filter(r => r.id !== id);
      this.setTable(table, filtered);
      this.removeFromIndexes(table, id);
      return true;
    }
    return false;
  }

  // Batch operations for better performance
  async batchCreate(table, dataArray) {
    const records = dataArray.map(data => ({
      ...data,
      id: data.id || this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (this.type === 'localStorage') {
      const existing = this.getTable(table);
      const combined = [...existing, ...records];
      this.setTable(table, combined);
      records.forEach(record => this.updateIndexes(table, record));
    }

    return records;
  }

  async batchUpdate(table, updates) {
    if (this.type === 'localStorage') {
      const records = this.getTable(table);
      const updatedRecords = records.map(record => {
        const update = updates.find(u => u.id === record.id);
        return update ? { ...record, ...update.data, updatedAt: new Date() } : record;
      });
      this.setTable(table, updatedRecords);
      return updatedRecords;
    }
    return [];
  }

  // Query operations with indexing
  async query(table, conditions = {}) {
    const records = this.getTable(table);
    
    // Use indexes if available
    const indexKey = Object.keys(conditions)[0];
    if (indexKey && this.indexes.has(`${table}_${indexKey}`)) {
      const index = this.indexes.get(`${table}_${indexKey}`);
      const value = conditions[indexKey];
      const indexedIds = index.get(value) || [];
      return records.filter(r => indexedIds.includes(r.id));
    }

    // Fallback to full scan
    return records.filter(record => {
      return Object.entries(conditions).every(([key, value]) => {
        if (typeof value === 'object' && value.operator) {
          return this.applyOperator(record[key], value.operator, value.value);
        }
        return record[key] === value;
      });
    });
  }

  // Pagination
  async paginate(table, page = 1, limit = 10, conditions = {}) {
    const allRecords = await this.query(table, conditions);
    const offset = (page - 1) * limit;
    const records = allRecords.slice(offset, offset + limit);
    
    return {
      data: records,
      pagination: {
        page,
        limit,
        total: allRecords.length,
        pages: Math.ceil(allRecords.length / limit)
      }
    };
  }

  // Aggregation functions
  async aggregate(table, field, operation = 'sum', conditions = {}) {
    const records = await this.query(table, conditions);
    const values = records.map(r => r[field]).filter(v => typeof v === 'number');
    
    switch (operation) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return records.length;
      default:
        return 0;
    }
  }

  // Index management
  createIndex(table, field) {
    const indexKey = `${table}_${field}`;
    if (!this.indexes.has(indexKey)) {
      this.indexes.set(indexKey, new Map());
      
      // Build index from existing data
      const records = this.getTable(table);
      records.forEach(record => {
        this.updateIndexes(table, record, field);
      });
    }
  }

  updateIndexes(table, record, specificField = null) {
    const fields = specificField ? [specificField] : Object.keys(record);
    
    fields.forEach(field => {
      const indexKey = `${table}_${field}`;
      if (this.indexes.has(indexKey)) {
        const index = this.indexes.get(indexKey);
        const value = record[field];
        
        if (!index.has(value)) {
          index.set(value, []);
        }
        
        const ids = index.get(value);
        if (!ids.includes(record.id)) {
          ids.push(record.id);
        }
      }
    });
  }

  removeFromIndexes(table, recordId) {
    this.indexes.forEach((index, indexKey) => {
      if (indexKey.startsWith(`${table}_`)) {
        index.forEach((ids, value) => {
          const filteredIds = ids.filter(id => id !== recordId);
          if (filteredIds.length === 0) {
            index.delete(value);
          } else {
            index.set(value, filteredIds);
          }
        });
      }
    });
  }

  // Helper methods
  getTable(table) {
    if (this.cache.has(table)) {
      return this.cache.get(table);
    }
    
    const data = localStorage.getItem(`vcare_${table}`);
    const records = data ? JSON.parse(data) : [];
    this.cache.set(table, records);
    return records;
  }

  setTable(table, records) {
    localStorage.setItem(`vcare_${table}`, JSON.stringify(records));
    this.cache.set(table, records);
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  applyOperator(value, operator, compareValue) {
    switch (operator) {
      case 'gt': return value > compareValue;
      case 'gte': return value >= compareValue;
      case 'lt': return value < compareValue;
      case 'lte': return value <= compareValue;
      case 'ne': return value !== compareValue;
      case 'in': return Array.isArray(compareValue) && compareValue.includes(value);
      case 'like': return String(value).toLowerCase().includes(String(compareValue).toLowerCase());
      default: return value === compareValue;
    }
  }

  // MySQL migration helpers
  generateMySQLSchema() {
    const tables = ['products', 'rawMaterials', 'transactions', 'users', 'categories', 'coupons', 'taxes'];
    const schema = {};
    
    tables.forEach(table => {
      const records = this.getTable(table);
      if (records.length > 0) {
        schema[table] = this.inferMySQLSchema(records[0]);
      }
    });
    
    return schema;
  }

  inferMySQLSchema(record) {
    const schema = {};
    
    Object.entries(record).forEach(([key, value]) => {
      if (key === 'id') {
        schema[key] = 'VARCHAR(255) PRIMARY KEY';
      } else if (key === 'createdAt' || key === 'updatedAt') {
        schema[key] = 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
      } else if (typeof value === 'number') {
        schema[key] = Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)';
      } else if (typeof value === 'boolean') {
        schema[key] = 'BOOLEAN';
      } else if (typeof value === 'object') {
        schema[key] = 'JSON';
      } else {
        schema[key] = 'TEXT';
      }
    });
    
    return schema;
  }

  // Clear cache periodically to prevent memory leaks
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
export const db = new DatabaseAdapter();

// Initialize indexes for commonly queried fields
db.createIndex('products', 'category');
db.createIndex('products', 'name');
db.createIndex('transactions', 'timestamp');
db.createIndex('transactions', 'cashier');
db.createIndex('users', 'username');
db.createIndex('users', 'role');