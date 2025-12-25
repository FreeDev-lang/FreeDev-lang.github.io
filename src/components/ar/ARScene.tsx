import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { XRButton, Hands, useXR } from '@react-three/xr'
import { Suspense } from 'react'
import type { HitTestResult } from './types/ar.types'
import { performHitTest, isPlaceableSurface } from './utils/ar-utils'

interface ARSceneProps {
  onSurfaceHit: (hit: HitTestResult) => void
  children: React.ReactNode
}

function ARHitTestPlane({ onSurfaceHit }: { onSurfaceHit: (hit: HitTestResult) => void }) {
  const { gl } = useThree()
  const { isPresenting } = useXR()

  useFrame(() => {
    if (!isPresenting) return

    try {
      const xrFrame = (gl.xr as any)?.getFrame?.()
      if (!xrFrame) return

      const referenceSpace = (gl.xr as any)?.getReferenceSpace?.()
      if (!referenceSpace) return

      // Perform hit test at screen center
      const hitResult = performHitTest(0, 0, xrFrame, referenceSpace)
      if (hitResult && isPlaceableSurface(hitResult.normal)) {
        onSurfaceHit(hitResult)
      }
    } catch (error) {
      // Silently fail hit testing - it's not critical
      console.warn('Hit test error:', error)
    }
  })

  return null
}

export default function ARScene({ onSurfaceHit, children }: ARSceneProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        onError={(error) => {
          console.error('Canvas error:', error)
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <XRButton
            mode="AR"
            sessionInit={{
              requiredFeatures: ['local-floor'],
              optionalFeatures: ['hit-test', 'bounded-floor', 'dom-overlay', 'local'],
            }}
          />
          <Hands />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ARHitTestPlane onSurfaceHit={onSurfaceHit} />
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}

