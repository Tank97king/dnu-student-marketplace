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
  }
})

export const { clearError, clearProduct } = productSlice.actions
export default productSlice.reducer








