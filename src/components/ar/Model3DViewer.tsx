import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, RotateCcw, ZoomIn, ZoomOut, Camera, X, ShoppingCart } from 'lucide-react'
import type { Group } from 'three'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { captureCanvas, downloadCapture, shareCapture } from './utils/capture-utils'

interface Model3DViewerProps {
  modelUrl: string
  productName: string
  productId: string
  onClose?: () => void
  onAddToCart?: () => void
}

interface ModelProps {
  url: string
  scale?: number
  onLoaded?: () => void
  onError?: (error: Error) => void
}

function Model({ url, scale = 1, onLoaded, onError }: ModelProps) {
  const groupRef = useRef<Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  
  useEffect(() => {
    const loader = new GLTFLoader()
    
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene
        
        // Center the model
        const box = new THREE.Box3().setFromObject(scene)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        // Scale to fit in view
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetScale = 2 / maxDim
        
        scene.position.sub(center)
        scene.scale.setScalar(targetScale * scale)
        
        setModel(scene)
        onLoaded?.()
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
        onError?.(new Error('Failed to load 3D model'))
      }
    )
  }, [url, scale, onLoaded, onError])
  
  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  if (!model) return null
  
  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  )
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-white text-sm">Loading 3D model...</p>
    </div>
  )
}

function CaptureButton({ onCapture }: { onCapture: () => void }) {
  return (
    <button
      onClick={onCapture}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
      title="Take photo"
    >
      <Camera className="w-8 h-8 text-gray-800" />
    </button>
  )
}

export default function Model3DViewer({ 
  modelUrl, 
  productName,
  onClose,
  onAddToCart 
}: Model3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showShareOptions, setShowShareOptions] = useState(false)
  
  const handleCapture = async () => {
    if (!canvasRef.current) return
    
    try {
      const result = await captureCanvas(canvasRef.current)
      
      // Check if Web Share API is available
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        setShowShareOptions(true)
      } else {
        // Direct download on desktop
        downloadCapture(result, `${productName.replace(/\s+/g, '-')}-3d.png`)
      }
    } catch (err) {
      console.error('Capture failed:', err)
    }
  }
  
  const handleShare = async () => {
    if (!canvasRef.current) return
    
    try {
      const result = await captureCanvas(canvasRef.current)
      await shareCapture(result, productName)
    } catch (err) {
      console.error('Share failed:', err)
    }
    setShowShareOptions(false)
  }
  
  const handleDownload = async () => {
    if (!canvasRef.current) return
    
    try {
      const result = await captureCanvas(canvasRef.current)
      downloadCapture(result, `${productName.replace(/\s+/g, '-')}-3d.png`)
    } catch (err) {
      console.error('Download failed:', err)
    }
    setShowShareOptions(false)
  }
  
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5))
  const handleReset = () => setZoom(1)
  
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <Box className="w-full h-full" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load 3D model</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-white font-medium text-lg truncate max-w-[200px]">
          {productName}
        </h1>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Model 
            url={modelUrl} 
            scale={zoom}
            onLoaded={() => setIsLoading(false)}
            onError={(err) => setError(err.message)}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner />}
      
      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>
      
      {/* Capture Button */}
      <CaptureButton onCapture={handleCapture} />
      
      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onAddToCart}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>
        </div>
        
        <p className="text-center text-white/60 text-sm mt-4">
          Drag to rotate • Pinch to zoom
        </p>
      </div>
      
      {/* Share Options Modal */}
      {showShareOptions && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Share your design</h3>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => setShowShareOptions(false)}
                className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Preload utility
export function preloadModel(url: string) {
  const loader = new GLTFLoader()
  loader.load(url, () => {}, undefined, (error) => {
    console.error('Error preloading model:', error)
  })
}
