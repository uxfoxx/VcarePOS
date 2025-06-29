import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notification as antdNotification, message } from 'antd';
import { Icon } from '../components/common/Icon';

const initialState = {
  notifications: [],
  stockAlerts: [],
  lowStockThreshold: 10, // Default threshold for low stock warnings
  criticalStockThreshold: 5, // Critical stock threshold
  enableStockAlerts: true,
  enableLowStockWarnings: true,
  lastChecked: new Date()
};

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)] // Keep last 50
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true }))
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'UPDATE_STOCK_ALERTS':
      return {
        ...state,
        stockAlerts: action.payload,
        lastChecked: new Date()
      };
    case 'CLEAR_STOCK_ALERTS':
      return {
        ...state,
        stockAlerts: []
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification) => {
    const newNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    
    // Show Ant Design notification
    const antNotification = {
      message: notification.title,
      description: notification.message,
      icon: <Icon name={notification.icon || 'notifications'} className={`text-${notification.type === 'error' ? 'red' : notification.type === 'warning' ? 'orange' : 'blue'}-500`} />,
      placement: 'topRight',
      duration: notification.persistent ? 0 : 4.5,
      onClick: notification.onClick,
    };

    if (notification.type === 'error') {
      antdNotification.error(antNotification);
    } else if (notification.type === 'warning') {
      antdNotification.warning(antNotification);
    } else if (notification.type === 'success') {
      antdNotification.success(antNotification);
    } else {
      antdNotification.info(antNotification);
    }
  };

  const checkStockLevels = (rawMaterials, products) => {
    if (!state.enableStockAlerts) return;

    const alerts = [];
    const now = new Date();

    // Check raw materials - ensure rawMaterials is an array
    (rawMaterials || []).forEach(material => {
      if (material.stockQuantity <= 0) {
        alerts.push({
          id: `STOCK-${material.id}`,
          type: 'critical',
          category: 'raw-material',
          title: 'Raw Material Out of Stock',
          message: `${material.name} is completely out of stock`,
          materialId: material.id,
          materialName: material.name,
          currentStock: material.stockQuantity,
          minimumStock: material.minimumStock,
          timestamp: now,
          navigateTo: 'raw-materials'
        });
      } else if (material.stockQuantity <= material.minimumStock) {
        alerts.push({
          id: `STOCK-${material.id}`,
          type: 'warning',
          category: 'raw-material',
          title: 'Low Stock Alert',
          message: `${material.name} is running low (${material.stockQuantity} ${material.unit} remaining)`,
          materialId: material.id,
          materialName: material.name,
          currentStock: material.stockQuantity,
          minimumStock: material.minimumStock,
          timestamp: now,
          navigateTo: 'raw-materials'
        });
      }
    });

    // Check products - ensure products is an array
    (products || []).forEach(product => {
      if (product.stock <= 0) {
        alerts.push({
          id: `STOCK-PROD-${product.id}`,
          type: 'critical',
          category: 'product',
          title: 'Product Out of Stock',
          message: `${product.name} is out of stock`,
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          timestamp: now,
          navigateTo: 'products'
        });
      } else if (product.stock <= state.criticalStockThreshold) {
        alerts.push({
          id: `STOCK-PROD-${product.id}`,
          type: 'warning',
          category: 'product',
          title: 'Low Product Stock',
          message: `${product.name} is running low (${product.stock} units remaining)`,
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          timestamp: now,
          navigateTo: 'products'
        });
      }
    });

    // Update stock alerts
    dispatch({ type: 'UPDATE_STOCK_ALERTS', payload: alerts });

    // Send notifications for new critical alerts
    alerts.forEach(alert => {
      if (alert.type === 'critical') {
        addNotification({
          type: 'error',
          title: alert.title,
          message: alert.message,
          icon: 'warning',
          persistent: true,
          category: 'stock-alert',
          navigateTo: alert.navigateTo
        });
      }
    });
  };

  const checkRawMaterialAvailability = (cartItems, rawMaterials) => {
    const unavailableMaterials = [];
    const lowMaterials = [];

    cartItems.forEach(cartItem => {
      if (cartItem.product.rawMaterials) {
        cartItem.product.rawMaterials.forEach(requiredMaterial => {
          const material = rawMaterials.find(m => m.id === requiredMaterial.rawMaterialId);
          if (material) {
            const totalRequired = requiredMaterial.quantity * cartItem.quantity;
            
            if (material.stockQuantity < totalRequired) {
              if (material.stockQuantity === 0) {
                unavailableMaterials.push({
                  materialName: material.name,
                  productName: cartItem.product.name,
                  required: totalRequired,
                  available: material.stockQuantity,
                  unit: material.unit
                });
              } else {
                lowMaterials.push({
                  materialName: material.name,
                  productName: cartItem.product.name,
                  required: totalRequired,
                  available: material.stockQuantity,
                  unit: material.unit
                });
              }
            }
          }
        });
      }
    });

    return { unavailableMaterials, lowMaterials };
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_READ', payload: notificationId });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    message.success('All notifications cleared');
  };

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  const clearStockAlerts = () => {
    dispatch({ type: 'CLEAR_STOCK_ALERTS' });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  return (
    <NotificationContext.Provider value={{
      ...state,
      addNotification,
      checkStockLevels,
      checkRawMaterialAvailability,
      markAsRead,
      markAllAsRead,
      clearAllNotifications,
      removeNotification,
      clearStockAlerts,
      updateSettings
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}