import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrderStart(state) {
      state.loading = true
      state.error = null
    },
    createOrderSuccess(state, action) {
      state.loading = false
      state.currentOrder = action.payload
    },
    createOrderFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    fetchOrdersStart(state) {
      state.loading = true
      state.error = null
    },
    fetchOrdersSuccess(state, action) {
      state.loading = false
      state.orders = action.payload
    },
    fetchOrdersFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    clearCurrentOrder(state) {
      state.currentOrder = null
    },
  },
})

export const {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  clearCurrentOrder,
} = ordersSlice.actions

export default ordersSlice.reducer