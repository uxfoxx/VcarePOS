import { put, select, call, take, fork, cancel, cancelled, delay } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { addNotification, failed } from './notificationsSlice';
import { supabaseRealtime } from '../../utils/supabaseClient';
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
  console.log('[Notifications] Starting order polling...');

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

function createRealtimeChannel() {
  return eventChannel(emitter => {
    console.log('[Realtime] Setting up e-commerce orders subscription...');

    const channel = supabaseRealtime
      .channel('ecommerce-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ecommerce_orders'
        },
        (payload) => {
          console.log('[Realtime] New order received:', payload);
          emitter({ type: 'NEW_ORDER', order: payload.new });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to e-commerce orders');
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error');
          emitter({ type: 'ERROR', error: 'Channel subscription error' });
        }

        if (status === 'TIMED_OUT') {
          console.error('[Realtime] Connection timed out');
          emitter({ type: 'ERROR', error: 'Connection timed out' });
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from e-commerce orders');
      supabaseRealtime.removeChannel(channel);
    };
  });
}

function* watchRealtimeEvents() {
  const channel = yield call(createRealtimeChannel);

  try {
    while (true) {
      const event = yield take(channel);

      if (event.type === 'NEW_ORDER') {
        yield call(processNewOrder, event.order);
      } else if (event.type === 'ERROR') {
        console.error('[Realtime] Error:', event.error);
        yield put(failed(event.error));
      }
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

function* notificationsSaga() {
  const realtimeTask = yield fork(watchRealtimeEvents);
  const pollingTask = yield fork(pollForNewOrders);

  yield take('STOP_NOTIFICATIONS');
  yield cancel(realtimeTask);
  yield cancel(pollingTask);
}

export default notificationsSaga;
