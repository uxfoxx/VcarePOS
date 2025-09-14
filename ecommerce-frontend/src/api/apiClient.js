const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('ecommerce_token');
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    // Only set Content-Type: application/json if body is JSON and not FormData
    // Browser will set correct Content-Type for FormData automatically
    ...(options.body && !(options.body instanceof FormData) && {
      'Content-Type': 'application/json',
    }),
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type if it's FormData, as browser handles it with boundary
  if (options.body instanceof FormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Clear token if unauthorized
    localStorage.removeItem('ecommerce_token');
    throw new Error('Session expired. Please log in again.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Auth API
export const authApi = {
  register: async (userData) => {
    return makeRequest('/ecommerce/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (credentials) => {
    return makeRequest('/ecommerce/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  getCurrentCustomer: async () => {
    return makeRequest('/ecommerce/auth/me');
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    return makeRequest('/ecommerce/products');
  },
  
  getById: async (productId) => {
    return makeRequest(`/ecommerce/products/${productId}`);
  },
};

// Orders API
export const ordersApi = {
  create: async (orderData, receiptFile = null) => {
    if (receiptFile) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      
      // Append order data fields individually
      Object.keys(orderData).forEach(key => {
        if (typeof orderData[key] === 'object') {
          formData.append(key, JSON.stringify(orderData[key]));
        } else {
          formData.append(key, orderData[key]);
        }
      });
      
      return makeRequest('/ecommerce/orders', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Regular JSON request for cash on delivery
      return makeRequest('/ecommerce/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    }
  },
  
  getCustomerOrders: async (customerId) => {
    return makeRequest(`/ecommerce/users/${customerId}/orders`);
  },
  
  getById: async (orderId) => {
    return makeRequest(`/ecommerce/orders/${orderId}`);
  },
};