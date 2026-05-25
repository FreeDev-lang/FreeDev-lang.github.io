import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { storesApi } from '../lib/api'
import { Store, MapPin, ShoppingBag, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreData {
  id: number
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  primaryLocationCity: string | null
  primaryLocationCountry: string | null
  productCount: number
  status: string
}

export default function Stores() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterCountry, setFilterCountry] = useState('')

  const loadStores = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = { status: 'Active' }
      if (filterCity) params.city = filterCity
      if (filterCountry) params.country = filterCountry
      
      const response = await storesApi.getAll(params)
      setStores(response.data)
    } catch (error: any) {
      toast.error('Failed to load stores')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [filterCity, filterCountry])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const uniqueCities = Array.from(new Set(stores.map(s => s.primaryLocationCity).filter(Boolean)))
  const uniqueCountries = Array.from(new Set(stores.map(s => s.primaryLocationCountry).filter(Boolean)))

  return (
    <div className="section bg-secondary-50">
      <div className="border-b border-secondary-200 bg-white">
        <div className="section-inner py-8">
          <h1 className="text-h2 text-neutral-900">Browse Stores</h1>
          <p className="mt-2 text-body text-neutral-600">Discover furniture from our partner stores</p>
        </div>
      </div>

      <div className="section-inner py-8">
        <div className="card mb-8 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="input"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city || ''}>{city}</option>
              ))}
            </select>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="input"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country || ''}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="py-20 text-center">
            <Store className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
            <h3 className="text-h4 text-neutral-900">No stores found</h3>
            <p className="mt-2 text-body text-neutral-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.slug}`}
                className="card overflow-hidden transition-shadow duration-brand hover:shadow-card-hover"
              >
                {store.bannerUrl && (
                  <div className="h-32 overflow-hidden bg-secondary-100">
                    <img
                      src={store.bannerUrl}
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-start gap-4">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="h-16 w-16 rounded-card object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-card bg-primary-100">
                        <Store className="h-8 w-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-h4 text-neutral-900">{store.name}</h3>
                      {store.description && (
                        <p className="mt-1 line-clamp-2 text-body-sm text-neutral-600">{store.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-body-sm text-neutral-600">
                    {store.primaryLocationCity && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{store.primaryLocationCity}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{store.productCount} products</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

