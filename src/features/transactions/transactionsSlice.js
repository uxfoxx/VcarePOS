import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactionsList: [],
  currentTransaction: null,
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    fetchTransactions(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTransactionById(state) {
      state.loading = true;
      state.error = null;
    },
    createTransaction(state) {
      state.loading = true;
      state.error = null;
    },
    updateTransactionStatus(state) {
      state.loading = true;
      state.error = null;
    },
    processRefund(state) {
      state.loading = true;
      state.error = null;
    },
    restoreProductStock(_state, _action) {
      // TODO
      // This action will be handled by the saga to restore product stock after refund
      // No state changes needed here as it will be handled by products reducer
    },
    fetchTransactionsSucceeded(state, action) {
      state.loading = false;
      state.transactionsList = action.payload;
    },
    fetchTransactionByIdSucceeded(state, action) {
      state.loading = false;
      state.currentTransaction = action.payload;
    },
    createTransactionSucceeded(state, action) {
      state.loading = false;
      state.transactionsList.push(action.payload);
    },
    updateTransactionStatusSucceeded(state, action) {
      state.loading = false;
      // Update the transaction status in the list
      const idx = state.transactionsList.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.transactionsList[idx] = {
          ...state.transactionsList[idx],
          status: action.payload.status
        };
      }
      if (state.currentTransaction && state.currentTransaction.id === action.payload.id) {
        state.currentTransaction.status = action.payload.status;
      }
    },
    processRefundSucceeded(state, action) {
      // TODO
      state.loading = false;
      // Update the transaction in the list
      const idx = state.transactionsList.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.transactionsList[idx] = {
          ...state.transactionsList[idx],
          ...action.payload
        };
      }
      if (state.currentTransaction && state.currentTransaction.id === action.payload.id) {
        state.currentTransaction = {
          ...state.currentTransaction,
          ...action.payload
        };
      }
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentTransaction(state) {
      state.currentTransaction = null;
    }
  },
});

export const {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransactionStatus,
  processRefund,
  restoreProductStock,
  fetchTransactionsSucceeded,
  fetchTransactionByIdSucceeded,
  createTransactionSucceeded,
  updateTransactionStatusSucceeded,
  processRefundSucceeded,
  failed,
  clearCurrentTransaction
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
