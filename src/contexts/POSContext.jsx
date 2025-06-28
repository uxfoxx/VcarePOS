import React, { createContext, useContext, useReducer } from 'react';
import { mockProducts, mockRawMaterials, mockTransactions, mockCoupons, mockTaxes, mockCategories } from '../data/mockData';

const initialState = {
  cart: [],
  products: mockProducts,
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
  currentUser: { name: 'Sarah Wilson', role: 'manager' },
  customers: []
};

function posReducer(state, action) {
  switch (action.type) {
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
      return {
        ...state,
        cart: []
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'UPDATE_TRANSACTION_STATUS':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.transactionId
            ? { ...transaction, status: action.payload.status }
            : transaction
        )
      };
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        products: state.products.map(product => {
          if (product.id === action.payload.productId) {
            const updatedProduct = { ...product, stock: product.stock - action.payload.quantity };
            
            // Also update raw material stock if product has raw materials
            if (updatedProduct.rawMaterials && updatedProduct.rawMaterials.length > 0) {
              updatedProduct.rawMaterials.forEach(material => {
                const totalMaterialUsed = material.quantity * action.payload.quantity;
                // This will be handled by UPDATE_RAW_MATERIAL_STOCK action
                // We'll dispatch it separately to maintain clean separation
              });
            }
            
            return updatedProduct;
          }
          return product;
        }),
        // Update raw materials stock when product is sold
        rawMaterials: state.rawMaterials.map(rawMaterial => {
          const product = state.products.find(p => p.id === action.payload.productId);
          if (product && product.rawMaterials) {
            const materialUsage = product.rawMaterials.find(m => m.rawMaterialId === rawMaterial.id);
            if (materialUsage) {
              const totalUsed = materialUsage.quantity * action.payload.quantity;
              return {
                ...rawMaterial,
                stockQuantity: Math.max(0, rawMaterial.stockQuantity - totalUsed)
              };
            }
          }
          return rawMaterial;
        })
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    case 'ADD_RAW_MATERIAL':
      return {
        ...state,
        rawMaterials: [...state.rawMaterials, action.payload]
      };
    case 'UPDATE_RAW_MATERIAL':
      return {
        ...state,
        rawMaterials: state.rawMaterials.map(material =>
          material.id === action.payload.id ? action.payload : material
        )
      };
    case 'DELETE_RAW_MATERIAL':
      return {
        ...state,
        rawMaterials: state.rawMaterials.filter(material => material.id !== action.payload)
      };
    case 'UPDATE_RAW_MATERIAL_STOCK':
      return {
        ...state,
        rawMaterials: state.rawMaterials.map(material =>
          material.id === action.payload.materialId
            ? { ...material, stockQuantity: material.stockQuantity - action.payload.quantity }
            : material
        )
      };
    case 'ADD_COUPON':
      return {
        ...state,
        coupons: [...(state.coupons || []), action.payload]
      };
    case 'UPDATE_COUPON':
      return {
        ...state,
        coupons: (state.coupons || []).map(coupon =>
          coupon.id === action.payload.id ? action.payload : coupon
        )
      };
    case 'DELETE_COUPON':
      return {
        ...state,
        coupons: (state.coupons || []).filter(coupon => coupon.id !== action.payload)
      };
    case 'ADD_TAX':
      return {
        ...state,
        taxes: [...(state.taxes || []), action.payload]
      };
    case 'UPDATE_TAX':
      return {
        ...state,
        taxes: (state.taxes || []).map(tax =>
          tax.id === action.payload.id ? action.payload : tax
        )
      };
    case 'DELETE_TAX':
      return {
        ...state,
        taxes: (state.taxes || []).filter(tax => tax.id !== action.payload)
      };
    case 'CLEAR_DEFAULT_TAX':
      return {
        ...state,
        taxes: (state.taxes || []).map(tax => ({ ...tax, isDefault: false }))
      };
    case 'UPDATE_TAX_SETTINGS':
      return {
        ...state,
        taxSettings: { ...state.taxSettings, ...action.payload }
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...(state.categories || []), action.payload]
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: (state.categories || []).map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: (state.categories || []).filter(category => category.id !== action.payload)
      };
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload
      };
    default:
      return state;
  }
}

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  return (
    <POSContext.Provider value={{ state, dispatch }}>
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