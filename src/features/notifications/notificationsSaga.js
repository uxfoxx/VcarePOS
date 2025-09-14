import { put, select, takeEvery } from 'redux-saga/effects';
import { checkStockLevels, checkStockLevelsSucceeded, addNotification, failed } from './notificationsSlice';

// Selectors
const getRawMaterials = (state) => state.rawMaterials.rawMaterialsList;
const getProducts = (state) => state.products.productsList;
const getNotificationSettings = (state) => state.notifications.settings;
const getExistingStockAlerts = (state) => state.notifications.stockAlerts;
const getExistingNotifications = (state) => state.notifications.notifications;

function* checkStockLevelsSaga() {
  try {
    const rawMaterials = yield select(getRawMaterials);
    const products = yield select(getProducts);
    const settings = yield select(getNotificationSettings);
    const existingStockAlerts = yield select(getExistingStockAlerts);
    const existingNotifications = yield select(getExistingNotifications);
    
    if (!settings.enableStockAlerts) {
      return;
    }

    const alerts = [];
    const now = new Date().toISOString();
    
    // Create set for faster lookup of existing notification IDs
    const existingNotificationIds = new Set(existingNotifications.map(notif => notif.id));

    // Check raw materials
    if (Array.isArray(rawMaterials)) {
      rawMaterials.forEach(material => {
        const alertId = `STOCK-${material.id}`;
        
        if (material.stockQuantity <= 0) {
          const alert = {
            id: alertId,
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
          };
          alerts.push(alert);
        } else if (material.stockQuantity <= material.minimumStock) {
          const alert = {
            id: alertId,
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
          };
          alerts.push(alert);
        }
      });
    }

    // Check products
    if (Array.isArray(products)) {
      products.forEach(product => {
        const alertId = `STOCK-PROD-${product.id}`;
        
        if (product.stock <= 0) {
          const alert = {
            id: alertId,
            type: 'critical',
            category: 'product',
            title: 'Product Out of Stock',
            message: `${product.name} is out of stock`,
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            timestamp: now,
            navigateTo: 'products'
          };
          alerts.push(alert);
        } else if (product.stock <= settings.criticalStockThreshold) {
          const alert = {
            id: alertId,
            type: 'warning',
            category: 'product',
            title: 'Low Product Stock',
            message: `${product.name} is running low (${product.stock} units remaining)`,
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            timestamp: now,
            navigateTo: 'products'
          };
          alerts.push(alert);
        }
      });
    }

    // Only create notifications for NEW critical alerts (avoid duplicates)
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    const newCriticalAlerts = criticalAlerts.filter(alert => {
      // Check if this is a truly new alert (not just an update to existing one)
      const existingAlert = existingStockAlerts.find(existing => existing.id === alert.id);
      return !existingAlert || existingAlert.type !== 'critical';
    });
    
    for (const alert of newCriticalAlerts) {
      const notificationId = `NOTIFICATION-${alert.id}`;
      
      // Only add notification if it doesn't already exist
      if (!existingNotificationIds.has(notificationId)) {
        const notificationPayload = {
          id: notificationId,
          type: 'error',
          title: alert.title,
          message: alert.message,
          icon: 'warning',
          persistent: true,
          category: 'stock-alert',
          navigateTo: alert.navigateTo,
          timestamp: now,
          // Flag to indicate this should show as UI notification
          showUINotification: true
        };
        
        yield put(addNotification(notificationPayload));
      }
    }

    // Update stock alerts with current alerts (this replaces the entire array)
    yield put(checkStockLevelsSucceeded({
      alerts,
      timestamp: now
    }));

  } catch (error) {
    console.error('Error checking stock levels:', error);
    yield put(failed(`Failed to check stock levels: ${error.message}`));
  }
}

function* notificationsSaga() {
  yield takeEvery(checkStockLevels.type, checkStockLevelsSaga);
}

export default notificationsSaga;
