import { combineReducers } from '@reduxjs/toolkit'
import productsReducer from '../features/products/productsSlice'
import cartReducer from '../features/cart/cartSlice'
import authReducer from '../features/auth/authSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import ordersReducer from '../features/orders/ordersSlice'

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  auth: authReducer,
  categories: categoriesReducer,
  orders: ordersReducer,
})

export default rootReducer