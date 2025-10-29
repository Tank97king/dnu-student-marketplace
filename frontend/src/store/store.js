import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    user: userReducer
  }
})








