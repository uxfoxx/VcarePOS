import { takeLatest, call, put } from "redux-saga/effects";
import { message as antdMessage } from "antd";
import {
  fetchTaxes,
  addTax,
  updateTax,
  deleteTax,
  bulkUpdateStatus,
  bulkDeleteTaxes,
  fetchTaxesSucceeded,
  addTaxSucceeded,
  updateTaxSucceeded,
  deleteTaxSucceeded,
  bulkUpdateStatusSucceeded,
  bulkDeleteTaxesSucceeded,
  failed
} from "./taxesSlice";
import { taxesApi } from "../../api/apiClient";

function* fetchTaxesSaga() {
  try {
    const data = yield call(taxesApi.getAll);
    yield put(fetchTaxesSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addTaxSaga(action) {
  try {
    const data = yield call(taxesApi.create, action.payload);
    yield put(addTaxSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateTaxSaga(action) {
  try {
    const data = yield call(taxesApi.update, action.payload.id, action.payload);
    yield put(updateTaxSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteTaxSaga(action) {
  try {
    yield call(taxesApi.delete, action.payload);
    yield put(deleteTaxSucceeded({ id: action.payload }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* bulkUpdateStatusSaga(action) {
  try {
    const { action: statusAction, taxIds } = action.payload;
    const data = yield call(taxesApi.bulkUpdateStatus, statusAction, taxIds);
    yield put(bulkUpdateStatusSucceeded(data));
    
    // Show success message
    const message = statusAction === 'enable' 
      ? `All taxes have been activated`
      : 'All taxes have been disabled';
    yield call([antdMessage, 'success'], message);
  } catch (error) {
    yield put(failed(error.message));
    yield call([antdMessage, 'error'], 'Failed to update tax settings. Please try again.');
  }
}

function* bulkDeleteTaxesSaga(action) {
  try {
    const { taxIds } = action.payload;
    const data = yield call(taxesApi.bulkDelete, taxIds);
    yield put(bulkDeleteTaxesSucceeded({ ...data, deletedIds: taxIds }));
    
    // Show success message
    yield call([antdMessage, 'success'], `${taxIds.length} taxes deleted successfully`);
  } catch (error) {
    yield put(failed(error.message));
    yield call([antdMessage, 'error'], 'Failed to delete taxes. Please try again.');
  }
}

export default function* taxesSaga() {
  yield takeLatest(fetchTaxes.type, fetchTaxesSaga);
  yield takeLatest(addTax.type, addTaxSaga);
  yield takeLatest(updateTax.type, updateTaxSaga);
  yield takeLatest(deleteTax.type, deleteTaxSaga);
  yield takeLatest(bulkUpdateStatus.type, bulkUpdateStatusSaga);
  yield takeLatest(bulkDeleteTaxes.type, bulkDeleteTaxesSaga);
}
