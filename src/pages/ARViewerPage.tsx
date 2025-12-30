import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDeviceDetect } from '../components/ar/hooks/useDeviceDetect'
import ARViewer from '../components/ar/ARViewer'
import Model3DViewer from '../components/ar/Model3DViewer'
import type { CartItem } from '../components/ar/types/ar.types'
import toast from 'react-hot-toast'
import { cartApi, productsApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function ARViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isMobile } = useDeviceDetect()
  const { isAuthenticated } = useAuthStore()
  
  const productId = searchParams.get('productId')
  const textureId = searchParams.get('textureId') || undefined
  const modelUrl = searchParams.get('modelUrl') || undefined
  const mode = searchParams.get('mode')

  // Fetch product data if needed
  const { data: product, isLoading: loading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(Number(productId)).then((res) => res.data),
    enabled: !!productId && !modelUrl,
  })

  const handleClose = () => {
    navigate(-1)
  }

  const handleAddToCart = async (items?: CartItem[]) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      navigate('/login')
      return
    }

    try {
      if (items && items.length > 0) {
        for (const item of items) {
          await cartApi.add({
            furnitureItemId: Number(item.productId),
            quantity: item.quantity,
          })
        }
      } else if (productId) {
        // Add current product
        await cartApi.add({
          furnitureItemId: Number(productId),
          quantity: 1,
        })
      }
      toast.success('Added to cart!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !productId) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">
            {error ? 'Error' : 'Invalid Product'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Please try again later' : 'No product ID provided'}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // No model available
  if (!product?.rendablePath && !modelUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">3D Model Not Available</h2>
          <p className="text-gray-600 mb-6">
            This product doesn't have a 3D model for AR viewing.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Use Model3DViewer for 3D-only mode or mobile with modelUrl
  if (mode === '3d' || (isMobile && modelUrl)) {
    return (
      <Model3DViewer
        modelUrl={modelUrl || product?.rendablePath || ''}
        productName={product?.model || 'Product'}
        productId={productId}
        onClose={handleClose}
        onAddToCart={() => handleAddToCart()}
      />
    )
  }

  // Default: Use ARViewer for WebXR AR experience
  return (
    <ARViewer
      initialProductId={productId}
      initialTextureId={textureId}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
    />
  )
}
