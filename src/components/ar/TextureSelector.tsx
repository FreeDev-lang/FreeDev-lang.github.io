import { X } from 'lucide-react'
import type { ProductTexture } from './types/ar.types'

interface TextureSelectorProps {
  textures: ProductTexture[]
  selectedTextureId: string
  onSelect: (textureId: string) => void
  onClose: () => void
}

export default function TextureSelector({
  textures,
  selectedTextureId,
  onSelect,
  onClose,
}: TextureSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Color</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {textures.map((texture) => (
            <button
              key={texture.id}
              onClick={() => {
                onSelect(texture.id)
                onClose()
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTextureId === texture.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                <img
                  src={texture.thumbnailUrl}
                  alt={texture.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">{texture.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

