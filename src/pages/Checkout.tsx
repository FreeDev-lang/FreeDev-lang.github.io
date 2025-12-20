import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { cartApi, ordersApi, addressesApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'
import { CreditCard, Truck, FileText, CheckCircle2, MapPin } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  const { formatCurrency } = useCurrency()
  
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then(res => res.data),
  })
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then(res => res.data),
  })

  const { register, handleSubmit } = useForm()

  const orderMutation = useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
      navigate('/orders')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order')
    },
  })

  const onSubmit = (data: any) => {
    orderMutation.mutate({
      shippingAddressId: selectedAddress,
      billingAddressId: selectedAddress,
      paymentMethod: data.paymentMethod || 'CreditCard',
      notes: data.notes,
    })
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              {addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`block p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">{addr.streetAddress}</p>
                          <p className="text-sm text-gray-600">
                            {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                          {addr.country && (
                            <p className="text-sm text-gray-500 mt-1">{addr.country}</p>
                          )}
                        </div>
                        {selectedAddress === addr.id && (
                          <CheckCircle2 className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No addresses saved</p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Add Address in Profile
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {['CreditCard', 'PayPal', 'BankTransfer'].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-gray-50 transition-all"
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register('paymentMethod')}
                      defaultChecked={method === 'CreditCard'}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-medium text-gray-900">
                      {method === 'CreditCard' ? 'Credit Card' : method === 'PayPal' ? 'PayPal' : 'Bank Transfer'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order Notes</h2>
              </div>
              <textarea
                {...register('notes')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Any special instructions or delivery notes..."
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(cart.subTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">{formatCurrency(cart.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-medium">{formatCurrency(cart.taxAmount)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedAddress || orderMutation.isPending}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
              >
                {orderMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              {!selectedAddress && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  Please select a shipping address
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

