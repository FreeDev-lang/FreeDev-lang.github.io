import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { cartApi, wishlistApi } from '../lib/api'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      await cartApi.add({ furnitureItemId: product.id, quantity: 1 })
      toast.success('Added to cart!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      toast.error('Please sign in to save items')
      return
    }

    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await wishlistApi.add(product.id)
        setIsWishlisted(true)
        toast.success('Added to wishlist!')
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist')
    }
  }

  const price = product.discountPrice || product.price
  const originalPrice = product.discountPrice ? product.price : null

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.model}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {product.discountPrice && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              Sale
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-semibold">
              Featured
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.model}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">${originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.averageRating && (
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full shadow-lg ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:text-red-500'
          } transition-colors`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleAddToCart}
          className="p-2 rounded-full bg-white text-gray-700 shadow-lg hover:text-primary-600 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

