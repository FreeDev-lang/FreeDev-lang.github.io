import { useState } from 'react'
import { X, Move, RotateCw, ZoomIn, Hand } from 'lucide-react'

export default function ARInstructions() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">How to Use AR</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Hand className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Place Object</h3>
              <p className="text-sm text-gray-600">
                Point your phone at a flat surface and tap to place the furniture
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Move className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Move</h3>
              <p className="text-sm text-gray-600">
                Drag with one finger to move the object around
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <RotateCw className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Rotate</h3>
              <p className="text-sm text-gray-600">
                Twist with two fingers to rotate the object
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Scale</h3>
              <p className="text-sm text-gray-600">
                Pinch with two fingers to resize the object
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="mt-6 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

