import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  receiveGoods,
  fetchPurchaseOrdersSucceeded,
  fetchPurchaseOrderByIdSucceeded,
  addPurchaseOrderSucceeded,
  updatePurchaseOrderSucceeded,
  deletePurchaseOrderSucceeded,
  updatePurchaseOrderStatusSucceeded,
  receiveGoodsSucceeded,
  failed
} from "./purchaseOrdersSlice";
import { purchaseOrdersApi } from "../../api/apiClient";

function* fetchPurchaseOrdersSaga() {
  try {
    const data = yield call(purchaseOrdersApi.getAll);
    yield put(fetchPurchaseOrdersSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchPurchaseOrderByIdSaga(action) {
  try {
    const data = yield call(purchaseOrdersApi.getById, action.payload.id);
    yield put(fetchPurchaseOrderByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addPurchaseOrderSaga(action) {
  try {
    const data = yield call(purchaseOrdersApi.create, action.payload);
    yield put(addPurchaseOrderSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updatePurchaseOrderSaga(action) {
  try {
    const data = yield call(purchaseOrdersApi.update, action.payload.id, action.payload);
    yield put(updatePurchaseOrderSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deletePurchaseOrderSaga(action) {
  try {
    yield call(purchaseOrdersApi.delete, action.payload.id);
    yield put(deletePurchaseOrderSucceeded({ id: action.payload.id }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updatePurchaseOrderStatusSaga(action) {
  try {
    const data = yield call(purchaseOrdersApi.updateStatus, action.payload.id, action.payload.status, action.payload.notes);
    yield put(updatePurchaseOrderStatusSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* receiveGoodsSaga(action) {
  try {
    const data = yield call(purchaseOrdersApi.receiveGoods, action.payload.id, action.payload.grnData);
    yield put(receiveGoodsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* purchaseOrdersSaga() {
  yield takeLatest(fetchPurchaseOrders.type, fetchPurchaseOrdersSaga);
  yield takeLatest(fetchPurchaseOrderById.type, fetchPurchaseOrderByIdSaga);
  yield takeLatest(addPurchaseOrder.type, addPurchaseOrderSaga);
  yield takeLatest(updatePurchaseOrder.type, updatePurchaseOrderSaga);
  yield takeLatest(deletePurchaseOrder.type, deletePurchaseOrderSaga);
  yield takeLatest(updatePurchaseOrderStatus.type, updatePurchaseOrderStatusSaga);
  yield takeLatest(receiveGoods.type, receiveGoodsSaga);
}
