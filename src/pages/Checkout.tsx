import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { cartApi, ordersApi, addressesApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'
import { CreditCard, Truck, FileText, CheckCircle2, MapPin, ShoppingBag } from 'lucide-react'

function CheckoutSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description?: string
  icon: typeof MapPin
  children: ReactNode
}) {
  return (
    <section className="card space-y-5 p-6">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden />
        <div>
          <h2 className="text-h3 text-neutral-900">{title}</h2>
          {description && <p className="mt-1 text-body-sm text-neutral-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function SelectableCard({
  selected,
  children,
  className = '',
}: {
  selected: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-card border-2 p-4 transition-all duration-brand md:p-5 ${
        selected
          ? 'border-primary-600 bg-primary-50 shadow-card-default'
          : 'border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50/50'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then((res) => res.data),
  })

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  })

  const { register, handleSubmit, watch } = useForm({
    defaultValues: { paymentMethod: 'CashOnDelivery', notes: '' },
  })

  const selectedPayment = watch('paymentMethod')

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
      paymentMethod: data.paymentMethod || 'CashOnDelivery',
      notes: data.notes,
    })
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="section-inner py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-card bg-secondary-100">
          <ShoppingBag className="h-8 w-8 text-neutral-400" />
        </div>
        <p className="mt-5 text-body text-neutral-600">Your cart is empty</p>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="btn btn-primary btn-pill mt-6"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="section-inner py-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-h1-md text-neutral-900">Checkout</h1>
        <p className="mt-1 text-body text-neutral-500">Complete your order</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CheckoutSection
            title="Shipping Address"
            description="Choose where your order should be delivered"
            icon={MapPin}
          >
            {addresses && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr: any) => (
                  <label key={addr.id} className="block cursor-pointer">
                    <SelectableCard selected={selectedAddress === addr.id}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm font-semibold text-neutral-900">
                            {addr.streetAddress}
                          </p>
                          <p className="mt-0.5 text-body-sm text-neutral-600">
                            {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                          {addr.country && (
                            <p className="mt-0.5 text-caption text-neutral-500">{addr.country}</p>
                          )}
                        </div>
                        {selectedAddress === addr.id && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" />
                        )}
                      </div>
                    </SelectableCard>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-card bg-secondary-50 py-8 text-center">
                <MapPin className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
                <p className="text-body-sm text-neutral-600">No addresses saved</p>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="nav-link mt-3 inline-flex text-primary-700"
                >
                  Add Address in Profile
                </button>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection
            title="Payment Method"
            description="Choose how you'd like to pay on delivery"
            icon={CreditCard}
          >
            <p className="mb-3 rounded-card bg-secondary-50 px-4 py-3 text-body-sm text-neutral-600">
              Payment is collected on delivery. Your order is placed as Pending until the store
              confirms it.
            </p>
            <div className="space-y-3">
              {[
                { value: 'CashOnDelivery', label: 'Cash on delivery' },
                { value: 'CardOnDelivery', label: 'Card on delivery' },
              ].map((method) => (
                <label key={method.value} className="block cursor-pointer">
                  <SelectableCard selected={selectedPayment === method.value}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value={method.value}
                        {...register('paymentMethod')}
                        className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-body-sm font-medium text-neutral-900">{method.label}</span>
                    </div>
                  </SelectableCard>
                </label>
              ))}
            </div>
          </CheckoutSection>

          <CheckoutSection
            title="Order Notes"
            description="Optional delivery or gift instructions"
            icon={FileText}
          >
            <textarea
              {...register('notes')}
              className="textarea"
              rows={4}
              placeholder="Any special instructions or delivery notes..."
            />
          </CheckoutSection>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 space-y-5 p-6">
            <div>
              <h2 className="text-h3 text-neutral-900">Order Summary</h2>
              <p className="mt-1 text-caption text-neutral-500">{cart.items.length} items</p>
            </div>

            <div className="max-h-48 space-y-3 overflow-y-auto text-body-sm">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between gap-3 text-neutral-600">
                  <span className="line-clamp-2 min-w-0">
                    {item.productName}
                    <span className="text-neutral-400"> × {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium text-neutral-900">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
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
            </div>

            <div className="divider pt-4">
              <div className="flex justify-between text-body font-bold text-neutral-900">
                <span>Total</span>
                <span className="text-primary-700">{formatCurrency(cart.totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedAddress || orderMutation.isPending}
              className="btn btn-primary btn-lg w-full gap-2"
            >
              {orderMutation.isPending ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  Place Order
                </>
              )}
            </button>

            {!selectedAddress && (
              <p className="text-center text-caption text-red-600">Please select a shipping address</p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
