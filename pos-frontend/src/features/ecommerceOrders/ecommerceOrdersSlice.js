import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ordersList: [],
  currentOrder: null,
  newOrders: [],
  newOrdersCount: 0,
  selectedOrderId: null, // Order ID to auto-open when navigating from notifications
  receipts: {}, // { [receiptId]: { blobUrl, loading, error, timestamp } }
  loading: false,
  error: null,
};

const ecommerceOrdersSlice = createSlice({
  name: "ecommerceOrders",
  initialState,
  reducers: {
    fetchEcommerceOrders(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEcommerceOrderById(state) {
      state.loading = true;
      state.error = null;
    },
    updateEcommerceOrderStatus(state) {
      state.loading = true;
      state.error = null;
    },
    updateEcommerceReceiptStatus(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReceiptBlob(state, action) {
      const { receiptId } = action.payload;
      if (!state.receipts[receiptId]) {
        state.receipts[receiptId] = {};
      }
      state.receipts[receiptId].loading = true;
      state.receipts[receiptId].error = null;
    },
    fetchEcommerceOrdersSucceeded(state, action) {
      state.loading = false;
      state.ordersList = action.payload;
    },
    fetchEcommerceOrderByIdSucceeded(state, action) {
      state.loading = false;
      state.currentOrder = action.payload;
    },
    updateEcommerceOrderStatusSucceeded(state, action) {
      state.loading = false;
      const idx = state.ordersList.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) {
        state.ordersList[idx] = {
          ...state.ordersList[idx],
          orderStatus: action.payload.orderStatus,
          updatedAt: action.payload.updatedAt
        };
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.id) {
        state.currentOrder.orderStatus = action.payload.orderStatus;
        state.currentOrder.updatedAt = action.payload.updatedAt;
      }
    },
    updateEcommerceReceiptStatusSucceeded(state, action) {
      state.loading = false;
      const idx = state.ordersList.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) {
        state.ordersList[idx] = {
          ...state.ordersList[idx],
          orderStatus: action.payload.orderStatus,
          bankReceipt: state.ordersList[idx].bankReceipt ? {
            ...state.ordersList[idx].bankReceipt,
            status: action.payload.receiptStatus
          } : null
        };
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.id) {
        state.currentOrder.orderStatus = action.payload.orderStatus;
        if (state.currentOrder.bankReceipt) {
          state.currentOrder.bankReceipt.status = action.payload.receiptStatus;
        }
      }
    },
    fetchReceiptBlobSucceeded(state, action) {
      const { receiptId, blobUrl } = action.payload;
      state.receipts[receiptId] = {
        blobUrl,
        loading: false,
        error: null,
        timestamp: Date.now()
      };
    },
    fetchReceiptBlobFailed(state, action) {
      const { receiptId, error } = action.payload;
      state.receipts[receiptId] = {
        loading: false,
        error,
        blobUrl: null,
        timestamp: Date.now()
      };
    },
    clearReceiptBlob(state, action) {
      const { receiptId } = action.payload;
      const receipt = state.receipts[receiptId];
      if (receipt?.blobUrl) {
        // Note: URL.revokeObjectURL will be called in the component
        delete state.receipts[receiptId];
      }
    },
    fetchNewOrders(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNewOrdersSucceeded(state, action) {
      state.loading = false;
      state.newOrders = action.payload.orders || [];
      state.newOrdersCount = action.payload.count || 0;
    },
    fetchNewOrdersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    markOrderNotified(state) {
      state.loading = true;
      state.error = null;
    },
    markOrderNotifiedSucceeded(state, action) {
      state.loading = false;
      const { orderId } = action.payload;
      state.newOrders = state.newOrders.filter(order => order.id !== orderId);
      state.newOrdersCount = Math.max(0, state.newOrdersCount - 1);
    },
    markOrderNotifiedFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedOrderId(state, action) {
      state.selectedOrderId = action.payload;
    },
    clearSelectedOrderId(state) {
      state.selectedOrderId = null;
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
export const {
  fetchEcommerceOrders,
  fetchEcommerceOrderById,
  updateEcommerceOrderStatus,
  updateEcommerceReceiptStatus,
  fetchReceiptBlob,
  fetchEcommerceOrdersSucceeded,
  fetchEcommerceOrderByIdSucceeded,
  updateEcommerceOrderStatusSucceeded,
  updateEcommerceReceiptStatusSucceeded,
  fetchReceiptBlobSucceeded,
  fetchReceiptBlobFailed,
  clearReceiptBlob,
  fetchNewOrders,
  fetchNewOrdersSucceeded,
  fetchNewOrdersFailed,
  markOrderNotified,
  markOrderNotifiedSucceeded,
  markOrderNotifiedFailed,
  setSelectedOrderId,
  clearSelectedOrderId,
  failed,
} = ecommerceOrdersSlice.actions;

export default ecommerceOrdersSlice.reducer;