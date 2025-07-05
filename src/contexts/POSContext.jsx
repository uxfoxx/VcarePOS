import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { 
  mockProducts, 
  mockRawMaterials, 
  mockTransactions, 
  mockCoupons, 
  mockTaxes, 
  mockCategories
} from '../data/mockData';
import { getOrFetch, invalidateCache, invalidateCacheByPrefix } from '../utils/cache';

const initialState = {
  cart: [],
  products: mockProducts,
  rawMaterials: mockRawMaterials,
  transactions: mockTransactions,
  coupons: mockCoupons,
  purchaseOrders: [],
  taxes: mockTaxes,
  categories: mockCategories,
  customers: []
};

function posReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => 
        item.product.id === action.payload.id && 
        item.selectedSize === action.payload.selectedSize &&
        JSON.stringify(item.product.addons || []) === JSON.stringify(action.payload.addons || [])
      );
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.id && 
            item.selectedSize === action.payload.selectedSize &&
            JSON.stringify(item.product.addons || []) === JSON.stringify(action.payload.addons || [])
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        cart: [...state.cart, { 
          product: action.payload, 
          quantity: 1,
          selectedSize: action.payload.selectedSize || null
        }]
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => 
          !(item.product.id === action.payload.productId && 
            item.selectedSize === action.payload.selectedSize)
        )
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId && 
          item.selectedSize === action.payload.selectedSize
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };
    case 'ADD_TRANSACTION': {
      // Invalidate transactions cache
      invalidateCacheByPrefix('transactions');
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    }
    case 'UPDATE_TRANSACTION': {
      // Invalidate transactions cache
      invalidateCacheByPrefix('transactions');
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    }
    case 'UPDATE_TRANSACTION_STATUS': {
      // Invalidate transactions cache
      invalidateCacheByPrefix('transactions');
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.transactionId
            ? { ...transaction, status: action.payload.status }
            : transaction
        )
      };
    }
    case 'UPDATE_PRODUCT_STOCK': {
      // Invalidate product cache
      invalidateCacheByPrefix('products');
      
      const updatedProducts = state.products.map(product => {
        if (product.id === action.payload.productId) {
          if (product.hasSizes && action.payload.selectedSize) {
            // Update specific size stock
            const updatedSizes = product.sizes.map(size => 
              size.name === action.payload.selectedSize
                ? { ...size, stock: Math.max(0, size.stock - action.payload.quantity) }
                : size
            );
            const totalStock = updatedSizes.reduce((sum, size) => sum + size.stock, 0);
            return { ...product, sizes: updatedSizes, stock: totalStock };
          } else {
            // Update regular product stock
            return { ...product, stock: Math.max(0, product.stock - action.payload.quantity) };
          }
        }
        return product;
      });

      // Update raw materials stock (including custom products and addons)
      const productToUpdate = state.products.find(p => p.id === action.payload.productId);
      let updatedRawMaterials = [...state.rawMaterials];

      if (productToUpdate) {
        // Update stock for regular product materials
        if (productToUpdate.rawMaterials) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const materialUsage = productToUpdate.rawMaterials.find(m => m.rawMaterialId === rawMaterial.id);
            if (materialUsage) {
              const totalUsed = materialUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: Math.max(0, rawMaterial.stockQuantity - totalUsed)
              };
            }
            return rawMaterial;
          });
        }

        // Update stock for custom product materials
        if (productToUpdate.isCustom && productToUpdate.customMaterials) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const materialUsage = productToUpdate.customMaterials.find(m => m.id === rawMaterial.id);
            if (materialUsage) {
              const totalUsed = materialUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: Math.max(0, rawMaterial.stockQuantity - totalUsed)
              };
            }
            return rawMaterial;
          });
        }

        // Update stock for addon materials
        if (productToUpdate.hasAddons && productToUpdate.addons) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const addonUsage = productToUpdate.addons.find(a => a.id === rawMaterial.id);
            if (addonUsage) {
              const totalUsed = addonUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: Math.max(0, rawMaterial.stockQuantity - totalUsed)
              };
            }
            return rawMaterial;
          });
        }
      }

      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');

      return {
        ...state,
        products: updatedProducts,
        rawMaterials: updatedRawMaterials
      };
    }
    case 'RESTORE_PRODUCT_STOCK': {
      // Invalidate product cache
      invalidateCacheByPrefix('products');
      
      const updatedProducts = state.products.map(product => {
        if (product.id === action.payload.productId) {
          if (product.hasSizes && action.payload.selectedSize) {
            // Restore specific size stock
            const updatedSizes = product.sizes.map(size => 
              size.name === action.payload.selectedSize
                ? { ...size, stock: size.stock + action.payload.quantity }
                : size
            );
            const totalStock = updatedSizes.reduce((sum, size) => sum + size.stock, 0);
            return { ...product, sizes: updatedSizes, stock: totalStock };
          } else {
            // Restore regular product stock
            return { ...product, stock: product.stock + action.payload.quantity };
          }
        }
        return product;
      });

      // Restore raw materials stock
      const productToRestore = state.products.find(p => p.id === action.payload.productId);
      let updatedRawMaterials = [...state.rawMaterials];

      if (productToRestore) {
        // Restore stock for regular product materials
        if (productToRestore.rawMaterials) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const materialUsage = productToRestore.rawMaterials.find(m => m.rawMaterialId === rawMaterial.id);
            if (materialUsage) {
              const totalRestored = materialUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: rawMaterial.stockQuantity + totalRestored
              };
            }
            return rawMaterial;
          });
        }

        // Restore stock for custom product materials
        if (productToRestore.isCustom && productToRestore.customMaterials) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const materialUsage = productToRestore.customMaterials.find(m => m.id === rawMaterial.id);
            if (materialUsage) {
              const totalRestored = materialUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: rawMaterial.stockQuantity + totalRestored
              };
            }
            return rawMaterial;
          });
        }

        // Restore stock for addon materials
        if (productToRestore.hasAddons && productToRestore.addons) {
          updatedRawMaterials = updatedRawMaterials.map(rawMaterial => {
            const addonUsage = productToRestore.addons.find(a => a.id === rawMaterial.id);
            if (addonUsage) {
              const totalRestored = addonUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: rawMaterial.stockQuantity + totalRestored
              };
            }
            return rawMaterial;
          });
        }
      }

      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');

      return {
        ...state,
        products: updatedProducts,
        rawMaterials: updatedRawMaterials
      };
    }
    case 'ADD_PRODUCT': {
      // Invalidate product cache
      invalidateCacheByPrefix('products');
      
      // If product has variants, add them as separate products with isVariant flag
      let newProducts = [action.payload];
      
      if (action.payload.hasVariants && action.payload.variants) {
        const variants = action.payload.variants.map(variant => {
          // Create a product-like object for each variant
          return {
            id: variant.id,
            parentProductId: action.payload.id,
            name: `${action.payload.name} - ${variant.name}`,
            description: variant.description || action.payload.description,
            category: action.payload.category,
            price: variant.price || action.payload.price,
            stock: variant.stock || 0,
            barcode: variant.sku || `${action.payload.barcode}-${variant.name.substring(0, 2).toUpperCase()}`,
            image: variant.image || action.payload.image,
            color: variant.color,
            material: variant.material,
            hasSizes: variant.hasSizes,
            sizes: variant.sizes || [],
            rawMaterials: variant.rawMaterials || [],
            isVariant: true,
            variantName: variant.name,
            parentProductName: action.payload.name
          };
        });
        
        newProducts = [...newProducts, ...variants];
      }
      
      return {
        ...state,
        products: [...state.products, ...newProducts]
      };
    }
    case 'UPDATE_PRODUCT': {
      // Invalidate product cache
      invalidateCacheByPrefix('products');
      
      // Handle variants update
      let updatedProducts = state.products.map(product =>
        product.id === action.payload.id ? action.payload : product
      );
      
      // Remove old variants of this product
      updatedProducts = updatedProducts.filter(product => 
        !(product.isVariant && product.parentProductId === action.payload.id)
      );
      
      // Add updated variants if any
      if (action.payload.hasVariants && action.payload.variants) {
        const newVariants = action.payload.variants.map(variant => {
          return {
            id: variant.id,
            parentProductId: action.payload.id,
            name: `${action.payload.name} - ${variant.name}`,
            description: variant.description || action.payload.description,
            category: action.payload.category,
            price: variant.price || action.payload.price,
            stock: variant.stock || 0,
            barcode: variant.sku || `${action.payload.barcode}-${variant.name.substring(0, 2).toUpperCase()}`,
            image: variant.image || action.payload.image,
            color: variant.color,
            material: variant.material,
            hasSizes: variant.hasSizes,
            sizes: variant.sizes || [],
            rawMaterials: variant.rawMaterials || [],
            isVariant: true,
            variantName: variant.name,
            parentProductName: action.payload.name
          };
        });
        
        updatedProducts = [...updatedProducts, ...newVariants];
      }
      
      return {
        ...state,
        products: updatedProducts
      };
    }
    case 'DELETE_PRODUCT': {
      // Invalidate product cache
      invalidateCacheByPrefix('products');
      
      // Also delete all variants of this product
      return {
        ...state,
        products: state.products.filter(product => 
          product.id !== action.payload && product.parentProductId !== action.payload
        )
      };
    }
    case 'ADD_RAW_MATERIAL': {
      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');
      return {
        ...state,
        rawMaterials: [...state.rawMaterials, action.payload]
      };
    }
    case 'UPDATE_RAW_MATERIAL': {
      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');
      return {
        ...state,
        rawMaterials: state.rawMaterials.map(material =>
          material.id === action.payload.id ? action.payload : material
        )
      };
    }
    case 'DELETE_RAW_MATERIAL': {
      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');
      return {
        ...state,
        rawMaterials: state.rawMaterials.filter(material => material.id !== action.payload)
      };
    }
    case 'UPDATE_RAW_MATERIAL_STOCK': {
      // Invalidate raw materials cache
      invalidateCacheByPrefix('raw-materials');
      
      // Check if we're adding or removing stock
      const isAdding = action.payload.isAdding || false;
      const quantityChange = isAdding ? action.payload.quantity : -action.payload.quantity;
      
      return {
        ...state,
        rawMaterials: state.rawMaterials.map(material =>
          material.id === action.payload.materialId
            ? { ...material, stockQuantity: Math.max(0, material.stockQuantity + quantityChange) }
            : material
        )
      };
    }
    case 'ADD_COUPON': {
      // Invalidate coupons cache
      invalidateCacheByPrefix('coupons');
      return {
        ...state,
        coupons: [...(state.coupons || []), action.payload]
      };
    }
    case 'UPDATE_COUPON': {
      // Invalidate coupons cache
      invalidateCacheByPrefix('coupons');
      return {
        ...state,
        coupons: (state.coupons || []).map(coupon =>
          coupon.id === action.payload.id ? action.payload : coupon
        )
      };
    }
    case 'DELETE_COUPON': {
      // Invalidate coupons cache
      invalidateCacheByPrefix('coupons');
      return {
        ...state,
        coupons: (state.coupons || []).filter(coupon => coupon.id !== action.payload)
      };
    }
    case 'ADD_TAX': {
      // Invalidate taxes cache
      invalidateCacheByPrefix('taxes');
      return {
        ...state,
        taxes: [...(state.taxes || []), action.payload]
      };
    }
    case 'UPDATE_TAX': {
      // Invalidate taxes cache
      invalidateCacheByPrefix('taxes');
      return {
        ...state,
        taxes: (state.taxes || []).map(tax =>
          tax.id === action.payload.id ? action.payload : tax
        )
      };
    }
    case 'DELETE_TAX': {
      // Invalidate taxes cache
      invalidateCacheByPrefix('taxes');
      return {
        ...state,
        taxes: (state.taxes || []).filter(tax => tax.id !== action.payload)
      };
    }
    case 'ADD_PURCHASE_ORDER': {
      return {
        ...state,
        purchaseOrders: [action.payload, ...(state.purchaseOrders || [])]
      };
    }
    case 'UPDATE_PURCHASE_ORDER': {
      return {
        ...state,
        purchaseOrders: (state.purchaseOrders || []).map(order =>
          order.id === action.payload.id ? action.payload : order
        )
      };
    }
    case 'DELETE_PURCHASE_ORDER': {
      return {
        ...state,
        purchaseOrders: (state.purchaseOrders || []).filter(order => order.id !== action.payload)
      };
    }
    case 'ADD_CATEGORY': {
      // Invalidate categories cache
      invalidateCacheByPrefix('categories');
      return {
        ...state,
        categories: [...(state.categories || []), action.payload]
      };
    }
    case 'UPDATE_CATEGORY': {
      // Invalidate categories cache
      invalidateCacheByPrefix('categories');
      return {
        ...state,
        categories: (state.categories || []).map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    }
    case 'DELETE_CATEGORY': {
      // Invalidate categories cache
      invalidateCacheByPrefix('categories');
      return {
        ...state,
        categories: (state.categories || []).filter(category => category.id !== action.payload)
      };
    }
    default:
      return state;
  }
}

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const [state, dispatch] = useReducer(posReducer, initialState);
  const { logAction } = useAuth();
  const { addNotification, checkStockLevels } = useNotifications();

  // Enhanced dispatch that logs actions
  const enhancedDispatch = (action) => {
    // Log certain actions to audit trail
    const loggableActions = {
      'ADD_PRODUCT': { module: 'products', action: 'CREATE' },
      'UPDATE_PRODUCT': { module: 'products', action: 'UPDATE' },
      'DELETE_PRODUCT': { module: 'products', action: 'DELETE' },
      'ADD_RAW_MATERIAL': { module: 'raw-materials', action: 'CREATE' },
      'UPDATE_RAW_MATERIAL': { module: 'raw-materials', action: 'UPDATE' },
      'DELETE_RAW_MATERIAL': { module: 'raw-materials', action: 'DELETE' },
      'ADD_TRANSACTION': { module: 'transactions', action: 'CREATE' },
      'UPDATE_TRANSACTION': { module: 'transactions', action: 'UPDATE' },
      'ADD_COUPON': { module: 'coupons', action: 'CREATE' },
      'UPDATE_COUPON': { module: 'coupons', action: 'UPDATE' },
      'DELETE_COUPON': { module: 'coupons', action: 'DELETE' },
      'ADD_TAX': { module: 'tax', action: 'CREATE' },
      'ADD_PURCHASE_ORDER': { module: 'purchase-orders', action: 'CREATE' },
      'UPDATE_PURCHASE_ORDER': { module: 'purchase-orders', action: 'UPDATE' },
      'DELETE_PURCHASE_ORDER': { module: 'purchase-orders', action: 'DELETE' },
      'UPDATE_TAX': { module: 'tax', action: 'UPDATE' },
      'DELETE_TAX': { module: 'tax', action: 'DELETE' },
      'UPDATE_PRODUCT_STOCK': { module: 'products', action: 'UPDATE' },
      'RESTORE_PRODUCT_STOCK': { module: 'products', action: 'UPDATE' },
      'UPDATE_RAW_MATERIAL_STOCK': { module: 'raw-materials', action: 'UPDATE' },
    };

    const logInfo = loggableActions[action.type];
    if (logInfo && logAction) {
      const description = getActionDescription(action);
      logAction(logInfo.action, logInfo.module, description, action.payload);
    }

    // Check for stock-related actions
    const stockActions = [
      'UPDATE_PRODUCT_STOCK', 
      'RESTORE_PRODUCT_STOCK',
      'UPDATE_RAW_MATERIAL_STOCK',
      'ADD_TRANSACTION'
    ];
    
    // Execute the action
    dispatch(action);
    
    // Check stock levels after stock-related actions
    if (stockActions.includes(action.type) && checkStockLevels) {
      // Use setTimeout to ensure state is updated first
      setTimeout(() => {
        checkStockLevels(state.rawMaterials, state.products);
      }, 0);
    }
    
    // Send notifications for certain actions
    if (action.type === 'ADD_TRANSACTION' && addNotification) {
      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: `Transaction ${action.payload.id} completed for LKR ${action.payload.total.toFixed(2)}`,
        icon: 'receipt_long',
        category: 'transaction',
        navigateTo: 'transactions'
      });
    }
  };

  const getActionDescription = (action) => {
    switch (action.type) {
      case 'ADD_PRODUCT':
        return `Created new product: ${action.payload.name}`;
      case 'UPDATE_PRODUCT':
        return `Updated product: ${action.payload.name}`;
      case 'DELETE_PRODUCT':
        return `Deleted product with ID: ${action.payload}`;
      case 'ADD_RAW_MATERIAL':
        return `Added raw material: ${action.payload.name}`;
      case 'UPDATE_RAW_MATERIAL':
        return `Updated raw material: ${action.payload.name}`;
      case 'DELETE_RAW_MATERIAL':
        return `Deleted raw material with ID: ${action.payload}`;
      case 'ADD_TRANSACTION':
        return `Completed transaction: ${action.payload.id} (LKR ${action.payload.total.toFixed(2)})`;
      case 'UPDATE_TRANSACTION':
        return `Updated transaction: ${action.payload.id}`;
      case 'ADD_COUPON':
        return `Created coupon: ${action.payload.code}`;
      case 'UPDATE_COUPON':
        return `Updated coupon: ${action.payload.code}`;
      case 'DELETE_COUPON':
        return `Deleted coupon with ID: ${action.payload}`;
      case 'ADD_TAX':
        return `Created tax: ${action.payload.name} (${action.payload.rate}%)`;
      case 'UPDATE_TAX':
        return `Updated tax: ${action.payload.name} (${action.payload.rate}%)`;
      case 'DELETE_TAX':
        return `Deleted tax with ID: ${action.payload}`;
      case 'ADD_PURCHASE_ORDER':
        return `Created purchase order: ${action.payload.id} (LKR ${action.payload.total?.toFixed(2) || '0.00'})`;
      case 'UPDATE_PURCHASE_ORDER':
        return `Updated purchase order: ${action.payload.id}`;
      case 'DELETE_PURCHASE_ORDER':
        return `Deleted purchase order with ID: ${action.payload}`;
      case 'UPDATE_PRODUCT_STOCK':
        return `Updated product stock: ${action.payload.productId} (-${action.payload.quantity} units)`;
      case 'RESTORE_PRODUCT_STOCK':
        return `Restored product stock: ${action.payload.productId} (+${action.payload.quantity} units)`;
      case 'UPDATE_RAW_MATERIAL_STOCK':
        return `Updated raw material stock: ${action.payload.materialId} (-${action.payload.quantity} units)`;
      default:
        return 'System action performed';
    }
  };

  // Cached data access methods
  const getProducts = async () => {
    return state.products;
  };

  const getRawMaterials = async () => {
    return state.rawMaterials;
  };

  const getTransactions = async () => {
    return state.transactions;
  };

  const getCoupons = async () => {
    return state.coupons;
  };

  const getTaxes = async () => {
    return state.taxes;
  };

  const getCategories = async () => {
    return state.categories;
  };

  return (
    <POSContext.Provider value={{ 
      state, 
      dispatch: enhancedDispatch,
      getProducts,
      getRawMaterials,
      getTransactions,
      getCoupons,
      getTaxes,
      getCategories
    }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}