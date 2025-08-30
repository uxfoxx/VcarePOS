import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, quantity = 1, selectedColorId, selectedSize, addons = [] } = action.payload
      
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
      )

      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += quantity
      } else {
        state.items.push({
          id: `${product.id}-${selectedColorId || 'default'}-${selectedSize || 'default'}`,
          product,
          quantity,
          selectedColorId,
          selectedSize,
          addons,
        })
      }
    },
    removeFromCart(state, action) {
      const { itemId } = action.payload
      state.items = state.items.filter(item => item.id !== itemId)
    },
    updateQuantity(state, action) {
      const { itemId, quantity } = action.payload
      const item = state.items.find(item => item.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },
    clearCart(state) {
      state.items = []
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    openCart(state) {
      state.isOpen = true
    },
    closeCart(state) {
      state.isOpen = false
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions

export default cartSlice.reducer