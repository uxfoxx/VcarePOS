import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
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
 * Enhanced Redux notifications hook that provides backward compatibility
 * with the old NotificationContext API. This allows for seamless migration
 * of existing components.
 */
export function useReduxNotifications() {
  const dispatch = useDispatch();
  const {
    notifications,
    stockAlerts,
    settings,
    lastChecked,
    loading,
    error
  } = useSelector(state => state.notifications);

  // Get products and raw materials for compatibility functions
  const productsList = useSelector(state => state.products?.productsList || []);
  const rawMaterialsList = useSelector(state => state.rawMaterials?.rawMaterialsList || []);

  const addNotificationWithDisplay = (notificationData) => {
    const newNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      showUINotification: true, // Always show UI notification for manually added ones
      ...notificationData
    };
    
    dispatch(addNotification(newNotification));
  };

  const checkStockLevelsAction = () => {
    dispatch(checkStockLevels());
  };

  const markAsRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const markAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const clearAllNotifications = () => {
    dispatch(clearNotifications());
    message.success('All notifications cleared');
  };

  const removeNotificationById = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const clearStockAlertsAction = () => {
    dispatch(clearStockAlerts());
  };

  const updateSettings = (newSettings) => {
    dispatch(updateNotificationSettings(newSettings));
  };

  // Enhanced backward compatibility function for raw material availability
  const checkRawMaterialAvailability = (cartItems, rawMaterials = rawMaterialsList) => {
    const unavailableMaterials = [];
    const lowMaterials = [];
    
    // Ensure we have valid arrays to work with
    if (!Array.isArray(cartItems) || !Array.isArray(rawMaterials)) {
      return { unavailableMaterials, lowMaterials };
    }

    cartItems.forEach(cartItem => {
      // Get raw materials from the selected size
      let requiredMaterials = [];
      
      // Find the selected size data which contains raw materials
      if (cartItem?.selectedColorId && cartItem?.selectedSize && cartItem?.product?.colors) {
        const selectedColor = cartItem.product.colors.find(color => color.id === cartItem.selectedColorId);
        if (selectedColor && selectedColor.sizes) {
          const selectedSizeData = selectedColor.sizes.find(size => size.name === cartItem.selectedSize);
          if (selectedSizeData && Array.isArray(selectedSizeData.rawMaterials)) {
            requiredMaterials = selectedSizeData.rawMaterials;
          }
        }
      } else if (cartItem?.product && Array.isArray(cartItem.product.rawMaterials)) {
        // Fallback for products without color/size structure
        requiredMaterials = cartItem.product.rawMaterials;
      }
      
      if (requiredMaterials.length > 0) {
        requiredMaterials.forEach(requiredMaterial => {
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

  return {
    // State - maintaining exact same structure as old context
    notifications,
    stockAlerts,
    settings,
    lastChecked,
    loading,
    error,
    
    // Backward compatibility aliases for settings
    enableStockAlerts: settings.enableStockAlerts,
    lowStockThreshold: settings.lowStockThreshold,
    criticalStockThreshold: settings.criticalStockThreshold,
    enableLowStockWarnings: settings.enableLowStockWarnings,
    
    // Actions - maintaining exact same function names as old context
    addNotification: addNotificationWithDisplay,
    checkStockLevels: checkStockLevelsAction,
    checkRawMaterialAvailability,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification: removeNotificationById,
    clearStockAlerts: clearStockAlertsAction,
    updateSettings,
  };
}
