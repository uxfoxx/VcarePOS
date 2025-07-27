import { combineReducers } from '@reduxjs/toolkit';
import rawMaterialsReducer from '../features/rawMaterials/rawMaterialsSlice';
import productsReducer from '../features/products/productsSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';
import authReducer from '../features/auth/authSlice';
import couponsReducer from '../features/coupons/couponsSlice';
import taxesReducer from '../features/taxes/taxesSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import usersReducer from '../features/users/usersSlice';
import auditReducer from '../features/audit/auditSlice';
import purchaseOrdersReducer from '../features/purchaseOrders/purchaseOrdersSlice';
import vendorsReducer from '../features/vendors/vendorsSlice';
import cartReducer from '../features/cart/cartSlice';


const rootReducer = combineReducers({
  rawMaterials: rawMaterialsReducer,
  products: productsReducer,
  transactions: transactionsReducer,
  auth: authReducer,
  coupons: couponsReducer,
  taxes: taxesReducer,
  categories: categoriesReducer,
  users: usersReducer,
  audit: auditReducer,
  purchaseOrders: purchaseOrdersReducer,
  vendors: vendorsReducer,
  cart: cartReducer,
});

export default rootReducer;
