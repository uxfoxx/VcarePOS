import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notification } from 'antd';

/**
 * Component to display Redux error notifications
 */
function ReduxErrorNotification() {
  const authError = useSelector(state => state.auth.error);
  const productsError = useSelector(state => state.products.error);
  const rawMaterialsError = useSelector(state => state.rawMaterials.error);
  const transactionsError = useSelector(state => state.transactions.error);
  const couponsError = useSelector(state => state.coupons.error);
  const taxesError = useSelector(state => state.taxes.error);
  const categoriesError = useSelector(state => state.categories.error);
  const usersError = useSelector(state => state.users.error);
  const auditError = useSelector(state => state.audit.error);
  const purchaseOrdersError = useSelector(state => state.purchaseOrders.error);
  const vendorsError = useSelector(state => state.vendors.error);
  const customersError = useSelector(state => state.customers.error);
  const notificationsError = useSelector(state => state.notifications.error);

  // Show error notifications
  useEffect(() => {
    const errors = [
      { error: authError, module: 'Authentication' },
      { error: productsError, module: 'Products' },
      { error: rawMaterialsError, module: 'Raw Materials' },
      { error: transactionsError, module: 'Transactions' },
      { error: couponsError, module: 'Coupons' },
      { error: taxesError, module: 'Taxes' },
      { error: categoriesError, module: 'Categories' },
      { error: usersError, module: 'Users' },
      { error: auditError, module: 'Audit Trail' },
      { error: purchaseOrdersError, module: 'Purchase Orders' },
      { error: vendorsError, module: 'Vendors' },
      { error: customersError, module: 'Customers' },
      { error: notificationsError, module: 'Notifications' }
    ];

    errors.forEach(({ error, module }) => {
      if (error) {
        notification.error({
          message: `${module} Error`,
          description: error,
          placement: 'topRight',
          duration: 5,
        });
      }
    });
  }, [
    authError,
    productsError,
    rawMaterialsError,
    transactionsError,
    couponsError,
    taxesError,
    categoriesError,
    usersError,
    auditError,
    purchaseOrdersError,
    vendorsError,
    customersError,
    notificationsError
  ]);

  return null;
}

export default ReduxErrorNotification;