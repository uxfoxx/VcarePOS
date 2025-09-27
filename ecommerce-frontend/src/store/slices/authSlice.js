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
  // Forgot Password state
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  // Change Password state
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false,
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
      state.otpLoading = false;
      state.otpSent = true;
      state.otpError = null;
      state.resendTimer = action.payload || 60;
    },
    sendOtpFailure: (state, action) => {
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
    // Forgot Password Reducers
    forgotPasswordStart: (state) => {
      state.forgotPasswordLoading = true;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    forgotPasswordSuccess: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = true;
    },
    forgotPasswordFailure: (state, action) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = action.payload;
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    // Change Password Reducers
    changePasswordStart: (state) => {
      state.changePasswordLoading = true;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
    },
    changePasswordSuccess: (state) => {
      state.changePasswordLoading = false;
      state.changePasswordSuccess = true;
    },
    changePasswordFailure: (state, action) => {
      state.changePasswordLoading = false;
      state.changePasswordError = action.payload;
    },
    clearChangePasswordState: (state) => {
      state.changePasswordLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
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
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  clearForgotPasswordState,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  clearChangePasswordState,
} = authSlice.actions;

export default authSlice.reducer;