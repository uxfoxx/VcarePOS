import { takeLatest, call, put, all } from "redux-saga/effects";
import { message as antdMessage } from "antd";
import {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransactionStatus,
  processRefund,
  fetchTransactionsSucceeded,
  fetchTransactionByIdSucceeded,
  createTransactionSucceeded,
  updateTransactionStatusSucceeded,
  processRefundSucceeded,
  failed
} from "./transactionsSlice";
import { transactionsApi } from "../../api/apiClient";
import { fetchProducts } from "../products/productsSlice";
import { fetchRawMaterials } from "../rawMaterials/rawMaterialsSlice";

function* fetchTransactionsSaga() {
  try {
    const data = yield call(transactionsApi.getAll);
    yield put(fetchTransactionsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchTransactionByIdSaga(action) {
  try {
    const data = yield call(transactionsApi.getById, action.payload.id);
    yield put(fetchTransactionByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* createTransactionSaga(action) {
  try {
    const data = yield call(transactionsApi.create, action.payload);
    yield put(createTransactionSucceeded(data));
    // refresh products and raw materials after creating a transaction
    yield all([
      put(fetchProducts()),
      put(fetchRawMaterials())
    ]);
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateTransactionStatusSaga(action) {
  try {
    const data = yield call(transactionsApi.updateStatus, action.payload.id, action.payload.status);
    yield put(updateTransactionStatusSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* processRefundSaga(action) {
  try {
    const { id, refundData } = action.payload;
    const data = yield call(transactionsApi.processRefund, id, refundData);
    yield put(processRefundSucceeded(data));
    
    // Show success message in saga
    yield call([antdMessage, 'success'], 'Refund processed successfully');
  } catch (error) {
    yield put(failed(error.message));
    yield call([antdMessage, 'error'], 'Failed to process refund');
  }
}

export default function* transactionsSaga() {
  yield takeLatest(fetchTransactions.type, fetchTransactionsSaga);
  yield takeLatest(fetchTransactionById.type, fetchTransactionByIdSaga);
  yield takeLatest(createTransaction.type, createTransactionSaga);
  yield takeLatest(updateTransactionStatus.type, updateTransactionStatusSaga);
  yield takeLatest(processRefund.type, processRefundSaga);
}
