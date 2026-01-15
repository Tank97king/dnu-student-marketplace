import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import userReducer from './slices/userSlice'
import postReducer from './slices/postSlice'
import storyReducer from './slices/storySlice'
import followReducer from './slices/followSlice'
import collectionReducer from './slices/collectionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    user: userReducer,
    post: postReducer,
    story: storyReducer,
    follow: followReducer,
    collection: collectionReducer
  }
})








