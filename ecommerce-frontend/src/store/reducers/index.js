import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import productsReducer from '../slices/productsSlice';
import cartReducer from '../slices/cartSlice';
import ordersReducer from '../slices/ordersSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
});

export default rootReducer;