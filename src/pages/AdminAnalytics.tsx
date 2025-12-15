import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../lib/api'
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react'

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  })

  const { data: dashboardStats } = useQuery({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: () => analyticsApi.getDashboardStats({
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    }).then(res => res.data),
  })

  const { data: salesReport } = useQuery({
    queryKey: ['analytics-sales', dateRange],
    queryFn: () => analyticsApi.getSalesReport(dateRange.fromDate, dateRange.toDate).then(res => res.data),
  })

  const { data: topProducts } = useQuery({
    queryKey: ['analytics-top-products', dateRange],
    queryFn: () => analyticsApi.getTopProducts({ limit: 10, fromDate: dateRange.fromDate, toDate: dateRange.toDate }).then(res => res.data),
  })

  const { data: couponUsage } = useQuery({
    queryKey: ['analytics-coupon-usage', dateRange],
    queryFn: () => analyticsApi.getCouponUsage({ fromDate: dateRange.fromDate, toDate: dateRange.toDate }).then(res => res.data),
  })

  const { data: customerAnalytics } = useQuery({
    queryKey: ['analytics-customers', dateRange],
    queryFn: () => analyticsApi.getCustomerAnalytics({ fromDate: dateRange.fromDate, toDate: dateRange.toDate }).then(res => res.data),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">View detailed analytics and reports</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.fromDate}
            onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={dateRange.toDate}
            onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardStats?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalOrders || 0}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardStats?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalCustomers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
        {topProducts && topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity Sold</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product: any, index: number) => (
                  <tr key={product.productId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <span className="font-medium mr-2">#{index + 1}</span>
                      {product.productName}
                    </td>
                    <td className="py-3 px-4">{product.sku || 'N/A'}</td>
                    <td className="py-3 px-4">{product.quantitySold}</td>
                    <td className="py-3 px-4 font-semibold">${product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Analytics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">New Customers</span>
              <span className="font-semibold">{customerAnalytics?.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Returning Customers</span>
              <span className="font-semibold">{customerAnalytics?.returningCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Customer Value</span>
              <span className="font-semibold">
                ${customerAnalytics?.averageCustomerValue?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Coupon Usage</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Coupons</span>
              <span className="font-semibold">{couponUsage?.totalCoupons || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Coupons</span>
              <span className="font-semibold">{couponUsage?.activeCoupons || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Usage</span>
              <span className="font-semibold">{couponUsage?.totalUsage || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Discount Given</span>
              <span className="font-semibold">
                ${couponUsage?.totalDiscountGiven?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      {salesReport && salesReport.dailySales && salesReport.dailySales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Sales</h2>
          <div className="space-y-2">
            {salesReport.dailySales.map((day: any) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString()}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="bg-primary-600 h-8 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(day.revenue / salesReport.totalRevenue) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      ${day.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {day.orderCount} orders
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

