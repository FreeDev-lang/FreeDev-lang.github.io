import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import FiltersSidebar, { MobileFilterToggle, type ProductFilters } from '../components/FiltersSidebar'
import { X } from 'lucide-react'
import { skeletonClassName } from '../utils/motion'

export default function Products() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProductFilters>({
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
      const cleanFilters: any = {
        ...filters,
        searchTerm: filters.searchTerm || null,
        category: filters.category || null,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      }
      const keysToKeep = ['sortBy', 'sortOrder', 'page', 'pageSize']
      Object.keys(cleanFilters).forEach((key: string) => {
        const value = (cleanFilters as any)[key]
        if (!keysToKeep.includes(key) && (value === null || value === undefined || value === '')) {
          delete (cleanFilters as any)[key]
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
    <div className="section-inner py-8 md:py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <FiltersSidebar
          filters={filters}
          categories={categories}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onClearAll={clearFilters}
        />

        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-h1-md text-neutral-900">Products</h1>
              {searchResults && (
                <p className="mt-1 text-body text-neutral-500">
                  {searchResults.totalCount} products found
                </p>
              )}
            </div>
            <MobileFilterToggle
              showFilters={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>

          {filters.searchTerm && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-body-sm text-neutral-600">Search: "{filters.searchTerm}"</span>
              <button
                type="button"
                onClick={() => handleFilterChange('searchTerm', '')}
                className="btn-icon shrink-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-96 ${skeletonClassName}`} />
              ))}
            </div>
          ) : searchResults && searchResults.items.length > 0 ? (
            <>
              <div className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.items.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {searchResults.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={!searchResults.hasPreviousPage}
                    className="btn btn-outline disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-body-sm text-neutral-600">
                    Page {filters.page} of {searchResults.totalPages}
                  </span>
                  <button
                    type="button"
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
            <div className="py-12 text-center">
              <p className="text-body text-neutral-500">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
