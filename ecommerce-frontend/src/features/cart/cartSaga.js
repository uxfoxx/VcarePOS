import { takeEvery, put } from 'redux-saga/effects'
import toast from 'react-hot-toast'
import { addToCart, openCart } from './cartSlice'

function* addToCartSaga(action) {
  const { product, quantity = 1 } = action.payload
  
  // Automatically open cart when item is added
  yield put(openCart())
  
  // Show success toast
  toast.success(`${product.name} added to cart!`, {
    icon: '🛒',
    duration: 2000,
  })
}

export default function* cartSaga() {
  yield takeEvery(addToCart.type, addToCartSaga)
}