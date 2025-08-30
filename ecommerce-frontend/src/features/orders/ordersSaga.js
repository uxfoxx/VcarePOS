import { takeLatest, call, put, select } from 'redux-saga/effects'
import { ordersApi } from '../../api/ecommerceApiClient'
import { clearCart } from '../cart/cartSlice'
import {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
} from './ordersSlice'

function* createOrderSaga(action) {
  try {
    const orderData = action.payload
    const response = yield call(ordersApi.create, orderData)
    
    yield put(createOrderSuccess(response))
    yield put(clearCart()) // Clear cart after successful order
  } catch (error) {
    yield put(createOrderFailure(error.message))
  }
}

function* fetchOrdersSaga(action) {
  try {
    const { customerId } = action.payload
    const orders = yield call(ordersApi.getCustomerOrders, customerId)
    yield put(fetchOrdersSuccess(orders))
  } catch (error) {
    yield put(fetchOrdersFailure(error.message))
  }
}

export default function* ordersSaga() {
  yield takeLatest(createOrderStart.type, createOrderSaga)
  yield takeLatest(fetchOrdersStart.type, fetchOrdersSaga)
}