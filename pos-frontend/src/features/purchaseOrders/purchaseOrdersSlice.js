import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  purchaseOrdersList: [],
  currentPurchaseOrder: null,
  loading: false,
  error: null,
};

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    fetchPurchaseOrders(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPurchaseOrderById(state) {
      state.loading = true;
      state.error = null;
    },
    addPurchaseOrder(state) {
      state.loading = true;
      state.error = null;
    },
    updatePurchaseOrder(state) {
      state.loading = true;
      state.error = null;
    },
    deletePurchaseOrder(state) {
      state.loading = true;
      state.error = null;
    },
    updatePurchaseOrderStatus(state) {
      state.loading = true;
      state.error = null;
    },
    receiveGoods(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPurchaseOrdersSucceeded(state, action) {
      state.loading = false;
      state.purchaseOrdersList = action.payload;
    },
    fetchPurchaseOrderByIdSucceeded(state, action) {
      state.loading = false;
      state.currentPurchaseOrder = action.payload;
    },
    addPurchaseOrderSucceeded(state, action) {
      state.loading = false;
      state.purchaseOrdersList.push(action.payload);
    },
    updatePurchaseOrderSucceeded(state, action) {
      state.loading = false;
      const idx = state.purchaseOrdersList.findIndex(po => po.id === action.payload.id);
      if (idx !== -1) {
        state.purchaseOrdersList[idx] = action.payload;
      }
      if (state.currentPurchaseOrder && state.currentPurchaseOrder.id === action.payload.id) {
        state.currentPurchaseOrder = action.payload;
      }
    },
    deletePurchaseOrderSucceeded(state, action) {
      state.loading = false;
      state.purchaseOrdersList = state.purchaseOrdersList.filter(po => po.id !== action.payload.id);
    },
    updatePurchaseOrderStatusSucceeded(state, action) {
      state.loading = false;
      const idx = state.purchaseOrdersList.findIndex(po => po.id === action.payload.id);
      if (idx !== -1) {
        state.purchaseOrdersList[idx] = {
          ...state.purchaseOrdersList[idx],
          status: action.payload.status
        };
      }
      if (state.currentPurchaseOrder && state.currentPurchaseOrder.id === action.payload.id) {
        state.currentPurchaseOrder.status = action.payload.status;
      }
    },
    receiveGoodsSucceeded(state, action) {
      state.loading = false;
      // Optionally update the order with received goods
      const idx = state.purchaseOrdersList.findIndex(po => po.id === action.payload.id);
      if (idx !== -1) {
        state.purchaseOrdersList[idx] = {
          ...state.purchaseOrdersList[idx],
          ...action.payload
        };
      }
      if (state.currentPurchaseOrder && state.currentPurchaseOrder.id === action.payload.id) {
        state.currentPurchaseOrder = {
          ...state.currentPurchaseOrder,
          ...action.payload
        };
      }
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentPurchaseOrder(state) {
      state.currentPurchaseOrder = null;
    }
  },
});

export const {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  receiveGoods,
  fetchPurchaseOrdersSucceeded,
  fetchPurchaseOrderByIdSucceeded,
  addPurchaseOrderSucceeded,
  updatePurchaseOrderSucceeded,
  deletePurchaseOrderSucceeded,
  updatePurchaseOrderStatusSucceeded,
  receiveGoodsSucceeded,
  failed,
  clearCurrentPurchaseOrder
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
