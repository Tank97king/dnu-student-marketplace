import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Load user from localStorage
const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user')
    if (!user || user === 'undefined' || user === 'null') {
      return null
    }
    return JSON.parse(user)
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    // Clear invalid data
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

const initialState = {
  user: getUserFromLocalStorage(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token')
}

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại')
    }
  }
)

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, data } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(data))
      
      return { token, user: data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  }
)

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, code })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh thất bại')
    }
  }
)

// Resend verification code
export const resendVerificationCode = createAsyncThunk(
  'auth/resendVerificationCode',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification', { email })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi lại mã xác minh')
    }
  }
)

// Forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgotpassword', { email, newPassword })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gửi mã xác minh thất bại')
    }
  }
)

// Verify OTP and reset password
export const verifyOTPAndResetPassword = createAsyncThunk(
  'auth/verifyOTPAndResetPassword',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp-reset-password', { email, code })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh thất bại')
    }
  }
)

// Resend verification code for password reset (reuse forgotPassword)
export const resendVerificationCodeResetPassword = createAsyncThunk(
  'auth/resendVerificationCodeResetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgotpassword', { email, newPassword })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi lại mã xác minh')
    }
  }
)

// Request change password (send OTP)
export const requestChangePassword = createAsyncThunk(
  'auth/requestChangePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/request-change-password', { currentPassword, newPassword })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gửi mã xác minh thất bại')
    }
  }
)

// Verify OTP and change password
export const verifyOTPAndChangePassword = createAsyncThunk(
  'auth/verifyOTPAndChangePassword',
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp-change-password', { code })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh thất bại')
    }
  }
)

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return true
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Resend verification code
      .addCase(resendVerificationCode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendVerificationCode.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resendVerificationCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify OTP and reset password
      .addCase(verifyOTPAndResetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTPAndResetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyOTPAndResetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Resend verification code for password reset
      .addCase(resendVerificationCodeResetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendVerificationCodeResetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resendVerificationCodeResetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Request change password
      .addCase(requestChangePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(requestChangePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(requestChangePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify OTP and change password
      .addCase(verifyOTPAndChangePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTPAndChangePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyOTPAndChangePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  }
})

export const { clearError, updateUser } = authSlice.actions
// verifyOTP and resendVerificationCode are already exported above
export default authSlice.reducer






