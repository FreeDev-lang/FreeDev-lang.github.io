import * as THREE from 'three'
import type { ProductTexture } from '../types/ar.types'

/**
 * Loads a texture from a URL
 */
export async function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (texture) => {
        texture.flipY = false
        texture.encoding = THREE.sRGBEncoding
        resolve(texture)
      },
      undefined,
      (error) => {
        reject(error)
      }
    )
  })
}

/**
 * Applies a texture to a material
 */
export function applyTextureToMaterial(
  material: THREE.MeshStandardMaterial,
  texture: ProductTexture
): void {
  // Load and apply diffuse map
  loadTexture(texture.diffuseMapUrl)
    .then((diffuseTexture) => {
      material.map = diffuseTexture
      material.needsUpdate = true
    })
    .catch((error) => {
      console.error('Failed to load diffuse texture:', error)
    })

  // Load and apply normal map if available
  if (texture.normalMapUrl) {
    loadTexture(texture.normalMapUrl)
      .then((normalTexture) => {
        material.normalMap = normalTexture
        material.needsUpdate = true
      })
      .catch((error) => {
        console.error('Failed to load normal texture:', error)
      })
  }

  // Load and apply roughness map if available
  if (texture.roughnessMapUrl) {
    loadTexture(texture.roughnessMapUrl)
      .then((roughnessTexture) => {
        material.roughnessMap = roughnessTexture
        material.needsUpdate = true
      })
      .catch((error) => {
        console.error('Failed to load roughness texture:', error)
      })
  }
}

/**
 * Applies texture to all materials in a GLB model
 */
export function applyTextureToModel(
  model: THREE.Group,
  texture: ProductTexture,
  materialName?: string
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial
      
      // If materialName is specified, only apply to matching materials
      if (materialName && child.name !== materialName) {
        return
      }

      if (material && material instanceof THREE.MeshStandardMaterial) {
        applyTextureToMaterial(material, texture)
      }
    }
  })
}

/**
 * Gets all material names from a GLB model
 */
export function getMaterialNames(model: THREE.Group): string[] {
  const materialNames: string[] = []
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name) {
      if (!materialNames.includes(child.name)) {
        materialNames.push(child.name)
      }
    }
  })
  return materialNames
}

