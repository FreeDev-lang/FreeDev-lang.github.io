import { X, Plus, Palette, ShoppingCart } from 'lucide-react'

interface ARControlsProps {
  onClose: () => void
  onAddProduct: () => void
  onChangeTexture: () => void
  onAddToCart: () => void
  hasSelectedObject: boolean
}

export default function ARControls({
  onClose,
  onAddProduct,
  onChangeTexture,
  onAddToCart,
  hasSelectedObject,
}: ARControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          onClick={onClose}
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
          <span className="text-xs">Exit</span>
        </button>

        <button
          onClick={onAddProduct}
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-gray-900"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs">Add More</span>
        </button>

        <button
          onClick={onChangeTexture}
          disabled={!hasSelectedObject}
          className={`flex flex-col items-center gap-1 p-2 ${
            hasSelectedObject
              ? 'text-gray-600 hover:text-gray-900'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Palette className="w-6 h-6" />
          <span className="text-xs">Color</span>
        </button>

        <button
          onClick={onAddToCart}
          className="flex flex-col items-center gap-1 p-2 text-primary-600 hover:text-primary-700"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs">Add to Cart</span>
        </button>
      </div>
    </div>
  )
}

