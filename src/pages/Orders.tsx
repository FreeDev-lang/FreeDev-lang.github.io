import { useQuery } from '@tanstack/react-query'
import { ordersApi, receiptsApi } from '../lib/api'
import { Package, Truck, CheckCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'

export default function Orders() {
  const { formatCurrency } = useCurrency()
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then(res => res.data),
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-600">Start shopping to see your orders here</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Shipped':
        return <Truck className="w-5 h-5 text-blue-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.orderStatus)}
                <span className="font-medium">{order.orderStatus}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{order.orderItems.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                  {order.trackingNumber && (
                    <p className="text-sm text-gray-600">Tracking: {order.trackingNumber}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await receiptsApi.getOrderReceipt(order.id)
                          const url = window.URL.createObjectURL(new Blob([response.data]))
                          const link = document.createElement('a')
                          link.href = url
                          link.setAttribute('download', `order_receipt_${order.orderNumber}.pdf`)
                          document.body.appendChild(link)
                          link.click()
                          link.remove()
                          toast.success('Order receipt downloaded')
                        } catch (error) {
                          toast.error('Failed to download receipt')
                        }
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Order Receipt
                    </button>
                    {order.paymentStatus === 'Paid' && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await receiptsApi.getPaymentReceipt(order.id)
                            const url = window.URL.createObjectURL(new Blob([response.data]))
                            const link = document.createElement('a')
                            link.href = url
                            link.setAttribute('download', `payment_receipt_${order.orderNumber}.txt`)
                            document.body.appendChild(link)
                            link.click()
                            link.remove()
                            toast.success('Payment receipt downloaded')
                          } catch (error) {
                            toast.error('Failed to download receipt')
                          }
                        }}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Payment Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

