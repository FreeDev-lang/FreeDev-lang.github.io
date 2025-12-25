import * as THREE from 'three'
import type { HitTestResult } from '../types/ar.types'

/**
 * Performs hit testing against detected planes/surfaces
 */
export function performHitTest(
  _x: number,
  _y: number,
  frame: XRFrame,
  referenceSpace: XRReferenceSpace
): HitTestResult | null {
  if (!frame.session) return null

  try {
    // Request hit test source (cached)
    let hitTestSource: XRHitTestSource | null = null
    if ((frame.session as any).hitTestSource) {
      hitTestSource = (frame.session as any).hitTestSource
    } else {
      hitTestSource = (frame.session as any).requestHitTestSource?.(referenceSpace) || null
      if (hitTestSource) {
        (frame.session as any).hitTestSource = hitTestSource
      }
    }

    if (!hitTestSource) return null

    const hitTestResults = frame.getHitTestResults(hitTestSource)
    if (hitTestResults.length === 0) return null

    const hit = hitTestResults[0]
    const pose = hit.getPose(referenceSpace)
    if (!pose) return null

    const position = new THREE.Vector3(
      pose.transform.position.x,
      pose.transform.position.y,
      pose.transform.position.z
    )

    const rotation = new THREE.Quaternion(
      pose.transform.orientation.x,
      pose.transform.orientation.y,
      pose.transform.orientation.z,
      pose.transform.orientation.w
    )

    // Calculate normal from rotation (assuming up is Y)
    const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(rotation)

    return { position, rotation, normal }
  } catch (error) {
    console.error('Hit test error:', error)
    return null
  }
}

/**
 * Detects if a surface is suitable for placement (horizontal plane)
 */
export function isPlaceableSurface(normal: THREE.Vector3, threshold: number = 0.7): boolean {
  // Check if surface is roughly horizontal (normal pointing up)
  return normal.y > threshold
}

/**
 * Calculates distance between two 3D points
 */
export function calculateDistance(p1: THREE.Vector3, p2: THREE.Vector3): number {
  return p1.distanceTo(p2)
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Generates a unique ID for AR objects
 */
export function generateARObjectId(): string {
  return `ar-obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

