import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cartApi, productsApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import ARViewer from '../components/ar/ARViewer'
import Model3DViewer from '../components/ar/Model3DViewer'
import { useDeviceDetect } from '../components/ar/hooks/useDeviceDetect'
import type { CartItem } from '../components/ar/types/ar.types'
import toast from 'react-hot-toast'

interface ProductData {
  id: number
  name: string
  modelUrl: string | null
  price: number
  imageUrl?: string
}

export default function ARViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const deviceInfo = useDeviceDetect()
  
  const productId = searchParams.get('productId')
  const textureId = searchParams.get('textureId') || undefined
  const mode = searchParams.get('mode') // 'ar' or '3d'
  const modelUrlParam = searchParams.get('modelUrl')
  
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine which mode to use
  const shouldUse3DViewer = mode === '3d' || 
    (deviceInfo.supportedARMode !== 'webxr' && deviceInfo.supportedARMode !== 'quicklook')

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setError('No product ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await productsApi.getById(Number(productId))
        setProduct({
          id: response.data.id,
          name: response.data.name,
          modelUrl: response.data.modelUrl || modelUrlParam,
          price: response.data.price,
          imageUrl: response.data.imageUrl
        })
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, modelUrlParam])

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
            {error || 'Invalid Product'}
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
  if (!product?.modelUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">3D Model Not Available</h2>
          <p className="text-gray-600 mb-6">
            This product doesn't have a 3D model for AR viewing.
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

  // 3D Viewer mode (fallback for non-AR devices)
  if (shouldUse3DViewer) {
    return (
      <Model3DViewer
        modelUrl={product.modelUrl}
        productName={product.name}
        productId={productId}
        onClose={handleClose}
        onAddToCart={() => handleAddToCart()}
      />
    )
  }

  // Full AR Viewer
  return (
    <ARViewer
      initialProductId={productId}
      initialTextureId={textureId}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
    />
  )
}
