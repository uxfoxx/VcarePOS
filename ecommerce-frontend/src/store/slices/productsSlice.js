import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  listLoading: false,
  detailLoading: false,
  error: null,
  categories: [],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Actions
    fetchProducts: (state) => {
      state.listLoading = true;
      state.error = null;
    },
    fetchProductById: (state) => {
      state.detailLoading = true;
      state.error = null;
    },

    // Success actions
    fetchProductsSuccess: (state, action) => {
      state.listLoading = false;
      state.products = action.payload;
      // Extract unique categories
      state.categories = [...new Set(action.payload.map(p => p.category))];
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.detailLoading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },

    // Failure action
    productsFailure: (state, action) => {
      state.listLoading = false;
      state.detailLoading = false;
      state.error = action.payload;
    },

    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
});

export const {
  fetchProducts,
  fetchProductById,
  fetchProductsSuccess,
  fetchProductByIdSuccess,
  productsFailure,
  clearCurrentProduct,
} = productsSlice.actions;

export default productsSlice.reducer;