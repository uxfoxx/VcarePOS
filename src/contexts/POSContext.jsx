import React, { createContext, useContext, useReducer } from 'react';
import { mockProducts, mockRawMaterials, mockTransactions, mockCoupons, mockTaxes, mockCategories } from '../data/mockData';

// Helper function to get all product variations as individual products
const getAllProductVariations = (products) => {
  const allProducts = [];
  
  products.forEach(product => {
    if (product.hasVariations && product.variations && product.variations.length > 0) {
      // Add each variation as a separate product
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
          // Additional fields for variation tracking
          parentProductId: product.id,
          parentProductName: product.name,
          variationId: variation.id,
          variationName: variation.name,
          isVariation: true
        });
      });
    } else {
      // Add regular product without variations
      allProducts.push({
        ...product,
        isVariation: false,
        parentProductId: null,
        variationId: null,
        variationName: null
      });
    }
  });
  
  return allProducts;
};

const initialState = {
  cart: [],
  products: mockProducts, // Original products with variations
  allProducts: getAllProductVariations(mockProducts), // Flattened list for display
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
    case 'UPDATE_PRODUCT_STOCK': {
      const updatedAllProducts = state.allProducts.map(product => {
        if (product.id === action.payload.productId) {
          return { ...product, stock: product.stock - action.payload.quantity };
        }
        return product;
      });

      // Also update the original products structure
      const updatedProducts = state.products.map(product => {
        if (product.hasVariations) {
          const updatedVariations = product.variations.map(variation => {
            if (variation.id === action.payload.productId) {
              return { ...variation, stock: variation.stock - action.payload.quantity };
            }
            return variation;
          });
          return { ...product, variations: updatedVariations };
        } else if (product.id === action.payload.productId) {
          return { ...product, stock: product.stock - action.payload.quantity };
        }
        return product;
      });

      // Update raw materials stock
      const productToUpdate = updatedAllProducts.find(p => p.id === action.payload.productId);
      const updatedRawMaterials = state.rawMaterials.map(rawMaterial => {
        if (productToUpdate && productToUpdate.rawMaterials) {
          const materialUsage = productToUpdate.rawMaterials.find(m => m.rawMaterialId === rawMaterial.id);
          if (materialUsage) {
            const totalUsed = materialUsage.quantity * action.payload.quantity;
            return {
              ...rawMaterial,
              stockQuantity: Math.max(0, rawMaterial.stockQuantity - totalUsed)
            };
          }
        }
        return rawMaterial;
      });

      return {
        ...state,
        products: updatedProducts,
        allProducts: updatedAllProducts,
        rawMaterials: updatedRawMaterials
      };
    }
    case 'ADD_PRODUCT': {
      const newProducts = [...state.products, action.payload];
      return {
        ...state,
        products: newProducts,
        allProducts: getAllProductVariations(newProducts)
      };
    }
    case 'UPDATE_PRODUCT': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id ? action.payload : product
      );
      return {
        ...state,
        products: updatedProducts,
        allProducts: getAllProductVariations(updatedProducts)
      };
    }
    case 'DELETE_PRODUCT': {
      const updatedProducts = state.products.filter(product => product.id !== action.payload);
      return {
        ...state,
        products: updatedProducts,
        allProducts: getAllProductVariations(updatedProducts)
      };
    }
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