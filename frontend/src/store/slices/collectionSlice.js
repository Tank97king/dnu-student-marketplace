import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  collections: [],
  collection: null,
  loading: false,
  error: null
}

// Fetch collections
export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async ({ userId } = {}, { rejectWithValue }) => {
    try {
      const params = userId ? { userId } : {}
      const response = await api.get('/collections', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải collections')
    }
  }
)

// Fetch single collection
export const fetchCollection = createAsyncThunk(
  'collection/fetchCollection',
  async (collectionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/collections/${collectionId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy collection')
    }
  }
)

// Create collection
export const createCollection = createAsyncThunk(
  'collection/createCollection',
  async (collectionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/collections', collectionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo collection thất bại')
    }
  }
)

// Update collection
export const updateCollection = createAsyncThunk(
  'collection/updateCollection',
  async ({ id, ...collectionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/collections/${id}`, collectionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật collection thất bại')
    }
  }
)

// Delete collection
export const deleteCollection = createAsyncThunk(
  'collection/deleteCollection',
  async (collectionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/collections/${collectionId}`)
      return collectionId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa collection thất bại')
    }
  }
)

// Add post to collection
export const addPostToCollection = createAsyncThunk(
  'collection/addPostToCollection',
  async ({ collectionId, postId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/collections/${collectionId}/posts/${postId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Thêm bài đăng thất bại')
    }
  }
)

// Remove post from collection
export const removePostFromCollection = createAsyncThunk(
  'collection/removePostFromCollection',
  async ({ collectionId, postId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/collections/${collectionId}/posts/${postId}`)
      return { collectionId, postId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa bài đăng thất bại')
    }
  }
)

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCollection: (state) => {
      state.collection = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false
        state.collections = action.payload.data
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchCollection.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCollection.fulfilled, (state, action) => {
        state.loading = false
        state.collection = action.payload.data
      })
      .addCase(fetchCollection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.error = null
        state.collections.unshift(action.payload.data)
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c._id === action.payload.data._id)
        if (index !== -1) {
          state.collections[index] = action.payload.data
        }
        if (state.collection && state.collection._id === action.payload.data._id) {
          state.collection = action.payload.data
        }
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(c => c._id !== action.payload)
        if (state.collection && state.collection._id === action.payload) {
          state.collection = null
        }
      })
      .addCase(addPostToCollection.fulfilled, (state, action) => {
        const collection = action.payload.data
        const index = state.collections.findIndex(c => c._id === collection._id)
        if (index !== -1) {
          state.collections[index] = collection
        }
        if (state.collection && state.collection._id === collection._id) {
          state.collection = collection
        }
      })
      .addCase(removePostFromCollection.fulfilled, (state, action) => {
        const { collectionId, postId } = action.payload
        if (state.collection && state.collection._id === collectionId) {
          state.collection.posts = state.collection.posts.filter(p => p._id !== postId)
        }
      })
  }
})

export const { clearError, clearCollection } = collectionSlice.actions
export default collectionSlice.reducer

