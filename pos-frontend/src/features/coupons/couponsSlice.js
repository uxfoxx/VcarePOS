import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  couponsList: [],
  currentCoupon: null,
  loading: false,
  error: null,
};

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    fetchCoupons(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCouponById(state) {
      state.loading = true;
      state.error = null;
    },
    addCoupon(state) {
      state.loading = true;
      state.error = null;
    },
    updateCoupon(state) {
      state.loading = true;
      state.error = null;
    },
    deleteCoupon(state) {
      state.loading = true;
      state.error = null;
    },
    validateCoupon(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCouponsSucceeded(state, action) {
      state.loading = false;
      state.couponsList = action.payload;
    },
    fetchCouponByIdSucceeded(state, action) {
      state.loading = false;
      state.currentCoupon = action.payload;
    },
    addCouponSucceeded(state, action) {
      state.loading = false;
      state.couponsList.push(action.payload);
    },
    updateCouponSucceeded(state, action) {
      state.loading = false;
      const idx = state.couponsList.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.couponsList[idx] = action.payload;
      }
      if (state.currentCoupon && state.currentCoupon.id === action.payload.id) {
        state.currentCoupon = action.payload;
      }
    },
    deleteCouponSucceeded(state, action) {
      state.loading = false;
      state.couponsList = state.couponsList.filter(c => c.id !== action.payload.id);
    },
    validateCouponSucceeded(state, _action) {
      state.loading = false;
      // Optionally store validation result
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentCoupon(state) {
      state.currentCoupon = null;
    }
  },
});

export const {
  fetchCoupons,
  fetchCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  fetchCouponsSucceeded,
  fetchCouponByIdSucceeded,
  addCouponSucceeded,
  updateCouponSucceeded,
  deleteCouponSucceeded,
  validateCouponSucceeded,
  failed,
  clearCurrentCoupon
} = couponsSlice.actions;

export default couponsSlice.reducer;
