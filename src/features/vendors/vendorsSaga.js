import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchVendors,
  fetchVendorById,
  addVendor,
  updateVendor,
  deleteVendor,
  fetchVendorsSucceeded,
  fetchVendorByIdSucceeded,
  addVendorSucceeded,
  updateVendorSucceeded,
  deleteVendorSucceeded,
  failed
} from "./vendorsSlice";
import { vendorsApi } from "../../api/apiClient";

function* fetchVendorsSaga() {
  try {
    const data = yield call(vendorsApi.getAll);
    yield put(fetchVendorsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchVendorByIdSaga(action) {
  try {
    const data = yield call(vendorsApi.getById, action.payload.id);
    yield put(fetchVendorByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addVendorSaga(action) {
  try {
    const data = yield call(vendorsApi.create, action.payload);
    yield put(addVendorSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateVendorSaga(action) {
  try {
    const data = yield call(vendorsApi.update, action.payload.id, action.payload);
    yield put(updateVendorSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteVendorSaga(action) {
  try {
    yield call(vendorsApi.delete, action.payload.id);
    yield put(deleteVendorSucceeded({ id: action.payload.id }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* vendorsSaga() {
  yield takeLatest(fetchVendors.type, fetchVendorsSaga);
  yield takeLatest(fetchVendorById.type, fetchVendorByIdSaga);
  yield takeLatest(addVendor.type, addVendorSaga);
  yield takeLatest(updateVendor.type, updateVendorSaga);
  yield takeLatest(deleteVendor.type, deleteVendorSaga);
}
