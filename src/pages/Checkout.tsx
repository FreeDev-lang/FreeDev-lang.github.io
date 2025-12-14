import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { cartApi, ordersApi, addressesApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {addresses && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr: any) => (
                  <label
                    key={addr.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer ${
                      selectedAddress === addr.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mr-2"
                    />
                    <div>
                      <p className="font-medium">{addr.streetAddress}</p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No addresses saved. Add one in your profile.</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <select {...register('paymentMethod')} className="input">
              <option value="CreditCard">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
            <textarea
              {...register('notes')}
              className="input"
              rows={4}
              placeholder="Any special instructions..."
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cart.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${cart.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${cart.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!selectedAddress || orderMutation.isPending}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {orderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

