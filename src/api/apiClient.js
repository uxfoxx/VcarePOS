/**
 * API client for communicating with the backend
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('vcare_token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  // Parse response
  const data = await response.json();
  
  // Handle error responses
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

// Auth API
export const authApi = {
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// Products API
export const productsApi = {
  getAll: async () => {
    return apiRequest('/products');
  },
  
  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },
  
  create: async (product) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },
  
  update: async (id, product) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStock: async (id, quantity, operation, selectedSize) => {
    return apiRequest(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, operation, selectedSize })
    });
  }
};

// Raw Materials API
export const rawMaterialsApi = {
  getAll: async () => {
    return apiRequest('/raw-materials');
  },
  
  getById: async (id) => {
    return apiRequest(`/raw-materials/${id}`);
  },
  
  create: async (material) => {
    return apiRequest('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(material)
    });
  },
  
  update: async (id, material) => {
    return apiRequest(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/raw-materials/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStock: async (id, quantity, operation) => {
    return apiRequest(`/raw-materials/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, operation })
    });
  }
};

// Transactions API
export const transactionsApi = {
  getAll: async () => {
    return apiRequest('/transactions');
  },
  
  getById: async (id) => {
    return apiRequest(`/transactions/${id}`);
  },
  
  create: async (transaction) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  },
  
  updateStatus: async (id, status) => {
    return apiRequest(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },
  
  processRefund: async (id, refundData) => {
    return apiRequest(`/transactions/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData)
    });
  }
};

// Coupons API
export const couponsApi = {
  getAll: async () => {
    return apiRequest('/coupons');
  },
  
  getById: async (id) => {
    return apiRequest(`/coupons/${id}`);
  },
  
  create: async (coupon) => {
    return apiRequest('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
  },
  
  update: async (id, coupon) => {
    return apiRequest(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/coupons/${id}`, {
      method: 'DELETE'
    });
  },
  
  validate: async (code, amount) => {
    return apiRequest(`/coupons/validate/${code}?amount=${amount}`);
  }
};

// Taxes API
export const taxesApi = {
  getAll: async () => {
    return apiRequest('/taxes');
  },
  
  getById: async (id) => {
    return apiRequest(`/taxes/${id}`);
  },
  
  create: async (tax) => {
    return apiRequest('/taxes', {
      method: 'POST',
      body: JSON.stringify(tax)
    });
  },
  
  update: async (id, tax) => {
    return apiRequest(`/taxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tax)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/taxes/${id}`, {
      method: 'DELETE'
    });
  }
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    return apiRequest('/categories');
  },
  
  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },
  
  create: async (category) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },
  
  update: async (id, category) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

// Users API
export const usersApi = {
  getAll: async () => {
    return apiRequest('/users');
  },
  
  getById: async (id) => {
    return apiRequest(`/users/${id}`);
  },
  
  create: async (user) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },
  
  update: async (id, user) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Audit API
export const auditApi = {
  getAll: async () => {
    return apiRequest('/audit');
  },
  
  getById: async (id) => {
    return apiRequest(`/audit/${id}`);
  },
  
  getByUser: async (userId) => {
    return apiRequest(`/audit/user/${userId}`);
  },
  
  getByModule: async (module) => {
    return apiRequest(`/audit/module/${module}`);
  }
};

// Purchase Orders API
export const purchaseOrdersApi = {
  getAll: async () => {
    return apiRequest('/purchase-orders');
  },
  
  getById: async (id) => {
    return apiRequest(`/purchase-orders/${id}`);
  },
  
  create: async (order) => {
    return apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },
  
  update: async (id, order) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStatus: async (id, status, notes) => {
    return apiRequest(`/purchase-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },
  
  receiveGoods: async (id, grnData) => {
    return apiRequest(`/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify(grnData)
    });
  }
};

// Vendors API
export const vendorsApi = {
  getAll: async () => {
    return apiRequest('/vendors');
  },
  
  getById: async (id) => {
    return apiRequest(`/vendors/${id}`);
  },
  
  create: async (vendor) => {
    return apiRequest('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendor)
    });
  },
  
  update: async (id, vendor) => {
    return apiRequest(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendor)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/vendors/${id}`, {
      method: 'DELETE'
    });
  }
};