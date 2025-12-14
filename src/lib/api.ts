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
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
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
}

// Setup API (for creating first admin)
export const setupApi = {
  createAdmin: (data: any) => api.post('/setup/create-admin', data),
}

