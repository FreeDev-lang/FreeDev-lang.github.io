import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  socialLogin: (data: any) => api.post('/auth/social-login', data),
  googleLogin: (data: any) => api.post('/auth/google', data),
  facebookLogin: (data: any) => api.post('/auth/facebook', data),
  instagramLogin: (data: any) => api.post('/auth/instagram', data),
  verifySocialLogin: (data: any) => api.post('/auth/social-login/verify', data),
  linkSocialAccount: (data: any) => api.post('/auth/social/link', data),
  unlinkSocialAccount: (provider: string) => api.post('/auth/social/unlink', { provider }),
  getLinkedAccounts: () => api.get('/auth/social/accounts'),
  createGuest: () => api.post('/auth/guest'),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: any) => api.put('/auth/me', data),
}

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/furniture', { params }),
  getById: (id: number) => api.get(`/furniture/${id}`),
  search: (data: any) => api.post('/furniture/search', data),
  getCategories: () => api.get('/furniture/categories'),
  getFeatured: (limit = 10) => api.get(`/furniture/featured?limit=${limit}`),
  getRelated: (id: number, limit = 5) => api.get(`/furniture/${id}/related?limit=${limit}`),
  getLightweight: (params?: any) => api.get('/furniture/lightweight', { params }),
  create: (formData: FormData) => api.post('/furniture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: number, formData: FormData) => api.put(`/furniture/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: number) => api.delete(`/furniture/${id}`),
}

// Product Groups API
export const productGroupsApi = {
  getAll: () => api.get('/productgroups'),
  getById: (id: number) => api.get(`/productgroups/${id}`),
}

// Product Colors API
export const productColorsApi = {
  getByProduct: (productId: number) => api.get(`/productcolors/product/${productId}`),
  create: (productId: number, data: any) => api.post(`/productcolors/product/${productId}`, data),
  update: (id: number, data: any) => api.put(`/productcolors/${id}`, data),
  delete: (id: number) => api.delete(`/productcolors/${id}`),
}

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: any) => api.post('/cart', data),
  update: (id: number, data: any) => api.put(`/cart/${id}`, data),
  remove: (id: number) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
  validateDiscount: (code: string) => api.post('/cart/validate-discount', { code }),
}

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  getByIdForAdmin: (id: number) => api.get(`/orders/${id}/admin`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
  updateStatus: (id: number, data: any) => api.put(`/orders/${id}/status`, data),
  refund: (id: number, data: any) => api.post(`/orders/${id}/refund`, data),
  updateNotes: (id: number, data: any) => api.put(`/orders/${id}/notes`, data),
}

// Wishlist API
export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  add: (productId: number) => api.post(`/wishlist/${productId}`),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
  check: (productId: number) => api.get(`/wishlist/${productId}/check`),
}

// Reviews API
export const reviewsApi = {
  getByProduct: (productId: number) => api.get(`/reviews/product/${productId}`),
  create: (data: any) => api.post('/reviews', data),
  update: (id: number, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
}

// Addresses API
export const addressesApi = {
  getAll: () => api.get('/addresses'),
  create: (data: any) => api.post('/addresses', data),
  update: (id: number, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/addresses/${id}`),
  setDefault: (id: number) => api.post(`/addresses/${id}/set-default`),
}

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  makeAdmin: (id: number) => api.post(`/admin/users/${id}/make-admin`),
  removeAdmin: (id: number) => api.post(`/admin/users/${id}/remove-admin`),
  makeSuperAdmin: (id: number) => api.post(`/admin/users/${id}/make-super-admin`),
  removeSuperAdmin: (id: number) => api.post(`/admin/users/${id}/remove-super-admin`),
  // Store Management
  getAllStores: (params?: { status?: string; city?: string; country?: string }) => 
    api.get('/admin/stores', { params }),
  getPendingStores: () => api.get('/admin/stores/pending'),
  createStore: (data: any, ownerId: number) => api.post(`/admin/stores?ownerId=${ownerId}`, data),
  updateStore: (id: number, data: any) => api.put(`/admin/stores/${id}`, data),
  updateStoreStatus: (id: number, status: string) => api.put(`/admin/stores/${id}/status`, { status }),
  getStoreStats: (id: number) => api.get(`/admin/stores/${id}/stats`),
  addStoreAdmin: (id: number, data: any) => api.post(`/admin/stores/${id}/admins`, data),
  removeStoreAdmin: (id: number, adminUserId: number) => 
    api.delete(`/admin/stores/${id}/admins/${adminUserId}`),
}

// Inventory API
export const inventoryApi = {
  getLowStockAlerts: (threshold?: number) => api.get('/inventory/low-stock', { params: { threshold } }),
  adjustStock: (data: any) => api.post('/inventory/adjust', data),
  getStockAdjustments: (params?: any) => api.get('/inventory/adjustments', { params }),
  getStockReport: () => api.get('/inventory/report'),
}

// Customers API (CRM)
export const customersApi = {
  getAll: (search?: string) => api.get('/customers', { params: { search } }),
  getById: (id: number) => api.get(`/customers/${id}`),
  resetPassword: (id: number, data: any) => api.post(`/customers/${id}/reset-password`, data),
  deactivate: (id: number) => api.post(`/customers/${id}/deactivate`),
  activate: (id: number) => api.post(`/customers/${id}/activate`),
  export: () => api.get('/customers/export', { responseType: 'blob' }),
}

// Marketing API
export const marketingApi = {
  getActiveBanners: () => api.get('/marketing/banners'),
  getAllBanners: () => api.get('/marketing/banners/all'),
  getBanner: (id: number) => api.get(`/marketing/banners/${id}`),
  createBanner: (formData: FormData) => api.post('/marketing/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateBanner: (id: number, formData: FormData) => api.put(`/marketing/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteBanner: (id: number) => api.delete(`/marketing/banners/${id}`),
  getFeaturedProducts: () => api.get('/marketing/featured-products'),
  setFeaturedProducts: (data: any) => api.post('/marketing/featured-products', data),
  sendFeaturedProductNotification: () => api.post('/marketing/featured-products/notify'),
  notifyBanner: (id: number) => api.post(`/marketing/banners/${id}/notify`),
  sendNotification: (data: any) => api.post('/marketing/notifications/send', data),
  shareToFacebook: (data: any) => api.post('/marketing/social/share-facebook', data),
  shareToInstagram: (data: any) => api.post('/marketing/social/share-instagram', data),
  schedulePost: (data: any) => api.post('/marketing/social/schedule-post', data),
  getScheduledPosts: () => api.get('/marketing/social/scheduled-posts'),
}

// Analytics API
export const analyticsApi = {
  getDashboardStats: (params?: any) => api.get('/analytics/dashboard', { params }),
  getSalesReport: (fromDate: string, toDate: string) => api.get('/analytics/sales', { params: { fromDate, toDate } }),
  getTopProducts: (params?: any) => api.get('/analytics/top-products', { params }),
  getTopBrands: (params?: any) => api.get('/analytics/top-brands', { params }),
  getCouponUsage: (params?: any) => api.get('/analytics/coupon-usage', { params }),
  getCustomerAnalytics: (params?: any) => api.get('/analytics/customers', { params }),
  getSalesReportPdf: (fromDate: string, toDate: string) => api.get('/analytics/sales/pdf', { params: { fromDate, toDate }, responseType: 'blob' }),
  getDashboardReportPdf: (params?: any) => api.get('/analytics/dashboard/pdf', { params, responseType: 'blob' }),
  getCustomerAnalyticsPdf: (params?: any) => api.get('/analytics/customers/pdf', { params, responseType: 'blob' }),
  getCouponUsageReportPdf: (params?: any) => api.get('/analytics/coupon-usage/pdf', { params, responseType: 'blob' }),
}

// Activity Logs API
export const activityLogsApi = {
  getAll: (params?: any) => api.get('/activitylogs', { params }),
}

// Platform API (SuperAdmin only)
export const platformApi = {
  shutdown: () => api.post('/platform/shutdown'),
  restart: () => api.post('/platform/restart'),
  getStatus: () => api.get('/platform/status'),
  getSettings: () => api.get('/platform/settings'),
  updateCurrency: (currencyCode: string) => api.put('/platform/settings/currency', { currencyCode }),
}

// Shipping Methods API
export const shippingMethodsApi = {
  getAll: () => api.get('/shippingmethods'),
  getAllActive: () => api.get('/shippingmethods/all'),
  getById: (id: number) => api.get(`/shippingmethods/${id}`),
  create: (data: any) => api.post('/shippingmethods', data),
  update: (id: number, data: any) => api.put(`/shippingmethods/${id}`, data),
  delete: (id: number) => api.delete(`/shippingmethods/${id}`),
}


// Product Categories API
export const categoriesApi = {
  getAll: (includeInactive?: boolean) => api.get('/productcategories', { params: { includeInactive } }),
  getById: (id: number) => api.get(`/productcategories/${id}`),
  getBySlug: (slug: string) => api.get(`/productcategories/slug/${slug}`),
  create: (data: any) => api.post('/productcategories', data),
  update: (id: number, data: any) => api.put(`/productcategories/${id}`, data),
  delete: (id: number) => api.delete(`/productcategories/${id}`),
  checkExists: (data: any) => api.post('/productcategories/check-exists', data),
}

// Receipts API
export const receiptsApi = {
  getOrderReceipt: (orderId: number) => api.get(`/receipts/order/${orderId}`, { responseType: 'blob' }),
  getPaymentReceipt: (orderId: number) => api.get(`/receipts/payment/${orderId}`, { responseType: 'blob' }),
}

// QR Code API
export const qrCodeApi = {
  getProductQRCode: (productId: number, size?: number) => api.get(`/qrcode/product/${productId}`, { 
    params: { size },
    responseType: 'blob' 
  }),
}

// AR API
export const arApi = {
  getProductTextures: (productId: number) => api.get(`/productcolors/product/${productId}`),
  getProductModel: (productId: number) => api.get(`/furniture/${productId}`),
  trackARSession: (data: any) => api.post('/ar-sessions', data),
}

// Setup API (for creating first admin)
export const setupApi = {
  createAdmin: (data: any) => api.post('/setup/create-admin', data),
}

// Notifications API
export const notificationsApi = {
  registerDeviceToken: (data: any) => api.post('/notifications/register', data),
  sendNotification: (data: any) => api.post('/notifications/send', data),
  sendToUser: (userId: number, data: any) => api.post(`/notifications/send-to-user/${userId}`, data),
  sendToAll: (data: any) => api.post('/notifications/send-to-all', data),
}

// Stores API (Public)
export const storesApi = {
  getAll: (params?: { status?: string; city?: string; country?: string }) => 
    api.get('/stores', { params }),
  getBySlug: (slug: string) => api.get(`/stores/${slug}`),
  getById: (id: number) => api.get(`/stores/id/${id}`),
  getProducts: (id: number) => api.get(`/stores/${id}/products`),
  getLocations: (id: number) => api.get(`/stores/${id}/locations`),
  getCustomization: (id: number) => api.get(`/stores/${id}/customization`),
}

// Store Admin API
export const storeAdminApi = {
  getDashboard: (storeId: number) => api.get(`/store-admin/dashboard?storeId=${storeId}`),
  updateProfile: (storeId: number, data: any) => api.put(`/store-admin/profile?storeId=${storeId}`, data),
  addLocation: (storeId: number, data: any) => api.post(`/store-admin/locations?storeId=${storeId}`, data),
  updateLocation: (storeId: number, posId: number, data: any) => 
    api.put(`/store-admin/locations/${posId}?storeId=${storeId}`, data),
  deleteLocation: (storeId: number, posId: number) => 
    api.delete(`/store-admin/locations/${posId}?storeId=${storeId}`),
  getLocations: (storeId: number) => api.get(`/store-admin/locations?storeId=${storeId}`),
  updateCustomization: (storeId: number, data: any) => 
    api.put(`/store-admin/customization?storeId=${storeId}`, data),
  getOrders: (storeId: number) => api.get(`/store-admin/orders?storeId=${storeId}`),
  getAnalytics: (storeId: number) => api.get(`/store-admin/analytics?storeId=${storeId}`),
}

