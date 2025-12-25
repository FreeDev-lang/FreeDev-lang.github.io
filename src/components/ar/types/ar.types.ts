import * as THREE from 'three'

export interface ARObject {
  id: string
  productId: string
  model: THREE.Group
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  currentTextureId: string
  isSelected: boolean
}

export interface ProductTexture {
  id: string
  name: string
  thumbnailUrl: string
  diffuseMapUrl: string
  normalMapUrl?: string
  roughnessMapUrl?: string
  priceModifier?: number
}

export interface Product {
  id: string
  name: string
  price: number
  modelUrl: string
  textures: ProductTexture[]
  defaultTextureId: string
  dimensions: {
    width: number
    height: number
    depth: number
  }
}

export interface ARSessionState {
  isActive: boolean
  isSupported: boolean
  placedObjects: ARObject[]
  selectedObjectId: string | null
  availableProducts: Product[]
}

export interface ARViewerProps {
  initialProductId: string
  initialTextureId?: string
  onClose: () => void
  onAddToCart: (items: CartItem[]) => void
}

export interface CartItem {
  productId: string
  textureId: string
  quantity: number
}

export interface HitTestResult {
  position: THREE.Vector3
  rotation: THREE.Quaternion
  normal: THREE.Vector3
}

export type GestureType = 'none' | 'rotate' | 'scale' | 'translate'

export interface GestureState {
  type: GestureType
  startDistance?: number
  startAngle?: number
  startPosition?: THREE.Vector2
  lastPosition?: THREE.Vector2
}

