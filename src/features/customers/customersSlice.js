import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customersList: [],
  currentCustomer: null,
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    fetchCustomers(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCustomerById(state) {
      state.loading = true;
      state.error = null;
    },
    updateCustomer(state) {
      state.loading = true;
      state.error = null;
    },
    deleteCustomer(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCustomersSucceeded(state, action) {
      state.loading = false;
      state.customersList = action.payload;
    },
    fetchCustomerByIdSucceeded(state, action) {
      state.loading = false;
      state.currentCustomer = action.payload;
    },
    updateCustomerSucceeded(state, action) {
      state.loading = false;
      const idx = state.customersList.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.customersList[idx] = action.payload;
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer = action.payload;
      }
    },
    deleteCustomerSucceeded(state, action) {
      state.loading = false;
      state.customersList = state.customersList.filter(c => c.id !== action.payload.id);
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentCustomer(state) {
      state.currentCustomer = null;
    }
  },
});

export const {
  fetchCustomers,
  fetchCustomerById,
  updateCustomer,
  deleteCustomer,
  fetchCustomersSucceeded,
  fetchCustomerByIdSucceeded,
  updateCustomerSucceeded,
  deleteCustomerSucceeded,
  failed,
  clearCurrentCustomer
} = customersSlice.actions;

export default customersSlice.reducer;