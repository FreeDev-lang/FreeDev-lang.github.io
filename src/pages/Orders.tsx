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
    return (
      <div className="section">
        <div className="section-inner py-16">
          <div className="flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="section">
        <div className="section-inner py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
          <h2 className="text-h3 text-neutral-900">No orders yet</h2>
          <p className="mt-2 text-body text-neutral-600">Start shopping to see your orders here</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-primary-600" />
      case 'Shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      default:
        return <Package className="h-5 w-5 text-neutral-500" />
    }
  }

  return (
    <div className="section">
      <div className="section-inner py-8">
        <h1 className="text-h2 text-neutral-900">My Orders</h1>
        <p className="mt-1 text-body text-neutral-600">{orders.length} order{orders.length === 1 ? '' : 's'}</p>

        <div className="mt-8 space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-h4 text-neutral-900">Order #{order.orderNumber}</h3>
                  <p className="mt-1 text-caption text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.orderStatus)}
                  <span className="text-body-sm font-medium text-neutral-800">{order.orderStatus}</span>
                </div>
              </div>

              <div className="border-t border-secondary-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-body-sm text-neutral-600">{order.orderItems.length} items</p>
                  <div className="text-right">
                    <p className="text-body font-semibold text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                    {order.trackingNumber && (
                      <p className="mt-1 text-caption text-neutral-600">Tracking: {order.trackingNumber}</p>
                    )}
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
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
                          } catch {
                            toast.error('Failed to download receipt')
                          }
                        }}
                        className="btn btn-ghost btn-sm inline-flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Order Receipt
                      </button>
                      {order.paymentStatus === 'Paid' && (
                        <button
                          type="button"
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
                            } catch {
                              toast.error('Failed to download receipt')
                            }
                          }}
                          className="btn btn-ghost btn-sm inline-flex items-center gap-1 text-primary-700"
                        >
                          <Download className="h-4 w-4" />
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
    </div>
  )
}
