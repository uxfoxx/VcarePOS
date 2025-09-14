import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, selectedColorId, selectedSize } = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        state.items.push({
          id: `${product.id}-${selectedColorId || 'default'}-${selectedSize || 'default'}`,
          product,
          quantity,
          selectedColorId,
          selectedSize,
          addedAt: new Date().toISOString(),
        });
      }
      
      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
    
    removeFromCart: (state, action) => {
      const { productId, selectedColorId, selectedSize } = action.payload;
      
      state.items = state.items.filter(
        item =>
          !(
            item.product.id === productId &&
            item.selectedColorId === selectedColorId &&
            item.selectedSize === selectedSize
          )
      );
      
      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
    
    updateQuantity: (state, action) => {
      const { productId, selectedColorId, selectedSize, quantity } = action.payload;
      
      const item = state.items.find(
        item =>
          item.product.id === productId &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
      );
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(i => i.id !== item.id);
        } else {
          item.quantity = quantity;
        }
        
        // Recalculate totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;