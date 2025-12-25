import { useState, useCallback } from 'react'
import * as THREE from 'three'
import type { ProductTexture } from '../types/ar.types'
import { loadTexture } from '../utils/texture-utils'

interface TextureLoaderHook {
  loading: boolean
  error: string | null
  loadAndApplyTexture: (
    model: THREE.Group,
    texture: ProductTexture,
    materialName?: string
  ) => Promise<void>
}

export function useTextureLoader(): TextureLoaderHook {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAndApplyTexture = useCallback(
    async (
      model: THREE.Group,
      texture: ProductTexture,
      materialName?: string
    ): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        // Load all textures
        const [diffuseTexture, normalTexture, roughnessTexture] = await Promise.all([
          loadTexture(texture.diffuseMapUrl),
          texture.normalMapUrl ? loadTexture(texture.normalMapUrl) : Promise.resolve(null),
          texture.roughnessMapUrl ? loadTexture(texture.roughnessMapUrl) : Promise.resolve(null),
        ])

        // Apply textures to model
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.MeshStandardMaterial

            // If materialName is specified, only apply to matching materials
            if (materialName && child.name !== materialName) {
              return
            }

            if (material && material instanceof THREE.MeshStandardMaterial) {
              material.map = diffuseTexture
              if (normalTexture) material.normalMap = normalTexture
              if (roughnessTexture) material.roughnessMap = roughnessTexture
              material.needsUpdate = true
            }
          }
        })

        setLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load texture'
        setError(errorMessage)
        setLoading(false)
        throw err
      }
    },
    []
  )

  return {
    loading,
    error,
    loadAndApplyTexture,
  }
}

