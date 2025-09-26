import { takeLatest, call, put } from 'redux-saga/effects';
import {
  register,
  login,
  logout,
  getCurrentCustomer,
  registerSuccess,
  loginSuccess,
  logoutSuccess,
  getCurrentCustomerSuccess,
  authFailure,
} from '../slices/authSlice';
import { authApi } from '../../api/apiClient';

function* registerSaga(action) {
  try {
    const response = yield call(authApi.register, action.payload);

    // Store token in localStorage
    localStorage.setItem('ecommerce_token', response.token);

    yield put(registerSuccess(response));
  } catch (error) {
    yield put(authFailure(error.message || 'Registration failed'));
  }
}

function* loginSaga(action) {
  try {
    const response = yield call(authApi.login, action.payload);

    // Store token in localStorage
    localStorage.setItem('ecommerce_token', response.token);

    yield put(loginSuccess(response));
  } catch (error) {
    yield put(authFailure(error.message || 'Login failed'));
  }
}

function* logoutSaga() {
  try {
    // Clear token from localStorage
    localStorage.removeItem('ecommerce_token');

    yield put(logoutSuccess());
  } catch (error) {
    // Even if logout fails, clear local state
    console.log('Logout failed:', error);
    localStorage.removeItem('ecommerce_token');
    yield put(logoutSuccess());
  }
}

function* getCurrentCustomerSaga() {
  try {
    const response = yield call(authApi.getCurrentCustomer);
    yield put(getCurrentCustomerSuccess(response));
  } catch (error) {
    // If getting current customer fails, clear auth state
    localStorage.removeItem('ecommerce_token');
    yield put(authFailure(error.message || 'Session expired'));
  }
}

export default function* authSaga() {
  yield takeLatest(register.type, registerSaga);
  yield takeLatest(login.type, loginSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield takeLatest(getCurrentCustomer.type, getCurrentCustomerSaga);
}