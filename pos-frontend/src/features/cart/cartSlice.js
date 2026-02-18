import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, quantity = 1, selectedColorId, selectedSize, addons } = action.payload;
      const existingIndex = state.cart.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
      );
      if (existingIndex !== -1) {
        state.cart[existingIndex].quantity += quantity;
      } else {
        state.cart.push({
          product,
          quantity,
          selectedColorId,
          selectedSize,
          addons: addons || [],
        });
      }
    },
    removeFromCart(state, action) {
      const { productId, selectedColorId, selectedSize } = action.payload;
      state.cart = state.cart.filter(
        item =>
          !(
            item.product.id === productId &&
            item.selectedColorId === selectedColorId &&
            item.selectedSize === selectedSize
          )
      );
    },
    updateQuantity(state, action) {
      const { productId, selectedColorId, selectedSize, quantity } = action.payload;
      const item = state.cart.find(
        item =>
          item.product.id === productId &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
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
