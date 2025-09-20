import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productsList: [],
  currentProduct: null,
  scannedProduct: null,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    fetchProducts(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductById(state) {
      state.loading = true;
      state.error = null;
    },
    addProduct(state) {
      state.loading = true;
      state.error = null;
    },
    updateProduct(state) {
      state.loading = true;
      state.error = null;
    },
    deleteProducts(state) {
      state.loading = true;
      state.error = null;
    },
    updateProductStock(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSucceeded(state, action) {
      state.loading = false;
      state.productsList = action.payload;
    },
    fetchProductByIdSucceeded(state, action) {
      state.loading = false;
      state.currentProduct = action.payload;
    },
    fetchProductByBarcodeSucceeded(state, action) {
      state.loading = false;
      state.scannedProduct = action.payload;
    },
    addProductSucceeded(state, action) {
      state.loading = false;
      state.productsList.push(action.payload);
    },
    updateProductSucceeded(state, action) {
      state.loading = false;
      const idx = state.productsList.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.productsList[idx] = action.payload;
      }
      if (state.currentProduct && state.currentProduct.id === action.payload.id) {
        state.currentProduct = action.payload;
      }
    },
    deleteProductsSucceeded(state, action) {
      state.loading = false;
      state.productsList = state.productsList.filter((p) => p.id !== action.payload.productId);
    },
    updateProductStockSucceeded(state, action) {
      state.loading = false;
      const idx = state.productsList.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.productsList[idx] = {
          ...state.productsList[idx],
          stock: action.payload.stock,
          sizes: action.payload.sizes || state.productsList[idx].sizes,
        };
      }
      if (state.currentProduct && state.currentProduct.id === action.payload.id) {
        state.currentProduct = {
          ...state.currentProduct,
          stock: action.payload.stock,
          sizes: action.payload.sizes || state.currentProduct.sizes,
        };
      }
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
    clearScannedProduct(state) {
      state.scannedProduct = null;
    },
  },
});

export const {
  fetchProducts,
  fetchProductById,
  fetchProductByBarcode,
  addProduct,
  updateProduct,
  deleteProducts,
  updateProductStock,
  fetchProductsSucceeded,
  fetchProductByIdSucceeded,
  fetchProductByBarcodeSucceeded,
  addProductSucceeded,
  updateProductSucceeded,
  deleteProductsSucceeded,
  updateProductStockSucceeded,
  failed,
  clearCurrentProduct,
  clearScannedProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
