import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quotations: [],
  currentQuotation: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  },
  filters: {
    status: null,
    search: '',
    startDate: null,
    endDate: null
  }
};

const quotationsSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {
    fetchQuotations(state) {
      state.loading = true;
      state.error = null;
    },
    fetchQuotationsSuccess(state, action) {
      state.loading = false;
      state.quotations = action.payload.quotations;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchQuotationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchQuotationById(state) {
      state.loading = true;
      state.error = null;
    },
    fetchQuotationByIdSuccess(state, action) {
      state.loading = false;
      state.currentQuotation = action.payload;
      state.error = null;
    },
    fetchQuotationByIdFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    createQuotation(state) {
      state.loading = true;
      state.error = null;
    },
    createQuotationSuccess(state, action) {
      state.loading = false;
      state.quotations = [action.payload, ...state.quotations];
      state.error = null;
    },
    createQuotationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateQuotation(state) {
      state.loading = true;
      state.error = null;
    },
    updateQuotationSuccess(state, action) {
      state.loading = false;
      const index = state.quotations.findIndex(q => q.id === action.payload.id);
      if (index !== -1) {
        state.quotations[index] = action.payload;
      }
      if (state.currentQuotation?.id === action.payload.id) {
        state.currentQuotation = action.payload;
      }
      state.error = null;
    },
    updateQuotationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    deleteQuotation(state) {
      state.loading = true;
      state.error = null;
    },
    deleteQuotationSuccess(state, action) {
      state.loading = false;
      state.quotations = state.quotations.filter(q => q.id !== action.payload);
      if (state.currentQuotation?.id === action.payload) {
        state.currentQuotation = null;
      }
      state.error = null;
    },
    deleteQuotationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    convertQuotation(state) {
      state.loading = true;
      state.error = null;
    },
    convertQuotationSuccess(state, _action) {
      state.loading = false;
      state.error = null;
    },
    convertQuotationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    clearError(state) {
      state.error = null;
    },

    clearCurrentQuotation(state) {
      state.currentQuotation = null;
    }
  }
});

export const {
  fetchQuotations,
  fetchQuotationsSuccess,
  fetchQuotationsFailure,
  fetchQuotationById,
  fetchQuotationByIdSuccess,
  fetchQuotationByIdFailure,
  createQuotation,
  createQuotationSuccess,
  createQuotationFailure,
  updateQuotation,
  updateQuotationSuccess,
  updateQuotationFailure,
  deleteQuotation,
  deleteQuotationSuccess,
  deleteQuotationFailure,
  convertQuotation,
  convertQuotationSuccess,
  convertQuotationFailure,
  setFilters,
  setPagination,
  clearError,
  clearCurrentQuotation
} = quotationsSlice.actions;

export default quotationsSlice.reducer;
