import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchEcommerceOrders,
  fetchEcommerceOrderById,
  updateEcommerceOrderStatus,
  fetchEcommerceOrdersSucceeded,
  fetchEcommerceOrderByIdSucceeded,
  updateEcommerceOrderStatusSucceeded,
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

export default function* ecommerceOrdersSaga() {
  yield takeLatest(fetchEcommerceOrders.type, fetchEcommerceOrdersSaga);
  yield takeLatest(fetchEcommerceOrderById.type, fetchEcommerceOrderByIdSaga);
  yield takeLatest(updateEcommerceOrderStatus.type, updateEcommerceOrderStatusSaga);
}