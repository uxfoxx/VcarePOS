import { takeLatest, call, put, delay, fork } from 'redux-saga/effects';
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
  sendOtpStart,
  verifyOtpStart,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpSuccess,
  verifyOtpFailure,
  decrementResendTimer,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
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

function* sendOtpSaga(action) {
  try {
    const response = yield call(authApi.sendOtp, action.payload.email);
    yield put(sendOtpSuccess(response.cooldown || 60));
  } catch (error) {
    console.log("asdasdasdasdasdasdasdasdasdasdasd eeorrr", { error: error.data, status: error.status, response: error });
    const remainingTime = error.data?.remainingTime || 60;
    const message = error.data?.message || error.message || 'Failed to send OTP';

    yield put(sendOtpFailure({
      message,
      remainingTime
    }));
  }
}

function* verifyOtpSaga(action) {
  try {
    yield call(authApi.verifyOtp, action.payload.email, action.payload.otp);
    yield put(verifyOtpSuccess());
  } catch (error) {
    yield put(verifyOtpFailure(error.message || 'Invalid or expired OTP'));
  }
}

function* resendTimerSaga() {
  while (true) {
    yield delay(1000);
    yield put(decrementResendTimer());
  }
}

function* forgotPasswordSaga(action) {
  try {
    yield call(authApi.forgotPassword, action.payload.email);
    yield put(forgotPasswordSuccess());
  } catch (error) {
    yield put(forgotPasswordFailure(error.message || 'Failed to send temporary password'));
  }
}

function* changePasswordSaga(action) {
  try {
    yield call(authApi.changePassword, action.payload.currentPassword, action.payload.newPassword);
    yield put(changePasswordSuccess());
  } catch (error) {
    yield put(changePasswordFailure(error.message || 'Failed to change password'));
  }
}

export default function* authSaga() {
  yield takeLatest(register.type, registerSaga);
  yield takeLatest(login.type, loginSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield takeLatest(getCurrentCustomer.type, getCurrentCustomerSaga);
  yield takeLatest(sendOtpStart.type, sendOtpSaga);
  yield takeLatest(verifyOtpStart.type, verifyOtpSaga);
  yield takeLatest(forgotPasswordStart.type, forgotPasswordSaga);
  yield takeLatest(changePasswordStart.type, changePasswordSaga);
  yield fork(resendTimerSaga); // Run the timer in the background
}