import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchCoupons,
  fetchCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  fetchCouponsSucceeded,
  fetchCouponByIdSucceeded,
  addCouponSucceeded,
  updateCouponSucceeded,
  deleteCouponSucceeded,
  validateCouponSucceeded,
  failed
} from "./couponsSlice";
import { couponsApi } from "../../api/apiClient";

function* fetchCouponsSaga() {
  try {
    const data = yield call(couponsApi.getAll);
    yield put(fetchCouponsSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchCouponByIdSaga(action) {
  try {
    const data = yield call(couponsApi.getById, action.payload.id);
    yield put(fetchCouponByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* addCouponSaga(action) {
  try {
    const data = yield call(couponsApi.create, action.payload);
    yield put(addCouponSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateCouponSaga(action) {
  try {
    const data = yield call(couponsApi.update, action.payload.id, action.payload);
    yield put(updateCouponSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteCouponSaga(action) {
  try {
    yield call(couponsApi.delete, action.payload.id);
    yield put(deleteCouponSucceeded({ id: action.payload.id }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* validateCouponSaga(action) {
  try {
    const data = yield call(couponsApi.validate, action.payload.code, action.payload.amount);
    yield put(validateCouponSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* couponsSaga() {
  yield takeLatest(fetchCoupons.type, fetchCouponsSaga);
  yield takeLatest(fetchCouponById.type, fetchCouponByIdSaga);
  yield takeLatest(addCoupon.type, addCouponSaga);
  yield takeLatest(updateCoupon.type, updateCouponSaga);
  yield takeLatest(deleteCoupon.type, deleteCouponSaga);
  yield takeLatest(validateCoupon.type, validateCouponSaga);
}
