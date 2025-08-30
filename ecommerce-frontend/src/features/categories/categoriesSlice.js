import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  categories: [],
  loading: false,
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchCategories(state) {
      state.loading = true
      state.error = null
    },
    fetchCategoriesSuccess(state, action) {
      state.loading = false
      state.categories = action.payload
    },
    fetchCategoriesFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchCategories,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
} = categoriesSlice.actions

export default categoriesSlice.reducer