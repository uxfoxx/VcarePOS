import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchProducts,
  fetchProductById,
  fetchProductsSuccess,
  fetchProductByIdSuccess,
  productsFailure,
} from '../slices/productsSlice';
import { productsApi } from '../../api/apiClient';

function* fetchProductsSaga() {
  try {
    const products = yield call(productsApi.getAll);
    yield put(fetchProductsSuccess(products));
  } catch (error) {
    yield put(productsFailure(error.message || 'Failed to fetch products'));
  }
}

function* fetchProductByIdSaga(action) {
  try {
    const product = yield call(productsApi.getById, action.payload);
    yield put(fetchProductByIdSuccess(product));
  } catch (error) {
    yield put(productsFailure(error.message || 'Failed to fetch product details'));
  }
}

export default function* productsSaga() {
  yield takeLatest(fetchProducts.type, fetchProductsSaga);
  yield takeLatest(fetchProductById.type, fetchProductByIdSaga);
}