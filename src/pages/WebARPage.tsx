import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi, cartApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src: string
        alt?: string
        'auto-rotate'?: boolean
        'camera-controls'?: boolean
        'touch-action'?: string
        'interaction-policy'?: string
        'loading'?: string
        'ar'?: boolean
        'ar-modes'?: string
        'ar-scale'?: string
        'ar-placement'?: string
        'xr-environment'?: boolean
        'shadow-intensity'?: string
        'environment-image'?: string
        'exposure'?: string
        'poster'?: string
      }, HTMLElement>
    }
  }
}

export default function WebARPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modelViewerRef = useRef<any>(null)

  const productId = searchParams.get('productId')
  const modelUrl = searchParams.get('modelUrl')

  // Fetch product data if needed
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(Number(productId)).then((res) => res.data),
    enabled: !!productId && !modelUrl,
  })

  const finalModelUrl = modelUrl || product?.rendablePath
  const productName = product?.model || 'Product'

  useEffect(() => {
    // Check if model-viewer is already loaded
    if (customElements.get('model-viewer')) {
      setIsModelViewerLoaded(true)
      return
    }

    // Wait for model-viewer to be defined
    const checkModelViewer = setInterval(() => {
      if (customElements.get('model-viewer')) {
        setIsModelViewerLoaded(true)
        clearInterval(checkModelViewer)
      }
    }, 100)

    setTimeout(() => {
      clearInterval(checkModelViewer)
      if (!customElements.get('model-viewer')) {
        setError('Failed to load 3D viewer. Please refresh the page.')
      }
    }, 5000)

    return () => clearInterval(checkModelViewer)
  }, [])

  // Set up model-viewer event listeners
  useEffect(() => {
    if (!isModelViewerLoaded || !modelViewerRef.current) return

    const viewer = modelViewerRef.current
    let checkInterval: number | null = null

    const handleLoad = () => {
      setIsLoading(false)
      setError(null)
      if (checkInterval) clearInterval(checkInterval)
    }

    const handleError = () => {
      setIsLoading(false)
      setError('Failed to load 3D model.')
      if (checkInterval) clearInterval(checkInterval)
    }

    const timeoutId = setTimeout(() => {
      if (viewer.loaded === true) {
        handleLoad()
        return
      }

      viewer.addEventListener('load', handleLoad)
      viewer.addEventListener('error', handleError)
      
      checkInterval = setInterval(() => {
        if (viewer.loaded === true) {
          handleLoad()
        }
      }, 500)
      
      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval)
        if (isLoading) {
          if (viewer.loaded === true) {
            handleLoad()
          } else {
            setIsLoading(false)
          }
        }
      }, 15000)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      if (checkInterval) clearInterval(checkInterval)
      if (viewer) {
        viewer.removeEventListener('load', handleLoad)
        viewer.removeEventListener('error', handleError)
      }
    }
  }, [isModelViewerLoaded, isLoading])

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      navigate('/login')
      return
    }

    try {
      if (productId) {
        await cartApi.add({
          furnitureItemId: Number(productId),
          quantity: 1,
        })
        toast.success('Added to cart!')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  if (!finalModelUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h2 className="text-2xl font-bold mb-4">No 3D Model Available</h2>
          <p className="text-gray-400 mb-6">This product doesn't have a 3D model.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-white font-medium text-base truncate max-w-[60%] mx-auto">
          {productName}
        </h1>
        <div className="w-10" />
      </div>

      {/* AR Model Viewer */}
      <div className="absolute inset-0">
        {isModelViewerLoaded ? (
          <model-viewer
            ref={modelViewerRef}
            src={finalModelUrl}
            alt={productName}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            ar-placement="floor"
            xr-environment
            camera-controls
            touch-action="none"
            interaction-policy="allow-when-focused"
            loading="eager"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000000'
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-sm">Loading AR viewer...</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && isModelViewerLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-sm">Loading 3D model...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && isModelViewerLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center text-white p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <X className="w-full h-full" />
              </div>
              <h2 className="text-xl font-bold mb-2">Failed to load 3D model</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add to Cart
          </button>
          <p className="text-center text-white/60 text-xs">
            Tap the AR button to view in your space
          </p>
        </div>
      </div>
    </div>
  )
}

