import { createSlice } from "@reduxjs/toolkit";

// Helper function to merge stock alerts and avoid duplicates
const mergeStockAlerts = (existingAlerts, newAlerts) => {
  const alertMap = new Map();
  
  // Add existing alerts to map
  existingAlerts.forEach(alert => {
    alertMap.set(alert.id, alert);
  });
  
  // Add or update with new alerts
  newAlerts.forEach(alert => {
    alertMap.set(alert.id, alert);
  });
  
  return Array.from(alertMap.values());
};

// Helper function to deduplicate notifications
const deduplicateNotifications = (notifications) => {
  const seenIds = new Set();
  return notifications.filter(notification => {
    if (seenIds.has(notification.id)) {
      return false;
    }
    seenIds.add(notification.id);
    return true;
  });
};

const initialState = {
  notifications: [],
  stockAlerts: [],
  settings: {
    enableStockAlerts: true,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    stockCheckInterval: 5 * 60 * 1000, // 5 minutes
  },
  lastChecked: null,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Stock level checking
    checkStockLevels(state) {
      state.loading = true;
      state.error = null;
    },
    checkStockLevelsSucceeded(state, action) {
      state.loading = false;
      // Use helper function to merge alerts and avoid duplicates
      state.stockAlerts = mergeStockAlerts(state.stockAlerts, action.payload.alerts);
      state.lastChecked = action.payload.timestamp;
    },
    
    // General notifications
    addNotification(state, action) {
      const newNotification = {
        id: action.payload.id || `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        ...action.payload
      };
      
      // Check if notification with same ID already exists
      const existingIndex = state.notifications.findIndex(notif => notif.id === newNotification.id);
      if (existingIndex !== -1) {
        // Update existing notification instead of adding duplicate
        state.notifications[existingIndex] = newNotification;
      } else {
        // Add new notification and keep last 50
        state.notifications = [newNotification, ...state.notifications.slice(0, 49)];
      }
      
      // Ensure no duplicates
      state.notifications = deduplicateNotifications(state.notifications);
    },
    markNotificationRead(state, action) {
      state.notifications = state.notifications.map(notif =>
        notif.id === action.payload ? { ...notif, read: true } : notif
      );
    },
    markAllNotificationsRead(state) {
      state.notifications = state.notifications.map(notif => ({ ...notif, read: true }));
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(notif => notif.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    
    // Stock alerts
    clearStockAlerts(state) {
      state.stockAlerts = [];
    },
    updateStockAlerts(state, action) {
      // Use helper function to merge alerts and avoid duplicates
      state.stockAlerts = mergeStockAlerts(state.stockAlerts, action.payload);
      state.lastChecked = new Date().toISOString();
    },
    
    // Settings
    updateNotificationSettings(state, action) {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Error handling
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  checkStockLevels,
  checkStockLevelsSucceeded,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  clearStockAlerts,
  updateStockAlerts,
  updateNotificationSettings,
  failed,
  clearError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
