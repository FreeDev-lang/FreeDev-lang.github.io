import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from 'lucide-react'
import { useDeviceDetect } from './hooks/useDeviceDetect'
import QRCodeDisplay from './QRCodeDisplay'

interface ARButtonProps {
  productId: string
  productName: string
  textureId?: string
}

export default function ARButton({ productId, productName, textureId }: ARButtonProps) {
  const navigate = useNavigate()
  const { isMobile, isDesktop } = useDeviceDetect()
  const [showQR, setShowQR] = useState(false)

  const handleClick = () => {
    if (isMobile) {
      // Navigate to AR viewer on mobile
      const params = new URLSearchParams({ productId })
      if (textureId) params.set('textureId', textureId)
      navigate(`/ar?${params.toString()}`)
    } else {
      // Show QR code on desktop
      setShowQR(true)
    }
  }

  // Use VITE_FRONTEND_URL if set, otherwise use current origin
  // For production, set VITE_FRONTEND_URL=https://freedev-lang.github.io in your .env file
  const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  const arUrl = `${frontendBaseUrl}/ar?productId=${productId}${textureId ? `&textureId=${textureId}` : ''}`

  if (showQR && isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg p-6 max-w-md">
          <button
            onClick={() => setShowQR(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          <QRCodeDisplay url={arUrl} productName={productName} />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
    >
      <Box className="w-5 h-5" />
      <span>{isMobile ? 'View in Your Space' : 'Show QR Code'}</span>
    </button>
  )
}

