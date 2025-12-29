import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDeviceDetect } from '../components/ar/hooks/useDeviceDetect'
import ARViewer from '../components/ar/ARViewer'
import MobileARViewer from '../components/ar/MobileARViewer'
import type { CartItem } from '../components/ar/types/ar.types'
import toast from 'react-hot-toast'
import { cartApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function ARViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isMobile } = useDeviceDetect()
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

  // Validate productId
  if (!productId) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Invalid Product</h2>
          <p className="text-gray-600 mb-6">No product ID provided</p>
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

  // Use MobileARViewer for mobile devices (Google model-viewer)
  // Use ARViewer for desktop (React Three Fiber with WebXR)
  if (isMobile) {
    return (
      <MobileARViewer
        productId={productId}
        modelUrl={modelUrl}
        onClose={handleClose}
      />
    )
  }

  return (
    <ARViewer
      initialProductId={productId}
      initialTextureId={textureId}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
    />
  )
}
