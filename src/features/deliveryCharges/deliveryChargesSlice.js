import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deliveryCharges: [],
  activeDeliveryCharges: [],
  loading: false,
  error: null,
  lastFetch: null,
};

const deliveryChargesSlice = createSlice({
  name: 'deliveryCharges',
  initialState,
  reducers: {
    fetchDeliveryChargesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeliveryChargesSuccess: (state, action) => {
      state.deliveryCharges = action.payload;
      state.activeDeliveryCharges = action.payload.filter(charge => charge.is_active);
      state.loading = false;
      state.lastFetch = Date.now();
    },
    fetchDeliveryChargesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createDeliveryChargeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createDeliveryChargeSuccess: (state, action) => {
      state.deliveryCharges.push(action.payload);
      if (action.payload.is_active) {
        state.activeDeliveryCharges.push(action.payload);
      }
      state.loading = false;
    },
    createDeliveryChargeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDeliveryChargeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateDeliveryChargeSuccess: (state, action) => {
      const index = state.deliveryCharges.findIndex(charge => charge.id === action.payload.id);
      if (index !== -1) {
        state.deliveryCharges[index] = action.payload;
      }
      state.activeDeliveryCharges = state.deliveryCharges.filter(charge => charge.is_active);
      state.loading = false;
    },
    updateDeliveryChargeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDeliveryChargeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteDeliveryChargeSuccess: (state, action) => {
      state.deliveryCharges = state.deliveryCharges.filter(charge => charge.id !== action.payload);
      state.activeDeliveryCharges = state.deliveryCharges.filter(charge => charge.is_active);
      state.loading = false;
    },
    deleteDeliveryChargeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchDeliveryChargesRequest,
  fetchDeliveryChargesSuccess,
  fetchDeliveryChargesFailure,
  createDeliveryChargeRequest,
  createDeliveryChargeSuccess,
  createDeliveryChargeFailure,
  updateDeliveryChargeRequest,
  updateDeliveryChargeSuccess,
  updateDeliveryChargeFailure,
  deleteDeliveryChargeRequest,
  deleteDeliveryChargeSuccess,
  deleteDeliveryChargeFailure,
  clearError,
} = deliveryChargesSlice.actions;

export default deliveryChargesSlice.reducer;
