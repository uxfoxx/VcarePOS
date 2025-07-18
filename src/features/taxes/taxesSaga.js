import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchTaxes,
  addTax,
  updateTax,
  deleteTax,
  fetchTaxesSucceeded,
  addTaxSucceeded,
  updateTaxSucceeded,
  deleteTaxSucceeded,
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

export default function* taxesSaga() {
  yield takeLatest(fetchTaxes.type, fetchTaxesSaga);
  yield takeLatest(addTax.type, addTaxSaga);
  yield takeLatest(updateTax.type, updateTaxSaga);
  yield takeLatest(deleteTax.type, deleteTaxSaga);
}
