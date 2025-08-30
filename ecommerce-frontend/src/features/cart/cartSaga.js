import { takeEvery, put } from 'redux-saga/effects'
import { addToCart, openCart } from './cartSlice'

function* addToCartSaga() {
  // Automatically open cart when item is added
  yield put(openCart())
}

export default function* cartSaga() {
  yield takeEvery(addToCart.type, addToCartSaga)
}