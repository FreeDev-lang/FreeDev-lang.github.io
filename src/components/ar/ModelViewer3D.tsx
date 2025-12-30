import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Loader } from '@react-three/drei'
import { Suspense } from 'react'

interface ModelViewer3DProps {
  modelUrl: string
  className?: string
}

function Model({ url }: { url: string }) {
  try {
    const { scene } = useGLTF(url)
    return <primitive object={scene} scale={1} />
  } catch (error) {
    console.error('Error loading model:', error)
    return null
  }
}

export default function ModelViewer3D({ modelUrl, className = '' }: ModelViewer3DProps) {

  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No 3D model available</p>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ minHeight: '400px', height: '100%' }}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <Loader />
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Environment preset="sunset" />
          <Model url={modelUrl} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
          <PerspectiveCamera makeDefault />
        </Canvas>
      </Suspense>
    </div>
  )
}

