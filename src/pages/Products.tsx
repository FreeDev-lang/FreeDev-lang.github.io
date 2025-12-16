import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { Filter, X } from 'lucide-react'

export default function Products() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    searchTerm: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20,
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories().then(res => res.data),
  })

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['products-search', filters],
    queryFn: () => {
      // Clean up the filters - convert empty strings to null/undefined for optional numeric fields
      const cleanFilters = {
        ...filters,
        searchTerm: filters.searchTerm || null,
        category: filters.category || null,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      }
      // Remove null/undefined values
      Object.keys(cleanFilters).forEach(key => {
        if (cleanFilters[key] === null || cleanFilters[key] === undefined || cleanFilters[key] === '') {
          if (key !== 'sortBy' && key !== 'sortOrder' && key !== 'page' && key !== 'pageSize') {
            delete cleanFilters[key]
          }
        }
      })
      return productsApi.search(cleanFilters).then(res => res.data)
    },
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      pageSize: 20,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input"
                >
                  <option value="date">Newest</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="views">Popularity</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              {searchResults && (
                <p className="text-gray-600 mt-1">
                  {searchResults.totalCount} products found
                </p>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn btn-outline flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {filters.searchTerm && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Search: "{filters.searchTerm}"</span>
              <button
                onClick={() => handleFilterChange('searchTerm', '')}
                className="text-primary-600 hover:text-primary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : searchResults && searchResults.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.items.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={!searchResults.hasPreviousPage}
                    className="btn btn-outline disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4">
                    Page {filters.page} of {searchResults.totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={!searchResults.hasNextPage}
                    className="btn btn-outline disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

