import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { cartApi } from '../lib/api'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

export default function Cart() {
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then(res => res.data),
    enabled: isAuthenticated(),
  })

  useEffect(() => {
    if (cart) {
      setCart(cart)
    }
  }, [cart, setCart])

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartApi.update(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed from cart')
    },
  })

  if (!isAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please sign in to view your cart</h2>
        <Link to="/login" className="text-primary-600 hover:text-primary-700">
          Sign In
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading cart...</div>
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary mt-4">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex gap-4">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.productName}</h3>
                  <p className="text-gray-600 mb-2">${item.unitPrice.toFixed(2)} each</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
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
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link to="/checkout" className="block w-full btn btn-primary text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

