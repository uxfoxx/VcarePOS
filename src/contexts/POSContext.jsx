import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
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
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logAction } = useAuth();
  const { addNotification, checkStockLevels } = useNotifications();

  // Load data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all initial data
  const fetchInitialData = async () => {
    setLoading(true);
    try {
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

      setProducts(productsData);
      setRawMaterials(rawMaterialsData);
      setTransactions(transactionsData);
      setCoupons(couponsData);
      setTaxes(taxesData);
      setCategories(categoriesData);
      setPurchaseOrders(purchaseOrdersData);

      // Check stock levels
      if (checkStockLevels) {
        checkStockLevels(rawMaterialsData, productsData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cart actions
  const addToCart = (product) => {
    const existingItem = cart.find(item => 
      item.product.id === product.id && 
      item.selectedSize === product.selectedSize &&
      JSON.stringify(item.product.addons || []) === JSON.stringify(product.addons || [])
    );
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id && 
        item.selectedSize === product.selectedSize &&
        JSON.stringify(item.product.addons || []) === JSON.stringify(product.addons || [])
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        product, 
        quantity: 1,
        selectedSize: product.selectedSize || null
      }]);
    }
  };

  const removeFromCart = (productId, selectedSize) => {
    setCart(cart.filter(item => 
      !(item.product.id === productId && item.selectedSize === selectedSize)
    ));
  };

  const updateQuantity = (productId, selectedSize, quantity) => {
    setCart(cart.map(item =>
      item.product.id === productId && item.selectedSize === selectedSize
        ? { ...item, quantity }
        : item
    ).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product actions
  const addProduct = async (product) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts([...products, newProduct]);
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
      setProducts(products.map(p => 
        p.id === id ? updatedProduct : p
      ));
      
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
      setProducts(products.filter(p => p.id !== id));
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
      setProducts(products.map(p => 
        p.id === productId ? updatedProduct : p
      ));
      
      // Check stock levels
      if (checkStockLevels) {
        checkStockLevels(rawMaterials, products);
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
      setProducts(products.map(p => 
        p.id === productId ? updatedProduct : p
      ));
      
      // Check stock levels
      if (checkStockLevels) {
        checkStockLevels(rawMaterials, products);
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
      setRawMaterials([...rawMaterials, newMaterial]);
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
      setRawMaterials(rawMaterials.map(m => 
        m.id === id ? updatedMaterial : m
      ));
      
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
      setRawMaterials(rawMaterials.filter(m => m.id !== id));
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
      setRawMaterials(rawMaterials.map(m => 
        m.id === materialId ? updatedMaterial : m
      ));
      
      // Check stock levels
      if (checkStockLevels) {
        checkStockLevels(rawMaterials, products);
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
      setTransactions([newTransaction, ...transactions]);
      
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
      setTransactions(transactions.map(t => 
        t.id === id ? updatedTransaction : t
      ));
      
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
      setTransactions(transactions.map(t => 
        t.id === id ? { ...t, status } : t
      ));
      
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
      setCoupons([...coupons, newCoupon]);
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
      setCoupons(coupons.map(c => 
        c.id === id ? updatedCoupon : c
      ));
      
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
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  };

  // Tax actions
  const addTax = async (tax) => {
    try {
      const newTax = await taxesApi.create(tax);
      setTaxes([...taxes, newTax]);
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
      setTaxes(taxes.map(t => 
        t.id === id ? updatedTax : t
      ));
      
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
      setTaxes(taxes.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting tax:', error);
      throw error;
    }
  };

  // Category actions
  const addCategory = async (category) => {
    try {
      const newCategory = await categoriesApi.create(category);
      setCategories([...categories, newCategory]);
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
      setCategories(categories.map(c => 
        c.id === id ? updatedCategory : c
      ));
      
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
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Purchase Order actions
  const addPurchaseOrder = async (order) => {
    try {
      const newOrder = await purchaseOrdersApi.create(order);
      setPurchaseOrders([newOrder, ...purchaseOrders]);
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
      setPurchaseOrders(purchaseOrders.map(o => 
        o.id === id ? updatedOrder : o
      ));
      
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
      setPurchaseOrders(purchaseOrders.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  };

  // Cached data access methods
  const getProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return products;
    }
  };

  const getRawMaterials = async () => {
    try {
      const data = await rawMaterialsApi.getAll();
      setRawMaterials(data);
      return data;
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      return rawMaterials;
    }
  };

  const getTransactions = async () => {
    try {
      const data = await transactionsApi.getAll();
      setTransactions(data);
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return transactions;
    }
  };

  const getCoupons = async () => {
    try {
      const data = await couponsApi.getAll();
      setCoupons(data);
      return data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return coupons;
    }
  };

  const getTaxes = async () => {
    try {
      const data = await taxesApi.getAll();
      setTaxes(data);
      return data;
    } catch (error) {
      console.error('Error fetching taxes:', error);
      return taxes;
    }
  };

  const getCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return categories;
    }
  };

  const getPurchaseOrders = async () => {
    try {
      const data = await purchaseOrdersApi.getAll();
      setPurchaseOrders(data);
      return data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return purchaseOrders;
    }
  };

  return (
    <POSContext.Provider value={{ 
      // State
      cart,
      products,
      rawMaterials,
      transactions,
      coupons,
      taxes,
      categories,
      purchaseOrders,
      loading,
      
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