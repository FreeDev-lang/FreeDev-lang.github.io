import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { productsApi, cartApi, wishlistApi, reviewsApi } from '../lib/api'
import { ShoppingCart, Heart, Star, ArrowLeft, Package, Truck, Box } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrency } from '../utils/currency'
import Model3DViewer from '../components/ar/Model3DViewer'
import ARButton from '../components/ar/ARButton'

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const [show3DViewer, setShow3DViewer] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then(res => res.data),
    enabled: !!id,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getByProduct(Number(id)).then(res => res.data),
    enabled: !!id,
  })

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      await cartApi.add({ furnitureItemId: product.id, quantity })
      toast.success('Added to cart!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleToggleWishlist = async () => {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist')
    }
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Product not found</div>
  }

  const price = product.discountPrice || product.price
  const originalPrice = product.discountPrice ? product.price : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images / 3D Viewer */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] mb-4 relative">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {/* 3D View Toggle Button */}
            {product.rendablePath && (
              <button
                onClick={() => setShow3DViewer(true)}
                className="absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Box className="w-5 h-5" />
                View 3D Model
              </button>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={img} alt={`${product.model} ${idx + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.model}</h1>
          <p className="text-lg text-gray-600 mb-4">{product.category}</p>

          <div className="flex items-center gap-4 mb-6">
            <div>
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through ml-2">{formatCurrency(originalPrice)}</span>
              )}
            </div>
            {product.averageRating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>

          {/* AR / QR Code Section */}
          {product.rendablePath && (
            <div className="mb-6">
              <ARButton
                productId={product.id.toString()}
                productName={product.model}
                textureId={selectedColor?.id?.toString()}
                modelUrl={product.rendablePath}
                className="w-full"
                variant="primary"
              />
            </div>
          )}

          {/* Available Colors */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor?.id === color.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {color.hexCode && (
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      )}
                      <span>{color.colorName}</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedColor?.modelPath && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700 mb-2">
                    AR Model available for {selectedColor.colorName}
                  </p>
                  <a
                    href={selectedColor.modelPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View in AR →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
              <span className="text-sm text-gray-600">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-4 rounded-lg border-2 ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Truck className="w-5 h-5" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-5 h-5" />
              <span className="text-sm">Easy Returns</span>
            </div>
          </div>

          {/* Description */}
          {product.details?.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.details.description}</p>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.some((s: number) => s > 0) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Dimensions</h3>
              <p className="text-gray-600">
                {product.sizes[0]} × {product.sizes[1]} × {product.sizes[2]} cm
                (Width × Height × Depth)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-primary-600">Verified Purchase</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Model Viewer Modal */}
      {show3DViewer && product.rendablePath && (
        <Model3DViewer 
          modelUrl={product.rendablePath}
          productName={product.model}
          productId={product.id.toString()}
          onClose={() => setShow3DViewer(false)}
          onAddToCart={handleAddToCart}
        />
      )}

    </div>
  )
}

