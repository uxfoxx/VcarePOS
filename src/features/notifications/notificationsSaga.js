import { put, select, call, take, fork, cancel, cancelled } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import { addNotification, failed } from './notificationsSlice';
import { supabaseRealtime } from '../../utils/supabaseClient';
import { message } from 'antd';

// Selectors
const getExistingNotifications = (state) => state.notifications.notifications;

/**
 * Play notification sound for new orders
 */
function playNotificationSound() {
  try {
    // Better notification sound - pleasant two-tone chime
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==');
    audio.volume = 0.6; // Increased volume for better audibility
    audio.play().catch((err) => {
      console.warn('[Notifications] Could not play notification sound:', err.message);
    });
  } catch (err) {
    console.warn('[Notifications] Error creating notification sound:', err.message);
  }
}

/**
 * Create an event channel for Supabase Realtime subscriptions
 */
function createRealtimeChannel() {
  return eventChannel(emitter => {
    console.log('[Realtime] Setting up e-commerce orders subscription...');

    // Create a channel for ecommerce_orders table
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

    // Return unsubscribe function
    return () => {
      console.log('[Realtime] Unsubscribing from e-commerce orders');
      supabaseRealtime.removeChannel(channel);
    };
  });
}

/**
 * Watch for realtime events and dispatch notifications
 */
function* watchRealtimeEvents() {
  const channel = yield call(createRealtimeChannel);

  try {
    while (true) {
      const event = yield take(channel);

      if (event.type === 'NEW_ORDER') {
        const order = event.order;
        const existingNotifications = yield select(getExistingNotifications);
        const notificationId = `ORDER-${order.id}`;

        // Check if notification already exists
        const exists = existingNotifications.some(notif => notif.id === notificationId);

        if (!exists) {
          // Play notification sound when new order arrives
          playNotificationSound();

          const now = new Date().toISOString();

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

          // Show toast notification
          message.success({
            content: `New order from ${order.customer_name}`,
            duration: 5,
            style: {
              marginTop: '20px',
            }
          });
        }
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
  // Start watching for realtime events
  const realtimeTask = yield fork(watchRealtimeEvents);

  // Keep saga running
  yield take('STOP_NOTIFICATIONS');
  yield cancel(realtimeTask);
}

export default notificationsSaga;
