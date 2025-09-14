import { takeLatest, call, put } from 'redux-saga/effects';
import {
  createOrder,
  fetchOrders,
  fetchOrderById,
  uploadReceipt,
  createOrderSuccess,
  fetchOrdersSuccess,
  fetchOrderByIdSuccess,
  uploadReceiptSuccess,
  ordersFailure,
  uploadReceiptFailure,
} from '../slices/ordersSlice';
import { clearCart } from '../slices/cartSlice';
import { ordersApi } from '../../api/apiClient';

function* createOrderSaga(action) {
  try {
    const order = yield call(ordersApi.create, action.payload);
    yield put(createOrderSuccess(order));
    
    // Clear cart after successful order
    yield put(clearCart());
  } catch (error) {
    yield put(ordersFailure(error.message || 'Failed to create order'));
  }
}

function* fetchOrdersSaga(action) {
  try {
    const orders = yield call(ordersApi.getCustomerOrders, action.payload.customerId);
    yield put(fetchOrdersSuccess(orders));
  } catch (error) {
    yield put(ordersFailure(error.message || 'Failed to fetch orders'));
  }
}

function* fetchOrderByIdSaga(action) {
  try {
    const order = yield call(ordersApi.getById, action.payload);
    yield put(fetchOrderByIdSuccess(order));
  } catch (error) {
    yield put(ordersFailure(error.message || 'Failed to fetch order details'));
  }
}

function* uploadReceiptSaga(action) {
  try {
    const response = yield call(ordersApi.uploadReceipt, action.payload.orderId, action.payload.file);
    yield put(uploadReceiptSuccess({
      orderId: action.payload.orderId,
      orderStatus: response.orderStatus
    }));
  } catch (error) {
    yield put(uploadReceiptFailure(error.message || 'Failed to upload receipt'));
  }
}

export default function* ordersSaga() {
  yield takeLatest(createOrder.type, createOrderSaga);
  yield takeLatest(fetchOrders.type, fetchOrdersSaga);
  yield takeLatest(fetchOrderById.type, fetchOrderByIdSaga);
  yield takeLatest(uploadReceipt.type, uploadReceiptSaga);
}