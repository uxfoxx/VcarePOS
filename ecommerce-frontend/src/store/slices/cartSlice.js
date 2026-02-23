import { createSlice } from '@reduxjs/toolkit';

const getCartKey = (userId) => userId ? `cart_${userId}`.toLowerCase() : 'cart_guest';

const loadState = (userId) => {
  try {
    const key = getCartKey(userId);
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    }
    return JSON.parse(serializedState);
  } catch {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
  }
};

const saveState = (state, userId) => {
  try {
    const key = getCartKey(userId);
    const serializedState = JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
      totalAmount: state.totalAmount
    });
    localStorage.setItem(key, serializedState);
  } catch {
    // Ignore write errors
  }
};

const initialState = {
  ...loadState(null),
  userId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, selectedColorId, selectedSize } = action.payload;

      // Find available stock
      let availableStock = product.stock || 0;
      if (product.colors?.length > 0) {
        const colorVariant = product.colors.find(c => c.id === selectedColorId);
        if (colorVariant) {
          const sizeVariant = colorVariant.sizes?.find(s => s.name === selectedSize);
          if (sizeVariant) {
            availableStock = sizeVariant.stock;
          }
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColorId === selectedColorId &&
          item.selectedSize === selectedSize
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists, respecting stock
        const currentQty = state.items[existingItemIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > availableStock) {
          state.items[existingItemIndex].quantity = availableStock;
        } else {
          state.items[existingItemIndex].quantity = newQty;
        }
      } else {
        // Add new item to cart, respecting stock
        const finalQty = Math.min(quantity, availableStock);
        if (finalQty > 0) {
          state.items.push({
            id: `${product.id}-${selectedColorId || 'default'}-${selectedSize || 'default'}`,
            product,
            quantity: finalQty,
            selectedColorId,
            selectedSize,
            addedAt: new Date().toISOString(),
          });
        }
      }

      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      saveState(state, state.userId);
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
      saveState(state, state.userId);
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
          // Find available stock for validation
          let availableStock = item.product.stock || 0;
          if (item.product.colors?.length > 0) {
            const colorVariant = item.product.colors.find(c => c.id === item.selectedColorId);
            if (colorVariant) {
              const sizeVariant = colorVariant.sizes?.find(s => s.name === item.selectedSize);
              if (sizeVariant) {
                availableStock = sizeVariant.stock;
              }
            }
          }

          item.quantity = Math.min(quantity, availableStock);
        }

        // Recalculate totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
        saveState(state, state.userId);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      saveState(state, state.userId);
    },

    setUserId: (state, action) => {
      state.userId = action.payload;
    },

    syncUserCart: (state, action) => {
      const userId = action.payload;

      if (userId) {
        // Loading user cart and checking for guest cart items to merge
        const userState = loadState(userId);
        const guestState = loadState(null);

        if (guestState.items.length > 0) {
          // Merge logic
          const mergedItems = [...userState.items];

          guestState.items.forEach(guestItem => {
            const existingItemIndex = mergedItems.findIndex(
              uItem =>
                uItem.product.id === guestItem.product.id &&
                uItem.selectedColorId === guestItem.selectedColorId &&
                uItem.selectedSize === guestItem.selectedSize
            );

            if (existingItemIndex !== -1) {
              // Item exists in user cart, combine quantities (clamped by stock)
              let availableStock = guestItem.product.stock || 0;
              if (guestItem.product.colors?.length > 0) {
                const colorVariant = guestItem.product.colors.find(c => c.id === guestItem.selectedColorId);
                if (colorVariant) {
                  const sizeVariant = colorVariant.sizes?.find(s => s.name === guestItem.selectedSize);
                  if (sizeVariant) {
                    availableStock = sizeVariant.stock;
                  }
                }
              }

              const newQty = mergedItems[existingItemIndex].quantity + guestItem.quantity;
              mergedItems[existingItemIndex].quantity = Math.min(newQty, availableStock);
            } else {
              // Item doesn't exist in user cart, just add it
              mergedItems.push(guestItem);
            }
          });

          // Update state
          state.items = mergedItems;
          state.totalItems = mergedItems.reduce((total, item) => total + item.quantity, 0);
          state.totalAmount = mergedItems.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
          );

          // Clear guest cart from localStorage
          localStorage.removeItem('cart_guest');
        } else {
          // No guest items, just load user cart
          state.items = userState.items;
          state.totalItems = userState.totalItems;
          state.totalAmount = userState.totalAmount;
        }
      } else {
        // Logout case: load guest cart (which should be empty if merged previously)
        const guestState = loadState(null);
        state.items = guestState.items;
        state.totalItems = guestState.totalItems;
        state.totalAmount = guestState.totalAmount;
      }

      state.userId = userId;
      saveState(state, userId);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setUserId,
  syncUserCart,
} = cartSlice.actions;

export default cartSlice.reducer;