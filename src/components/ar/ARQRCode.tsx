import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Smartphone } from 'lucide-react'
import { qrCodeApi } from '../../lib/api'

interface ARQRCodeProps {
  productId: number
  productName: string
  modelUrl?: string
  onClose: () => void
}

export default function ARQRCode({ productId, productName, modelUrl, onClose }: ARQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate AR URL for mobile
  const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  const arUrl = `${frontendBaseUrl}/ar?productId=${productId}${modelUrl ? `&modelUrl=${encodeURIComponent(modelUrl)}` : ''}`

  useEffect(() => {
    const generateQRCode = async () => {
      setIsLoading(true)
      try {
        // Try to get QR code from API
        const response = await qrCodeApi.getProductQRCode(productId, 300)
        const url = URL.createObjectURL(response.data)
        setQrCodeUrl(url)
      } catch (error) {
        console.warn('Failed to generate QR code from API, using client-side generation')
        // Fallback to client-side QR code
        setQrCodeUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [productId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">View in AR</h3>
          </div>
          <p className="text-sm text-gray-600">
            Scan this QR code with your phone to view <strong>{productName}</strong> in AR
          </p>
        </div>

        <div className="flex justify-center mb-6">
          {isLoading ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                value={arUrl}
                size={256}
                level="H"
                includeMargin={true}
                className="w-64 h-64"
              />
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Instructions:</strong>
          </p>
          <ol className="text-sm text-green-700 mt-2 space-y-1 list-decimal list-inside">
            <li>Open your phone's camera app</li>
            <li>Point it at the QR code above</li>
            <li>Tap the notification to open in AR</li>
            <li>Place the product in your space</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

