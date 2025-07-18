import { takeLatest, call, put } from "redux-saga/effects";
import {
  login,
  logout,
  getCurrentUser,
  changePassword,
  loginSucceeded,
  logoutSucceeded,
  getCurrentUserSucceeded,
  changePasswordSucceeded,
  failed
} from "./authSlice";
import { authApi } from "../../api/apiClient";

function* loginSaga(action) {
  try {
    const data = yield call(authApi.login, action.payload.username, action.payload.password);
    yield put(loginSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* logoutSaga() {
  try {
    yield call(authApi.logout);
    yield put(logoutSucceeded());
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* getCurrentUserSaga() {
  try {
    const data = yield call(authApi.getCurrentUser);
    yield put(getCurrentUserSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* changePasswordSaga(action) {
  try {
    yield call(authApi.changePassword, action.payload.currentPassword, action.payload.newPassword);
    yield put(changePasswordSucceeded());
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* authSaga() {
  yield takeLatest(login.type, loginSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield takeLatest(getCurrentUser.type, getCurrentUserSaga);
  yield takeLatest(changePassword.type, changePasswordSaga);
}
