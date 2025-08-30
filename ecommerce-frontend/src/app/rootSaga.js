import { all } from 'redux-saga/effects'
import productsSaga from '../features/products/productsSaga'
import cartSaga from '../features/cart/cartSaga'
import authSaga from '../features/auth/authSaga'
import categoriesSaga from '../features/categories/categoriesSaga'
import ordersSaga from '../features/orders/ordersSaga'

export default function* rootSaga() {
  yield all([
    productsSaga(),
    cartSaga(),
    authSaga(),
    categoriesSaga(),
    ordersSaga(),
  ])
}