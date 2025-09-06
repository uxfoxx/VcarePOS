import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchProducts,
  fetchProductById,
  addProduct,
  updateProduct,
  deleteProducts,
  updateProductStock,
  fetchProductsSucceeded,
  fetchProductByIdSucceeded,
  addProductSucceeded,
  updateProductSucceeded,
  deleteProductsSucceeded,
  updateProductStockSucceeded,
  failed
} from "./productsSlice";
import { productsApi } from "../../api/apiClient";

function* fetchProductsSaga() {
  try {
    const data = yield call(productsApi.getAll);
    yield put(fetchProductsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchProductByIdSaga(action) {
  try {
    const data = yield call(productsApi.getById, action.payload.id);
    yield put(fetchProductByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addProductSaga(action) {
  try {
    const data = yield call(productsApi.create, action.payload);
    yield put(addProductSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateProductSaga(action) {
  try {
    const data = yield call(productsApi.update, action.payload.id, action.payload);
    yield put(updateProductSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteProductsSaga(action) {
  try {
    yield call(productsApi.delete, action.payload.productId);
    yield put(deleteProductsSucceeded({ productId: action.payload.productId }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateProductStockSaga(action) {
  try {
    const data = yield call(
      productsApi.updateStock, 
      action.payload.id, 
      action.payload.quantity, 
      action.payload.operation, 
      action.payload.selectedSize,
      action.payload.selectedColorId
    );
    yield put(updateProductStockSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* productsSaga() {
  yield takeLatest(fetchProducts.type, fetchProductsSaga);
  yield takeLatest(fetchProductById.type, fetchProductByIdSaga);
  yield takeLatest(addProduct.type, addProductSaga);
  yield takeLatest(updateProduct.type, updateProductSaga);
  yield takeLatest(deleteProducts.type, deleteProductsSaga);
  yield takeLatest(updateProductStock.type, updateProductStockSaga);
}
