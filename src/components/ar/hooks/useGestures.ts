import { useState, useCallback, useRef } from 'react'
import * as THREE from 'three'
import type { GestureState } from '../types/ar.types'
import { calculateDistance2D, calculateCenter, calculateRotation } from '../utils/math-utils'

interface GestureHandlers {
  onRotate: (deltaAngle: number) => void
  onScale: (deltaScale: number) => void
  onTranslate: (delta: THREE.Vector2) => void
}

interface GestureHook {
  gestureState: GestureState
  handleTouchStart: (touches: TouchList) => void
  handleTouchMove: (touches: TouchList) => void
  handleTouchEnd: () => void
}

export function useGestures(handlers: GestureHandlers): GestureHook {
  const [gestureState, setGestureState] = useState<GestureState>({ type: 'none' })
  const touchesRef = useRef<Map<number, Touch>>(new Map())

  const handleTouchStart = useCallback(
    (touches: TouchList) => {
      // Store touches
      touchesRef.current.clear()
      for (let i = 0; i < touches.length; i++) {
        touchesRef.current.set(touches[i].identifier, touches[i])
      }

      if (touches.length === 1) {
        // Single touch - prepare for translation
        const touch = touches[0]
        setGestureState({
          type: 'translate',
          startPosition: new THREE.Vector2(touch.clientX, touch.clientY),
          lastPosition: new THREE.Vector2(touch.clientX, touch.clientY),
        })
      } else if (touches.length === 2) {
        // Two touches - prepare for rotation or scale
        const touch1 = touches[0]
        const touch2 = touches[1]

        const pos1 = new THREE.Vector2(touch1.clientX, touch1.clientY)
        const pos2 = new THREE.Vector2(touch2.clientX, touch2.clientY)

        const center = calculateCenter(pos1, pos2)
        const distance = calculateDistance2D(pos1, pos2)
        const angle = calculateRotation(pos1, pos2, center)

        setGestureState({
          type: 'scale', // Default to scale, can switch to rotate
          startDistance: distance,
          startAngle: angle,
          startPosition: center,
        })
      }
    },
    []
  )

  const handleTouchMove = useCallback(
    (touches: TouchList) => {
      if (touches.length === 1 && gestureState.type === 'translate') {
        // Single touch translation
        const touch = touches[0]
        const currentPos = new THREE.Vector2(touch.clientX, touch.clientY)

        if (gestureState.lastPosition) {
          const delta = new THREE.Vector2(
            currentPos.x - gestureState.lastPosition.x,
            currentPos.y - gestureState.lastPosition.y
          )
          handlers.onTranslate(delta)
        }

        setGestureState((prev) => ({
          ...prev,
          lastPosition: currentPos,
        }))
      } else if (touches.length === 2) {
        // Two touches - determine if rotation or scale
        const touch1 = touches[0]
        const touch2 = touches[1]

        const pos1 = new THREE.Vector2(touch1.clientX, touch1.clientY)
        const pos2 = new THREE.Vector2(touch2.clientX, touch2.clientY)

        const distance = calculateDistance2D(pos1, pos2)

        if (gestureState.startDistance) {
          const scaleDelta = distance / gestureState.startDistance
          handlers.onScale(scaleDelta - 1) // Return delta, not absolute scale

          setGestureState((prev) => ({
            ...prev,
            startDistance: distance, // Update for next frame
          }))
        }

        // Also handle rotation (two-finger twist)
        if (gestureState.startAngle !== undefined && gestureState.startPosition) {
          const currentAngle = calculateRotation(pos1, pos2, gestureState.startPosition)
          const deltaAngle = currentAngle - (gestureState.startAngle || 0)
          handlers.onRotate(deltaAngle)

          setGestureState((prev) => ({
            ...prev,
            startAngle: currentAngle,
          }))
        }
      }
    },
    [gestureState, handlers]
  )

  const handleTouchEnd = useCallback(() => {
    touchesRef.current.clear()
    setGestureState({ type: 'none' })
  }, [])

  return {
    gestureState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}

