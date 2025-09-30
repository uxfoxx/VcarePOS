const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vcaresl.com/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('ecommerce_token');
};

// Helper function to make authenticated requests
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('ecommerce_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    // if (!response.ok) {
    //   throw new Error(data.message || 'Request failed');
    // }
    if (!response.ok) {
      // Throw the full response data plus status
      const err = new Error(data.message || 'Request failed');
      err.status = response.status;
      err.data = data; // <--- keep remainingTime

      console.log("API request failed", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        responseData: data,
        response,
        err
      });

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
    console.log('E-commerce API: Making request to /ecommerce/products');
    const result = await makeRequest('/ecommerce/products');
    console.log('E-commerce API: Received products response', {
      productCount: result.length,
      sampleProduct: result[0] ? {
        id: result[0].id,
        name: result[0].name,
        stock: result[0].stock,
        colorsCount: result[0].colors?.length || 0
      } : null
    });
    return result;
  },

  getById: async (productId) => {
    return makeRequest(`/ecommerce/products/${productId}`);
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