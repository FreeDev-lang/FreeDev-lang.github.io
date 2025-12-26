import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Hands, useXR } from '@react-three/xr'
import { Suspense, useState, useEffect, useRef } from 'react'
import type { HitTestResult } from './types/ar.types'
import { performHitTest, isPlaceableSurface } from './utils/ar-utils'
import * as THREE from 'three'

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

function StartARButton({ glRef }: { glRef: React.MutableRefObject<THREE.WebGLRenderer | null> }) {
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean | null>(null) as [boolean | null, (value: boolean | null) => void]
  const [isStarting, setIsStarting] = useState(false)
  
  useEffect(() => {
    // Check WebXR support
    const checkSupport = async () => {
      if (!navigator.xr) {
        setIsSupported(false)
        setError('WebXR not available')
        return
      }
      
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar')
        setIsSupported(supported)
        if (!supported) {
          setError('AR not supported on this device')
        }
      } catch (err) {
        setIsSupported(false)
        setError('Failed to check AR support')
      }
    }
    
    checkSupport()
  }, [])
  
  const handleStartAR = async () => {
    if (!navigator.xr || !glRef.current) {
      setError('WebXR or WebGL not available')
      return
    }
    
    setIsStarting(true)
    setError(null)
    
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hit-test', 'bounded-floor', 'local'],
      })
      
      console.log('AR session created:', session)
      
      // Set up the XR session on the WebGL renderer
      await glRef.current.xr.setSession(session)
      
      console.log('AR session started successfully')
    } catch (err: any) {
      console.error('Error starting AR session:', err)
      setError(err.message || 'Failed to start AR session')
      setIsStarting(false)
    }
  }
  
  if (isSupported === false || isSupported === null) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        textAlign: 'center',
        color: 'white',
        padding: '20px',
      }}>
        <p style={{ marginBottom: '20px', fontSize: '18px' }}>
          AR is not supported on this device
        </p>
        {error && <p style={{ fontSize: '14px', color: '#ff6b6b' }}>{error}</p>}
      </div>
    )
  }
  
  return (
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
      <button
        onClick={handleStartAR}
        disabled={isStarting || !isSupported}
        style={{
          padding: '16px 32px',
          backgroundColor: isStarting || !isSupported ? '#6b7280' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          cursor: isStarting || !isSupported ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isStarting ? 'Starting AR...' : 'Start AR Experience'}
      </button>
      {error && (
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#ff6b6b' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function ARScene({ onSurfaceHit, children }: ARSceneProps) {
  const glRef = useRef<THREE.WebGLRenderer | null>(null)
  
  return (
    <>
      {/* Manual AR button */}
      <StartARButton glRef={glRef} />
      
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Canvas
          camera={{ position: [0, 1.6, 0], fov: 75 }}
          gl={(canvas) => {
            const renderer = new THREE.WebGLRenderer({
              canvas,
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
            })
            glRef.current = renderer
            return renderer
          }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          onCreated={({ gl }) => {
            // Handle context lost/restored
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              console.warn('WebGL context lost')
            })
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored')
            })
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
