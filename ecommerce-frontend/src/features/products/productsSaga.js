import { takeLatest, call, put } from 'redux-saga/effects'
import { productsApi } from '../../api/ecommerceApiClient'
import {
  fetchProducts,
  fetchProductsSuccess,
  fetchProductsFailure,
} from './productsSlice'

function* fetchProductsSaga() {
  try {
    const products = yield call(productsApi.getAll)
    yield put(fetchProductsSuccess(products))
  } catch (error) {
    yield put(fetchProductsFailure(error.message))
  }
}

export default function* productsSaga() {
  yield takeLatest(fetchProducts.type, fetchProductsSaga)
}