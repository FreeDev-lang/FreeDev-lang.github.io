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
  storeName?: string | null
}

interface AddItemInput {
  furnitureItemId: number
  productName: string
  productImage?: string
  unitPrice: number
  quantity?: number
  availableStock?: number
  storeName?: string | null
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
  addItem: (item: AddItemInput) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
}

function recompute(items: CartItem[]) {
  const subTotal = items.reduce((s, i) => s + i.totalPrice, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  return { subTotal, totalItems, totalAmount: subTotal }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
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
      addItem: (item) => {
        const items = [...get().items]
        const qty = item.quantity ?? 1
        const existing = items.find((i) => i.furnitureItemId === item.furnitureItemId)
        if (existing) {
          existing.quantity += qty
          existing.totalPrice = existing.quantity * existing.unitPrice
        } else {
          items.push({
            id: -Date.now(), // local-only temporary id
            furnitureItemId: item.furnitureItemId,
            productName: item.productName,
            productImage: item.productImage,
            unitPrice: item.unitPrice,
            totalPrice: qty * item.unitPrice,
            quantity: qty,
            availableStock: item.availableStock ?? 0,
            storeName: item.storeName,
          })
        }
        set({ items, ...recompute(items) })
      },
      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id)
        set({ items, ...recompute(items) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        const items = get().items.map((i) =>
          i.id === id ? { ...i, quantity, totalPrice: quantity * i.unitPrice } : i
        )
        set({ items, ...recompute(items) })
      },
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

