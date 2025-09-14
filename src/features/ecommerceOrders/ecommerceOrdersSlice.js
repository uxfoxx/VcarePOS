import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ordersList: [],
  currentOrder: null,
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
  fetchEcommerceOrdersSucceeded,
  fetchEcommerceOrderByIdSucceeded,
  updateEcommerceOrderStatusSucceeded,
  failed,
} = ecommerceOrdersSlice.actions;

export default ecommerceOrdersSlice.reducer;