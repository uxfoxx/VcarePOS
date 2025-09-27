import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customer: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
  // OTP-related state
  otpSent: false,
  otpVerified: false,
  otpLoading: false,
  otpError: null,
  otpEmail: null,
  resendTimer: 0,
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
    clearError: (state) => {
      state.error = null;
      state.otpError = null;
    },

    // New OTP actions
    sendOtpStart: (state, action) => {
      state.otpLoading = true;
      state.otpError = null;
      state.otpEmail = action.payload.email;
    },
    sendOtpSuccess: (state, action) => {
      console.log("action.payload", action.payload);
      state.otpLoading = false;
      state.otpSent = true;
      state.otpError = null;
      state.resendTimer = action.payload || 60;
    },
    sendOtpFailure: (state, action) => {
      // If action.payload is object { message, remainingTime }
      console.log("action.payload", action.payload);
      if (typeof action.payload === 'object') {
        state.otpError = action.payload.message;
        state.resendTimer = action.payload.remainingTime || 0;
      } else {
        state.otpError = action.payload;
      }
      state.otpLoading = false;
      state.otpSent = false;
    },
    verifyOtpStart: (state) => {
      state.otpLoading = true;
      state.otpError = null;
    },
    verifyOtpSuccess: (state) => {
      state.otpLoading = false;
      state.otpVerified = true;
      state.otpError = null;
    },
    verifyOtpFailure: (state, action) => {
      state.otpLoading = false;
      state.otpError = action.payload;
      state.otpVerified = false;
    },
    decrementResendTimer: (state) => {
      if (state.resendTimer > 0) {
        state.resendTimer -= 1;
      }
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.otpLoading = false;
      state.otpError = null;
      state.otpEmail = null;
      state.resendTimer = 0;
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
  sendOtpStart,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  decrementResendTimer,
  resetOtpState,
} = authSlice.actions;

export default authSlice.reducer;