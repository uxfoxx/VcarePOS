import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  addNotification,
  checkStockLevels,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  clearStockAlerts,
  updateNotificationSettings
} from '../features/notifications/notificationsSlice';

/**
 * Custom hook for managing Redux-based notifications
 * Provides a clean interface for notification operations
 */
export function useReduxNotifications() {
  const dispatch = useDispatch();
  
  // Get notification state from Redux
  const notifications = useSelector(state => state.notifications.notifications);
  const stockAlerts = useSelector(state => state.notifications.stockAlerts);
  const settings = useSelector(state => state.notifications.settings);
  const lastChecked = useSelector(state => state.notifications.lastChecked);
  const loading = useSelector(state => state.notifications.loading);
  const error = useSelector(state => state.notifications.error);
  
  // Get products and raw materials for stock checking
  const productsList = useSelector(state => state.products?.productsList || []);
  const rawMaterialsList = useSelector(state => state.rawMaterials?.rawMaterialsList || []);

  // Action creators wrapped in useCallback for performance
  const addNotificationAction = useCallback((notification) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  const markAsRead = useCallback((notificationId) => {
    dispatch(markNotificationRead(notificationId));
  }, [dispatch]);

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  const removeNotificationAction = useCallback((notificationId) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const clearStockAlertsAction = useCallback(() => {
    dispatch(clearStockAlerts());
  }, [dispatch]);

  const updateSettings = useCallback((newSettings) => {
    dispatch(updateNotificationSettings(newSettings));
  }, [dispatch]);

  const checkStockLevelsAction = useCallback(() => {
    dispatch(checkStockLevels());
  }, [dispatch]);

  // Helper functions
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getCriticalAlertsCount = useCallback(() => {
    return stockAlerts.filter(alert => alert.type === 'critical').length;
  }, [stockAlerts]);

  const getWarningAlertsCount = useCallback(() => {
    return stockAlerts.filter(alert => alert.type === 'warning').length;
  }, [stockAlerts]);

  // Get low stock items for quick access
  const getLowStockItems = useCallback(() => {
    const lowStockProducts = productsList.filter(product => 
      product.stock <= settings.criticalStockThreshold
    );
    
    const lowStockMaterials = rawMaterialsList.filter(material => 
      material.stockQuantity <= material.minimumStock
    );
    
    return {
      products: lowStockProducts,
      materials: lowStockMaterials,
      total: lowStockProducts.length + lowStockMaterials.length
    };
  }, [productsList, rawMaterialsList, settings.criticalStockThreshold]);

  return {
    // State
    notifications,
    stockAlerts,
    settings,
    lastChecked,
    loading,
    error,
    
    // Actions
    addNotification: addNotificationAction,
    markAsRead,
    markAllAsRead,
    removeNotification: removeNotificationAction,
    clearAllNotifications,
    clearStockAlerts: clearStockAlertsAction,
    updateSettings,
    checkStockLevels: checkStockLevelsAction,
    
    // Helper functions
    getUnreadCount,
    getCriticalAlertsCount,
    getWarningAlertsCount,
    getLowStockItems
  };
}

export default useReduxNotifications;