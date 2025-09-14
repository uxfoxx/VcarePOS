import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customer: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: localStorage.getItem('ecommerce_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actions
    register: (state) => {
      state.loading = true;
      state.error = null;
    },
    login: (state) => {
      state.loading = true;
      state.error = null;
    },
    logout: (state) => {
      state.loading = true;
      state.error = null;
    },
    getCurrentCustomer: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Success actions
    registerSuccess: (state, action) => {
      state.loading = false;
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    getCurrentCustomerSuccess: (state, action) => {
      state.loading = false;
      state.customer = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    // Failure action
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      if (action.payload.includes('401') || action.payload.includes('unauthorized')) {
        state.customer = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  register,
  login,
  logout,
  getCurrentCustomer,
  registerSuccess,
  loginSuccess,
  logoutSuccess,
  getCurrentCustomerSuccess,
  authFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;