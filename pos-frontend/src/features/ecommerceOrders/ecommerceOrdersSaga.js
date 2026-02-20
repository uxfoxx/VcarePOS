import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchEcommerceOrders,
  fetchEcommerceOrderById,
  updateEcommerceOrderStatus,
  updateEcommerceReceiptStatus,
  fetchReceiptBlob,
  fetchEcommerceOrdersSucceeded,
  fetchEcommerceOrderByIdSucceeded,
  updateEcommerceOrderStatusSucceeded,
  updateEcommerceReceiptStatusSucceeded,
  fetchReceiptBlobSucceeded,
  fetchReceiptBlobFailed,
  fetchNewOrders,
  fetchNewOrdersSucceeded,
  fetchNewOrdersFailed,
  markOrderNotified,
  markOrderNotifiedSucceeded,
  markOrderNotifiedFailed,
  failed
} from "./ecommerceOrdersSlice";
import { ecommerceOrdersApi } from "../../api/apiClient";

function* fetchEcommerceOrdersSaga() {
  try {
    const data = yield call(ecommerceOrdersApi.getAll);
    yield put(fetchEcommerceOrdersSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchEcommerceOrderByIdSaga(action) {
  try {
    const data = yield call(ecommerceOrdersApi.getById, action.payload.orderId);
    yield put(fetchEcommerceOrderByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateEcommerceOrderStatusSaga(action) {
  try {
    const data = yield call(ecommerceOrdersApi.updateStatus, action.payload.orderId, action.payload.status);
    yield put(updateEcommerceOrderStatusSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateEcommerceReceiptStatusSaga(action) {
  try {
    const data = yield call(ecommerceOrdersApi.updateReceiptStatus, action.payload.orderId, action.payload.status, action.payload.notes);
    yield put(updateEcommerceReceiptStatusSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchReceiptBlobSaga(action) {
  try {
    const { receiptId, filename } = action.payload;
    const blob = yield call(ecommerceOrdersApi.getReceiptBlob, filename);
    const blobUrl = URL.createObjectURL(blob);
    yield put(fetchReceiptBlobSucceeded({ receiptId, blobUrl }));
  } catch (error) {
    yield put(fetchReceiptBlobFailed({ receiptId: action.payload.receiptId, error: error.message }));
  }
}

function* fetchNewOrdersSaga() {
  try {
    const data = yield call(ecommerceOrdersApi.getNewOrders);
    yield put(fetchNewOrdersSucceeded(data));
  } catch (error) {
    yield put(fetchNewOrdersFailed(error.message));
  }
}

function* markOrderNotifiedSaga(action) {
  try {
    const { orderId } = action.payload;
    yield call(ecommerceOrdersApi.markOrderNotified, orderId);
    yield put(markOrderNotifiedSucceeded({ orderId }));
  } catch (error) {
    yield put(markOrderNotifiedFailed(error.message));
  }
}

export default function* ecommerceOrdersSaga() {
  yield takeLatest(fetchEcommerceOrders.type, fetchEcommerceOrdersSaga);
  yield takeLatest(fetchEcommerceOrderById.type, fetchEcommerceOrderByIdSaga);
  yield takeLatest(updateEcommerceOrderStatus.type, updateEcommerceOrderStatusSaga);
  yield takeLatest(updateEcommerceReceiptStatus.type, updateEcommerceReceiptStatusSaga);
  yield takeLatest(fetchReceiptBlob.type, fetchReceiptBlobSaga);
  yield takeLatest(fetchNewOrders.type, fetchNewOrdersSaga);
  yield takeLatest(markOrderNotified.type, markOrderNotifiedSaga);
}