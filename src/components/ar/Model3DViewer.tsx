import { useEffect, useRef, useState } from 'react'
import { X, Ruler, RotateCcw } from 'lucide-react'

interface Model3DViewerProps {
  modelUrl: string
  productName: string
  productId: string
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  showARButton?: boolean // Show "View in your space" button
  onClose?: () => void
  onAddToCart?: () => void
  onViewInSpace?: () => void // Callback for "View in your space" button
}

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

export default function Model3DViewer({ 
  modelUrl, 
  productName,
  productId: _productId,
  dimensions,
  showARButton = false,
  onClose,
  onAddToCart,
  onViewInSpace
}: Model3DViewerProps) {
  const modelViewerRef = useRef<HTMLElement & {
    cameraOrbit?: string
    fieldOfView?: string
    src?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false)

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

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkModelViewer)
      if (!customElements.get('model-viewer')) {
        setError('Failed to load 3D viewer. Please refresh the page.')
      }
    }, 5000)

    return () => clearInterval(checkModelViewer)
  }, [])

  // Set up model-viewer event listeners when it's loaded
  useEffect(() => {
    if (!isModelViewerLoaded || !modelViewerRef.current) return

    const viewer = modelViewerRef.current as any
    let checkInterval: number | null = null
    let timeoutId: number | null = null

    const handleLoad = () => {
      console.log('Model loaded successfully')
      setIsLoading(false)
      setError(null)
      if (checkInterval) clearInterval(checkInterval)
    }

    const handleError = (event: any) => {
      console.error('Model load error:', event)
      setIsLoading(false)
      setError('Failed to load 3D model. Please check your connection and try again.')
      if (checkInterval) clearInterval(checkInterval)
    }

    // Wait a bit for the element to be fully ready
    timeoutId = setTimeout(() => {
      // Check if model is already loaded first
      if (viewer.loaded === true) {
        handleLoad()
        return
      }

      // Add event listeners
      viewer.addEventListener('load', handleLoad)
      viewer.addEventListener('error', handleError)
      
      // Fallback: check periodically if model loaded (in case events don't fire)
      checkInterval = setInterval(() => {
        if (viewer.loaded === true) {
          handleLoad()
        }
      }, 500)
      
      // Clear interval after 15 seconds (model should load by then)
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval)
          // If still loading after 15 seconds, assume it loaded or show error
          if (isLoading) {
            // Check one more time
            if (viewer.loaded === true) {
              handleLoad()
            } else {
              // Might still be loading, but hide loader after reasonable time
              setIsLoading(false)
            }
          }
        }
      }, 15000)
    }, 300)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (checkInterval) clearInterval(checkInterval)
      if (viewer) {
        viewer.removeEventListener('load', handleLoad)
        viewer.removeEventListener('error', handleError)
      }
    }
  }, [isModelViewerLoaded, isLoading])

  const handleResetView = () => {
    if (modelViewerRef.current) {
      const viewer = modelViewerRef.current as any
      if (viewer.cameraOrbit !== undefined) {
        viewer.cameraOrbit = '0deg 75deg 105%'
      }
      if (viewer.fieldOfView !== undefined) {
        viewer.fieldOfView = '45deg'
      }
    }
  }

  const formatDimension = (value: number) => {
    if (!value || value === 0) return 'N/A'
    return `${value} cm`
  }

  if (error && !isModelViewerLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <X className="w-full h-full" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load 3D viewer</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-white font-medium text-base md:text-lg truncate max-w-[60%] mx-auto">
            {productName}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetView}
            className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            aria-label="Reset view"
            title="Reset view"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* 3D Model Viewer */}
      <div className="absolute inset-0">
        {isModelViewerLoaded ? (
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            alt={productName}
            auto-rotate
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
              <p className="text-white text-sm">Loading 3D viewer...</p>
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
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dimensions Panel */}
      {dimensions && (dimensions.width > 0 || dimensions.height > 0 || dimensions.depth > 0) && (
        <div className={`absolute left-4 md:left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 md:p-5 shadow-xl z-10 ${
          showARButton && onViewInSpace ? 'bottom-32 md:bottom-36' : 'bottom-24'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">Dimensions</h3>
          </div>
          <div className="space-y-2 text-sm md:text-base">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Width:</span>
              <span className="font-medium text-gray-900">{formatDimension(dimensions.width)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Height:</span>
              <span className="font-medium text-gray-900">{formatDimension(dimensions.height)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Depth:</span>
              <span className="font-medium text-gray-900">{formatDimension(dimensions.depth)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
        <div className="flex flex-col items-center gap-3">
          {/* View in your space button (for mobile after QR scan) */}
          {showARButton && onViewInSpace && (
            <button
              onClick={onViewInSpace}
              className="w-full max-w-md px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base shadow-lg"
            >
              View in Your Space
            </button>
          )}
          
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
            >
              Add to Cart
            </button>
          )}
          
          <p className="text-center text-white/60 text-xs md:text-sm">
            Drag to rotate • Scroll to zoom • Right-click to pan
          </p>
        </div>
      </div>
    </div>
  )
}
