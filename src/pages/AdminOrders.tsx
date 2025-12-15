import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, receiptsApi } from '../lib/api'
import { Eye, RefreshCw, DollarSign, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'

export default function AdminOrders() {
  const { formatCurrency } = useCurrency()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [statusForm, setStatusForm] = useState({
    orderStatus: '',
    trackingNumber: '',
    shippingLabelInfo: '',
    shippingMethodId: null as number | null,
    notes: '',
  })
  const [refundForm, setRefundForm] = useState({
    refundAmount: 0,
    reason: '',
    restoreStock: true,
  })
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAll().then(res => res.data),
  })

  const { data: orderDetail } = useQuery({
    queryKey: ['admin-order-detail', selectedOrder?.id],
    queryFn: () => ordersApi.getByIdForAdmin(selectedOrder.id).then((res: any) => res.data),
    enabled: !!selectedOrder,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: any) => ordersApi.updateStatus(id, data),
    onSuccess: () => {
      toast.success('Order status updated')
      setShowStatusModal(false)
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  const refundMutation = useMutation({
    mutationFn: ({ id, data }: any) => ordersApi.refund(id, data),
    onSuccess: () => {
      toast.success('Order refunded successfully')
      setShowRefundModal(false)
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
  }

  const handleUpdateStatus = (order: any) => {
    setStatusForm({
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber || '',
      shippingLabelInfo: order.shippingLabelInfo || '',
      shippingMethodId: null,
      notes: order.notes || '',
    })
    setSelectedOrder(order)
    setShowStatusModal(true)
  }

  const handleRefund = (order: any) => {
    setRefundForm({
      refundAmount: order.totalAmount,
      reason: '',
      restoreStock: true,
    })
    setSelectedOrder(order)
    setShowRefundModal(true)
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Confirmed: 'bg-indigo-100 text-indigo-800',
      Paid: 'bg-green-100 text-green-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      PickedUp: 'bg-teal-100 text-teal-800',
      Cancelled: 'bg-red-100 text-red-800',
      Refunded: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-2">View and manage all orders</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-primary-600 hover:text-primary-700"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Update Status"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      {order.paymentStatus === 'Paid' && order.orderStatus !== 'Refunded' && (
                        <button
                          onClick={() => handleRefund(order)}
                          className="text-red-600 hover:text-red-700"
                          title="Refund"
                        >
                          <DollarSign className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && orderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order Details - {orderDetail.orderNumber}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1">
                    {orderDetail.customer ? `${orderDetail.customer.firstName} ${orderDetail.customer.lastName}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1">{new Date(orderDetail.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetail.orderStatus)}`}>
                      {orderDetail.orderStatus}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetail.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetail.paymentStatus}
                    </span>
                  </p>
                </div>
                {orderDetail.trackingNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                    <p className="mt-1">{orderDetail.trackingNumber}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {orderDetail.orderItems.map((item: any) => (
                    <div key={item.id} className="border border-gray-200 rounded p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetail.subTotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatCurrency(orderDetail.shippingCost)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax:</span>
                  <span>{formatCurrency(orderDetail.taxAmount)}</span>
                </div>
                {orderDetail.discountAmount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(orderDetail.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(orderDetail.totalAmount)}</span>
                </div>
              </div>
              <div className="border-t pt-4 flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const response = await receiptsApi.getOrderReceipt(orderDetail.id)
                      const url = window.URL.createObjectURL(new Blob([response.data]))
                      const link = document.createElement('a')
                      link.href = url
                      link.setAttribute('download', `order_receipt_${orderDetail.orderNumber}.txt`)
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                      toast.success('Order receipt downloaded')
                    } catch (error) {
                      toast.error('Failed to download receipt')
                    }
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Order Receipt
                </button>
                {orderDetail.paymentStatus === 'Paid' && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await receiptsApi.getPaymentReceipt(orderDetail.id)
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `payment_receipt_${orderDetail.orderNumber}.txt`)
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        toast.success('Payment receipt downloaded')
                      } catch (error) {
                        toast.error('Failed to download receipt')
                      }
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Payment Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status *</label>
                <select
                  value={statusForm.orderStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="PickedUp">Picked Up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={statusForm.trackingNumber}
                  onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Label Info</label>
                <textarea
                  value={statusForm.shippingLabelInfo}
                  onChange={(e) => setStatusForm({ ...statusForm, shippingLabelInfo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, data: statusForm })}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Refund Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount *</label>
                <input
                  type="number"
                  value={refundForm.refundAmount}
                  onChange={(e) => setRefundForm({ ...refundForm, refundAmount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={refundForm.restoreStock}
                  onChange={(e) => setRefundForm({ ...refundForm, restoreStock: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Restore stock to inventory</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => refundMutation.mutate({ id: selectedOrder.id, data: refundForm })}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Refund
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
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

