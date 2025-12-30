import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../lib/api'
import { X, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { cartApi } from '../../lib/api'

interface MobileARViewerProps {
  productId: string
  modelUrl?: string
  onClose: () => void
}

export default function MobileARViewer({ productId, modelUrl, onClose }: MobileARViewerProps) {
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(Number(productId)).then(res => res.data),
    enabled: !!productId,
  })

  const { isAuthenticated } = useAuthStore()
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false)
  const modelViewerRef = useRef<any>(null)

  const finalModelUrl = modelUrl || product?.rendablePath || ''

  useEffect(() => {
    // Check if model-viewer is already loaded
    if (customElements.get('model-viewer')) {
      setIsModelViewerLoaded(true)
      return
    }

    // Load Google's model-viewer script
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js'
    script.onload = () => setIsModelViewerLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      await cartApi.add({ furnitureItemId: Number(productId), quantity: 1 })
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  if (!finalModelUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">3D Model Not Available</h2>
          <p className="text-gray-600 mb-6">This product doesn't have a 3D model for AR viewing.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-lg font-bold">{product?.model || 'Product'}</h2>
            {product?.price && (
              <p className="text-sm text-gray-300">${product.price.toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Viewer */}
      <div className="flex-1 w-full h-full">
        {isModelViewerLoaded ? (
          <model-viewer
            ref={modelViewerRef}
            src={finalModelUrl}
            alt={product?.model || '3D Model'}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            touch-action="pan-y"
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
            interaction-policy="allow-when-focused"
            auto-rotate
            camera-orbit="0deg 75deg 105%"
            min-camera-orbit="auto auto 0%"
            max-camera-orbit="auto auto 120%"
          >
            <div slot="ar-button" className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <button className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-colors">
                View in Your Space
              </button>
            </div>
          </model-viewer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading 3D Model...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="text-white text-center text-sm">
          <p className="mb-2">Tap "View in Your Space" to place this product in AR</p>
          <p className="text-gray-400 text-xs">Move your phone to find a flat surface</p>
        </div>
      </div>
    </div>
  )
}

