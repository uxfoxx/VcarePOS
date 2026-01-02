import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchDeliveryChargesRequest,
  fetchDeliveryChargesSuccess,
  fetchDeliveryChargesFailure,
  createDeliveryChargeRequest,
  createDeliveryChargeSuccess,
  createDeliveryChargeFailure,
  updateDeliveryChargeRequest,
  updateDeliveryChargeSuccess,
  updateDeliveryChargeFailure,
  deleteDeliveryChargeRequest,
  deleteDeliveryChargeSuccess,
  deleteDeliveryChargeFailure,
} from './deliveryChargesSlice';
import { deliveryChargesApi } from '../../api/apiClient';

function* fetchDeliveryChargesSaga(action) {
  try {
    const { is_active } = action.payload || {};
    const data = yield call(deliveryChargesApi.getAll, is_active);
    yield put(fetchDeliveryChargesSuccess(data));
  } catch (error) {
    yield put(fetchDeliveryChargesFailure(error.message));
  }
}

function* createDeliveryChargeSaga(action) {
  try {
    const data = yield call(deliveryChargesApi.create, action.payload);
    yield put(createDeliveryChargeSuccess(data));
  } catch (error) {
    yield put(createDeliveryChargeFailure(error.message));
  }
}

function* updateDeliveryChargeSaga(action) {
  try {
    const { id, ...updateData } = action.payload;
    const data = yield call(deliveryChargesApi.update, id, updateData);
    yield put(updateDeliveryChargeSuccess(data));
  } catch (error) {
    yield put(updateDeliveryChargeFailure(error.message));
  }
}

function* deleteDeliveryChargeSaga(action) {
  try {
    yield call(deliveryChargesApi.delete, action.payload);
    yield put(deleteDeliveryChargeSuccess(action.payload));
  } catch (error) {
    yield put(deleteDeliveryChargeFailure(error.message));
  }
}

export default function* deliveryChargesSaga() {
  yield takeLatest(fetchDeliveryChargesRequest.type, fetchDeliveryChargesSaga);
  yield takeLatest(createDeliveryChargeRequest.type, createDeliveryChargeSaga);
  yield takeLatest(updateDeliveryChargeRequest.type, updateDeliveryChargeSaga);
  yield takeLatest(deleteDeliveryChargeRequest.type, deleteDeliveryChargeSaga);
}
