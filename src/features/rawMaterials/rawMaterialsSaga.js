import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchRawMaterials,
  fetchRawMaterialsSucceeded,
  addRawMaterials,
  addRawMaterialsSucceeded,
  updateRawMaterials,
  updateRawMaterialsSucceeded,
  deleteRawMaterials,
  deleteRawMaterialsSucceeded,
  failed,
  updateStock,
  updateStockSucceeded
} from "./rawMaterialsSlice";
import { rawMaterialsApi } from "../../api/apiClient";
import { message } from "antd";

function* fetchRawMaterialsSaga(_action) {
  try {
    const data = yield call(rawMaterialsApi.getAll);
    yield put(fetchRawMaterialsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
    message.error('Failed to load raw materials');
  }
}

function* addRawMaterialsSaga(action) {
  try {
    const data = yield call(rawMaterialsApi.create, action.payload.materialData);
    yield put(addRawMaterialsSucceeded({materialData: data}));
    message.success('Raw material added successfully');
  } catch (error) {
    yield put(failed(error.message));
    message.error(error.message || 'Failed to add raw material');
  }
}

function* updateRawMaterialsSaga(action) {
  try {
    const {payload} = action;
    const data = yield call(rawMaterialsApi.update, payload.materialData.id, payload.materialData);
    yield put(updateRawMaterialsSucceeded({id: payload.materialData.id, materialData: data}));
    message.success('Raw material updated successfully');
  } catch (error) {
    yield put(failed(error.message));
    message.error(error.message || 'Failed to update raw material');
  }
}

function* deleteRawMaterialsSaga(action) {
  try {
    const data = yield call(rawMaterialsApi.delete, action.payload.materialId);
    yield put(deleteRawMaterialsSucceeded({materialId: action.payload.materialId, message:data.message}));
    message.success('Raw material deleted successfully');
  } catch (error) {
    yield put(failed(error.message));
    message.error(error.message || 'Failed to delete raw material');
  }
}

function* updateStockSaga(action) {
  try {
    const { id, quantity, operation } = action.payload;
    const data = yield call(rawMaterialsApi.updateStock, id, quantity, operation);
    yield put(updateStockSucceeded(data));
    message.success('Stock updated successfully');
  } catch (error) {
    yield put(failed(error.message));
    message.error(error.message || 'Failed to update stock');
  }
}

export default function* rawMaterialsSaga() {
  yield takeLatest(fetchRawMaterials.type, fetchRawMaterialsSaga);
  yield takeLatest(addRawMaterials.type, addRawMaterialsSaga);
  yield takeLatest(updateRawMaterials.type, updateRawMaterialsSaga);
  yield takeLatest(deleteRawMaterials.type, deleteRawMaterialsSaga);
  yield takeLatest(updateStock.type, updateStockSaga);
}
