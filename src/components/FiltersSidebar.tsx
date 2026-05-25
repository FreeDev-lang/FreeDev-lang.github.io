import { ChevronDown, Filter, X } from 'lucide-react'
import type { ReactNode } from 'react'

export type ProductFilters = {
  searchTerm: string
  category: string
  minPrice: string
  maxPrice: string
  sortBy: string
  sortOrder: string
  page: number
  pageSize: number
}

type FiltersSidebarProps = {
  filters: ProductFilters
  categories?: string[]
  showFilters: boolean
  onFilterChange: (key: string, value: string) => void
  onClearAll: () => void
}

function SelectField({
  id,
  value,
  onChange,
  children,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select w-full appearance-none pr-10"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
    </div>
  )
}

export function MobileFilterToggle({
  showFilters,
  onToggle,
}: {
  showFilters: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`btn btn-pill gap-2 md:hidden ${
        showFilters ? 'btn-primary' : 'btn-secondary'
      }`}
      aria-expanded={showFilters}
      aria-controls="products-filters-sidebar"
    >
      {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
      {showFilters ? 'Close' : 'Filters'}
    </button>
  )
}

export default function FiltersSidebar({
  filters,
  categories,
  showFilters,
  onFilterChange,
  onClearAll,
}: FiltersSidebarProps) {
  const hasActiveFilters =
    Boolean(filters.category) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.sortBy !== 'date'

  return (
    <aside
      id="products-filters-sidebar"
      className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}
    >
      <div className="sticky top-20 rounded-card bg-white p-5 shadow-card-default md:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-h3 text-neutral-900">Filters</h2>
            <p className="mt-0.5 text-caption text-neutral-500">Refine your search</p>
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className={`nav-link shrink-0 text-caption font-semibold uppercase tracking-wider ${
              hasActiveFilters ? 'text-primary-700' : 'pointer-events-none text-neutral-300'
            }`}
            disabled={!hasActiveFilters}
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
              Category
            </legend>
            <SelectField
              id="filter-category"
              value={filters.category}
              onChange={(value) => onFilterChange('category', value)}
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </SelectField>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
              Price Range
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="filter-min-price" className="text-caption font-medium text-neutral-500">
                  Min
                </label>
                <input
                  id="filter-min-price"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => onFilterChange('minPrice', e.target.value)}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="filter-max-price" className="text-caption font-medium text-neutral-500">
                  Max
                </label>
                <input
                  id="filter-max-price"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
              Sort
            </legend>
            <SelectField
              id="filter-sort"
              value={filters.sortBy}
              onChange={(value) => onFilterChange('sortBy', value)}
            >
              <option value="date">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="views">Popularity</option>
            </SelectField>
          </fieldset>
        </div>
      </div>
    </aside>
  )
}
