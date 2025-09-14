import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null, // General error for orders
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Actions
    createOrder: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrders: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderById: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Success actions
    createOrderSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload); // Add to beginning of array
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.error = null;
    },
    // No specific success action for uploadReceipt as it's now part of createOrder
    // The createOrderSuccess handles the order object update
    
    // Failure actions
    
    // Failure actions
    ordersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    uploadReceiptFailure: (state, action) => {
      // This action is no longer needed if uploadReceipt is removed
    },
    
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
  },
});

export const {
  createOrder,
  fetchOrders,
  fetchOrderById,
  createOrderSuccess,
  fetchOrdersSuccess,
  fetchOrderByIdSuccess,
  ordersFailure,
  uploadReceiptFailure,
  clearCurrentOrder,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;