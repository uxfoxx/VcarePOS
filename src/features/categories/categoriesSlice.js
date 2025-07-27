import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoriesList: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    fetchCategories(state, _action) {
      state.loading = true;
      state.error = null;
    },

    addCategories(state, _action) {
      state.loading = true;
      state.error = null;
    },

    updateCategories(state, _action) {
      state.loading = true;
      state.error = null;
    },

    deleteCategories(state, _action) {
      state.loading = true;
      state.error = null;
    },

    fetchCategoriesSucceeded(state, action) {
      state.loading = false;
      state.categoriesList = action.payload;
    },

    addCategoriesSucceeded(state, action) {
      state.loading = false;
      state.categoriesList.push(action.payload.categoryData);
    },

    updateCategoriesSucceeded(state, action) {
        state.loading = false;
        state.categoriesList = state.categoriesList.map((category) =>
            category.id === action.payload.id
            ? { ...category, ...action.payload.categoryData }
            : category
        );
      },

    deleteCategoriesSucceeded(state, action) {
      state.loading = false;
      state.categoriesList = state.categoriesList.filter(
        (category) => category.id !== action.payload.categoryId
      );
    },
    failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCategories,
  addCategories,
  updateCategories,
  deleteCategories,
  fetchCategoriesSucceeded,
  addCategoriesSucceeded,
  updateCategoriesSucceeded,
  deleteCategoriesSucceeded,
  failed,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
