import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  }
}

// Fetch products
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải sản phẩm')
    }
  }
)

// Fetch single product
export const fetchProduct = createAsyncThunk(
  'product/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy sản phẩm')
    }
  }
)

// Create product
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          productData[key].forEach(img => formData.append('images', img))
        } else {
          formData.append(key, productData[key])
        }
      })

      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo sản phẩm thất bại')
    }
  }
)

// Update product
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      
      // Add text fields
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'newImages') {
          if (productData[key] !== undefined && productData[key] !== null) {
            formData.append(key, productData[key])
          }
        }
      })

      // Add existing images as JSON string (backend will parse)
      if (productData.images && Array.isArray(productData.images)) {
        formData.append('images', JSON.stringify(productData.images))
      }

      // Add new image files
      if (productData.newImages && productData.newImages.length > 0) {
        productData.newImages.forEach(file => {
          formData.append('images', file)
        })
      }

      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật sản phẩm thất bại')
    }
  }
)

// Delete product
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa sản phẩm thất bại')
    }
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearProduct: (state) => {
      state.product = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload.data
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.error = null
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Update product in state if it's the current product
        if (state.product && state.product._id === action.payload.data._id) {
          state.product = action.payload.data
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false
        state.error = null
        state.product = null
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearProduct } = productSlice.actions
export default productSlice.reducer








