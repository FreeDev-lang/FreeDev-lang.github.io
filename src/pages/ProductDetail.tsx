import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { productsApi, cartApi, wishlistApi, reviewsApi } from '../lib/api'
import { ShoppingCart, Heart, Star, ArrowLeft, Package, Truck, QrCode, Box } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useCurrency } from '../utils/currency'
import ARQRCode from '../components/ar/ARQRCode'
import ModelViewer3D from '../components/ar/ModelViewer3D'
import { useDeviceDetect } from '../components/ar/hooks/useDeviceDetect'

function SectionDivider() {
  return <div className="divider" aria-hidden />
}

function DetailSection({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      {title && <h3 className="text-h3 text-neutral-900">{title}</h3>}
      {children}
    </section>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [show3DViewer, setShow3DViewer] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const { isDesktop } = useDeviceDetect()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then((res) => res.data),
    enabled: !!id,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getByProduct(Number(id)).then((res) => res.data),
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
    return (
      <div className="section-inner py-12">
        <p className="text-body text-neutral-500">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="section-inner py-12">
        <p className="text-body text-neutral-500">Product not found</p>
      </div>
    )
  }

  const price = product.discountPrice || product.price
  const originalPrice = product.discountPrice ? product.price : null

  return (
    <div className="section-inner py-8 md:py-10">
      <Link to="/products" className="nav-link mb-8 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Gallery / 3D viewer */}
        <div className="space-y-4">
          {isDesktop && product.rendablePath && show3DViewer ? (
            <div className="relative aspect-square overflow-hidden rounded-card bg-secondary-100 shadow-card-default">
              <ModelViewer3D modelUrl={product.rendablePath} className="h-full w-full" />
              <button
                type="button"
                onClick={() => setShow3DViewer(false)}
                className="btn btn-secondary btn-sm absolute right-4 top-4 z-10 shadow-card-default"
              >
                View Images
              </button>
            </div>
          ) : (
            <>
              <div className="relative aspect-square overflow-hidden rounded-card bg-secondary-100 shadow-card-default">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.model}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-body-sm text-neutral-400">
                    No Image
                  </div>
                )}

                {isDesktop && product.rendablePath && (
                  <button
                    type="button"
                    onClick={() => setShow3DViewer(true)}
                    className="btn btn-secondary absolute bottom-4 right-4 gap-2 shadow-card-default"
                  >
                    <Box className="h-5 w-5" />
                    View 3D Model
                  </button>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1, 5).map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-btn bg-secondary-100 ring-2 ring-transparent ring-offset-2 transition-all duration-brand hover:ring-secondary-300"
                    >
                      <img
                        src={img}
                        alt={`${product.model} ${idx + 2}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-8">
          <header className="space-y-3">
            <p className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
              {product.category}
            </p>
            <h1 className="text-h1-md text-neutral-900">{product.model}</h1>

            <div className="flex flex-wrap items-end gap-4 pt-1">
              <div>
                <span className="text-h2-md font-bold text-neutral-900">{formatCurrency(price)}</span>
                {originalPrice && (
                  <span className="ml-2 text-body text-neutral-400 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>

              {product.averageRating && (
                <div className="flex items-center gap-2 rounded-pill bg-secondary-100 px-3 py-1.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.averageRating)
                            ? 'fill-accent-400 text-accent-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-body-sm font-medium text-neutral-700">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </header>

          <SectionDivider />

          {product.rendablePath && (
            <DetailSection>
              {isDesktop ? (
                <button
                  type="button"
                  onClick={() => setShowQRCode(true)}
                  className="btn btn-secondary btn-lg w-full gap-2"
                >
                  <QrCode className="h-5 w-5" />
                  Show QR Code for Mobile AR
                </button>
              ) : (
                <Link
                  to={`/ar?productId=${product.id}${selectedColor?.id ? `&textureId=${selectedColor.id}` : ''}`}
                  className="btn btn-secondary btn-lg w-full gap-2"
                >
                  <Box className="h-5 w-5" />
                  View in Your Space (AR)
                </Link>
              )}
            </DetailSection>
          )}

          {product.availableColors && product.availableColors.length > 0 && (
            <DetailSection title="Available Colors">
              <div className="flex flex-wrap gap-3">
                {product.availableColors.map((color: any) => {
                  const isSelected = selectedColor?.id === color.id
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex min-w-[4.5rem] flex-col items-center gap-2 rounded-card px-3 py-2.5 transition-all duration-brand ${
                        isSelected
                          ? 'bg-primary-50 ring-2 ring-primary-600 ring-offset-2'
                          : 'bg-secondary-50 hover:bg-secondary-100'
                      }`}
                    >
                      {color.hexCode ? (
                        <span
                          className="h-9 w-9 rounded-full ring-1 ring-secondary-200"
                          style={{ backgroundColor: color.hexCode }}
                          aria-hidden
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-200 text-caption text-neutral-500">
                          ?
                        </span>
                      )}
                      <span className="text-caption font-medium text-neutral-700">{color.colorName}</span>
                    </button>
                  )
                })}
              </div>

              {selectedColor?.modelPath && (
                <div className="mt-4 rounded-card bg-primary-50 p-4">
                  <p className="text-body-sm text-primary-800">
                    AR Model available for {selectedColor.colorName}
                  </p>
                  <a
                    href={selectedColor.modelPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link mt-1 inline-flex text-primary-700"
                  >
                    View in AR →
                  </a>
                </div>
              )}
            </DetailSection>
          )}

          <DetailSection title="Quantity">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center overflow-hidden rounded-btn border border-secondary-200 bg-white shadow-card-default">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-icon h-11 w-11 rounded-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2.5rem] px-2 text-center text-body font-semibold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="btn-icon h-11 w-11 rounded-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-body-sm text-neutral-500">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>
          </DetailSection>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="btn btn-primary btn-lg flex-1 gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`btn btn-ghost btn-lg shrink-0 gap-2 px-5 ${
                isWishlisted ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="badge-secondary inline-flex items-center gap-2 px-4 py-2.5">
              <Truck className="h-4 w-4 text-primary-600" />
              <span className="text-body-sm font-medium">Free Shipping</span>
            </div>
            <div className="badge-secondary inline-flex items-center gap-2 px-4 py-2.5">
              <Package className="h-4 w-4 text-primary-600" />
              <span className="text-body-sm font-medium">Easy Returns</span>
            </div>
          </div>

          {product.details?.description && (
            <>
              <SectionDivider />
              <DetailSection title="Description">
                <p className="text-body text-neutral-600 leading-relaxed">{product.details.description}</p>
              </DetailSection>
            </>
          )}

          {product.sizes && product.sizes.some((s: number) => s > 0) && (
            <>
              {!product.details?.description && <SectionDivider />}
              <DetailSection title="Dimensions">
                <p className="text-body text-neutral-600">
                  {product.sizes[0]} × {product.sizes[1]} × {product.sizes[2]} cm
                  <span className="text-neutral-400"> (Width × Height × Depth)</span>
                </p>
              </DetailSection>
            </>
          )}
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <section className="mt-16 border-t border-secondary-200 pt-12">
          <h2 className="text-h2-md mb-8 text-neutral-900">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <article key={review.id} className="card">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body-sm font-semibold text-neutral-900">{review.userName}</p>
                    {review.isVerifiedPurchase && (
                      <span className="text-caption font-semibold text-primary-700">Verified Purchase</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-body-sm text-neutral-600 leading-relaxed">{review.comment}</p>
                )}
                <p className="mt-3 text-caption text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {showQRCode && isDesktop && product.rendablePath && (
        <ARQRCode
          productId={product.id}
          productName={product.model}
          modelUrl={product.rendablePath}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  )
}
