import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminUsers from './pages/AdminUsers'
import AdminLayout from './pages/AdminLayout'
import AdminAddProduct from './pages/AdminAddProduct'
import SetupAdmin from './pages/SetupAdmin'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="setup-admin" element={<SetupAdmin />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        </Route>
        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminAddProduct />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App

