import { put, select, takeEvery, delay, call } from 'redux-saga/effects';
import { addNotification, failed } from './notificationsSlice';
import { fetchNewOrders } from '../ecommerceOrders/ecommerceOrdersSlice';

// Selectors
const getExistingNotifications = (state) => state.notifications.notifications;
const getNewOrders = (state) => state.ecommerceOrders.newOrders;

function* pollNewOrdersSaga() {
  while (true) {
    try {
      // Fetch new orders
      yield put(fetchNewOrders());

      // Wait for the fetch to complete and get the new orders
      yield delay(1000);
      const newOrders = yield select(getNewOrders);
      const existingNotifications = yield select(getExistingNotifications);

      // Create set for faster lookup of existing notification IDs
      const existingNotificationIds = new Set(existingNotifications.map(notif => notif.id));

      const now = new Date().toISOString();

      // Create notifications for new orders
      if (Array.isArray(newOrders)) {
        for (const order of newOrders) {
          const notificationId = `ORDER-${order.id}`;

          // Only add notification if it doesn't already exist
          if (!existingNotificationIds.has(notificationId)) {
            const notificationPayload = {
              id: notificationId,
              type: 'info',
              title: 'New E-commerce Order',
              message: `New order from ${order.customer_name} - LKR ${parseFloat(order.total_amount).toFixed(2)}`,
              icon: 'shopping-bag',
              persistent: true,
              category: 'ecommerce-order',
              navigateTo: 'ecommerce-orders',
              orderId: order.id,
              timestamp: now,
              showUINotification: true
            };

            yield put(addNotification(notificationPayload));
          }
        }
      }

      // Poll every 30 seconds
      yield delay(30000);
    } catch (error) {
      console.error('Error polling new orders:', error);
      yield put(failed(`Failed to poll new orders: ${error.message}`));

      // Wait before retrying
      yield delay(30000);
    }
  }
}

function* notificationsSaga() {
  // Start polling for new orders when the saga starts
  yield call(pollNewOrdersSaga);
}

export default notificationsSaga;
