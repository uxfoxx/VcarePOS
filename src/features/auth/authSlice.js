import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state) {
      state.loading = true;
      state.error = null;
    },
    logout(state) {
      state.loading = true;
      state.error = null;
    },
    getCurrentUser(state) {
      state.loading = true;
      state.error = null;
    },
    changePassword(state) {
      state.loading = true;
      state.error = null;
    },
    loginSucceeded(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutSucceeded(state) {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    getCurrentUserSucceeded(state, action) {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    changePasswordSucceeded(state) {
      state.loading = false;
      state.error = null;
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
});

export const {
  login,
  logout,
  getCurrentUser,
  changePassword,
  loginSucceeded,
  logoutSucceeded,
  getCurrentUserSucceeded,
  changePasswordSucceeded,
  failed,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
