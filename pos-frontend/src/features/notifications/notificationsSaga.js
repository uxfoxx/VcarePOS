import { put, select, call, fork, cancel, delay, take } from 'redux-saga/effects';
import { addNotification } from './notificationsSlice';
import { ecommerceOrdersApi } from '../../api/apiClient';
import { message } from 'antd';

const getExistingNotifications = (state) => state.notifications.notifications;

const POLLING_INTERVAL = 30000;

function playNotificationSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==');
    audio.volume = 0.6;
    audio.play().catch((err) => {
      console.warn('[Notifications] Could not play notification sound:', err.message);
    });
  } catch (err) {
    console.warn('[Notifications] Error creating notification sound:', err.message);
  }
}

function* processNewOrder(order) {
  const existingNotifications = yield select(getExistingNotifications);
  const notificationId = `ORDER-${order.id}`;

  const exists = existingNotifications.some(notif => notif.id === notificationId);

  if (!exists) {
    playNotificationSound();

    const now = new Date().toISOString();

    const notificationPayload = {
      id: notificationId,
      type: 'info',
      title: 'New E-commerce Order',
      message: `New order from ${order.customer_name || order.customerName} - LKR ${parseFloat(order.total_amount || order.totalAmount).toFixed(2)}`,
      icon: 'shopping-bag',
      persistent: true,
      category: 'ecommerce-order',
      navigateTo: 'ecommerce-orders',
      orderId: order.id,
      timestamp: now,
      showUINotification: true
    };

    yield put(addNotification(notificationPayload));

    message.success({
      content: `New order from ${order.customer_name || order.customerName}`,
      duration: 5,
      style: {
        marginTop: '20px',
      }
    });

    try {
      yield call(ecommerceOrdersApi.markOrderNotified, order.id);
    } catch (error) {
      console.warn('[Notifications] Failed to mark order as notified:', error);
    }

    return true;
  }
  return false;
}

function* pollForNewOrders() {
  // console.log('[Notifications] Starting order polling...');

  while (true) {
    try {
      const newOrders = yield call(ecommerceOrdersApi.getNewOrders);

      if (newOrders && Array.isArray(newOrders) && newOrders.length > 0) {
        console.log(`[Notifications] Found ${newOrders.length} new orders via polling`);

        for (const order of newOrders) {
          yield call(processNewOrder, order);
        }
      }
    } catch (error) {
      console.warn('[Notifications] Polling error:', error.message);
    }

    yield delay(POLLING_INTERVAL);
  }
}

function* notificationsSaga() {
  const pollingTask = yield fork(pollForNewOrders);

  yield take('STOP_NOTIFICATIONS');
  yield cancel(pollingTask);
}

export default notificationsSaga;
