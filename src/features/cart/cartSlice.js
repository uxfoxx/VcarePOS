import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, quantity = 1, selectedSize, selectedVariant, addons } = action.payload;
      const existingIndex = state.cart.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedVariant === selectedVariant
      );
      if (existingIndex !== -1) {
        state.cart[existingIndex].quantity += quantity;
      } else {
        state.cart.push({
          product,
          quantity,
          selectedSize,
          selectedVariant,
          addons: addons || [],
        });
      }
    },
    removeFromCart(state, action) {
      const { productId, selectedSize, selectedVariant } = action.payload;
      state.cart = state.cart.filter(
        item =>
          !(
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedVariant === selectedVariant
          )
      );
    },
    updateQuantity(state, action) {
      const { productId, selectedSize, selectedVariant, quantity } = action.payload;
      const item = state.cart.find(
        item =>
          item.product.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedVariant === selectedVariant
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart(state) {
      state.cart = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
