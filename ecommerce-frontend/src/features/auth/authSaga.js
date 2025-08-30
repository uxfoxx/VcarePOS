import { takeLatest, call, put } from 'redux-saga/effects'
import { customersApi } from '../../api/ecommerceApiClient'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
} from './authSlice'

function* loginSaga(action) {
  try {
    const { email, password } = action.payload
    const response = yield call(customersApi.login, email, password)
    
    // Store customer data in localStorage
    localStorage.setItem('ecommerce_customer', JSON.stringify(response.customer))
    
    yield put(loginSuccess(response))
  } catch (error) {
    yield put(loginFailure(error.message))
  }
}

function* registerSaga(action) {
  try {
    const customerData = action.payload
    const response = yield call(customersApi.register, customerData)
    
    // Store customer data in localStorage
    localStorage.setItem('ecommerce_customer', JSON.stringify(response))
    
    yield put(registerSuccess({ customer: response }))
  } catch (error) {
    yield put(registerFailure(error.message))
  }
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, loginSaga)
  yield takeLatest(registerStart.type, registerSaga)
}