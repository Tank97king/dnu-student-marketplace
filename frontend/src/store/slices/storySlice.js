import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  stories: [],
  currentStory: null,
  loading: false,
  error: null
}

// Fetch stories
export const fetchStories = createAsyncThunk(
  'story/fetchStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stories')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải stories')
    }
  }
)

// Fetch user stories
export const fetchUserStories = createAsyncThunk(
  'story/fetchUserStories',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories/user/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải stories')
    }
  }
)

// Create story
export const createStory = createAsyncThunk(
  'story/createStory',
  async (storyData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('media', storyData.media)
      formData.append('mediaType', storyData.mediaType || 'image')
      if (storyData.text) formData.append('text', storyData.text)
      if (storyData.stickers) formData.append('stickers', JSON.stringify(storyData.stickers))

      const response = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo story thất bại')
    }
  }
)

// View story
export const viewStory = createAsyncThunk(
  'story/viewStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories/${storyId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xem story')
    }
  }
)

// React to story
export const reactToStory = createAsyncThunk(
  'story/reactToStory',
  async ({ storyId, emoji }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/stories/${storyId}/reaction`, { emoji })
      return { storyId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi react story')
    }
  }
)

// Delete story
export const deleteStory = createAsyncThunk(
  'story/deleteStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/stories/${storyId}`)
      return storyId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa story thất bại')
    }
  }
)

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentStory: (state, action) => {
      state.currentStory = action.payload
    },
    clearCurrentStory: (state) => {
      state.currentStory = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false
        state.stories = action.payload.data
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchUserStories.fulfilled, (state, action) => {
        // Update stories for specific user
        const userStories = action.payload.data
        const userIndex = state.stories.findIndex(s => s.user?._id === userStories[0]?.userId?._id)
        if (userIndex !== -1) {
          state.stories[userIndex].stories = userStories
        }
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.error = null
        // Add to stories if user's story group exists
        const story = action.payload.data
        const userIndex = state.stories.findIndex(s => s.user?._id === story.userId._id)
        if (userIndex !== -1) {
          state.stories[userIndex].stories.unshift(story)
        } else {
          // Create new story group
          state.stories.unshift({
            user: story.userId,
            stories: [story]
          })
        }
      })
      .addCase(viewStory.fulfilled, (state, action) => {
        state.currentStory = action.payload.data
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.stories = state.stories.map(userStory => ({
          ...userStory,
          stories: userStory.stories.filter(s => s._id !== action.payload)
        }))
      })
  }
})

export const { clearError, setCurrentStory, clearCurrentStory } = storySlice.actions
export default storySlice.reducer

