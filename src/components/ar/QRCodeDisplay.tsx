import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  productName: string
}

export default function QRCodeDisplay({ url, productName }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">View in Your Space</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Scan with your phone to see {productName} in your room
      </p>
      <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
        <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
        Point your phone camera at this QR code to open the AR experience
      </p>
    </div>
  )
}

