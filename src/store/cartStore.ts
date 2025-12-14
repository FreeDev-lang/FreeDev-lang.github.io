import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CartItem {
  id: number
  furnitureItemId: number
  productName: string
  productImage?: string
  unitPrice: number
  totalPrice: number
  quantity: number
  availableStock: number
}

interface CartState {
  items: CartItem[]
  subTotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  totalItems: number
  setCart: (cart: any) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      subTotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      totalItems: 0,
      setCart: (cart) => set({
        items: cart.items || [],
        subTotal: cart.subTotal || 0,
        shippingCost: cart.shippingCost || 0,
        taxAmount: cart.taxAmount || 0,
        discountAmount: cart.discountAmount || 0,
        totalAmount: cart.totalAmount || 0,
        totalItems: cart.totalItems || 0,
      }),
      clearCart: () => set({
        items: [],
        subTotal: 0,
        shippingCost: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        totalItems: 0,
      }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

