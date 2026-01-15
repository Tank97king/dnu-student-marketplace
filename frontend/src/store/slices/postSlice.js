import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  posts: [],
  post: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

// Fetch posts
export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải bài đăng')
    }
  }
)

// Fetch single post
export const fetchPost = createAsyncThunk(
  'post/fetchPost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy bài đăng')
    }
  }
)

// Create post
export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      
      // Add images
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach(img => formData.append('images', img))
      }
      
      // Add other fields
      Object.keys(postData).forEach(key => {
        if (key !== 'images' && postData[key] !== undefined && postData[key] !== null) {
          formData.append(key, postData[key])
        }
      })

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo bài đăng thất bại')
    }
  }
)

// Like/Unlike post
export const likePost = createAsyncThunk(
  'post/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      return { postId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi like bài đăng')
    }
  }
)

// Share post
export const sharePost = createAsyncThunk(
  'post/sharePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/share`)
      return { postId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi share bài đăng')
    }
  }
)

// Delete post
export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/posts/${postId}`)
      return postId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa bài đăng thất bại')
    }
  }
)

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearPost: (state) => {
      state.post = null
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload)
    },
    updatePostInList: (state, action) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(p => p._id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchPost.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading = false
        state.post = action.payload.data
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.error = null
        state.posts.unshift(action.payload.data)
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isLiked, likeCount } = action.payload
        const userId = action.meta.arg
        const post = state.posts.find(p => p._id === postId)
        if (post) {
          if (isLiked) {
            if (!post.likes.some(like => like.toString() === userId || like._id === userId)) {
              post.likes.push(userId)
            }
          } else {
            post.likes = post.likes.filter(like => like.toString() !== userId && like._id !== userId)
          }
          post.likeCount = likeCount
        }
        if (state.post && state.post._id === postId) {
          if (isLiked) {
            if (!state.post.likes.some(like => like.toString() === userId || like._id === userId)) {
              state.post.likes.push(userId)
            }
          } else {
            state.post.likes = state.post.likes.filter(like => like.toString() !== userId && like._id !== userId)
          }
          state.post.likeCount = likeCount
        }
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, shareCount } = action.payload
        const post = state.posts.find(p => p._id === postId)
        if (post) {
          post.shareCount = shareCount
        }
        if (state.post && state.post._id === postId) {
          state.post.shareCount = shareCount
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload)
        if (state.post && state.post._id === action.payload) {
          state.post = null
        }
      })
  }
})

export const { clearError, clearPost, addPost, updatePostInList, removePost } = postSlice.actions
export default postSlice.reducer

