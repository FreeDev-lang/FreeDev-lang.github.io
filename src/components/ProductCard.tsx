import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cardHoverWhile } from '../utils/motion'
import { useAuthStore } from '../store/authStore'
import { cartApi, wishlistApi } from '../lib/api'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrency } from '../utils/currency'
import { useTranslation } from '../utils/i18n'

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { formatCurrency } = useCurrency()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      toast.error(t('common.signInToAdd'))
      return
    }

    try {
      await cartApi.add({ furnitureItemId: product.id, quantity: 1 })
      toast.success(t('common.addedToCart'))
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.failedToAdd'))
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      toast.error(t('common.signInToSave'))
      return
    }

    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id)
        setIsWishlisted(false)
        toast.success(t('common.removedFromWishlist'))
      } else {
        await wishlistApi.add(product.id)
        setIsWishlisted(true)
        toast.success(t('common.addedToWishlist'))
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.failedToUpdate'))
    }
  }

  const price = product.discountPrice || product.price
  const originalPrice = product.discountPrice ? product.price : null

  return (
    <motion.article
      whileHover={cardHoverWhile}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="group flex h-full flex-col overflow-hidden rounded-frame border border-secondary-200 bg-white shadow-card-default transition-shadow duration-brand hover:border-accent-300/70 hover:shadow-card-hover"
    >
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-secondary-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.model}
            className="h-full w-full object-cover transition-transform duration-brand ease-brand group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-body-sm text-neutral-400">
            {t('products.noImage')}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {product.discountPrice && (
            <span className="badge rounded-pill bg-midnight/90 text-accent-300 backdrop-blur-sm">
              {t('products.sale')}
            </span>
          )}
          {product.isFeatured && (
            <span className="badge-gold ml-auto rounded-pill backdrop-blur-sm">
              {t('products.featured')}
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-end gap-1 border-b border-secondary-100 bg-white px-3 py-2 opacity-70 transition-opacity duration-brand group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`btn-icon h-9 w-9 rounded-pill transition-all duration-brand ${
            isWishlisted
              ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
              : 'text-neutral-600 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="btn-icon h-9 w-9 rounded-pill text-neutral-600 transition-all duration-brand hover:text-primary-700"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      <Link to={`/products/${product.id}`} className="flex flex-1 flex-col px-4 pb-5 pt-4">
        <p className="mb-1.5 text-eyebrow uppercase text-accent-600">
          {product.category}
        </p>
        <h3 className="mb-3 line-clamp-1 font-display text-lg font-semibold text-neutral-900 transition-colors duration-brand group-hover:text-primary-700">
          {product.model}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-secondary-100 pt-3">
          <div className="min-w-0">
            <span className="text-body font-semibold text-neutral-900">{formatCurrency(price)}</span>
            {originalPrice && (
              <span className="ml-2 text-body-sm text-neutral-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {product.averageRating != null && product.averageRating > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-pill bg-secondary-100 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden />
              <span className="text-caption font-semibold text-neutral-700">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
