const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 15000;

const getAuthToken = () => {
  return localStorage.getItem('ecommerce_token');
};

const fetchWithTimeout = async (url, options, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Server is taking too long to respond.');
    }
    throw error;
  }
};

const makeRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Don't auto-redirect if it's an auth endpoint (otherwise login errors cause a reload)
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('ecommerce_token');
        localStorage.removeItem('vcare_token');
        localStorage.removeItem('vcare_token_exp');
        localStorage.removeItem('loglevel');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
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

  sendOtp: async (email) => {
    return makeRequest('/ecommerce/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email, otp) => {
    return makeRequest('/ecommerce/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  getCurrentCustomer: async () => {
    return makeRequest('/ecommerce/auth/me');
  },

  forgotPassword: async (email) => {
    return makeRequest('/ecommerce/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return makeRequest('/ecommerce/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
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

  search: async (query) => {
    return makeRequest(`/ecommerce/products/search?q=${encodeURIComponent(query)}`);
  },
};

// Orders API
export const ordersApi = {
  create: async (orderData, receiptDetails = null) => {
    const payload = { ...orderData };
    if (receiptDetails) {
      payload.receiptDetails = receiptDetails;
    }

    return makeRequest('/ecommerce/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadTemporaryReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/ecommerce/receipts/temp-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('ecommerce_token');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getCustomerOrders: async (customerId) => {
    return makeRequest(`/ecommerce/users/${customerId}/orders`);
  },

  getById: async (orderId) => {
    return makeRequest(`/ecommerce/orders/${orderId}`);
  },
};

// Delivery Charges API
export const deliveryChargesApi = {
  getActive: async () => {
    return makeRequest('/delivery-charges?source=ecommerce');
  },
};