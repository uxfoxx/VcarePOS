import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allSettings: [],
  settings: {
    freeDelivery: null,
    insideColombo: null,
    outOfColombo: null,
  },
  calculation: null,
  loading: false,
  error: null,
  lastFetch: null,
};

const deliveryChargesSlice = createSlice({
  name: 'deliveryCharges',
  initialState,
  reducers: {
    fetchDeliverySettingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeliverySettingsSuccess: (state, action) => {
      state.allSettings = action.payload;
      action.payload.forEach(setting => {
        if (setting.type === 'free_delivery') {
          state.settings.freeDelivery = setting;
        } else if (setting.type === 'inside_colombo') {
          state.settings.insideColombo = setting;
        } else if (setting.type === 'out_of_colombo') {
          state.settings.outOfColombo = setting;
        }
      });
      state.loading = false;
      state.lastFetch = Date.now();
    },
    fetchDeliverySettingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFreeDeliveryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateFreeDeliverySuccess: (state, action) => {
      state.settings.freeDelivery = action.payload;
      const index = state.allSettings.findIndex(s => s.type === 'free_delivery');
      if (index !== -1) {
        state.allSettings[index] = action.payload;
      }
      state.loading = false;
    },
    updateFreeDeliveryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateInsideColomboRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateInsideColomboSuccess: (state, action) => {
      state.settings.insideColombo = action.payload;
      const index = state.allSettings.findIndex(s => s.type === 'inside_colombo');
      if (index !== -1) {
        state.allSettings[index] = action.payload;
      }
      state.loading = false;
    },
    updateInsideColomboFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOutOfColomboRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOutOfColomboSuccess: (state, action) => {
      state.settings.outOfColombo = action.payload;
      const index = state.allSettings.findIndex(s => s.type === 'out_of_colombo');
      if (index !== -1) {
        state.allSettings[index] = action.payload;
      }
      state.loading = false;
    },
    updateOutOfColomboFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    calculateDeliveryChargeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    calculateDeliveryChargeSuccess: (state, action) => {
      state.calculation = action.payload;
      state.loading = false;
    },
    calculateDeliveryChargeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCalculation: (state) => {
      state.calculation = null;
    },
  },
});

export const {
  fetchDeliverySettingsRequest,
  fetchDeliverySettingsSuccess,
  fetchDeliverySettingsFailure,
  updateFreeDeliveryRequest,
  updateFreeDeliverySuccess,
  updateFreeDeliveryFailure,
  updateInsideColomboRequest,
  updateInsideColomboSuccess,
  updateInsideColomboFailure,
  updateOutOfColomboRequest,
  updateOutOfColomboSuccess,
  updateOutOfColomboFailure,
  calculateDeliveryChargeRequest,
  calculateDeliveryChargeSuccess,
  calculateDeliveryChargeFailure,
  clearError,
  clearCalculation,
} = deliveryChargesSlice.actions;

export default deliveryChargesSlice.reducer;
