import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { storeAdminApi } from '../lib/api'
import { Package, Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrency } from '../utils/currency'

export default function StoreAdminProducts() {
  const { storeId } = useOutletContext<{ storeId: number }>()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    if (storeId) {
      loadProducts()
    }
  }, [storeId])

  const loadProducts = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getProducts(storeId)
      setProducts(response.data)
    } catch (error: any) {
      toast.error('Failed to load products')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => storeAdminApi.deleteProduct(storeId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-admin-products', storeId] })
      toast.success('Product deleted successfully')
      loadProducts()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  })

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    deleteMutation.mutate(productId)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your store's product catalog</p>
        </div>
        <Link
          to="/store-admin/products/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'No products yet' : 'No products found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {products.length === 0 
              ? 'Add your first product to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {products.length === 0 && (
            <Link
              to="/store-admin/products/new"
              className="btn btn-primary"
            >
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].imageUrl}
                          alt={product.model}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{product.model}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stockQuantity || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/store-admin/products/${product.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

