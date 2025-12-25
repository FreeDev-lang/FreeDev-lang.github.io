import * as THREE from 'three'

/**
 * Converts screen coordinates to normalized device coordinates (-1 to 1)
 */
export function screenToNDC(x: number, y: number, width: number, height: number): THREE.Vector2 {
  return new THREE.Vector2(
    (x / width) * 2 - 1,
    -(y / height) * 2 + 1
  )
}

/**
 * Calculates rotation from two touch points
 */
export function calculateRotation(
  point1: THREE.Vector2,
  point2: THREE.Vector2,
  center: THREE.Vector2
): number {
  const angle1 = Math.atan2(point1.y - center.y, point1.x - center.x)
  const angle2 = Math.atan2(point2.y - center.y, point2.x - center.x)
  return angle2 - angle1
}

/**
 * Calculates distance between two 2D points
 */
export function calculateDistance2D(p1: THREE.Vector2, p2: THREE.Vector2): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * Calculates center point between two 2D points
 */
export function calculateCenter(p1: THREE.Vector2, p2: THREE.Vector2): THREE.Vector2 {
  return new THREE.Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
}

/**
 * Converts degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Converts radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Linearly interpolates between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Smoothly interpolates between two Vector3 values
 */
export function lerpVector3(
  start: THREE.Vector3,
  end: THREE.Vector3,
  t: number
): THREE.Vector3 {
  return new THREE.Vector3(
    lerp(start.x, end.x, t),
    lerp(start.y, end.y, t),
    lerp(start.z, end.z, t)
  )
}

