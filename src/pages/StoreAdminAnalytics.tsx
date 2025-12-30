import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { storeAdminApi } from '../lib/api'
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalOrders: number
    paidOrders: number
    pendingOrders: number
    shippedOrders: number
    deliveredOrders: number
    cancelledOrders: number
    averageOrderValue: number
    conversionRate: number
  }
  revenueByStatus: Array<{
    status: string
    revenue: number
    count: number
  }>
  revenueByMonth: Array<{
    year: number
    month: number
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    productId: number
    productName: string
    quantitySold: number
    revenue: number
  }>
}

export default function StoreAdminAnalytics() {
  const { storeId } = useOutletContext<{ storeId: number }>()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (storeId) {
      loadAnalytics()
    }
  }, [storeId, fromDate, toDate])

  const loadAnalytics = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getAnalytics(
        storeId,
        fromDate || undefined,
        toDate || undefined
      )
      setAnalytics(response.data)
    } catch (error: any) {
      toast.error('Failed to load analytics')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1] || ''
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Analytics data will appear here once you have orders.</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...analytics.revenueByMonth.map(m => m.revenue), 1)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your store's performance and sales metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${analytics.summary.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${analytics.summary.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.summary.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">{analytics.summary.pendingOrders}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">Shipped</div>
            <div className="text-2xl font-bold text-blue-800">{analytics.summary.shippedOrders}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Delivered</div>
            <div className="text-2xl font-bold text-green-800">{analytics.summary.deliveredOrders}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-600">Cancelled</div>
            <div className="text-2xl font-bold text-red-800">{analytics.summary.cancelledOrders}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Month</h2>
          {analytics.revenueByMonth.length > 0 ? (
            <div className="space-y-4">
              {analytics.revenueByMonth.map((month, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getMonthName(month.month)} {month.year}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${month.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{month.orders} orders</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Products</h2>
          {analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.quantitySold} sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${product.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No product sales data available</p>
          )}
        </div>
      </div>

      {/* Revenue by Status */}
      {analytics.revenueByStatus.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.revenueByStatus.map((status, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{status.status}</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  ${status.revenue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{status.count} orders</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

