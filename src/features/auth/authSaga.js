import { takeLatest, call, put, delay, select, fork } from "redux-saga/effects";
import {
  login,
  logout,
  getCurrentUser,
  changePassword,
  loginSucceeded,
  logoutSucceeded,
  getCurrentUserSucceeded,
  changePasswordSucceeded,
  failed,
  sessionExpired
} from "./authSlice";
import { authApi } from "../../api/apiClient";

/**
 * Decode a JWT token to get its payload
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function decodeToken(token) {
  try {
    // JWT tokens are in format: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if a token is expired or will expire soon
 * @param {string} token - JWT token
 * @param {number} expirationBuffer - Buffer in seconds before actual expiration
 * @returns {boolean} - True if token is expired or will expire soon
 */
function isTokenExpired(token, expirationBuffer = 300) { // 5 minutes buffer by default
  if (!token) return true;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decodedToken.exp * 1000;
  const currentTime = Date.now();
  
  // Return true if token will expire within buffer time
  return currentTime > expirationTime - expirationBuffer * 1000;
}

function* loginSaga(action) {
  try {
    const data = yield call(authApi.login, action.payload.username, action.payload.password);
    
    // Store token with expiration information
    if (data.token) {
      localStorage.setItem('vcare_token', data.token);
      
      // Extract token expiration if possible
      const decodedToken = decodeToken(data.token);
      if (decodedToken && decodedToken.exp) {
        localStorage.setItem('vcare_token_exp', decodedToken.exp);
      }
    }
    
    yield put(loginSucceeded(data));
  } catch (error) {
    yield put(failed(error.message || 'Login failed. Please try again.'));
  }
}

function* logoutSaga() {
  try {
    yield call(authApi.logout);
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with logout even if API fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('vcare_token');
    localStorage.removeItem('vcare_token_exp');
    yield put(logoutSucceeded());
  }
}

function* getCurrentUserSaga() {
  try {
    // Check token expiration before making the API call
    const token = localStorage.getItem('vcare_token');
    if (!token || isTokenExpired(token)) {
      yield put(sessionExpired('Your session has expired. Please log in again.'));
      return;
    }
    
    const data = yield call(authApi.getCurrentUser);
    yield put(getCurrentUserSucceeded(data));
  } catch (error) {
    // Check if error is due to invalid token/unauthorized
    if (error.statusCode === 401) {
      localStorage.removeItem('vcare_token');
      localStorage.removeItem('vcare_token_exp');
      yield put(sessionExpired('Session expired. Please log in again.'));
    } else {
      yield put(failed(error.message || 'Failed to get current user.'));
    }
  }
}

function* changePasswordSaga(action) {
  try {
    yield call(authApi.changePassword, action.payload.currentPassword, action.payload.newPassword);
    yield put(changePasswordSucceeded());
  } catch (error) {
    yield put(failed(error.message || 'Failed to change password.'));
  }
}

/**
 * Monitor token expiration in the background
 */
function* tokenExpirationMonitor() {
  while (true) {
    // Check every minute
    yield delay(60000);
    
    const isAuthenticated = yield select(state => state.auth.isAuthenticated);
    if (!isAuthenticated) continue;
    
    const token = localStorage.getItem('vcare_token');
    if (token && isTokenExpired(token)) {
      yield put(sessionExpired('Your session has expired. Please log in again.'));
    }
  }
}

export default function* authSaga() {
  yield takeLatest(login.type, loginSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield takeLatest(getCurrentUser.type, getCurrentUserSaga);
  yield takeLatest(changePassword.type, changePasswordSaga);
  
  // Start token expiration monitor
  yield fork(tokenExpirationMonitor);
}
