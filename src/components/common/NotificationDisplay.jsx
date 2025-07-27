import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { notification } from 'antd';

/**
 * NotificationDisplay component handles showing Ant Design notifications
 * based on Redux state changes. This separates UI concerns from business logic.
 */
export function NotificationDisplay() {
  const notifications = useSelector(state => state.notifications.notifications);
  
  // Keep track of notifications we've already shown to avoid duplicates
  const shownNotifications = useRef(new Set());

  useEffect(() => {
    notifications.forEach(notif => {
      // Only show notifications that are flagged to show UI and haven't been shown yet
      if (notif.showUINotification && !shownNotifications.current.has(notif.id)) {
        shownNotifications.current.add(notif.id);
        
        const antNotification = {
          message: notif.title,
          description: notif.message,
          placement: 'topRight',
          duration: notif.persistent ? 0 : 4.5,
          onClick: notif.onClick,
          key: notif.id, // Use notification ID as key for Ant Design
        };

        if (notif.type === 'error') {
          notification.error(antNotification);
        } else if (notif.type === 'warning') {
          notification.warning(antNotification);
        } else if (notif.type === 'success') {
          notification.success(antNotification);
        } else {
          notification.info(antNotification);
        }
      }
    });
  }, [notifications]);

  // This component doesn't render anything visible - it's just for side effects
  return null;
}

export default NotificationDisplay;
