import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  uploadingReceipt: false,
  uploadError: null,
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
    uploadReceipt: (state) => {
      state.uploadingReceipt = true;
      state.uploadError = null;
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
    uploadReceiptSuccess: (state, action) => {
      state.uploadingReceipt = false;
      state.uploadError = null;
      // Update current order status if it matches
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
        state.currentOrder.orderStatus = action.payload.orderStatus;
      }
      // Update order in orders list
      const orderIndex = state.orders.findIndex(order => order.id === action.payload.orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].orderStatus = action.payload.orderStatus;
      }
    },
    
    // Failure actions
    ordersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    uploadReceiptFailure: (state, action) => {
      state.uploadingReceipt = false;
      state.uploadError = action.payload;
    },
    
    // Clear actions
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
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
  uploadReceipt,
  createOrderSuccess,
  fetchOrdersSuccess,
  fetchOrderByIdSuccess,
  uploadReceiptSuccess,
  ordersFailure,
  uploadReceiptFailure,
  clearCurrentOrder,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;