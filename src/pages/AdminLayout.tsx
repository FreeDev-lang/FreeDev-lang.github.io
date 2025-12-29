import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Users, Warehouse, UsersRound, Megaphone, BarChart3, FileText, Truck, Shield, FolderTree, LogOut, Bell, Share2, Store } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../utils/i18n'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/admin/dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('admin.products'), icon: Package },
    { path: '/admin/categories', label: t('admin.categories'), icon: FolderTree },
    { path: '/admin/orders', label: t('admin.orders'), icon: FileText },
    { path: '/admin/inventory', label: t('admin.inventory'), icon: Warehouse },
    { path: '/admin/customers', label: t('admin.customers'), icon: UsersRound },
    { path: '/admin/marketing', label: t('admin.marketing'), icon: Megaphone },
    { path: '/admin/notifications', label: 'Push Notifications', icon: Bell },
    { path: '/admin/social-media', label: 'Social Media', icon: Share2 },
    { path: '/admin/analytics', label: t('admin.analytics'), icon: BarChart3 },
    { path: '/admin/shipping', label: t('admin.shipping'), icon: Truck },
    { path: '/admin/activity-logs', label: t('admin.activityLogs'), icon: FileText },
    ...(user?.isSuperAdmin ? [
      { path: '/admin/stores', label: 'Stores', icon: Store },
      { path: '/admin/users', label: t('admin.userManagement'), icon: Users },
      { path: '/admin/platform', label: t('admin.platform'), icon: Shield },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Fria Admin</span>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('admin.disconnect')}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

