import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  profile: null,
  favorites: [],
  loading: false,
  error: null
}

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/profile/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thông tin')
    }
  }
)

// Fetch favorites
export const fetchFavorites = createAsyncThunk(
  'user/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/favorites')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách yêu thích')
    }
  }
)

// Add to favorites
export const addToFavorites = createAsyncThunk(
  'user/addToFavorites',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/users/favorites/${productId}`)
      // Refresh favorites list after adding
      await dispatch(fetchFavorites())
      return productId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Thêm yêu thích thất bại')
    }
  }
)

// Remove from favorites
export const removeFromFavorites = createAsyncThunk(
  'user/removeFromFavorites',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/users/favorites/${productId}`)
      // Refresh favorites list after removing
      await dispatch(fetchFavorites())
      return productId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa yêu thích thất bại')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload.data || action.payload
      })
      .addCase(addToFavorites.fulfilled, (state) => {
        // State will be updated by fetchFavorites
      })
      .addCase(removeFromFavorites.fulfilled, (state) => {
        // State will be updated by fetchFavorites
      })
  }
})

export const { clearError } = userSlice.actions
export default userSlice.reducer








