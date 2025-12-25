import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Search } from 'lucide-react'
import { productsApi } from '../../lib/api'
import type { Product } from './types/ar.types'

interface ProductPickerProps {
  onSelect: (product: Product) => void
  onClose: () => void
  excludeProductIds?: string[]
}

export default function ProductPicker({
  onSelect,
  onClose,
  excludeProductIds = [],
}: ProductPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'ar', searchTerm],
    queryFn: () => productsApi.getAll({ search: searchTerm }).then((res) => res.data),
  })

  const filteredProducts = products?.filter(
    (p: any) => !excludeProductIds.includes(p.id.toString())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => {
                    // Convert to Product type
                    const arProduct: Product = {
                      id: product.id.toString(),
                      name: product.model,
                      price: product.price,
                      modelUrl: product.rendablePath || '',
                      textures: [], // Will be loaded separately
                      defaultTextureId: '',
                      dimensions: {
                        width: product.sizes?.[0] || 0,
                        height: product.sizes?.[1] || 0,
                        depth: product.sizes?.[2] || 0,
                      },
                    }
                    onSelect(arProduct)
                    onClose()
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left"
                >
                  {product.images && product.images.length > 0 && (
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">{product.model}</h3>
                  <p className="text-sm text-gray-600">${product.price}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No products found</div>
          )}
        </div>
      </div>
    </div>
  )
}

