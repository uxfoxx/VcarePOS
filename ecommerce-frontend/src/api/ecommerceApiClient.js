// E-commerce API client for public endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Products API
export const productsApi = {
  getAll: async () => {
    return apiRequest('/ecommerce/products')
  },
}

// Categories API
export const categoriesApi = {
  getAll: async () => {
    return apiRequest('/ecommerce/categories')
  },
}

// Taxes API
export const taxesApi = {
  getAll: async () => {
    return apiRequest('/ecommerce/taxes')
  },
}

// Delivery Zones API
export const deliveryApi = {
  getZones: async () => {
    return apiRequest('/ecommerce/delivery-zones')
  },
}

// Coupons API
export const couponsApi = {
  validate: async (code, amount) => {
    return apiRequest(`/ecommerce/coupons/validate/${code}?amount=${amount}`)
  },
}

// Customers API
export const customersApi = {
  register: async (customerData) => {
    return apiRequest('/ecommerce/customers/register', {
      method: 'POST',
      body: JSON.stringify(customerData)
    })
  },
  
  login: async (email, password) => {
    return apiRequest('/ecommerce/customers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },
}

// Orders API
export const ordersApi = {
  create: async (orderData) => {
    return apiRequest('/ecommerce/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  },
  
  getCustomerOrders: async (customerId) => {
    return apiRequest(`/ecommerce/orders/${customerId}`)
  },
}