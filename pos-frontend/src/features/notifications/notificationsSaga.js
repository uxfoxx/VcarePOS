import { put, select, call, fork, cancel, delay, take } from 'redux-saga/effects';
import { addNotification } from './notificationsSlice';
import { ecommerceOrdersApi } from '../../api/apiClient';
import { message } from 'antd';

const getExistingNotifications = (state) => state.notifications.notifications;

const POLLING_INTERVAL = 30000;

function playNotificationSound() {
  try {
    const audio = new Audio('/assets/audio/mixkit-bell-notification-933.wav');
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

  // 1. Play sound only if it hasn't been played according to the backend
  if (!order.sound_played_at) {
    playNotificationSound();

    try {
      // Mark merely the sound as played on the backend, so we don't repeat the bell on reload
      yield call(ecommerceOrdersApi.markSoundPlayed, order.id);
    } catch (error) {
      console.warn('[Notifications] Failed to mark sound as played:', error);
    }
  }

  // 2. Add to Redux UI Notifications if not already present in the active session
  if (!exists) {
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

    // Show screen toaster only if it hasn't been seen this session
    message.success({
      content: `New order from ${order.customer_name || order.customerName}`,
      duration: 5,
      style: {
        marginTop: '20px',
      }
    });

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
