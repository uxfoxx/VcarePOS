import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taxesList: [],
  loading: false,
  error: null,
};

const taxesSlice = createSlice({
  name: "taxes",
  initialState,
  reducers: {
    fetchTaxes(state) {
      state.loading = true;
      state.error = null;
    },
    addTax(state) {
      state.loading = true;
      state.error = null;
    },
    updateTax(state) {
      state.loading = true;
      state.error = null;
    },
    deleteTax(state) {
      state.loading = true;
      state.error = null;
    },
    bulkUpdateStatus(state) {
      state.loading = true;
      state.error = null;
    },
    bulkDeleteTaxes(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTaxesSucceeded(state, action) {
      state.loading = false;
      state.taxesList = action.payload;
    },
    addTaxSucceeded(state, action) {
      state.loading = false;
      state.taxesList.push(action.payload);
    },
    updateTaxSucceeded(state, action) {
      state.loading = false;
      const idx = state.taxesList.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.taxesList[idx] = action.payload;
      }
    },
    deleteTaxSucceeded(state, action) {
      state.loading = false;
      state.taxesList = state.taxesList.filter(t => t.id !== action.payload.id);
    },
    bulkUpdateStatusSucceeded(state, action) {
      state.loading = false;
      // Update the taxes in the list with the returned updated taxes
      action.payload.updatedTaxes.forEach(updatedTax => {
        const idx = state.taxesList.findIndex(t => t.id === updatedTax.id);
        if (idx !== -1) {
          state.taxesList[idx] = updatedTax;
        }
      });
    },
    bulkDeleteTaxesSucceeded(state, action) {
      state.loading = false;
      // Remove deleted taxes from the list
      const deletedIds = action.payload.deletedIds;
      state.taxesList = state.taxesList.filter(t => !deletedIds.includes(t.id));
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTaxes,
  addTax,
  updateTax,
  deleteTax,
  bulkUpdateStatus,
  bulkDeleteTaxes,
  fetchTaxesSucceeded,
  addTaxSucceeded,
  updateTaxSucceeded,
  deleteTaxSucceeded,
  bulkUpdateStatusSucceeded,
  bulkDeleteTaxesSucceeded,
  failed,
} = taxesSlice.actions;

export default taxesSlice.reducer;
