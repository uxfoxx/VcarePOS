// CSV Export Utility for all data types with filtering
import dayjs from 'dayjs';

// Convert data to CSV format
function convertToCSV(data, headers) {
  try {
    if (!data || data.length === 0) {
      return '';
    }

    // Create header row
    const headerRow = headers.map(header => `"${header.label}"`).join(',');
    
    // Create data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        let value = '';
        
        try {
          if (header.key.includes('.')) {
            // Handle nested properties safely
            const keys = header.key.split('.');
            value = keys.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, item);
          } else {
            value = item[header.key];
          }
          
          // Format value based on type
          if (header.type === 'date' && value) {
            value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
          } else if (header.type === 'currency' && typeof value === 'number') {
            value = value.toFixed(2);
          } else if (header.type === 'boolean') {
            value = value === true ? 'Yes' : value === false ? 'No' : '';
          } else if (header.type === 'array' && Array.isArray(value)) {
            value = value.map(v => typeof v === 'object' ? v.name || v.id : v).join('; ');
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          } else if (value === null || value === undefined) {
            value = '';
          }
          
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        } catch (error) {
          console.warn(`Error processing field ${header.key}:`, error);
          return '""';
        }
      }).join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
  } catch (error) {
    console.error('Error converting data to CSV:', error);
    throw new Error('Failed to convert data to CSV format');
  }
}

// Download CSV file
function downloadCSV(csvContent, filename) {
  try {
    if (!csvContent) {
      throw new Error('No CSV content to download');
    }

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
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      throw new Error('File download is not supported in this browser');
    }
  } catch (error) {
    console.error('Error downloading CSV file:', error);
    throw new Error(`Failed to download file: ${error.message}`);
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
  { key: 'hasVariations', label: 'Has Variations', type: 'boolean' },
  { key: 'isVariation', label: 'Is Variation', type: 'boolean' },
  { key: 'variationName', label: 'Variation Name', type: 'text' },
  { key: 'parentProductName', label: 'Parent Product', type: 'text' },
  { key: 'totalSizes', label: 'Total Sizes', type: 'number' },
  { key: 'totalColors', label: 'Total Colors', type: 'number' }
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

// Purchase Order export headers
const PURCHASE_ORDER_HEADERS = [
  { key: 'id', label: 'Purchase Order ID', type: 'text' },
  { key: 'vendorId', label: 'Vendor ID', type: 'text' },
  { key: 'vendorName', label: 'Vendor Name', type: 'text' },
  { key: 'vendorEmail', label: 'Vendor Email', type: 'text' },
  { key: 'vendorPhone', label: 'Vendor Phone', type: 'text' },
  { key: 'vendorAddress', label: 'Vendor Address', type: 'text' },
  { key: 'orderDate', label: 'Order Date', type: 'date' },
  { key: 'expectedDeliveryDate', label: 'Expected Delivery Date', type: 'date' },
  { key: 'shippingAddress', label: 'Shipping Address', type: 'text' },
  { key: 'paymentTerms', label: 'Payment Terms', type: 'text' },
  { key: 'shippingMethod', label: 'Shipping Method', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' },
  { key: 'total', label: 'Total Amount', type: 'currency' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'createdBy', label: 'Created By', type: 'text' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'updatedAt', label: 'Updated At', type: 'date' },
  { key: 'itemCount', label: 'Number of Items', type: 'number' },
  { key: 'timelineCount', label: 'Timeline Events', type: 'number' }
];

// Vendor export headers
const VENDOR_HEADERS = [
  { key: 'id', label: 'Vendor ID', type: 'text' },
  { key: 'name', label: 'Vendor Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'isActive', label: 'Is Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' }
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
export function exportPurchaseOrders(purchaseOrders, filters = {}) {
  try {
    let filteredData = [...purchaseOrders];
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter(po => po.status === filters.status);
    }
    
    if (filters.vendorName) {
      filteredData = filteredData.filter(po => 
        po.vendorName?.toLowerCase().includes(filters.vendorName.toLowerCase())
      );
    }
    
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filteredData = filteredData.filter(po => {
        const orderDate = dayjs(po.orderDate);
        return orderDate.isSameOrAfter(startDate.startOf('day')) && 
               orderDate.isSameOrBefore(endDate.endOf('day'));
      });
    }
    
    if (filters.minAmount) {
      filteredData = filteredData.filter(po => po.total >= filters.minAmount);
    }
    
    if (filters.maxAmount) {
      filteredData = filteredData.filter(po => po.total <= filters.maxAmount);
    }
    
    // Add calculated fields
    const enrichedData = filteredData.map(purchaseOrder => ({
      ...purchaseOrder,
      itemCount: purchaseOrder.items?.length || 0,
      timelineCount: purchaseOrder.timeline?.length || 0
    }));
    
    const csv = convertToCSV(enrichedData, PURCHASE_ORDER_HEADERS);
    const filename = `purchase-orders-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    downloadCSV(csv, filename);
  } catch (error) {
    console.error('Error exporting purchase orders:', error);
    throw new Error(`Failed to export purchase orders: ${error.message}`);
  }
}

export function exportVendors(vendors, filters = {}) {
  try {
    let filteredData = [...vendors];
    
    // Apply filters
    if (filters.category && filters.category !== 'all') {
      filteredData = filteredData.filter(v => v.category === filters.category);
    }
    
    if (filters.isActive !== undefined) {
      filteredData = filteredData.filter(v => v.isActive === filters.isActive);
    }
    
    if (filters.name) {
      filteredData = filteredData.filter(v => 
        v.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    const csv = convertToCSV(filteredData, VENDOR_HEADERS);
    const filename = `vendors-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    downloadCSV(csv, filename);
  } catch (error) {
    console.error('Error exporting vendors:', error);
    throw new Error(`Failed to export vendors: ${error.message}`);
  }
}

export function exportProducts(products, filters = {}) {
  try {
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
      totalSizes: product.colors?.reduce((sum, color) => sum + (color.sizes?.length || 0), 0) || 0,
      totalColors: product.colors?.length || 0
    }));
    
    const csv = convertToCSV(enrichedData, PRODUCT_HEADERS);
    const filename = `products-export-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    downloadCSV(csv, filename);
  } catch (error) {
    console.error('Error exporting products:', error);
    throw new Error(`Failed to export products: ${error.message}`);
  }
}

export function exportRawMaterials(rawMaterials, filters = {}) {
  try {
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
  } catch (error) {
    console.error('Error exporting raw materials:', error);
    throw new Error(`Failed to export raw materials: ${error.message}`);
  }
}

export function exportTransactions(transactions, filters = {}) {
  try {
    let filteredData = [...transactions];
    
    // Apply filters
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filteredData = filteredData.filter(t => {
        const transactionDate = dayjs(t.timestamp);
        return transactionDate.isSameOrAfter(startDate.startOf('day')) && 
               transactionDate.isSameOrBefore(endDate.endOf('day'));
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
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw new Error(`Failed to export transactions: ${error.message}`);
  }
}

export async function exportTransactionItems(transactions, filters = {}) {
  try {
    let filteredTransactions = [...transactions];
    
    // Apply transaction-level filters first
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = dayjs(t.timestamp);
        return transactionDate.isSameOrAfter(startDate.startOf('day')) && 
               transactionDate.isSameOrBefore(endDate.endOf('day'));
      });
    }
    
    // Check for large datasets and warn user
    const totalItems = filteredTransactions.reduce((sum, t) => sum + (t.items?.length || 0), 0);
    if (totalItems > 10000) {
      // Use a Promise-based approach instead of blocking window.confirm
      const { Modal } = await import('antd');
      return new Promise((resolve) => {
        Modal.confirm({
          title: 'Large Export Warning',
          content: `This export will process ${totalItems} items. This may slow down your browser. Continue?`,
          onOk: () => {
            resolve(true);
            // Continue with the export logic here
            processLargeExport();
          },
          onCancel: () => {
            resolve(false);
          }
        });
      });
    }
    
    // Flatten transaction items with chunking for large datasets
    const items = [];
    const chunkSize = 1000;
    
    for (let i = 0; i < filteredTransactions.length; i += chunkSize) {
      const chunk = filteredTransactions.slice(i, i + chunkSize);
      
      chunk.forEach(transaction => {
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            items.push({
              transactionId: transaction.id,
              transactionDate: transaction.timestamp,
              customerName: transaction.customerName || 'Walk-in Customer',
              productId: item.product?.id || '',
              productName: item.product?.name || '',
              productSKU: item.product?.barcode || '',
              productCategory: item.product?.category || '',
              quantity: item.quantity || 0,
              unitPrice: item.product?.price || 0,
              totalPrice: (item.product?.price || 0) * (item.quantity || 0),
              cashier: transaction.cashier || '',
              salesperson: transaction.salesperson || ''
            });
          });
        }
      });
    }
    
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
  } catch (error) {
    console.error('Error exporting transaction items:', error);
    throw new Error(`Failed to export transaction items: ${error.message}`);
  }
}

export function exportCoupons(coupons, filters = {}) {
  try {
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
  } catch (error) {
    console.error('Error exporting coupons:', error);
    throw new Error(`Failed to export coupons: ${error.message}`);
  }
}

export function exportUsers(users, filters = {}) {
  try {
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
  } catch (error) {
    console.error('Error exporting users:', error);
    throw new Error(`Failed to export users: ${error.message}`);
  }
}

export function exportAuditTrail(auditTrail, filters = {}) {
  try {
    let filteredData = [...auditTrail];
    
    // Apply filters
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filteredData = filteredData.filter(entry => {
        const entryDate = dayjs(entry.timestamp);
        return entryDate.isSameOrAfter(startDate.startOf('day')) && 
               entryDate.isSameOrBefore(endDate.endOf('day'));
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
  } catch (error) {
    console.error('Error exporting audit trail:', error);
    throw new Error(`Failed to export audit trail: ${error.message}`);
  }
}

// Export all data as a comprehensive report
export function exportComprehensiveReport(data, _filters = {}) {
  try {
    const { products = [], rawMaterials = [], transactions = [], coupons = [], users = [], purchaseOrders = [], vendors = [] } = data;
    
    // Create a summary report
    const summaryData = [{
      reportDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalProducts: products.length,
      totalRawMaterials: rawMaterials.length,
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + (t.total || 0), 0),
      totalPurchaseOrders: purchaseOrders.length,
      totalVendors: vendors.length,
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive).length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      lowStockProducts: products.filter(p => (p.stock || 0) <= 10).length,
      outOfStockProducts: products.filter(p => (p.stock || 0) === 0).length,
      lowStockMaterials: rawMaterials.filter(m => (m.stockQuantity || 0) <= (m.minimumStock || 0)).length,
      outOfStockMaterials: rawMaterials.filter(m => (m.stockQuantity || 0) === 0).length,
      pendingPurchaseOrders: purchaseOrders.filter(po => po.status === 'pending').length,
      completedPurchaseOrders: purchaseOrders.filter(po => po.status === 'completed').length
    }];
    
    const summaryHeaders = [
      { key: 'reportDate', label: 'Report Date', type: 'text' },
      { key: 'totalProducts', label: 'Total Products', type: 'number' },
      { key: 'totalRawMaterials', label: 'Total Raw Materials', type: 'number' },
      { key: 'totalTransactions', label: 'Total Transactions', type: 'number' },
      { key: 'totalRevenue', label: 'Total Revenue', type: 'currency' },
      { key: 'totalPurchaseOrders', label: 'Total Purchase Orders', type: 'number' },
      { key: 'totalVendors', label: 'Total Vendors', type: 'number' },
      { key: 'totalCoupons', label: 'Total Coupons', type: 'number' },
      { key: 'activeCoupons', label: 'Active Coupons', type: 'number' },
      { key: 'totalUsers', label: 'Total Users', type: 'number' },
      { key: 'activeUsers', label: 'Active Users', type: 'number' },
      { key: 'lowStockProducts', label: 'Low Stock Products', type: 'number' },
      { key: 'outOfStockProducts', label: 'Out of Stock Products', type: 'number' },
      { key: 'lowStockMaterials', label: 'Low Stock Materials', type: 'number' },
      { key: 'outOfStockMaterials', label: 'Out of Stock Materials', type: 'number' },
      { key: 'pendingPurchaseOrders', label: 'Pending Purchase Orders', type: 'number' },
      { key: 'completedPurchaseOrders', label: 'Completed Purchase Orders', type: 'number' }
    ];
    
    const csv = convertToCSV(summaryData, summaryHeaders);
    const filename = `comprehensive-report-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    downloadCSV(csv, filename);
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    throw new Error(`Failed to generate comprehensive report: ${error.message}`);
  }
}