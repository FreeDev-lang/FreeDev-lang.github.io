import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ARObject as ARObjectType } from './types/ar.types'

interface ARObjectProps {
  arObject: ARObjectType
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ARObjectType>) => void
}

export default function ARObject({ arObject, isSelected, onSelect }: ARObjectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const outlineRef = useRef<THREE.Mesh>(null)

  // Update position, rotation, scale
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(arObject.position)
      groupRef.current.rotation.copy(arObject.rotation)
      groupRef.current.scale.setScalar(arObject.scale)
    }
  }, [arObject.position, arObject.rotation, arObject.scale])

  // Animate selection outline
  useFrame((state) => {
    if (outlineRef.current && isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1
      outlineRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} onClick={onSelect}>
      <primitive object={arObject.model} />
      
      {isSelected && (
        <mesh ref={outlineRef}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}

