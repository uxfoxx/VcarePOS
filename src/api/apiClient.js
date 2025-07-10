/**
 * API client for communicating with the backend
 */

import { supabase } from '../utils/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('vcare_token');
  
  try {
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
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    
    // Fall back to Supabase direct access if API fails
    if (endpoint.startsWith('/products')) {
      return fallbackToSupabase('products', endpoint, options);
    } else if (endpoint.startsWith('/raw-materials')) {
      return fallbackToSupabase('raw_materials', endpoint, options);
    } else if (endpoint.startsWith('/transactions')) {
      return fallbackToSupabase('transactions', endpoint, options);
    } else if (endpoint.startsWith('/categories')) {
      return fallbackToSupabase('categories', endpoint, options);
    } else if (endpoint.startsWith('/coupons')) {
      return fallbackToSupabase('coupons', endpoint, options);
    } else if (endpoint.startsWith('/taxes')) {
      return fallbackToSupabase('taxes', endpoint, options);
    }
    
    throw error;
  }
}

// Fallback to direct Supabase access if API fails
async function fallbackToSupabase(table, endpoint, options) {
  console.log(`Falling back to direct Supabase access for ${table}`);
  
  if (options.method === 'GET' || !options.method) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  } else if (options.method === 'POST') {
    const body = JSON.parse(options.body);
    const { data, error } = await supabase.from(table).insert(body).select();
    if (error) throw error;
    return data[0];
  } else if (options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const body = JSON.parse(options.body);
    const { data, error } = await supabase.from(table).update(body).eq('id', id).select();
    if (error) throw error;
    return data[0];
  } else if (options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
  
  throw new Error('Unsupported method in fallback');
}

// Auth API
export const authApi = {
  login: async (username, password) => {
    try {
      // Try API first
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    } catch (error) {
      console.error('API login failed, trying Supabase:', error);
      
      // Fallback to Supabase auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });
      
      if (authError) throw authError;
      
      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .single();
      
      if (userError) throw userError;
      
      return {
        success: true,
        token: data.session.access_token,
        user: {
          id: userData.id,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          lastLogin: userData.last_login
        }
      };
    }
  },
  
  logout: async () => {
    try {
      // Try API first
      await apiRequest('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('API logout failed, trying Supabase:', error);
      
      // Fallback to Supabase auth
      await supabase.auth.signOut();
    }
    
    return { success: true };
  },
  
  getCurrentUser: async () => {
    try {
      // Try API first
      return await apiRequest('/auth/me');
    } catch (error) {
      console.error('API getCurrentUser failed, trying Supabase:', error);
      
      // Fallback to Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (userError) throw userError;
      
      return {
        id: userData.id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions,
        lastLogin: userData.last_login
      };
    }
  },
  
  changePassword: async (currentPassword, newPassword) => {
    try {
      // Try API first
      return await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    } catch (error) {
      console.error('API changePassword failed, trying Supabase:', error);
      
      // Fallback to Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      return { success: true, message: 'Password updated successfully' };
    }
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