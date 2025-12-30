import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, MapPin, FileText, BarChart3, Settings, LogOut, Eye, Package } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { storeAdminApi } from '../lib/api'

interface Store {
  id: number
  name: string
  slug: string
  status: string
}

export default function StoreAdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const response = await storeAdminApi.getMyStores()
      setStores(response.data)
      if (response.data.length > 0 && !selectedStoreId) {
        setSelectedStoreId(response.data[0].id)
        // Store selected store in sessionStorage
        sessionStorage.setItem('selectedStoreId', response.data[0].id.toString())
      } else {
        const stored = sessionStorage.getItem('selectedStoreId')
        if (stored) {
          setSelectedStoreId(parseInt(stored))
        }
      }
    } catch (error) {
      console.error('Failed to load stores', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoreChange = (storeId: number) => {
    setSelectedStoreId(storeId)
    sessionStorage.setItem('selectedStoreId', storeId.toString())
    // Navigate to dashboard when store changes
    navigate('/store-admin/dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/store-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/store-admin/products', label: 'Products', icon: Package },
    { path: '/store-admin/profile', label: 'Store Profile', icon: Store },
    { path: '/store-admin/locations', label: 'Locations', icon: MapPin },
    { path: '/store-admin/orders', label: 'Orders', icon: FileText },
    { path: '/store-admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/store-admin/customization', label: 'Customization', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Stores Found</h2>
          <p className="text-gray-600 mb-4">You don't have access to any stores.</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const selectedStore = stores.find(s => s.id === selectedStoreId) || stores[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Store Admin</span>
            </div>

            {/* Store Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Store
              </label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => handleStoreChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} {store.status !== 'Active' && `(${store.status})`}
                  </option>
                ))}
              </select>
              {selectedStore && (
                <Link
                  to={`/stores/${selectedStore.slug}`}
                  target="_blank"
                  className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Eye className="w-4 h-4" />
                  View Store Page
                </Link>
              )}
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    state={{ storeId: selectedStoreId }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="px-4 py-2 mb-4">
                <div className="text-sm text-gray-500">Logged in as</div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet context={{ storeId: selectedStoreId, store: selectedStore }} />
        </main>
      </div>
    </div>
  )
}

