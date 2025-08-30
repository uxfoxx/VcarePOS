import { takeLatest, call, put } from 'redux-saga/effects'
import { categoriesApi } from '../../api/ecommerceApiClient'
import {
  fetchCategories,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
} from './categoriesSlice'

function* fetchCategoriesSaga() {
  try {
    const categories = yield call(categoriesApi.getAll)
    yield put(fetchCategoriesSuccess(categories))
  } catch (error) {
    yield put(fetchCategoriesFailure(error.message))
  }
}

export default function* categoriesSaga() {
  yield takeLatest(fetchCategories.type, fetchCategoriesSaga)
}