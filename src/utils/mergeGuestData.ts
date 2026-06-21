import { cartApi, wishlistApi } from '../lib/api'
import { queryClient } from '../lib/queryClient'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'

/**
 * After a successful (non-guest) sign-in or sign-up, push any items the guest
 * accumulated locally up to the server account, then clear the local guest
 * stores. Individual failures (e.g. item already in the server cart) are
 * ignored so one bad item never blocks the rest of the merge.
 */
export async function mergeGuestData(): Promise<void> {
  const cartItems = useCartStore.getState().items
  const wishlistItems = useWishlistStore.getState().items

  // Merge guest cart -> server cart
  for (const item of cartItems) {
    try {
      await cartApi.add({
        furnitureItemId: item.furnitureItemId,
        quantity: item.quantity || 1,
      })
    } catch {
      /* ignore individual cart merge failures */
    }
  }

  // Merge guest wishlist -> server wishlist
  for (const item of wishlistItems) {
    try {
      await wishlistApi.add(item.id)
    } catch {
      /* ignore individual wishlist merge failures */
    }
  }

  // Clear the local guest stores; server is now the source of truth.
  try {
    useCartStore.getState().clearCart()
  } catch {
    /* ignore */
  }
  try {
    useWishlistStore.getState().clear()
  } catch {
    /* ignore */
  }

  // Refresh from server now that it is the source of truth.
  queryClient.invalidateQueries({ queryKey: ['cart'] })
  queryClient.invalidateQueries({ queryKey: ['wishlist'] })
}
