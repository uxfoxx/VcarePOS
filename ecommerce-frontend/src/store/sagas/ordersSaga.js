import { takeLatest, call, put } from 'redux-saga/effects';
import {
  createOrder,
  fetchOrders,
  fetchOrderById, // Keep fetchOrderById
  createOrderSuccess,
  fetchOrdersSuccess,
  fetchOrderByIdSuccess,
  ordersFailure,
} from '../slices/ordersSlice';
import { clearCart } from '../slices/cartSlice';
import { ordersApi } from '../../api/apiClient';

function* createOrderSaga(action) {
  try {
    // Extract receiptFile from payload to handle file upload
    const { receiptFile, ...orderData } = action.payload;
    
    // Call API with both order data and receipt file
    const order = yield call(ordersApi.create, orderData, receiptFile);
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

export default function* ordersSaga() {
  yield takeLatest(createOrder.type, createOrderSaga);
  yield takeLatest(fetchOrders.type, fetchOrdersSaga);
  yield takeLatest(fetchOrderById.type, fetchOrderByIdSaga);
}