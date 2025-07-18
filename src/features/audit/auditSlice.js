import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  auditList: [],
  loading: false,
  error: null,
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    fetchAudit(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAuditById(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAuditByUser(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAuditByModule(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAuditSucceeded(state, action) {
      state.loading = false;
      state.auditList = action.payload;
    },
    fetchAuditByIdSucceeded(state, action) {
      state.loading = false;
      // Optionally store a single audit entry if needed
    },
    fetchAuditByUserSucceeded(state, action) {
      state.loading = false;
      state.auditList = action.payload;
    },
    fetchAuditByModuleSucceeded(state, action) {
      state.loading = false;
      state.auditList = action.payload;
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAudit,
  fetchAuditById,
  fetchAuditByUser,
  fetchAuditByModule,
  fetchAuditSucceeded,
  fetchAuditByIdSucceeded,
  fetchAuditByUserSucceeded,
  fetchAuditByModuleSucceeded,
  failed,
} = auditSlice.actions;

export default auditSlice.reducer;
