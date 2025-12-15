import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../lib/api'
import { AlertTriangle, Plus, TrendingDown, TrendingUp, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminInventory() {
  const [threshold, setThreshold] = useState(10)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustForm, setAdjustForm] = useState({ productId: 0, quantityChange: 0, reason: '', adjustmentType: 'Manual' })
  const queryClient = useQueryClient()

  const { data: lowStockAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['inventory-low-stock', threshold],
    queryFn: () => inventoryApi.getLowStockAlerts(threshold).then(res => res.data),
  })

  const { data: stockReport, isLoading: reportLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: () => inventoryApi.getStockReport().then(res => res.data),
  })

  const { data: adjustments, isLoading: adjustmentsLoading } = useQuery({
    queryKey: ['inventory-adjustments'],
    queryFn: () => inventoryApi.getStockAdjustments().then(res => res.data),
  })

  const adjustStockMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.adjustStock(data),
    onSuccess: () => {
      toast.success('Stock adjusted successfully')
      setShowAdjustModal(false)
      setAdjustForm({ productId: 0, quantityChange: 0, reason: '', adjustmentType: 'Manual' })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: () => {
      toast.error('Failed to adjust stock')
    },
  })

  const handleAdjustStock = () => {
    if (!adjustForm.productId || !adjustForm.quantityChange) {
      toast.error('Please fill in all required fields')
      return
    }
    adjustStockMutation.mutate(adjustForm)
  }

  if (alertsLoading || reportLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track stock levels and manage inventory</p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adjust Stock
        </button>
      </div>

      {/* Stock Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockReport?.totalProducts || 0}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{stockReport?.inStockProducts || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stockReport?.lowStockProducts || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stockReport?.outOfStockProducts || 0}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Threshold:</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-20"
              min="0"
            />
          </div>
        </div>
        {lowStockAlerts && lowStockAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.map((alert: any) => (
                  <tr key={alert.productId} className="border-b border-gray-100">
                    <td className="py-3 px-4">{alert.productName}</td>
                    <td className="py-3 px-4">{alert.sku || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${alert.currentStock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {alert.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4">{alert.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No low stock alerts</p>
        )}
      </div>

      {/* Stock Adjustments History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Adjustment History</h2>
        {adjustmentsLoading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : adjustments && adjustments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Change</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Previous</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">New</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj: any) => (
                  <tr key={adj.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{adj.productName}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${adj.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4">{adj.previousStock}</td>
                    <td className="py-3 px-4">{adj.newStock}</td>
                    <td className="py-3 px-4">{adj.reason || 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(adj.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No stock adjustments yet</p>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Adjust Stock</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <input
                  type="number"
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter product ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change</label>
                <input
                  type="number"
                  value={adjustForm.quantityChange}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Positive for increase, negative for decrease"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdjustStock}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Adjust
                </button>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

