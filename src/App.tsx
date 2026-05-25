import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useLanguageStore, setPlatformCurrency } from './store/languageStore'
import { useQuery } from '@tanstack/react-query'
import { platformApi } from './lib/api'
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
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import StoreAdminRoute from './components/StoreAdminRoute'
import Chatbot from './components/Chatbot'

const ARViewerPage = lazy(() => import('./pages/ARViewerPage'))
const WebARPage = lazy(() => import('./pages/WebARPage'))
const SetupAdmin = lazy(() => import('./pages/SetupAdmin'))
const AdminLayout = lazy(() => import('./pages/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminAddProduct = lazy(() => import('./pages/AdminAddProduct'))
const AdminInventory = lazy(() => import('./pages/AdminInventory'))
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'))
const AdminMarketing = lazy(() => import('./pages/AdminMarketing'))
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'))
const AdminOrders = lazy(() => import('./pages/AdminOrders'))
const AdminActivityLogs = lazy(() => import('./pages/AdminActivityLogs'))
const AdminShipping = lazy(() => import('./pages/AdminShipping'))
const AdminPlatform = lazy(() => import('./pages/AdminPlatform'))
const AdminCategories = lazy(() => import('./pages/AdminCategories'))
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'))
const AdminSocialMedia = lazy(() => import('./pages/AdminSocialMedia'))
const AdminStores = lazy(() => import('./pages/AdminStores'))
const StoreAdminLayout = lazy(() => import('./pages/StoreAdminLayout'))
const StoreAdminDashboard = lazy(() => import('./pages/StoreAdminDashboard'))
const StoreAdminProfile = lazy(() => import('./pages/StoreAdminProfile'))
const StoreAdminLocations = lazy(() => import('./pages/StoreAdminLocations'))
const StoreAdminOrders = lazy(() => import('./pages/StoreAdminOrders'))
const StoreAdminAnalytics = lazy(() => import('./pages/StoreAdminAnalytics'))
const StoreAdminCustomization = lazy(() => import('./pages/StoreAdminCustomization'))
const StoreAdminProducts = lazy(() => import('./pages/StoreAdminProducts'))
const StoreAdminAddProduct = lazy(() => import('./pages/StoreAdminAddProduct'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  const { language } = useLanguageStore()

  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => platformApi.getSettings().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (platformSettings) {
      setPlatformCurrency({
        code: platformSettings.currencyCode,
        symbol: platformSettings.currencySymbol,
        name: platformSettings.currencyName,
      })
    }
  }, [platformSettings])

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl')
      document.documentElement.setAttribute('lang', 'ar')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
      document.documentElement.setAttribute('lang', language)
    }
  }, [language])

  return (
    <>
      <Routes>
        <Route path="/ar" element={<LazyPage><ARViewerPage /></LazyPage>} />
        <Route path="/webar" element={<LazyPage><WebARPage /></LazyPage>} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="stores" element={<Stores />} />
          <Route path="stores/:slug" element={<StoreDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="setup-admin" element={<LazyPage><SetupAdmin /></LazyPage>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        </Route>
        <Route path="admin" element={<AdminRoute><LazyPage><AdminLayout /></LazyPage></AdminRoute>}>
          <Route path="dashboard" element={<LazyPage><AdminDashboard /></LazyPage>} />
          <Route path="products" element={<LazyPage><AdminProducts /></LazyPage>} />
          <Route path="products/new" element={<LazyPage><AdminAddProduct /></LazyPage>} />
          <Route path="products/:id/edit" element={<LazyPage><AdminAddProduct /></LazyPage>} />
          <Route path="categories" element={<LazyPage><AdminCategories /></LazyPage>} />
          <Route path="orders" element={<LazyPage><AdminOrders /></LazyPage>} />
          <Route path="inventory" element={<LazyPage><AdminInventory /></LazyPage>} />
          <Route path="customers" element={<LazyPage><AdminCustomers /></LazyPage>} />
          <Route path="marketing" element={<LazyPage><AdminMarketing /></LazyPage>} />
          <Route path="notifications" element={<LazyPage><AdminNotifications /></LazyPage>} />
          <Route path="social-media" element={<LazyPage><AdminSocialMedia /></LazyPage>} />
          <Route path="analytics" element={<LazyPage><AdminAnalytics /></LazyPage>} />
          <Route path="shipping" element={<LazyPage><AdminShipping /></LazyPage>} />
          <Route path="activity-logs" element={<LazyPage><AdminActivityLogs /></LazyPage>} />
          <Route path="users" element={<LazyPage><AdminUsers /></LazyPage>} />
          <Route path="platform" element={<LazyPage><AdminPlatform /></LazyPage>} />
          <Route path="stores" element={<LazyPage><AdminStores /></LazyPage>} />
        </Route>
        <Route path="store-admin" element={<StoreAdminRoute><LazyPage><StoreAdminLayout /></LazyPage></StoreAdminRoute>}>
          <Route path="dashboard" element={<LazyPage><StoreAdminDashboard /></LazyPage>} />
          <Route path="products" element={<LazyPage><StoreAdminProducts /></LazyPage>} />
          <Route path="products/new" element={<LazyPage><StoreAdminAddProduct /></LazyPage>} />
          <Route path="products/:id/edit" element={<LazyPage><StoreAdminAddProduct /></LazyPage>} />
          <Route path="profile" element={<LazyPage><StoreAdminProfile /></LazyPage>} />
          <Route path="locations" element={<LazyPage><StoreAdminLocations /></LazyPage>} />
          <Route path="orders" element={<LazyPage><StoreAdminOrders /></LazyPage>} />
          <Route path="analytics" element={<LazyPage><StoreAdminAnalytics /></LazyPage>} />
          <Route path="customization" element={<LazyPage><StoreAdminCustomization /></LazyPage>} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
      <Chatbot />
    </>
  )
}

export default App
