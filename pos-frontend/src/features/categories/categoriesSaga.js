import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchCategories,
  addCategories,
  updateCategories,
  deleteCategories,
  fetchCategoriesSucceeded,
  addCategoriesSucceeded,
  updateCategoriesSucceeded,
  deleteCategoriesSucceeded,
  failed,
} from "./categoriesSlice";
import { categoriesApi } from "../../api/apiClient";

function* fetchCategoriesSaga(_action) {
  try {
    const data = yield call(categoriesApi.getAll);
    yield put(fetchCategoriesSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addCategoriesSaga(action) {
  try {
    const data = yield call(categoriesApi.create, action.payload.categoryData);
    yield put(addCategoriesSucceeded({ categoryData: data }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateCategoriesSaga(action) {
  try {
    const {payload} = action;
    const data = yield call(categoriesApi.update, payload.categoryData.id, payload.categoryData);
    yield put(updateCategoriesSucceeded({id: payload.categoryData.id, categoryData: data}));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteCategoriesSaga(action) {
  try {
    const data = yield call(categoriesApi.delete, action.payload.categoryId);
    yield put(
      deleteCategoriesSucceeded({
        categoryId: action.payload.categoryId,
        message: data.message,
      })
    );
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* categoriesSaga() {
  yield takeLatest(fetchCategories.type, fetchCategoriesSaga);
  yield takeLatest(addCategories.type, addCategoriesSaga);
  yield takeLatest(updateCategories.type, updateCategoriesSaga);
  yield takeLatest(deleteCategories.type, deleteCategoriesSaga);
}
