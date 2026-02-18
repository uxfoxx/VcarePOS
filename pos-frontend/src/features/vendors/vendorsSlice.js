import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vendorsList: [],
  currentVendor: null,
  loading: false,
  error: null,
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    fetchVendors(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVendorById(state) {
      state.loading = true;
      state.error = null;
    },
    addVendor(state) {
      state.loading = true;
      state.error = null;
    },
    updateVendor(state) {
      state.loading = true;
      state.error = null;
    },
    deleteVendor(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVendorsSucceeded(state, action) {
      state.loading = false;
      state.vendorsList = action.payload;
    },
    fetchVendorByIdSucceeded(state, action) {
      state.loading = false;
      state.currentVendor = action.payload;
    },
    addVendorSucceeded(state, action) {
      state.loading = false;
      state.vendorsList.push(action.payload);
    },
    updateVendorSucceeded(state, action) {
      state.loading = false;
      const idx = state.vendorsList.findIndex(v => v.id === action.payload.id);
      if (idx !== -1) {
        state.vendorsList[idx] = action.payload;
      }
      if (state.currentVendor && state.currentVendor.id === action.payload.id) {
        state.currentVendor = action.payload;
      }
    },
    deleteVendorSucceeded(state, action) {
      state.loading = false;
      state.vendorsList = state.vendorsList.filter(v => v.id !== action.payload.id);
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentVendor(state) {
      state.currentVendor = null;
    }
  },
});

export const {
  fetchVendors,
  fetchVendorById,
  addVendor,
  updateVendor,
  deleteVendor,
  fetchVendorsSucceeded,
  fetchVendorByIdSucceeded,
  addVendorSucceeded,
  updateVendorSucceeded,
  deleteVendorSucceeded,
  failed,
  clearCurrentVendor
} = vendorsSlice.actions;

export default vendorsSlice.reducer;
