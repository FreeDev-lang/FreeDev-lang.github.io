import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { cartApi } from '../lib/api'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useEffect, type ReactNode } from 'react'
import { useCurrency } from '../utils/currency'

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-btn border border-secondary-200 bg-white shadow-card-default">
      <button
        type="button"
        onClick={onDecrease}
        className="btn-icon h-9 w-9 rounded-none text-body-sm"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2rem] px-2 text-center text-body-sm font-semibold text-neutral-900">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="btn-icon h-9 w-9 rounded-none text-body-sm"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

function OrderSummaryCard({
  cart,
  action,
}: {
  cart: any
  action: ReactNode
}) {
  const { formatCurrency } = useCurrency()

  return (
    <div className="card sticky top-20 space-y-5 p-6">
      <div>
        <h2 className="text-h3 text-neutral-900">Order Summary</h2>
        <p className="mt-1 text-caption text-neutral-500">{cart.items?.length ?? 0} items</p>
      </div>

      <div className="space-y-3 text-body-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-medium text-neutral-900">{formatCurrency(cart.subTotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Shipping</span>
          <span className="font-medium text-neutral-900">{formatCurrency(cart.shippingCost)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Tax</span>
          <span className="font-medium text-neutral-900">{formatCurrency(cart.taxAmount)}</span>
        </div>
        {cart.discountAmount > 0 && (
          <div className="flex justify-between text-primary-700">
            <span>Discount</span>
            <span className="font-medium">−{formatCurrency(cart.discountAmount)}</span>
          </div>
        )}
      </div>

      <div className="divider pt-4">
        <div className="flex justify-between text-body font-bold text-neutral-900">
          <span>Total</span>
          <span>{formatCurrency(cart.totalAmount)}</span>
        </div>
      </div>

      {action}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShoppingBag
  title: string
  children: ReactNode
}) {
  return (
    <div className="section-inner py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-card bg-secondary-100">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h2 className="mt-5 text-h2 text-neutral-900">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  )
}

export default function Cart() {
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then((res) => res.data),
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
      <EmptyState icon={ShoppingBag} title="Please sign in to view your cart">
        <Link to="/login" className="btn btn-primary btn-pill">
          Sign In
        </Link>
      </EmptyState>
    )
  }

  if (isLoading) {
    return (
      <div className="section-inner py-16">
        <p className="text-body text-neutral-500">Loading cart...</p>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <EmptyState icon={ShoppingBag} title="Your cart is empty">
        <Link to="/products" className="btn btn-primary btn-pill">
          Continue Shopping
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="section-inner py-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-h1-md text-neutral-900">Shopping Cart</h1>
        <p className="mt-1 text-body text-neutral-500">Review items before checkout</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item: any) => (
            <article key={item.id} className="card flex gap-4 p-5 md:p-6">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="h-24 w-24 shrink-0 rounded-btn bg-secondary-100 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-btn bg-secondary-100 text-caption text-neutral-400">
                  No image
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-body font-semibold text-neutral-900">
                      {item.productName}
                    </h3>
                    <p className="mt-0.5 text-body-sm text-neutral-500">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(item.id)}
                    className="btn btn-ghost btn-sm shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    quantity={item.quantity}
                    onDecrease={() =>
                      updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })
                    }
                    onIncrease={() =>
                      updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })
                    }
                  />
                  <span className="text-body font-bold text-neutral-900">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="lg:col-span-1">
          <OrderSummaryCard
            cart={cart}
            action={
              <Link to="/checkout" className="btn btn-primary btn-lg w-full">
                Proceed to Checkout
              </Link>
            }
          />
        </div>
      </div>
    </div>
  )
}
