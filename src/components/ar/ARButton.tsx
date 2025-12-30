import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Monitor, Loader2 } from 'lucide-react'
import { useDeviceDetect, getARCapabilityDescription } from './hooks/useDeviceDetect'
import QRCodeDisplay from './QRCodeDisplay'

interface ARButtonProps {
  productId: string
  productName: string
  textureId?: string
  modelUrl?: string
  usdzUrl?: string // iOS AR Quick Look URL
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export default function ARButton({ 
  productId, 
  productName, 
  textureId,
  modelUrl,
  usdzUrl,
  className = '',
  variant = 'primary',
  size = 'md'
}: ARButtonProps) {
  const navigate = useNavigate()
  const deviceInfo = useDeviceDetect()
  const [showQR, setShowQR] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Build AR URL with parameters
  const buildARUrl = useCallback(() => {
    const params = new URLSearchParams({ productId })
    if (textureId) params.set('textureId', textureId)
    if (modelUrl) params.set('modelUrl', encodeURIComponent(modelUrl))
    
    // Use VITE_FRONTEND_URL if set, otherwise use current origin
    const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
    return `${frontendBaseUrl}/ar?${params.toString()}`
  }, [productId, textureId, modelUrl])

  const handleClick = async () => {
    setIsLoading(true)
    
    try {
      switch (deviceInfo.supportedARMode) {
        case 'webxr':
          // Navigate to WebXR AR viewer
          {
            const params = new URLSearchParams({ productId })
            if (textureId) params.set('textureId', textureId)
            if (modelUrl) params.set('modelUrl', encodeURIComponent(modelUrl))
            navigate(`/ar?${params.toString()}`)
          }
          break
          
        case 'quicklook':
          // iOS AR Quick Look with USDZ file
          if (usdzUrl) {
            // Create anchor element for AR Quick Look
            const anchor = document.createElement('a')
            anchor.setAttribute('rel', 'ar')
            anchor.setAttribute('href', usdzUrl)
            
            // Add preview image
            const img = document.createElement('img')
            img.src = '' // Thumbnail URL would go here
            anchor.appendChild(img)
            
            document.body.appendChild(anchor)
            anchor.click()
            document.body.removeChild(anchor)
          } else {
            // Fallback to 3D viewer if no USDZ
            navigate(`/ar?productId=${productId}&mode=3d`)
          }
          break
          
        case '3d-only':
          // Navigate to 3D viewer
          {
            const params = new URLSearchParams({ productId, mode: '3d' })
            if (modelUrl) params.set('modelUrl', encodeURIComponent(modelUrl))
            navigate(`/ar?${params.toString()}`)
          }
          break
          
        default:
          // Show QR code for unsupported devices (desktop without WebXR)
          if (deviceInfo.isDesktop) {
            setShowQR(true)
          }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button text based on device capabilities
  const getButtonText = () => {
    if (isLoading) return 'Loading...'
    
    switch (deviceInfo.supportedARMode) {
      case 'webxr':
        return 'View in AR'
      case 'quicklook':
        return 'View in AR'
      case '3d-only':
        return 'View in 3D'
      default:
        return deviceInfo.isDesktop ? 'Scan QR for AR' : 'View in 3D'
    }
  }

  // Get appropriate icon
  const getIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />
    if (deviceInfo.isDesktop && deviceInfo.supportedARMode !== 'webxr') {
      return <Monitor className="w-5 h-5" />
    }
    return <Box className="w-5 h-5" />
  }

  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const arUrl = buildARUrl()

  // QR Code modal for desktop
  if (showQR && deviceInfo.isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <button
            onClick={() => setShowQR(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <QRCodeDisplay url={arUrl} productName={productName} />
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate(`/ar?productId=${productId}&mode=3d`)}
              className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              Or view in 3D on this device
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      title={getARCapabilityDescription(deviceInfo)}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
      
      {/* AR badge for supported devices */}
      {(deviceInfo.supportedARMode === 'webxr' || deviceInfo.supportedARMode === 'quicklook') && !isLoading && (
        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">
          AR
        </span>
      )}
    </button>
  )
}

/**
 * Compact AR button for product cards
 */
export function ARButtonCompact({ productId, textureId }: { productId: string; textureId?: string }) {
  const navigate = useNavigate()
  const deviceInfo = useDeviceDetect()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (deviceInfo.supportedARMode === 'webxr' || deviceInfo.supportedARMode === 'quicklook') {
      const params = new URLSearchParams({ productId })
      if (textureId) params.set('textureId', textureId)
      navigate(`/ar?${params.toString()}`)
    } else {
      navigate(`/ar?productId=${productId}&mode=3d`)
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      title="View in AR"
    >
      <Box className="w-4 h-4" />
    </button>
  )
}
