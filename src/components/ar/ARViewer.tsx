import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, productColorsApi } from '../../lib/api'
import { useGLBLoader } from './hooks/useGLBLoader'
import { useTextureLoader } from './hooks/useTextureLoader'
import { useGestures } from './hooks/useGestures'
import { generateARObjectId } from './utils/ar-utils'
import type { ARObject, Product, ProductTexture, ARViewerProps, CartItem } from './types/ar.types'
import ARScene from './ARScene'
import ARObjectManager from './ARObjectManager'
import ARControls from './ARControls'
import ARInstructions from './ARInstructions'
import TextureSelector from './TextureSelector'
import ProductPicker from './ProductPicker'
import { ARErrorBoundary } from './ARErrorBoundary'
import toast from 'react-hot-toast'
import * as THREE from 'three'

export default function ARViewer({
  initialProductId,
  initialTextureId,
  onClose,
  onAddToCart,
}: ARViewerProps) {
  const [placedObjects, setPlacedObjects] = useState<ARObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [showTextureSelector, setShowTextureSelector] = useState(false)
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [showInstructions] = useState(true)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [availableTextures, setAvailableTextures] = useState<ProductTexture[]>([])

  // Remove arSession hook - React Three XR handles this internally
  const glbLoader = useGLBLoader()
  const textureLoader = useTextureLoader()

  // Load product data
  const { data: productData } = useQuery({
    queryKey: ['product', initialProductId],
    queryFn: () => productsApi.getById(Number(initialProductId)).then((res) => res.data),
    enabled: !!initialProductId,
  })

  // Load textures
  const { data: texturesData } = useQuery({
    queryKey: ['product-textures', initialProductId],
    queryFn: () => productColorsApi.getByProduct(Number(initialProductId)).then((res) => res.data),
    enabled: !!initialProductId,
  })

  // Initialize product and textures
  useEffect(() => {
    if (productData) {
      // Use base product model URL
      const baseModelUrl = productData.rendablePath || ''
      
      // Map colors to textures (for now, each color variant is a separate model)
      // In the future, this could be actual texture maps
      const textures: ProductTexture[] = texturesData
        ? texturesData.map((color: any) => ({
            id: color.id.toString(),
            name: color.colorName,
            thumbnailUrl: color.previewImagePath || productData.images?.[0] || '',
            diffuseMapUrl: color.modelPath || baseModelUrl, // Use color-specific model if available
            priceModifier: 0,
          }))
        : []

      const product: Product = {
        id: productData.id.toString(),
        name: productData.model,
        price: productData.price,
        modelUrl: baseModelUrl,
        textures: textures.length > 0 ? textures : [
          {
            id: 'default',
            name: 'Default',
            thumbnailUrl: productData.images?.[0] || '',
            diffuseMapUrl: baseModelUrl,
          }
        ],
        defaultTextureId: initialTextureId || textures[0]?.id || 'default',
        dimensions: {
          width: productData.sizes?.[0] || 0,
          height: productData.sizes?.[1] || 0,
          depth: productData.sizes?.[2] || 0,
        },
      }

      setCurrentProduct(product)
      setAvailableTextures(product.textures)
    }
  }, [productData, texturesData, initialTextureId])

  // Note: AR session is started by ARButton in ARScene, not here
  // This component just manages the AR experience state

  // Load model when product is ready
  const loadAndPlaceModel = useCallback(
    async (product: Product, textureId?: string) => {
      if (!product.modelUrl) {
        toast.error('No 3D model available for this product')
        return
      }

      const model = await glbLoader.loadModel(product.modelUrl)
      if (!model) {
        toast.error('Failed to load 3D model')
        return
      }

      // Apply default texture if different model URL
      let finalModel = model
      const texture = product.textures.find((t) => t.id === (textureId || product.defaultTextureId))
      if (texture && texture.diffuseMapUrl !== product.modelUrl) {
        // If texture has a different model URL, load that model instead
        const textureModel = await glbLoader.loadModel(texture.diffuseMapUrl)
        if (textureModel) {
          // Replace the model
          finalModel = textureModel
        }
      }

      // Create AR object
      const arObject: ARObject = {
        id: generateARObjectId(),
        productId: product.id,
        model: finalModel,
        position: new THREE.Vector3(0, 0, -1), // Default position in front of camera
        rotation: new THREE.Euler(0, 0, 0),
        scale: 1,
        currentTextureId: textureId || product.defaultTextureId,
        isSelected: false,
      }

      setPlacedObjects((prev) => [...prev, arObject])
      setSelectedObjectId(arObject.id)
    },
    [glbLoader, textureLoader]
  )

  // Handle surface hit (tap to place)
  const handleSurfaceHit = useCallback(
    (hit: { position: THREE.Vector3; rotation: THREE.Quaternion; normal: THREE.Vector3 }) => {
      if (currentProduct && placedObjects.length === 0) {
        // Place first object
        loadAndPlaceModel(currentProduct, initialTextureId).then(() => {
          // Update position to hit location
          setPlacedObjects((prev) => {
            if (prev.length > 0) {
              const updated = [...prev]
              updated[0].position.copy(hit.position)
              return updated
            }
            return prev
          })
        })
      }
    },
    [currentProduct, placedObjects.length, initialTextureId, loadAndPlaceModel]
  )

  // Gesture handlers
  const gestureHandlers = {
    onRotate: (deltaAngle: number) => {
      if (selectedObjectId) {
        setPlacedObjects((prev) =>
          prev.map((obj) => {
            if (obj.id === selectedObjectId) {
              const newRotation = new THREE.Euler(
                obj.rotation.x,
                obj.rotation.y + deltaAngle,
                obj.rotation.z
              )
              return { ...obj, rotation: newRotation }
            }
            return obj
          })
        )
      }
    },
    onScale: (deltaScale: number) => {
      if (selectedObjectId) {
        setPlacedObjects((prev) =>
          prev.map((obj) => {
            if (obj.id === selectedObjectId) {
              const newScale = Math.max(0.5, Math.min(2, obj.scale + deltaScale))
              return { ...obj, scale: newScale }
            }
            return obj
          })
        )
      }
    },
    onTranslate: () => {
      // Translation handled by drag in AR space
    },
  }

  useGestures(gestureHandlers)

  // Handle object updates
  const handleObjectUpdate = useCallback((id: string, updates: Partial<ARObject>) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    )
  }, [])

  // Handle texture change
  const handleTextureChange = useCallback(
    async (textureId: string) => {
      if (!selectedObjectId) return

      const selectedObject = placedObjects.find((obj) => obj.id === selectedObjectId)
      if (!selectedObject) return

      const texture = availableTextures.find((t) => t.id === textureId)
      if (!texture) return

      try {
        await textureLoader.loadAndApplyTexture(selectedObject.model, texture)
        handleObjectUpdate(selectedObjectId, { currentTextureId: textureId })
        toast.success('Color changed')
      } catch (err) {
        toast.error('Failed to change color')
        console.error(err)
      }
    },
    [selectedObjectId, placedObjects, availableTextures, textureLoader, handleObjectUpdate]
  )

  // Handle add product
  const handleAddProduct = useCallback(
    (product: Product) => {
      loadAndPlaceModel(product)
    },
    [loadAndPlaceModel]
  )

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    const cartItems: CartItem[] = placedObjects.map((obj) => ({
      productId: obj.productId,
      textureId: obj.currentTextureId,
      quantity: 1,
    }))

    onAddToCart(cartItems)
    toast.success('Added to cart!')
  }, [placedObjects, onAddToCart])

  // Show loading state while checking support
  const [supportChecked, setSupportChecked] = useState(false)
  
  useEffect(() => {
    // Give it a moment to check support
    const timer = setTimeout(() => setSupportChecked(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!supportChecked) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking AR support...</p>
        </div>
      </div>
    )
  }

  // Don't block if not supported - let React Three XR handle it
  // The XRButton will show appropriate UI if not supported

  // Suppress XRSession errors globally (React Three XR issue)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('XRSession has already ended')) {
        console.warn('XR Session cleanup (safe to ignore)')
        event.preventDefault()
      }
    }
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || ''
      if (message.includes('XRSession has already ended')) {
        console.warn('XR Session cleanup (safe to ignore)')
        event.preventDefault()
      }
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <ARErrorBoundary>
      <div 
        className="fixed inset-0 z-50 bg-black" 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {showInstructions && <ARInstructions />}
        
        {showTextureSelector && (
          <TextureSelector
            textures={availableTextures}
            selectedTextureId={
              placedObjects.find((obj) => obj.id === selectedObjectId)?.currentTextureId || ''
            }
            onSelect={handleTextureChange}
            onClose={() => setShowTextureSelector(false)}
          />
        )}

        {showProductPicker && (
          <ProductPicker
            onSelect={handleAddProduct}
            onClose={() => setShowProductPicker(false)}
            excludeProductIds={placedObjects.map((obj) => obj.productId)}
          />
        )}

        <div style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000'
        }}>
          <ARScene onSurfaceHit={handleSurfaceHit}>
            <ARObjectManager
              objects={placedObjects}
              onObjectUpdate={handleObjectUpdate}
              onObjectSelect={setSelectedObjectId}
              selectedObjectId={selectedObjectId}
            />
          </ARScene>
        </div>

        {/* Only show controls when AR is active */}
        {placedObjects.length > 0 && (
          <ARControls
            onClose={onClose}
            onAddProduct={() => setShowProductPicker(true)}
            onChangeTexture={() => setShowTextureSelector(true)}
            onAddToCart={handleAddToCart}
            hasSelectedObject={!!selectedObjectId}
          />
        )}
      </div>
    </ARErrorBoundary>
  )
}

