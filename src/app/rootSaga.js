// src/app/rootSaga.js
import { all } from 'redux-saga/effects';
import rawMaterialsSaga from '../features/rawMaterials/rawMaterialsSaga';
import productsSaga from '../features/products/productsSaga';
import transactionsSaga from '../features/transactions/transactionsSaga';
import authSaga from '../features/auth/authSaga';
import couponsSaga from '../features/coupons/couponsSaga';
import taxesSaga from '../features/taxes/taxesSaga';
import categoriesSaga from '../features/categories/categoriesSaga';
import usersSaga from '../features/users/usersSaga';
import auditSaga from '../features/audit/auditSaga';
import purchaseOrdersSaga from '../features/purchaseOrders/purchaseOrdersSaga';
import vendorsSaga from '../features/vendors/vendorsSaga';
import notificationsSaga from '../features/notifications/notificationsSaga';
import customersSaga from '../features/customers/customersSaga';


export default function* rootSaga() {
  yield all([
    rawMaterialsSaga(),
    productsSaga(),
    transactionsSaga(),
    authSaga(),
    couponsSaga(),
    taxesSaga(),
    usersSaga(),
    auditSaga(),
    purchaseOrdersSaga(),
    vendorsSaga(),
    categoriesSaga(),
    notificationsSaga(),
    customersSaga(),
  ]);
}
