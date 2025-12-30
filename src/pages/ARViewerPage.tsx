import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDeviceDetect } from '../components/ar/hooks/useDeviceDetect'
import ARViewer from '../components/ar/ARViewer'
import Model3DViewer from '../components/ar/Model3DViewer'
import type { CartItem } from '../components/ar/types/ar.types'
import toast from 'react-hot-toast'
import { cartApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function ARViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const productId = searchParams.get('productId')
  const textureId = searchParams.get('textureId') || undefined
  const modelUrl = searchParams.get('modelUrl') || undefined

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

  // Error state - no product ID
  if (!productId) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Invalid Product</h2>
          <p className="text-gray-600 mb-6">No product ID provided</p>
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

  // Check if user wants 3D viewer mode (not AR)
  const mode = searchParams.get('mode')
  
  // Use Model3DViewer only if explicitly requested (mode=3d)
  // Otherwise use ARViewer for the actual AR experience
  if (mode === '3d' && modelUrl) {
    return (
      <Model3DViewer
        modelUrl={modelUrl}
        productName="Product"
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
