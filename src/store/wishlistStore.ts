import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Minimal product shape kept locally so the wishlist page can render for guests
// without a server round-trip.
export interface GuestWishlistItem {
  id: number
  model?: string
  nameFr?: string | null
  nameAr?: string | null
  category?: string
  price?: number
  discountPrice?: number | null
  images?: string[]
  averageRating?: number | null
  isFeatured?: boolean
  storeName?: string | null
}

interface WishlistState {
  items: GuestWishlistItem[]
  has: (productId: number) => boolean
  add: (product: GuestWishlistItem) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (productId) => get().items.some((p) => p.id === productId),
      add: (product) =>
        set((state) =>
          state.items.some((p) => p.id === product.id)
            ? state
            : { items: [...state.items, product] }
        ),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
