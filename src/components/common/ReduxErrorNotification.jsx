import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notification } from 'antd';
import { clearAuthError } from '../../features/auth/authSlice';
import { failed as clearProductsError } from '../../features/products/productsSlice';
import { failed as clearUsersError } from '../../features/users/usersSlice';
import { failed as clearCategoriesError } from '../../features/categories/categoriesSlice';
import { failed as clearVendorsError } from '../../features/vendors/vendorsSlice';
import { failed as clearTransactionsError } from '../../features/transactions/transactionsSlice';
import { failed as clearCouponsError } from '../../features/coupons/couponsSlice';
import { failed as clearTaxesError } from '../../features/taxes/taxesSlice';
import { failed as clearPurchaseOrdersError } from '../../features/purchaseOrders/purchaseOrdersSlice';
import { failed as clearRawMaterialsError } from '../../features/rawMaterials/rawMaterialsSlice';
import { failed as clearAuditError } from '../../features/audit/auditSlice';

// Map slice names to selectors and clear actions
const errorSelectors = [
  {
    key: 'auth',
    selector: (state) => state.auth.error,
    clear: clearAuthError
  },
  {
    key: 'products',
    selector: (state) => state.products.error,
    clear: clearProductsError
  },
  {
    key: 'users',
    selector: (state) => state.users.error,
    clear: clearUsersError
  },
  {
    key: 'categories',
    selector: (state) => state.categories.error,
    clear: clearCategoriesError
  },
  {
    key: 'vendors',
    selector: (state) => state.vendors.error,
    clear: clearVendorsError
  },
  {
    key: 'transactions',
    selector: (state) => state.transactions.error,
    clear: clearTransactionsError
  },
  {
    key: 'coupons',
    selector: (state) => state.coupons.error,
    clear: clearCouponsError
  },
  {
    key: 'taxes',
    selector: (state) => state.taxes.error,
    clear: clearTaxesError
  },
  {
    key: 'purchaseOrders',
    selector: (state) => state.purchaseOrders.error,
    clear: clearPurchaseOrdersError
  },
  {
    key: 'rawMaterials',
    selector: (state) => state.rawMaterials.error,
    clear: clearRawMaterialsError
  },
  {
    key: 'audit',
    selector: (state) => state.audit.error,
    clear: clearAuditError
  },
];

export default function ReduxErrorNotification() {
  const dispatch = useDispatch();
  // Get all errors
  const errors = errorSelectors.map(({ selector }) => useSelector(selector));
  const prevErrors = useRef(errors);

  useEffect(() => {
    errors.forEach((err, idx) => {
      if (
        err &&
        (prevErrors.current[idx] !== err) &&
        typeof err === 'string' &&
        err.trim() !== ''
      ) {
        notification.error({
          message: 'Error',
          description: err,
          duration: 3,
        });
        // Optionally clear error after showing
        const clearAction = errorSelectors[idx].clear;
        if (clearAction) {
          dispatch(clearAction(null));
        }
      }
    });
    prevErrors.current = errors;
  }, [errors, dispatch]);

  return null; // This component does not render anything
}
