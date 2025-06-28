import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../utils/database';
import { performanceMonitor, globalCache } from '../utils/performance';
import { useDebounce } from '../hooks/useDebounce';
import { mockProducts, mockRawMaterials, mockTransactions, mockCoupons, mockTaxes, mockCategories } from '../data/mockData';

// Optimized reducer with performance monitoring
function optimizedPOSReducer(state, action) {
  return performanceMonitor.measure(`reducer_${action.type}`, () => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: { ...state.loading, [action.payload.key]: action.payload.value } };
      
      case 'SET_CACHE':
        globalCache.set(action.payload.key, action.payload.value);
        return state;
      
      case 'BATCH_UPDATE':
        return { ...state, ...action.payload };
      
      case 'ADD_TO_CART': {
        const existingItem = state.cart.find(item => item.product.id === action.payload.id);
        if (existingItem) {
          return {
            ...state,
            cart: state.cart.map(item =>
              item.product.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        return {
          ...state,
          cart: [...state.cart, { product: action.payload, quantity: 1 }]
        };
      }
      
      case 'REMOVE_FROM_CART':
        return {
          ...state,
          cart: state.cart.filter(item => item.product.id !== action.payload)
        };
      
      case 'UPDATE_QUANTITY':
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          ).filter(item => item.quantity > 0)
        };
      
      case 'CLEAR_CART':
        return { ...state, cart: [] };
      
      // Batch operations for better performance
      case 'BATCH_ADD_PRODUCTS':
        return {
          ...state,
          products: [...state.products, ...action.payload],
          allProducts: getAllProductVariations([...state.products, ...action.payload])
        };
      
      case 'BATCH_UPDATE_STOCK': {
        const stockUpdates = new Map(action.payload.map(update => [update.productId, update.quantity]));
        
        const updatedAllProducts = state.allProducts.map(product => {
          const stockChange = stockUpdates.get(product.id);
          return stockChange ? { ...product, stock: product.stock - stockChange } : product;
        });

        const updatedProducts = state.products.map(product => {
          if (product.hasVariations) {
            const updatedVariations = product.variations.map(variation => {
              const stockChange = stockUpdates.get(variation.id);
              return stockChange ? { ...variation, stock: variation.stock - stockChange } : variation;
            });
            return { ...product, variations: updatedVariations };
          } else {
            const stockChange = stockUpdates.get(product.id);
            return stockChange ? { ...product, stock: product.stock - stockChange } : product;
          }
        });

        return {
          ...state,
          products: updatedProducts,
          allProducts: updatedAllProducts
        };
      }
      
      default:
        return state;
    }
  });
}

// Helper function with memoization
const getAllProductVariations = (products) => {
  const cacheKey = `variations_${products.length}_${products.map(p => p.id).join('_')}`;
  const cached = globalCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const allProducts = [];
  
  products.forEach(product => {
    if (product.hasVariations && product.variations && product.variations.length > 0) {
      product.variations.forEach(variation => {
        allProducts.push({
          id: variation.id,
          name: `${product.name} - ${variation.name}`,
          price: variation.price,
          category: product.category,
          stock: variation.stock,
          barcode: variation.sku,
          image: variation.image || product.image,
          description: variation.description || product.description,
          dimensions: variation.dimensions || product.baseDimensions,
          weight: variation.weight || product.baseWeight,
          material: variation.material || product.baseMaterial,
          color: variation.color || product.baseColor,
          rawMaterials: variation.rawMaterials || [],
          parentProductId: product.id,
          parentProductName: product.name,
          variationId: variation.id,
          variationName: variation.name,
          isVariation: true
        });
      });
    } else {
      allProducts.push({
        ...product,
        isVariation: false,
        parentProductId: null,
        variationId: null,
        variationName: null
      });
    }
  });
  
  globalCache.set(cacheKey, allProducts);
  return allProducts;
};

const initialState = {
  cart: [],
  products: mockProducts,
  allProducts: getAllProductVariations(mockProducts),
  rawMaterials: mockRawMaterials,
  transactions: mockTransactions,
  coupons: mockCoupons,
  taxes: mockTaxes,
  categories: mockCategories,
  taxSettings: {
    rate: 8,
    name: 'Sales Tax',
    defaultTaxId: 'TAX-001'
  },
  customers: [],
  loading: {},
  pagination: {
    products: { page: 1, limit: 20 },
    transactions: { page: 1, limit: 10 },
    rawMaterials: { page: 1, limit: 15 }
  }
};

const OptimizedPOSContext = createContext(null);

export function OptimizedPOSProvider({ children }) {
  const [state, dispatch] = useReducer(optimizedPOSReducer, initialState);
  const { logAction } = useAuth();

  // Memoized selectors for better performance
  const selectors = useMemo(() => ({
    getProductsByCategory: (category) => {
      const cacheKey = `products_category_${category}`;
      const cached = globalCache.get(cacheKey);
      
      if (cached) return cached;
      
      const filtered = state.allProducts.filter(product => 
        category === 'All' || product.category === category
      );
      
      globalCache.set(cacheKey, filtered);
      return filtered;
    },
    
    getLowStockProducts: () => {
      const cacheKey = 'low_stock_products';
      const cached = globalCache.get(cacheKey);
      
      if (cached) return cached;
      
      const lowStock = state.allProducts.filter(product => product.stock <= 5);
      globalCache.set(cacheKey, lowStock);
      return lowStock;
    },
    
    getTransactionsByDateRange: (startDate, endDate) => {
      const cacheKey = `transactions_${startDate}_${endDate}`;
      const cached = globalCache.get(cacheKey);
      
      if (cached) return cached;
      
      const filtered = state.transactions.filter(transaction => {
        const date = new Date(transaction.timestamp);
        return date >= startDate && date <= endDate;
      });
      
      globalCache.set(cacheKey, filtered);
      return filtered;
    }
  }), [state.allProducts, state.transactions]);

  // Optimized dispatch with batching
  const optimizedDispatch = useCallback((action) => {
    performanceMonitor.measure('dispatch_total', () => {
      // Log certain actions to audit trail
      const loggableActions = {
        'ADD_PRODUCT': { module: 'products', action: 'CREATE' },
        'UPDATE_PRODUCT': { module: 'products', action: 'UPDATE' },
        'DELETE_PRODUCT': { module: 'products', action: 'DELETE' },
        'ADD_TRANSACTION': { module: 'transactions', action: 'CREATE' },
      };

      const logInfo = loggableActions[action.type];
      if (logInfo && logAction) {
        const description = getActionDescription(action);
        logAction(logInfo.action, logInfo.module, description, action.payload);
      }

      dispatch(action);
      
      // Clear relevant cache entries
      if (action.type.includes('PRODUCT')) {
        globalCache.clear();
      }
    });
  }, [logAction]);

  // Batch operations for better performance
  const batchOperations = useMemo(() => ({
    batchAddToCart: (products) => {
      const updates = products.map(product => ({
        type: 'ADD_TO_CART',
        payload: product
      }));
      
      updates.forEach(update => optimizedDispatch(update));
    },
    
    batchUpdateStock: (stockUpdates) => {
      optimizedDispatch({
        type: 'BATCH_UPDATE_STOCK',
        payload: stockUpdates
      });
    }
  }), [optimizedDispatch]);

  // Database operations with caching
  const databaseOperations = useMemo(() => ({
    async saveToDatabase(table, data) {
      performanceMonitor.measure(`db_save_${table}`, async () => {
        await db.create(table, data);
        globalCache.clear(); // Clear cache after database changes
      });
    },
    
    async loadFromDatabase(table, conditions = {}) {
      const cacheKey = `db_${table}_${JSON.stringify(conditions)}`;
      const cached = globalCache.get(cacheKey);
      
      if (cached) return cached;
      
      const result = await performanceMonitor.measureAsync(`db_load_${table}`, async () => {
        return await db.query(table, conditions);
      });
      
      globalCache.set(cacheKey, result);
      return result;
    },
    
    async paginatedLoad(table, page, limit, conditions = {}) {
      return await performanceMonitor.measureAsync(`db_paginated_${table}`, async () => {
        return await db.paginate(table, page, limit, conditions);
      });
    }
  }), []);

  const getActionDescription = (action) => {
    switch (action.type) {
      case 'ADD_PRODUCT':
        return `Created new product: ${action.payload.name}`;
      case 'UPDATE_PRODUCT':
        return `Updated product: ${action.payload.name}`;
      case 'DELETE_PRODUCT':
        return `Deleted product with ID: ${action.payload}`;
      case 'ADD_TRANSACTION':
        return `Completed transaction: ${action.payload.id} ($${action.payload.total.toFixed(2)})`;
      default:
        return 'System action performed';
    }
  };

  // Cleanup function to prevent memory leaks
  React.useEffect(() => {
    const cleanup = () => {
      globalCache.clear();
      performanceMonitor.clearMetrics();
      db.clearCache();
    };

    // Cleanup every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, []);

  const contextValue = useMemo(() => ({
    state,
    dispatch: optimizedDispatch,
    selectors,
    batchOperations,
    databaseOperations,
    performanceMetrics: performanceMonitor.getMetrics.bind(performanceMonitor)
  }), [state, optimizedDispatch, selectors, batchOperations, databaseOperations]);

  return (
    <OptimizedPOSContext.Provider value={contextValue}>
      {children}
    </OptimizedPOSContext.Provider>
  );
}

export function useOptimizedPOS() {
  const context = useContext(OptimizedPOSContext);
  if (!context) {
    throw new Error('useOptimizedPOS must be used within an OptimizedPOSProvider');
  }
  return context;
}