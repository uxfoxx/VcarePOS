import React, { createContext, useContext, useReducer } from 'react';
import { mockProducts, mockRawMaterials, mockTransactions, mockCoupons } from '../data/mockData';

const initialState = {
  cart: [],
  products: mockProducts,
  rawMaterials: mockRawMaterials,
  transactions: mockTransactions,
  coupons: mockCoupons,
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
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId
            ? { ...product, stock: product.stock - action.payload.quantity }
            : product
        )
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