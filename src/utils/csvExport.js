// CSV Export Utility for all data types with filtering
import dayjs from 'dayjs';

// Convert data to CSV format
function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(header => `"${header.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      let value = '';
      
      if (header.key.includes('.')) {
        // Handle nested properties
        const keys = header.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item);
      } else {
        value = item[header.key];
      }
      
      // Format value based on type
      if (header.type === 'date' && value) {
        value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      } else if (header.type === 'currency' && typeof value === 'number') {
        value = value.toFixed(2);
      } else if (header.type === 'array' && Array.isArray(value)) {
        value = value.map(v => typeof v === 'object' ? v.name || v.id : v).join('; ');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        value = '';
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Product export headers
const PRODUCT_HEADERS = [
  { key: 'id', label: 'Product ID', type: 'text' },
  { key: 'name', label: 'Product Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'barcode', label: 'SKU/Barcode', type: 'text' },
  { key: 'price', label: 'Price', type: 'currency' },
  { key: 'stock', label: 'Stock', type: 'number' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'material', label: 'Material', type: 'text' },
  { key: 'color', label: 'Color', type: 'text' },
  { key: 'weight', label: 'Weight (kg)', type: 'number' },
  { key: 'dimensions.length', label: 'Length', type: 'number' },
  { key: 'dimensions.width', label: 'Width', type: 'number' },
  { key: 'dimensions.height', label: 'Height', type: 'number' },
  { key: 'dimensions.unit', label: 'Dimension Unit', type: 'text' },
  { key: 'hasVariations', label: 'Has Variations', type: 'boolean' },
  { key: 'isVariation', label: 'Is Variation', type: 'boolean' },
  { key: 'variationName', label: 'Variation Name', type: 'text' },
  { key: 'parentProductName', label: 'Parent Product', type: 'text' },
  { key: 'rawMaterials', label: 'Raw Materials', type: 'array' }
];

// Raw Material export headers
const RAW_MATERIAL_HEADERS = [
  { key: 'id', label: 'Material ID', type: 'text' },
  { key: 'name', label: 'Material Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'unit', label: 'Unit', type: 'text' },
  { key: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
  { key: 'minimumStock', label: 'Minimum Stock', type: 'number' },
  { key: 'unitPrice', label: 'Unit Price', type: 'currency' },
  { key: 'supplier', label: 'Supplier', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Transaction export headers
const TRANSACTION_HEADERS = [
  { key: 'id', label: 'Transaction ID', type: 'text' },
  { key: 'timestamp', label: 'Date & Time', type: 'date' },
  { key: 'customerName', label: 'Customer Name', type: 'text' },
  { key: 'customerPhone', label: 'Customer Phone', type: 'text' },
  { key: 'customerEmail', label: 'Customer Email', type: 'text' },
  { key: 'customerAddress', label: 'Customer Address', type: 'text' },
  { key: 'cashier', label: 'Cashier', type: 'text' },
  { key: 'salesperson', label: 'Sales Person', type: 'text' },
  { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
  { key: 'subtotal', label: 'Subtotal', type: 'currency' },
  { key: 'categoryTaxTotal', label: 'Category Tax', type: 'currency' },
  { key: 'fullBillTaxTotal', label: 'Full Bill Tax', type: 'currency' },
  { key: 'totalTax', label: 'Total Tax', type: 'currency' },
  { key: 'discount', label: 'Discount', type: 'currency' },
  { key: 'total', label: 'Total Amount', type: 'currency' },
  { key: 'appliedCoupon', label: 'Applied Coupon', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' },
  { key: 'itemCount', label: 'Number of Items', type: 'number' },
  { key: 'totalQuantity', label: 'Total Quantity', type: 'number' }
];

// Transaction Items export headers
const TRANSACTION_ITEMS_HEADERS = [
  { key: 'transactionId', label: 'Transaction ID', type: 'text' },
  { key: 'transactionDate', label: 'Transaction Date', type: 'date' },
  { key: 'customerName', label: 'Customer Name', type: 'text' },
  { key: 'productId', label: 'Product ID', type: 'text' },
  { key: 'productName', label: 'Product Name', type: 'text' },
  { key: 'productSKU', label: 'Product SKU', type: 'text' },
  { key: 'productCategory', label: 'Product Category', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'unitPrice', label: 'Unit Price', type: 'currency' },
  { key: 'totalPrice', label: 'Total Price', type: 'currency' },
  { key: 'cashier', label: 'Cashier', type: 'text' },
  { key: 'salesperson', label: 'Sales Person', type: 'text' }
];

// Coupon export headers
const COUPON_HEADERS = [
  { key: 'id', label: 'Coupon ID', type: 'text' },
  { key: 'code', label: 'Coupon Code', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'discountType', label: 'Discount Type', type: 'text' },
  { key: 'discountPercent', label: 'Discount Percentage', type: 'number' },
  { key: 'discountAmount', label: 'Discount Amount', type: 'currency' },
  { key: 'minimumAmount', label: 'Minimum Amount', type: 'currency' },
  { key: 'maxDiscount', label: 'Maximum Discount', type: 'currency' },
  { key: 'usageLimit', label: 'Usage Limit', type: 'number' },
  { key: 'usedCount', label: 'Used Count', type: 'number' },
  { key: 'validFrom', label: 'Valid From', type: 'date' },
  { key: 'validTo', label: 'Valid To', type: 'date' },
  { key: 'isActive', label: 'Is Active', type: 'boolean' },
  { key: 'applicableCategories', label: 'Applicable Categories', type: 'array' },
  { key: 'createdAt', label: 'Created At', type: 'date' }
];

// User export headers
const USER_HEADERS = [
  { key: 'id', label: 'User ID', type: 'text' },
  { key: 'username', label: 'Username', type: 'text' },
  { key: 'firstName', label: 'First Name', type: 'text' },
  { key: 'lastName', label: 'Last Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'role', label: 'Role', type: 'text' },
  { key: 'isActive', label: 'Is Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'lastLogin', label: 'Last Login', type: 'date' }
];

// Audit Trail export headers
const AUDIT_HEADERS = [
  { key: 'id', label: 'Audit ID', type: 'text' },
  { key: 'timestamp', label: 'Timestamp', type: 'date' },
  { key: 'userId', label: 'User ID', type: 'text' },
  { key: 'userName', label: 'User Name', type: 'text' },
  { key: 'action', label: 'Action', type: 'text' },
  { key: 'module', label: 'Module', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'ipAddress', label: 'IP Address', type: 'text' },
  { key: 'details', label: 'Details', type: 'object' }
];

// Export functions for each data type
export function exportProducts(products, filters = {}) {
  let filteredData = [...products];
  
  // Apply filters
  if (filters.category && filters.category !== 'all') {
    filteredData = filteredData.filter(p => p.category === filters.category);
  }
  
  if (filters.hasVariations !== undefined) {
    filteredData = filteredData.filter(p => p.hasVariations === filters.hasVariations);
  }
  
  if (filters.lowStock) {
    filteredData = filteredData.filter(p => p.stock <= 10);
  }
  
  if (filters.outOfStock) {
    filteredData = filteredData.filter(p => p.stock === 0);
  }
  
  if (filters.priceRange) {
    filteredData = filteredData.filter(p => 
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );
  }
  
  // Add calculated fields
  const enrichedData = filteredData.map(product => ({
    ...product,
    itemCount: product.items?.length || 0,
    totalQuantity: product.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }));
  
  const csv = convertToCSV(enrichedData, PRODUCT_HEADERS);
  const filename = `products-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportRawMaterials(rawMaterials, filters = {}) {
  let filteredData = [...rawMaterials];
  
  // Apply filters
  if (filters.category && filters.category !== 'all') {
    filteredData = filteredData.filter(m => m.category === filters.category);
  }
  
  if (filters.lowStock) {
    filteredData = filteredData.filter(m => m.stockQuantity <= m.minimumStock);
  }
  
  if (filters.outOfStock) {
    filteredData = filteredData.filter(m => m.stockQuantity === 0);
  }
  
  if (filters.supplier) {
    filteredData = filteredData.filter(m => 
      m.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())
    );
  }
  
  const csv = convertToCSV(filteredData, RAW_MATERIAL_HEADERS);
  const filename = `raw-materials-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportTransactions(transactions, filters = {}) {
  let filteredData = [...transactions];
  
  // Apply filters
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange;
    filteredData = filteredData.filter(t => {
      const transactionDate = dayjs(t.timestamp);
      return transactionDate.isAfter(startDate.startOf('day')) && 
             transactionDate.isBefore(endDate.endOf('day'));
    });
  }
  
  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    filteredData = filteredData.filter(t => t.paymentMethod === filters.paymentMethod);
  }
  
  if (filters.status && filters.status !== 'all') {
    filteredData = filteredData.filter(t => t.status === filters.status);
  }
  
  if (filters.cashier) {
    filteredData = filteredData.filter(t => 
      t.cashier?.toLowerCase().includes(filters.cashier.toLowerCase())
    );
  }
  
  if (filters.salesperson) {
    filteredData = filteredData.filter(t => 
      t.salesperson?.toLowerCase().includes(filters.salesperson.toLowerCase())
    );
  }
  
  if (filters.minAmount) {
    filteredData = filteredData.filter(t => t.total >= filters.minAmount);
  }
  
  if (filters.maxAmount) {
    filteredData = filteredData.filter(t => t.total <= filters.maxAmount);
  }
  
  // Add calculated fields
  const enrichedData = filteredData.map(transaction => ({
    ...transaction,
    itemCount: transaction.items?.length || 0,
    totalQuantity: transaction.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }));
  
  const csv = convertToCSV(enrichedData, TRANSACTION_HEADERS);
  const filename = `transactions-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportTransactionItems(transactions, filters = {}) {
  let filteredTransactions = [...transactions];
  
  // Apply transaction-level filters first
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange;
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = dayjs(t.timestamp);
      return transactionDate.isAfter(startDate.startOf('day')) && 
             transactionDate.isBefore(endDate.endOf('day'));
    });
  }
  
  // Flatten transaction items
  const items = [];
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      items.push({
        transactionId: transaction.id,
        transactionDate: transaction.timestamp,
        customerName: transaction.customerName || 'Walk-in Customer',
        productId: item.product.id,
        productName: item.product.name,
        productSKU: item.product.barcode,
        productCategory: item.product.category,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        cashier: transaction.cashier,
        salesperson: transaction.salesperson
      });
    });
  });
  
  let filteredItems = items;
  
  // Apply item-level filters
  if (filters.productCategory && filters.productCategory !== 'all') {
    filteredItems = filteredItems.filter(item => item.productCategory === filters.productCategory);
  }
  
  if (filters.productName) {
    filteredItems = filteredItems.filter(item => 
      item.productName.toLowerCase().includes(filters.productName.toLowerCase())
    );
  }
  
  const csv = convertToCSV(filteredItems, TRANSACTION_ITEMS_HEADERS);
  const filename = `transaction-items-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportCoupons(coupons, filters = {}) {
  let filteredData = [...coupons];
  
  // Apply filters
  if (filters.isActive !== undefined) {
    filteredData = filteredData.filter(c => c.isActive === filters.isActive);
  }
  
  if (filters.discountType && filters.discountType !== 'all') {
    filteredData = filteredData.filter(c => c.discountType === filters.discountType);
  }
  
  if (filters.expired) {
    const now = new Date();
    filteredData = filteredData.filter(c => c.validTo && new Date(c.validTo) < now);
  }
  
  if (filters.usedUp) {
    filteredData = filteredData.filter(c => 
      c.usageLimit && c.usedCount >= c.usageLimit
    );
  }
  
  const csv = convertToCSV(filteredData, COUPON_HEADERS);
  const filename = `coupons-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportUsers(users, filters = {}) {
  let filteredData = [...users];
  
  // Apply filters
  if (filters.role && filters.role !== 'all') {
    filteredData = filteredData.filter(u => u.role === filters.role);
  }
  
  if (filters.isActive !== undefined) {
    filteredData = filteredData.filter(u => u.isActive === filters.isActive);
  }
  
  if (filters.recentLogin) {
    const cutoffDate = dayjs().subtract(30, 'days');
    filteredData = filteredData.filter(u => 
      u.lastLogin && dayjs(u.lastLogin).isAfter(cutoffDate)
    );
  }
  
  const csv = convertToCSV(filteredData, USER_HEADERS);
  const filename = `users-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

export function exportAuditTrail(auditTrail, filters = {}) {
  let filteredData = [...auditTrail];
  
  // Apply filters
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange;
    filteredData = filteredData.filter(entry => {
      const entryDate = dayjs(entry.timestamp);
      return entryDate.isAfter(startDate.startOf('day')) && 
             entryDate.isBefore(endDate.endOf('day'));
    });
  }
  
  if (filters.action && filters.action !== 'all') {
    filteredData = filteredData.filter(entry => entry.action === filters.action);
  }
  
  if (filters.module && filters.module !== 'all') {
    filteredData = filteredData.filter(entry => entry.module === filters.module);
  }
  
  if (filters.userId) {
    filteredData = filteredData.filter(entry => entry.userId === filters.userId);
  }
  
  const csv = convertToCSV(filteredData, AUDIT_HEADERS);
  const filename = `audit-trail-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}

// Export all data as a comprehensive report
export function exportComprehensiveReport(data, filters = {}) {
  const { products, rawMaterials, transactions, coupons, users, auditTrail } = data;
  
  // Create a summary report
  const summaryData = [{
    reportDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    totalProducts: products.length,
    totalRawMaterials: rawMaterials.length,
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.isActive).length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    lowStockProducts: products.filter(p => p.stock <= 10).length,
    outOfStockProducts: products.filter(p => p.stock === 0).length,
    lowStockMaterials: rawMaterials.filter(m => m.stockQuantity <= m.minimumStock).length,
    outOfStockMaterials: rawMaterials.filter(m => m.stockQuantity === 0).length
  }];
  
  const summaryHeaders = [
    { key: 'reportDate', label: 'Report Date', type: 'text' },
    { key: 'totalProducts', label: 'Total Products', type: 'number' },
    { key: 'totalRawMaterials', label: 'Total Raw Materials', type: 'number' },
    { key: 'totalTransactions', label: 'Total Transactions', type: 'number' },
    { key: 'totalRevenue', label: 'Total Revenue', type: 'currency' },
    { key: 'totalCoupons', label: 'Total Coupons', type: 'number' },
    { key: 'activeCoupons', label: 'Active Coupons', type: 'number' },
    { key: 'totalUsers', label: 'Total Users', type: 'number' },
    { key: 'activeUsers', label: 'Active Users', type: 'number' },
    { key: 'lowStockProducts', label: 'Low Stock Products', type: 'number' },
    { key: 'outOfStockProducts', label: 'Out of Stock Products', type: 'number' },
    { key: 'lowStockMaterials', label: 'Low Stock Materials', type: 'number' },
    { key: 'outOfStockMaterials', label: 'Out of Stock Materials', type: 'number' }
  ];
  
  const csv = convertToCSV(summaryData, summaryHeaders);
  const filename = `comprehensive-report-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
  downloadCSV(csv, filename);
}