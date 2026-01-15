import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  followers: [],
  following: [],
  suggestions: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
}

// Follow user
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/follow`)
      return { userId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Follow thất bại')
    }
  }
)

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}/follow`)
      return userId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Unfollow thất bại')
    }
  }
)

// Fetch followers
export const fetchFollowers = createAsyncThunk(
  'follow/fetchFollowers',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/followers`, { params: { page } })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải followers')
    }
  }
)

// Fetch following
export const fetchFollowing = createAsyncThunk(
  'follow/fetchFollowing',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/following`, { params: { page } })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải following')
    }
  }
)

// Fetch suggestions
export const fetchSuggestions = createAsyncThunk(
  'follow/fetchSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/suggestions')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải gợi ý')
    }
  }
)

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearFollowers: (state) => {
      state.followers = []
    },
    clearFollowing: (state) => {
      state.following = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(followUser.pending, (state) => {
        state.loading = true
      })
      .addCase(followUser.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.following = state.following.filter(u => u._id !== action.payload)
      })
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false
        state.followers = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.loading = false
        state.following = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload.data
      })
  }
})

export const { clearError, clearFollowers, clearFollowing } = followSlice.actions
export default followSlice.reducer

