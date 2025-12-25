import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { XRButton, Hands, useXR } from '@react-three/xr'
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

    const xrFrame = (gl.xr as any)?.getFrame?.()
    if (!xrFrame) return

    const referenceSpace = (gl.xr as any)?.getReferenceSpace?.()
    if (!referenceSpace) return

    // Perform hit test at screen center
    const hitResult = performHitTest(0, 0, xrFrame, referenceSpace)
    if (hitResult && isPlaceableSurface(hitResult.normal)) {
      onSurfaceHit(hitResult)
    }
  })

  return null
}

export default function ARScene({ onSurfaceHit, children }: ARSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0] }}
      gl={{ antialias: true, alpha: true }}
    >
      <XRButton
        mode="AR"
        sessionInit={{
          requiredFeatures: ['local-floor', 'hit-test'],
          optionalFeatures: ['bounded-floor', 'dom-overlay'],
        }}
      />
      <Hands />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ARHitTestPlane onSurfaceHit={onSurfaceHit} />
      {children}
    </Canvas>
  )
}

