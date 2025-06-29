import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { 
  mockProducts, 
  mockRawMaterials, 
  mockTransactions, 
  mockCoupons, 
  mockTaxes, 
  mockCategories,
  mockVariantTypes,
  mockVariantOptions
} from '../data/mockData';

// Helper function to get all product variants as individual products for display
const getAllProductVariations = (products, variantTypes, variantOptions) => {
  const allProducts = [];
  
  products.forEach(product => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      // Add each variant as a separate product
      product.variants.forEach(variant => {
        // Build variant display name
        const variantNames = [];
        Object.entries(variant.combination).forEach(([typeId, optionId]) => {
          const option = variantOptions.find(opt => opt.id === optionId);
          if (option) {
            variantNames.push(option.name);
          }
        });
        
        allProducts.push({
          id: variant.id,
          name: `${product.name}`,
          price: variant.price,
          category: product.category,
          stock: variant.stock,
          barcode: variant.sku,
          image: variant.image || product.image,
          description: product.description,
          dimensions: variant.dimensions || product.baseDimensions,
          weight: variant.weight || product.baseWeight,
          material: variant.material || product.baseMaterial,
          color: variant.color || product.baseColor,
          rawMaterials: variant.rawMaterials || [],
          // Additional fields for variant tracking
          parentProductId: product.id,
          parentProductName: product.name,
          variantId: variant.id,
          variantCombination: variant.combination,
          variantDisplay: variantNames.join(', '),
          isVariant: true
        });
      });
    } else {
      // Add regular product without variants
      allProducts.push({
        ...product,
        isVariant: false,
        parentProductId: null,
        variantId: null,
        variantCombination: null,
        variantDisplay: null
      });
    }
  });
  
  return allProducts;
};

const initialState = {
  cart: [],
  products: mockProducts, // Original products with variants
  allProducts: getAllProductVariations(mockProducts, mockVariantTypes, mockVariantOptions), // Flattened list for display
  rawMaterials: mockRawMaterials,
  transactions: mockTransactions,
  coupons: mockCoupons,
  taxes: mockTaxes,
  categories: mockCategories,
  variantTypes: mockVariantTypes,
  variantOptions: mockVariantOptions,
  taxSettings: {
    rate: 8,
    name: 'Sales Tax',
    defaultTaxId: 'TAX-001'
  },
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
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
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
          return { ...product, stock: Math.max(0, product.stock - action.payload.quantity) };
        }
        return product;
      });

      // Also update the original products structure
      const updatedProducts = state.products.map(product => {
        if (product.hasVariants) {
          const updatedVariants = product.variants.map(variant => {
            if (variant.id === action.payload.productId) {
              return { ...variant, stock: Math.max(0, variant.stock - action.payload.quantity) };
            }
            return variant;
          });
          return { ...product, variants: updatedVariants };
        } else if (product.id === action.payload.productId) {
          return { ...product, stock: Math.max(0, product.stock - action.payload.quantity) };
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
    case 'RESTORE_PRODUCT_STOCK': {
      const updatedAllProducts = state.allProducts.map(product => {
        if (product.id === action.payload.productId) {
          return { ...product, stock: product.stock + action.payload.quantity };
        }
        return product;
      });

      // Also update the original products structure
      const updatedProducts = state.products.map(product => {
        if (product.hasVariants) {
          const updatedVariants = product.variants.map(variation => {
            if (variation.id === action.payload.productId) {
              return { ...variation, stock: variation.stock + action.payload.quantity };
            }
            return variation;
          });
          return { ...product, variants: updatedVariants };
        } else if (product.id === action.payload.productId) {
          return { ...product, stock: product.stock + action.payload.quantity };
        }
        return product;
      });

      // Restore raw materials stock
      const productToRestore = updatedAllProducts.find(p => p.id === action.payload.productId);
      const updatedRawMaterials = state.rawMaterials.map(rawMaterial => {
        if (productToRestore && productToRestore.rawMaterials) {
          const materialUsage = productToRestore.rawMaterials.find(m => m.rawMaterialId === rawMaterial.id);
          if (materialUsage) {
            const totalRestored = materialUsage.quantity * action.payload.quantity;
            return {
              ...rawMaterial,
              stockQuantity: rawMaterial.stockQuantity + totalRestored
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
        allProducts: getAllProductVariations(newProducts, state.variantTypes, state.variantOptions)
      };
    }
    case 'UPDATE_PRODUCT': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id ? action.payload : product
      );
      return {
        ...state,
        products: updatedProducts,
        allProducts: getAllProductVariations(updatedProducts, state.variantTypes, state.variantOptions)
      };
    }
    case 'DELETE_PRODUCT': {
      const updatedProducts = state.products.filter(product => product.id !== action.payload);
      return {
        ...state,
        products: updatedProducts,
        allProducts: getAllProductVariations(updatedProducts, state.variantTypes, state.variantOptions)
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
            ? { ...material, stockQuantity: Math.max(0, material.stockQuantity - action.payload.quantity) }
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
    case 'ADD_VARIANT_TYPE':
      return {
        ...state,
        variantTypes: [...state.variantTypes, action.payload]
      };
    case 'UPDATE_VARIANT_TYPE':
      return {
        ...state,
        variantTypes: state.variantTypes.map(type =>
          type.id === action.payload.id ? action.payload : type
        )
      };
    case 'DELETE_VARIANT_TYPE':
      return {
        ...state,
        variantTypes: state.variantTypes.filter(type => type.id !== action.payload),
        variantOptions: state.variantOptions.filter(option => option.variantTypeId !== action.payload)
      };
    case 'ADD_VARIANT_OPTION':
      return {
        ...state,
        variantOptions: [...state.variantOptions, action.payload]
      };
    case 'UPDATE_VARIANT_OPTION':
      return {
        ...state,
        variantOptions: state.variantOptions.map(option =>
          option.id === action.payload.id ? action.payload : option
        )
      };
    case 'DELETE_VARIANT_OPTION':
      return {
        ...state,
        variantOptions: state.variantOptions.filter(option => option.id !== action.payload)
      };
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
      'UPDATE_TAX': { module: 'tax', action: 'UPDATE' },
      'DELETE_TAX': { module: 'tax', action: 'DELETE' },
      'UPDATE_PRODUCT_STOCK': { module: 'products', action: 'UPDATE' },
      'RESTORE_PRODUCT_STOCK': { module: 'products', action: 'UPDATE' },
      'UPDATE_RAW_MATERIAL_STOCK': { module: 'raw-materials', action: 'UPDATE' },
      'ADD_VARIANT_TYPE': { module: 'products', action: 'CREATE' },
      'UPDATE_VARIANT_TYPE': { module: 'products', action: 'UPDATE' },
      'DELETE_VARIANT_TYPE': { module: 'products', action: 'DELETE' },
      'ADD_VARIANT_OPTION': { module: 'products', action: 'CREATE' },
      'UPDATE_VARIANT_OPTION': { module: 'products', action: 'UPDATE' },
      'DELETE_VARIANT_OPTION': { module: 'products', action: 'DELETE' },
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
        checkStockLevels(state.rawMaterials, state.allProducts);
      }, 0);
    }
    
    // Send notifications for certain actions
    if (action.type === 'ADD_TRANSACTION' && addNotification) {
      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: `Transaction ${action.payload.id} completed for $${action.payload.total.toFixed(2)}`,
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
        return `Completed transaction: ${action.payload.id} ($${action.payload.total.toFixed(2)})`;
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
      case 'UPDATE_PRODUCT_STOCK':
        return `Updated product stock: ${action.payload.productId} (-${action.payload.quantity} units)`;
      case 'RESTORE_PRODUCT_STOCK':
        return `Restored product stock: ${action.payload.productId} (+${action.payload.quantity} units)`;
      case 'UPDATE_RAW_MATERIAL_STOCK':
        return `Updated raw material stock: ${action.payload.materialId} (-${action.payload.quantity} units)`;
      case 'ADD_VARIANT_TYPE':
        return `Created variant type: ${action.payload.name}`;
      case 'UPDATE_VARIANT_TYPE':
        return `Updated variant type: ${action.payload.name}`;
      case 'DELETE_VARIANT_TYPE':
        return `Deleted variant type with ID: ${action.payload}`;
      case 'ADD_VARIANT_OPTION':
        return `Created variant option: ${action.payload.name}`;
      case 'UPDATE_VARIANT_OPTION':
        return `Updated variant option: ${action.payload.name}`;
      case 'DELETE_VARIANT_OPTION':
        return `Deleted variant option with ID: ${action.payload}`;
      default:
        return 'System action performed';
    }
  };

  return (
    <POSContext.Provider value={{ state, dispatch: enhancedDispatch }}>
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