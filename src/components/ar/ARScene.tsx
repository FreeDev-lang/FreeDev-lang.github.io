import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Hands, useXR, XRButton } from '@react-three/xr'
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

function ARBackground() {
  const { gl } = useThree()
  
  useFrame(() => {
    // Set clear color to transparent so camera feed shows through
    gl.setClearColor(0x000000, 0)
  }, 1)
  
  return null
}

export default function ARScene({ onSurfaceHit, children }: ARSceneProps) {
  return (
    <>
      {/* XRButton is a DOM element, must be outside Canvas */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        textAlign: 'center',
        color: 'white',
      }}>
        <p style={{ marginBottom: '20px', fontSize: '18px' }}>
          Click the button below to start AR
        </p>
        <XRButton
          mode="AR"
          sessionInit={{
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['hit-test', 'bounded-floor', 'local'],
          }}
          style={{
            padding: '16px 32px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          Start AR Experience
        </XRButton>
      </div>
      
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
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ARBackground />
            <Hands />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <ARHitTestPlane onSurfaceHit={onSurfaceHit} />
            {children}
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}

