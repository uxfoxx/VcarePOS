import { call, put, takeLatest, select } from 'redux-saga/effects';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function* fetchDeliveryChargesSaga(action) {
  try {
    const { is_active } = action.payload || {};
    const url = is_active !== undefined
      ? `${API_BASE}/delivery-charges?is_active=${is_active}`
      : `${API_BASE}/delivery-charges`;

    const response = yield call(fetch, url);

    if (!response.ok) {
      throw new Error('Failed to fetch delivery charges');
    }

    const data = yield response.json();
    yield put(fetchDeliveryChargesSuccess(data));
  } catch (error) {
    yield put(fetchDeliveryChargesFailure(error.message));
  }
}

function* createDeliveryChargeSaga(action) {
  try {
    const token = yield select(state => state.auth.token);
    const response = yield call(fetch, `${API_BASE}/delivery-charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(action.payload),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      throw new Error(errorData.error || 'Failed to create delivery charge');
    }

    const data = yield response.json();
    yield put(createDeliveryChargeSuccess(data));
  } catch (error) {
    yield put(createDeliveryChargeFailure(error.message));
  }
}

function* updateDeliveryChargeSaga(action) {
  try {
    const { id, ...updateData } = action.payload;
    const token = yield select(state => state.auth.token);
    const response = yield call(fetch, `${API_BASE}/delivery-charges/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      throw new Error(errorData.error || 'Failed to update delivery charge');
    }

    const data = yield response.json();
    yield put(updateDeliveryChargeSuccess(data));
  } catch (error) {
    yield put(updateDeliveryChargeFailure(error.message));
  }
}

function* deleteDeliveryChargeSaga(action) {
  try {
    const token = yield select(state => state.auth.token);
    const response = yield call(fetch, `${API_BASE}/delivery-charges/${action.payload}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      throw new Error(errorData.error || 'Failed to delete delivery charge');
    }

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
