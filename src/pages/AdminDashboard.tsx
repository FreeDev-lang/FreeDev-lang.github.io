import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats().then(res => res.data),
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-600',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your e-commerce platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

