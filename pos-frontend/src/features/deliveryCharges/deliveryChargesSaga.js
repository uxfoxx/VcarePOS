import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchDeliverySettingsRequest,
  fetchDeliverySettingsSuccess,
  fetchDeliverySettingsFailure,
  updateFreeDeliveryRequest,
  updateFreeDeliverySuccess,
  updateFreeDeliveryFailure,
  updateInsideColomboRequest,
  updateInsideColomboSuccess,
  updateInsideColomboFailure,
  updateOutOfColomboRequest,
  updateOutOfColomboSuccess,
  updateOutOfColomboFailure,
  calculateDeliveryChargeRequest,
  calculateDeliveryChargeSuccess,
  calculateDeliveryChargeFailure,
} from './deliveryChargesSlice';
import { deliveryChargesApi } from '../../api/apiClient';

function* fetchDeliverySettingsSaga(action) {
  try {
    const { source } = action.payload || {};
    const data = yield call(deliveryChargesApi.getAllSettings, source);
    yield put(fetchDeliverySettingsSuccess(data));
  } catch (error) {
    yield put(fetchDeliverySettingsFailure(error.message));
  }
}

function* updateFreeDeliverySaga(action) {
  try {
    const data = yield call(deliveryChargesApi.updateFreeDelivery, action.payload);
    yield put(updateFreeDeliverySuccess(data));
  } catch (error) {
    yield put(updateFreeDeliveryFailure(error.message));
  }
}

function* updateInsideColomboSaga(action) {
  try {
    const data = yield call(deliveryChargesApi.updateInsideColombo, action.payload);
    yield put(updateInsideColomboSuccess(data));
  } catch (error) {
    yield put(updateInsideColomboFailure(error.message));
  }
}

function* updateOutOfColomboSaga(action) {
  try {
    const data = yield call(deliveryChargesApi.updateOutOfColombo, action.payload);
    yield put(updateOutOfColomboSuccess(data));
  } catch (error) {
    yield put(updateOutOfColomboFailure(error.message));
  }
}

function* calculateDeliveryChargeSaga(action) {
  try {
    const data = yield call(deliveryChargesApi.calculateCharge, action.payload);
    yield put(calculateDeliveryChargeSuccess(data));
  } catch (error) {
    yield put(calculateDeliveryChargeFailure(error.message));
  }
}

export default function* deliveryChargesSaga() {
  yield takeLatest(fetchDeliverySettingsRequest.type, fetchDeliverySettingsSaga);
  yield takeLatest(updateFreeDeliveryRequest.type, updateFreeDeliverySaga);
  yield takeLatest(updateInsideColomboRequest.type, updateInsideColomboSaga);
  yield takeLatest(updateOutOfColomboRequest.type, updateOutOfColomboSaga);
  yield takeLatest(calculateDeliveryChargeRequest.type, calculateDeliveryChargeSaga);
}
