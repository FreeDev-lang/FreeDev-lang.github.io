import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { qrCodeApi } from '../../lib/api'
import { modalMotion, overlayMotion } from '../../utils/motion'

interface ARQRCodeProps {
  productId: number
  productName: string
  modelUrl?: string
  onClose: () => void
}

export default function ARQRCode({ productId, productName, modelUrl, onClose }: ARQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  const arUrl = `${frontendBaseUrl}/ar?productId=${productId}${modelUrl ? `&modelUrl=${encodeURIComponent(modelUrl)}` : ''}`

  useEffect(() => {
    const generateQRCode = async () => {
      setIsLoading(true)
      try {
        const response = await qrCodeApi.getProductQRCode(productId, 300)
        const url = URL.createObjectURL(response.data)
        setQrCodeUrl(url)
      } catch (error) {
        console.warn('Failed to generate QR code from API, using client-side generation')
        setQrCodeUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [productId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close QR code overlay"
        {...overlayMotion}
        className="absolute inset-0 bg-neutral-900/50"
        onClick={onClose}
      />
      <motion.div
        {...modalMotion}
        className="surface-overlay relative max-w-md w-full p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-icon absolute right-4 top-4"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-primary-600" />
            <h3 className="text-h3 text-neutral-900">View in AR</h3>
          </div>
          <p className="text-body-sm text-neutral-600">
            Scan this QR code with your phone to view <strong>{productName}</strong> in AR
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          {isLoading ? (
            <div className="flex h-64 w-64 items-center justify-center rounded-card bg-secondary-100">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : qrCodeUrl ? (
            <div className="rounded-card border border-secondary-200 bg-white p-4">
              <img src={qrCodeUrl} alt="QR Code" className="h-64 w-64" />
            </div>
          ) : (
            <div className="rounded-card border border-secondary-200 bg-white p-4">
              <QRCodeSVG
                value={arUrl}
                size={256}
                level="H"
                includeMargin={true}
                className="h-64 w-64"
              />
            </div>
          )}
        </div>

        <div className="rounded-card border border-primary-200 bg-primary-50 p-4">
          <p className="text-body-sm font-semibold text-primary-800">Instructions:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-body-sm text-primary-700">
            <li>Open your phone&apos;s camera app</li>
            <li>Point it at the QR code above</li>
            <li>Tap the notification to open in AR</li>
            <li>Place the product in your space</li>
          </ol>
        </div>
      </motion.div>
    </div>
  )
}
