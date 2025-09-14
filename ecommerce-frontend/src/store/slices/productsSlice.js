import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  categories: [],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Actions
    fetchProducts: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductById: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Success actions
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload;
      // Extract unique categories
      state.categories = [...new Set(action.payload.map(p => p.category))];
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },
    
    // Failure action
    productsFailure: (state, action) => {
      state.loading = false;
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