import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '../utils/supabaseClient';
import {
  productsApi, 
  rawMaterialsApi, 
  transactionsApi, 
  couponsApi, 
  taxesApi, 
  categoriesApi,
  purchaseOrdersApi
} from '../api/apiClient';

const POSContext = createContext(null);

export function POSProvider({ children }) {
  // State
  const [state, setState] = useState({ 
    cart: [], // Initialize with empty arrays to prevent undefined errors
    products: [], 
    rawMaterials: [],
    transactions: [],
    coupons: [],
    taxes: [],
    categories: [],
    purchaseOrders: [],
    loading: true 
  });
  const [loading, setLoading] = useState(true);

  const { logAction } = useAuth();
  const { addNotification, checkStockLevels } = useNotifications();

  // Destructure state for easier access
  const {
    cart, 
    products, 
    rawMaterials, 
    transactions, 
    coupons, 
    taxes, 
    categories, 
    purchaseOrders
  } = state;

  // Load data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all initial data
  const fetchInitialData = async () => {
    setLoading(true);
    
    try {
      try {
        // Try API first
        const [
          productsData,
          rawMaterialsData,
          transactionsData,
          couponsData,
          taxesData,
          categoriesData,
          purchaseOrdersData 
        ] = await Promise.all([
          productsApi.getAll(),
          rawMaterialsApi.getAll(),
          transactionsApi.getAll(),
          couponsApi.getAll(),
          taxesApi.getAll(),
          categoriesApi.getAll(),
          purchaseOrdersApi.getAll()
        ]);

        setState(prev => ({
          ...prev,
          products: productsData,
          rawMaterials: rawMaterialsData,
          transactions: transactionsData,
          coupons: couponsData,
          taxes: taxesData,
          categories: categoriesData,
          purchaseOrders: purchaseOrdersData
        }));
      } catch (apiError) {
        console.error('API fetch failed, falling back to Supabase:', apiError);

        try {
          // Check if Supabase is configured
          if (!supabase || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.error('Supabase is not properly configured. Please connect to Supabase first.');
            throw new Error('Supabase not configured');
          }
          
          // Fetch data from Supabase
          const { data: productsData, error: productsError } = await supabase.from('products').select('*');
          if (productsError) throw productsError;
          
          const { data: rawMaterialsData, error: materialsError } = await supabase.from('raw_materials').select('*');
          if (materialsError) throw materialsError;
          
          const { data: transactionsData, error: transactionsError } = await supabase.from('transactions').select('*');
          if (transactionsError) throw transactionsError;
          
          const { data: couponsData, error: couponsError } = await supabase.from('coupons').select('*');
          if (couponsError) throw couponsError;
          
          const { data: taxesData, error: taxesError } = await supabase.from('taxes').select('*');
          if (taxesError) throw taxesError;
          
          const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
          if (categoriesError) throw categoriesError;
          
          const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase.from('purchase_orders').select('*');
          if (purchaseOrdersError) throw purchaseOrdersError;
          
          // Get product sizes
          const { data: sizesData, error: sizesError } = await supabase.from('product_sizes').select('*');
          if (sizesError) throw sizesError;
          
          // Get product raw materials
          const { data: productMaterialsData, error: productMaterialsError } = await supabase.from('product_raw_materials').select('*');
          if (productMaterialsError) throw productMaterialsError;
          
          // Get transaction items
          const { data: transactionItemsData, error: transactionItemsError } = await supabase.from('transaction_items').select('*');
          if (transactionItemsError) throw transactionItemsError;

          // Process products to include sizes and materials
          const processedProducts = (productsData || []).map(product => {
            // Find sizes for this product
            const sizes = (sizesData || [])
              .filter(size => size.product_id === product.id)
              .map(size => ({
                id: size.id,
                name: size.name,
                price: size.price,
                stock: size.stock,
                dimensions: size.dimensions,
                weight: size.weight
              }));

            // Find raw materials for this product
            const materials = (productMaterialsData || [])
              .filter(material => material.product_id === product.id)
              .map(material => ({
                rawMaterialId: material.raw_material_id,
                quantity: material.quantity
              }));

            return {
              ...product,
              sizes: sizes,
              rawMaterials: materials
            };
          });
          
          // Process transactions to include items
          const processedTransactions = (transactionsData || []).map(transaction => {
            // Find items for this transaction
            const items = (transactionItemsData || [])
              .filter(item => item.transaction_id === transaction.id)
              .map(item => ({
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  price: item.product_price,
                  barcode: item.product_barcode,
                  category: item.product_category
                },
                quantity: item.quantity,
                selectedSize: item.selected_size,
                selectedVariant: item.selected_variant,
                addons: item.addons
              }));

            return {
              ...transaction,
              items: items
            };
          });

          setState(prev => ({
            ...prev,
            products: processedProducts || [],
            rawMaterials: rawMaterialsData || [],
            transactions: processedTransactions || [],
            coupons: couponsData || [],
            taxes: taxesData || [],
            categories: categoriesData || [],
            purchaseOrders: purchaseOrdersData || []
          }));
        } catch (supabaseError) {
          console.error('Supabase fetch failed:', supabaseError);
          // Keep the state with empty arrays if Supabase fails
        }
      }

      // Check stock levels
      if (checkStockLevels && Array.isArray(state.rawMaterials) && Array.isArray(state.products)) {
        checkStockLevels(state.rawMaterials, state.products);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Cart actions
  const addToCart = (product) => {
    // Ensure addons is always an array
    const productWithAddons = {
      ...product, 
      addons: product.addons || []
    };
    
    const existingItem = state.cart.find(item => 
      item.product.id === productWithAddons.id && 
      item.selectedSize === productWithAddons.selectedSize &&
      JSON.stringify(item.product.addons || []) === JSON.stringify(productWithAddons.addons || [])
    );
    
    if (existingItem) { 
      setState(prev => ({
        ...prev,
        cart: prev.cart.map(item =>
        item.product.id === productWithAddons.id && 
        item.selectedSize === productWithAddons.selectedSize &&
        JSON.stringify(item.product.addons || []) === JSON.stringify(productWithAddons.addons || [])
          ? { ...item, quantity: item.quantity + 1 }
          : item
        )
      }));
    } else { 
      setState(prev => ({
        ...prev,
        cart: [...prev.cart, { 
        product: productWithAddons, 
        quantity: 1,
        selectedSize: productWithAddons.selectedSize || null
        }]
      }));
    }
  };

  const removeFromCart = (productId, selectedSize) => { 
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => 
      !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    }));
  };

  const updateQuantity = (productId, selectedSize, quantity) => { 
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
      item.product.id === productId && item.selectedSize === selectedSize
        ? { ...item, quantity }
        : item
      ).filter(item => item.quantity > 0)
    }));
  };

  const clearCart = () => { 
    setState(prev => ({
      ...prev,
      cart: []
    }));
  };

  // Product actions
  const addProduct = async (product) => { 
    try {
      const newProduct = await productsApi.create(product);
      setState(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, product) => { 
    try {
      const updatedProduct = await productsApi.update(id, product);
      
      // Update products state
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => 
        p.id === id ? updatedProduct : p
        )
      }));
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => { 
    try {
      await productsApi.delete(id);
      
      // Update products state
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const updateProductStock = async (productId, quantity, selectedSize) => { 
    try {
      const updatedProduct = await productsApi.updateStock(
        productId, 
        quantity, 
        'subtract', 
        selectedSize
      );
      
      // Update products state
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => 
        p.id === productId ? updatedProduct : p
        )
      }));
      
      // Check stock levels
      if (checkStockLevels && state.rawMaterials && state.products) {
        checkStockLevels(state.rawMaterials, state.products);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  };

  const restoreProductStock = async (productId, quantity, selectedSize) => { 
    try {
      const updatedProduct = await productsApi.updateStock(
        productId, 
        quantity, 
        'add', 
        selectedSize
      );
      
      // Update products state
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => 
        p.id === productId ? updatedProduct : p
        )
      }));
      
      // Check stock levels
      if (checkStockLevels && state.rawMaterials && state.products) {
        checkStockLevels(state.rawMaterials, state.products);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error restoring product stock:', error);
      throw error;
    }
  };

  // Raw Material actions
  const addRawMaterial = async (material) => { 
    try {
      const newMaterial = await rawMaterialsApi.create(material);
      setState(prev => ({
        ...prev,
        rawMaterials: [...prev.rawMaterials, newMaterial]
      }));
      return newMaterial;
    } catch (error) {
      console.error('Error adding raw material:', error);
      throw error;
    }
  };

  const updateRawMaterial = async (id, material) => { 
    try {
      const updatedMaterial = await rawMaterialsApi.update(id, material);
      
      // Update raw materials state
      setState(prev => ({
        ...prev,
        rawMaterials: prev.rawMaterials.map(m => 
        m.id === id ? updatedMaterial : m
        )
      }));
      
      return updatedMaterial;
    } catch (error) {
      console.error('Error updating raw material:', error);
      throw error;
    }
  };

  const deleteRawMaterial = async (id) => { 
    try {
      await rawMaterialsApi.delete(id);
      
      // Update raw materials state
      setState(prev => ({
        ...prev,
        rawMaterials: prev.rawMaterials.filter(m => m.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting raw material:', error);
      throw error;
    }
  };

  const updateRawMaterialStock = async (materialId, quantity, isAdding = false) => { 
    try {
      const operation = isAdding ? 'add' : 'subtract';
      const updatedMaterial = await rawMaterialsApi.updateStock(
        materialId, 
        quantity, 
        operation
      );
      
      // Update raw materials state
      setState(prev => ({
        ...prev,
        rawMaterials: prev.rawMaterials.map(m => 
        m.id === materialId ? updatedMaterial : m
        )
      }));
      
      // Check stock levels
      if (checkStockLevels && state.rawMaterials && state.products) {
        checkStockLevels(state.rawMaterials, state.products);
      }
      
      return updatedMaterial;
    } catch (error) {
      console.error('Error updating raw material stock:', error);
      throw error;
    }
  };

  // Transaction actions
  const addTransaction = async (transaction) => { 
    try {
      const newTransaction = await transactionsApi.create(transaction);
      setState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }));
      
      // Send notification
      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Sale Completed',
          message: `Transaction ${newTransaction.id} completed for LKR ${newTransaction.total.toFixed(2)}`,
          icon: 'receipt_long',
          category: 'transaction',
          navigateTo: 'transactions'
        });
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id, transaction) => { 
    try {
      const updatedTransaction = await transactionsApi.update(id, transaction);
      
      // Update transactions state
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
        t.id === id ? updatedTransaction : t
        )
      }));
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const updateTransactionStatus = async (id, status) => { 
    try {
      const result = await transactionsApi.updateStatus(id, status);
      
      // Update transactions state
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, status } : t
        )
      }));
      
      return result;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  };

  // Coupon actions 
  const addCoupon = async (coupon) => {
    try {
      const newCoupon = await couponsApi.create(coupon);
      setState(prev => ({
        ...prev,
        coupons: [...prev.coupons, newCoupon]
      }));
      return newCoupon;
    } catch (error) {
      console.error('Error adding coupon:', error);
      throw error;
    }
  };

  const updateCoupon = async (id, coupon) => { 
    try {
      const updatedCoupon = await couponsApi.update(id, coupon);
      
      // Update coupons state
      setState(prev => ({
        ...prev,
        coupons: prev.coupons.map(c => 
        c.id === id ? updatedCoupon : c
        )
      }));
      
      return updatedCoupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  };

  const deleteCoupon = async (id) => { 
    try {
      await couponsApi.delete(id);
      
      // Update coupons state
      setState(prev => ({
        ...prev,
        coupons: prev.coupons.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  };

  // Tax actions 
  const addTax = async (tax) => {
    try {
      const newTax = await taxesApi.create(tax);
      setState(prev => ({
        ...prev,
        taxes: [...prev.taxes, newTax]
      }));
      return newTax;
    } catch (error) {
      console.error('Error adding tax:', error);
      throw error;
    }
  };

  const updateTax = async (id, tax) => { 
    try {
      const updatedTax = await taxesApi.update(id, tax);
      
      // Update taxes state
      setState(prev => ({
        ...prev,
        taxes: prev.taxes.map(t => 
        t.id === id ? updatedTax : t
        )
      }));
      
      return updatedTax;
    } catch (error) {
      console.error('Error updating tax:', error);
      throw error;
    }
  };

  const deleteTax = async (id) => { 
    try {
      await taxesApi.delete(id);
      
      // Update taxes state
      setState(prev => ({
        ...prev,
        taxes: prev.taxes.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting tax:', error);
      throw error;
    }
  };

  // Category actions 
  const addCategory = async (category) => {
    try {
      const newCategory = await categoriesApi.create(category);
      setState(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, category) => { 
    try {
      const updatedCategory = await categoriesApi.update(id, category);
      
      // Update categories state
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => 
        c.id === id ? updatedCategory : c
        )
      }));
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => { 
    try {
      await categoriesApi.delete(id);
      
      // Update categories state
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Purchase Order actions 
  const addPurchaseOrder = async (order) => {
    try {
      const newOrder = await purchaseOrdersApi.create(order);
      setState(prev => ({
        ...prev,
        purchaseOrders: [newOrder, ...prev.purchaseOrders]
      }));
      return newOrder;
    } catch (error) {
      console.error('Error adding purchase order:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id, order) => { 
    try {
      const updatedOrder = await purchaseOrdersApi.update(id, order);
      
      // Update purchase orders state
      setState(prev => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.map(o => 
        o.id === id ? updatedOrder : o
        )
      }));
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  };

  const deletePurchaseOrder = async (id) => { 
    try {
      await purchaseOrdersApi.delete(id);
      
      // Update purchase orders state
      setState(prev => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.filter(o => o.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  };

  // Cached data access methods 
  const getProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setState(prev => ({ ...prev, products: data }));
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return products;
    }
  };

  const getRawMaterials = async () => { 
    try {
      const data = await rawMaterialsApi.getAll();
      setState(prev => ({ ...prev, rawMaterials: data }));
      return data;
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      return rawMaterials;
    }
  };

  const getTransactions = async () => { 
    try {
      const data = await transactionsApi.getAll();
      setState(prev => ({ ...prev, transactions: data }));
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return transactions;
    }
  };

  const getCoupons = async () => { 
    try {
      const data = await couponsApi.getAll();
      setState(prev => ({ ...prev, coupons: data }));
      return data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return coupons;
    }
  };

  const getTaxes = async () => { 
    try {
      const data = await taxesApi.getAll();
      setState(prev => ({ ...prev, taxes: data }));
      return data;
    } catch (error) {
      console.error('Error fetching taxes:', error);
      return taxes;
    }
  };

  const getCategories = async () => { 
    try {
      const data = await categoriesApi.getAll();
      setState(prev => ({ ...prev, categories: data }));
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return categories;
    }
  };

  const getPurchaseOrders = async () => { 
    try {
      const data = await purchaseOrdersApi.getAll();
      setState(prev => ({ ...prev, purchaseOrders: data }));
      return data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return purchaseOrders;
    }
  };

  return (
    <POSContext.Provider value={{  
      // State
      ...state,
      
      // Cart actions
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      
      // Product actions
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      restoreProductStock,
      
      // Raw Material actions
      addRawMaterial,
      updateRawMaterial,
      deleteRawMaterial,
      updateRawMaterialStock,
      
      // Transaction actions
      addTransaction,
      updateTransaction,
      updateTransactionStatus,
      
      // Coupon actions
      addCoupon,
      updateCoupon,
      deleteCoupon,
      
      // Tax actions
      addTax,
      updateTax,
      deleteTax,
      
      // Category actions
      addCategory,
      updateCategory,
      deleteCategory,
      
      // Purchase Order actions
      addPurchaseOrder,
      updatePurchaseOrder,
      deletePurchaseOrder,
      
      // Data fetching methods
      getProducts,
      getRawMaterials,
      getTransactions,
      getCoupons,
      getTaxes,
      getCategories,
      getPurchaseOrders,
      
      // Refresh all data
      refreshData: fetchInitialData
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