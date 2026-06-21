import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { storeAdminApi } from '../lib/api'
import { FileText, Search, Eye, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'
import { useTranslation } from '../utils/i18n'

interface Payment {
  id: number
  amount: number
  note?: string
  recordedByUserId?: number
  createdAt: string
}

interface Order {
  id: number
  orderNumber: string
  totalAmount: number
  amountPaid?: number
  remainingAmount?: number
  payments?: Payment[]
  orderStatus: string
  paymentStatus: string
  createdAt: string
  customer?: {
    firstName: string
    lastName: string
    email: string
  }
  orderItems: Array<{
    productName: string
    storeName?: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

export default function StoreAdminOrders() {
  const { storeId } = useOutletContext<{ storeId: number }>()
  const { formatCurrency } = useCurrency()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '' as number | '', note: '' })
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const loadOrders = useCallback(async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getOrders(storeId)
      setOrders(response.data)
    } catch (error: any) {
      toast.error('Failed to load orders')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeId) {
      loadOrders()
    }
  }, [storeId, loadOrders])

  const handleAddPayment = async () => {
    if (!selectedOrder) return
    const amount = Number(paymentForm.amount)
    const remaining = selectedOrder.remainingAmount ?? selectedOrder.totalAmount
    if (!amount || amount <= 0) {
      toast.error(t('payments.enterValidAmount'))
      return
    }
    if (amount > remaining) {
      toast.error(t('payments.exceedsRemaining'))
      return
    }
    setSubmittingPayment(true)
    try {
      const res = await storeAdminApi.addPayment(storeId, selectedOrder.id, {
        amount,
        note: paymentForm.note || undefined,
      })
      toast.success(t('payments.paymentRecorded'))
      setPaymentForm({ amount: '', note: '' })
      setSelectedOrder(res.data)
      await loadOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('payments.paymentFailed'))
    } finally {
      setSubmittingPayment(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Confirmed: 'bg-purple-100 text-purple-800',
      Paid: 'bg-green-100 text-green-800',
      Shipped: 'bg-indigo-100 text-indigo-800',
      Delivered: 'bg-green-100 text-green-800',
      PickedUp: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
      Refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter
    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalRevenue = filteredOrders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const orderStats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length,
    completed: filteredOrders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'PickedUp').length,
    paid: filteredOrders.filter(o => o.paymentStatus === 'Paid').length
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track all orders from your store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{orderStats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{orderStats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{orderStats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Paid">Paid</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="PickedUp">Picked Up</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customer ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.orderItems[0]?.productName}
                        {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => { setSelectedOrder(order); setPaymentForm({ amount: '', note: '' }) }}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail / Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {t('orders.orderNumber')}{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('orders.title')}</h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.storeName && <p className="text-xs text-gray-500">{item.storeName}</p>}
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{t('common.total')}:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>{t('payments.paid')}:</span>
                  <span>{formatCurrency(selectedOrder.amountPaid ?? 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-amber-700">
                  <span>{t('payments.remaining')}:</span>
                  <span>{formatCurrency(selectedOrder.remainingAmount ?? selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">{t('payments.history')}</h4>
                {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.payments.map((p) => (
                      <div key={p.id} className="flex justify-between text-sm border border-gray-100 rounded p-2">
                        <div>
                          <span className="font-medium">{formatCurrency(p.amount)}</span>
                          {p.note && <span className="text-gray-500"> — {p.note}</span>}
                        </div>
                        <span className="text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{t('payments.noPayments')}</p>
                )}
              </div>

              {(selectedOrder.remainingAmount ?? selectedOrder.totalAmount) > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">{t('payments.addPayment')}</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder={t('payments.amount')}
                      className="border border-gray-300 rounded-lg px-3 py-2 sm:w-32"
                    />
                    <input
                      type="text"
                      value={paymentForm.note}
                      onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                      placeholder={t('payments.noteOptional')}
                      className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
                    />
                    <button
                      onClick={handleAddPayment}
                      disabled={submittingPayment}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('payments.add')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

