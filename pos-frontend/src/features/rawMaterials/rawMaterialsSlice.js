import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rawMaterialsList: [],
  loading: false,
  error: null,
};

const rawMaterialsSlice = createSlice({
  name: "rawMaterials",
  initialState,
  reducers: {
    fetchRawMaterials(state, _action) {
      state.loading = true;
      state.error = null;
    },

    addRawMaterials(state, _action) {
      state.loading = true;
      state.error = null;
    },

    updateRawMaterials(state, _action) {
      state.loading = true;
      state.error = null;
    },

    deleteRawMaterials(state, _action) {
      state.loading = true;
      state.error = null;
    },

    updateStock(state) {
      state.loading = true;
      state.error = null;
    },

    addRawMaterialsSucceeded(state, action) {
      state.loading = false;
      state.rawMaterialsList.push(action.payload.materialData);
    },

    updateRawMaterialsSucceeded(state, action) {
      state.loading = false;
      state.rawMaterialsList = state.rawMaterialsList.map((material) =>
        material.id === action.payload.id
          ? { ...material, ...action.payload.materialData }
          : material
      );
    },

    deleteRawMaterialsSucceeded(state, action) {
      state.loading = false;
      state.rawMaterialsList = state.rawMaterialsList.filter(
        (material) => material.id !== action.payload.materialId
      );
    },

    fetchRawMaterialsSucceeded(state, action) {
      state.loading = false;
      state.rawMaterialsList = action.payload;
    },

    updateStockSucceeded(state, action) {
      state.loading = false;
      // Update the stock for the specific material
      const idx = state.rawMaterialsList.findIndex(m => m.id === action.payload.id);
      if (idx !== -1) {
        state.rawMaterialsList[idx] = {
          ...state.rawMaterialsList[idx],
          stockQuantity: action.payload.stockQuantity
        };
      }
    },

    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchRawMaterials,
  addRawMaterials,
  updateRawMaterials,
  deleteRawMaterials,
  fetchRawMaterialsSucceeded,
  addRawMaterialsSucceeded,
  updateRawMaterialsSucceeded,
  deleteRawMaterialsSucceeded,
  updateStock,
  updateStockSucceeded,
  failed,
} = rawMaterialsSlice.actions;

export default rawMaterialsSlice.reducer;
