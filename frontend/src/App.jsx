import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTPResetPassword from './pages/VerifyOTPResetPassword'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import EditProduct from './pages/EditProduct'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import UserReviews from './pages/UserReviews'
import UserProfile from './pages/UserProfile'
import Favorites from './pages/Favorites'
import CategoryPage from './pages/CategoryPage'
import Help from './pages/Help'
import Feedback from './pages/Feedback'
import Orders from './pages/Orders'
import Offers from './pages/Offers'
import MyPromotions from './pages/MyPromotions'
import SellerDashboard from './pages/SellerDashboard'
import CompareProducts from './pages/CompareProducts'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  console.log('✅ App component rendered')
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp-reset-password" element={<VerifyOTPResetPassword />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/user/:userId/reviews" element={<UserReviews />} />
        <Route path="/help" element={<Help />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/seller-dashboard/:userId" element={<SellerDashboard />} />
          <Route path="/compare" element={<CompareProducts />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/my-promotions" element={<MyPromotions />} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Layout>
  )
}

export default App






