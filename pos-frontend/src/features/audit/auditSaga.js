import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchAudit,
  fetchAuditById,
  fetchAuditByUser,
  fetchAuditByModule,
  fetchAuditSucceeded,
  fetchAuditByIdSucceeded,
  fetchAuditByUserSucceeded,
  fetchAuditByModuleSucceeded,
  failed
} from "./auditSlice";
import { auditApi } from "../../api/apiClient";

function* fetchAuditSaga() {
  try {
    const data = yield call(auditApi.getAll);
    yield put(fetchAuditSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchAuditByIdSaga(action) {
  try {
    const data = yield call(auditApi.getById, action.payload.id);
    yield put(fetchAuditByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchAuditByUserSaga(action) {
  try {
    const data = yield call(auditApi.getByUser, action.payload.userId);
    yield put(fetchAuditByUserSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchAuditByModuleSaga(action) {
  try {
    const data = yield call(auditApi.getByModule, action.payload.module);
    yield put(fetchAuditByModuleSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* auditSaga() {
  yield takeLatest(fetchAudit.type, fetchAuditSaga);
  yield takeLatest(fetchAuditById.type, fetchAuditByIdSaga);
  yield takeLatest(fetchAuditByUser.type, fetchAuditByUserSaga);
  yield takeLatest(fetchAuditByModule.type, fetchAuditByModuleSaga);
}
