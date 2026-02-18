import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchUsers,
  fetchUsersSucceeded,
  addUser,
  addUserSucceeded,
  updateUser,
  updateUserSucceeded,
  deleteUser,
  deleteUserSucceeded,
  failed
} from "./usersSlice";
import { usersApi } from "../../api/apiClient";

function* fetchUsersSaga() {
  try {
    const data = yield call(usersApi.getAll);
    yield put(fetchUsersSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addUserSaga(action) {
  try {
    const data = yield call(usersApi.create, action.payload.userData);
    yield put(addUserSucceeded({ userData: data }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateUserSaga(action) {
  try {
    const data = yield call(usersApi.update, action.payload.id, action.payload.userData);
    yield put(updateUserSucceeded({ userData: data }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteUserSaga(action) {
  try {
    yield call(usersApi.delete, action.payload.userId);
    yield put(deleteUserSucceeded({ userId: action.payload.userId }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* usersSaga() {
  yield takeLatest(fetchUsers.type, fetchUsersSaga);
  yield takeLatest(addUser.type, addUserSaga);
  yield takeLatest(updateUser.type, updateUserSaga);
  yield takeLatest(deleteUser.type, deleteUserSaga);
}
