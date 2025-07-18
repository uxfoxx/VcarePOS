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

function* fetchRawMaterialsSaga(action) {
  try {
    const data = yield call(rawMaterialsApi.getAll);
    yield put(fetchRawMaterialsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addRawMaterialsSaga(action) {
  try {
    const data = yield call(rawMaterialsApi.create, action.payload.materialData);
    yield put(addRawMaterialsSucceeded({materialData: data}));
  } catch (error) {
    yield put(failed(error.message));
    //todo show error msg
  }
}

function* updateRawMaterialsSaga(action) {
  try {
    const {payload} = action;
    const data = yield call(rawMaterialsApi.update, payload.materialData.id, payload.materialData);
    yield put(updateRawMaterialsSucceeded({id: payload.materialData.id, materialData: data}));
    console.log("updateRawMaterials");
  } catch (error) {
     console.log("error update raw meterial", error);
    yield put(failed(error.message));
    //todo show error msg
  }
}

function* deleteRawMaterialsSaga(action) {
  try {
    const data = yield call(rawMaterialsApi.delete, action.payload.materialId);
    yield put(deleteRawMaterialsSucceeded({materialId: action.payload.materialId, message:data.message}));
  } catch (error) {
    yield put(failed(error.message));
    //todo show error msg
  }
}

function* updateStockSaga(action) {
  try {
    // Correct parameter passing for updateStock
    const { id, quantity, operation } = action.payload;
    const data = yield call(rawMaterialsApi.updateStock, id, quantity, operation);
    yield put(updateStockSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* rawMaterialsSaga() {
  yield takeLatest(fetchRawMaterials.type, fetchRawMaterialsSaga);
  yield takeLatest(addRawMaterials.type, addRawMaterialsSaga);
  yield takeLatest(updateRawMaterials.type, updateRawMaterialsSaga);
  yield takeLatest(deleteRawMaterials.type, deleteRawMaterialsSaga);
  yield takeLatest(updateStock.type, updateStockSaga);
}
