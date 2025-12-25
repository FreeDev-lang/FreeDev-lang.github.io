import { useState, useCallback, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

interface GLBLoaderHook {
  loading: boolean
  error: string | null
  loadModel: (url: string) => Promise<THREE.Group | null>
  cache: Map<string, THREE.Group>
}

export function useGLBLoader(): GLBLoaderHook {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, THREE.Group>>(new Map())
  const loaderRef = useRef<GLTFLoader | null>(null)

  if (!loaderRef.current) {
    loaderRef.current = new GLTFLoader()
  }

  const loadModel = useCallback(
    async (url: string): Promise<THREE.Group | null> => {
      // Check cache first
      if (cacheRef.current.has(url)) {
        const cached = cacheRef.current.get(url)!
        // Clone the cached model to avoid sharing references
        return cached.clone()
      }

      setLoading(true)
      setError(null)

      try {
        const gltf = await loaderRef.current!.loadAsync(url)
        const model = gltf.scene

        // Store in cache
        cacheRef.current.set(url, model)

        // Clone for use
        const cloned = model.clone()
        setLoading(false)
        return cloned
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load 3D model'
        setError(errorMessage)
        setLoading(false)
        return null
      }
    },
    []
  )

  return {
    loading,
    error,
    loadModel,
    cache: cacheRef.current,
  }
}

