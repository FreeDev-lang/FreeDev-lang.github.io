import { useState, useEffect } from 'react'
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

  useEffect(() => {
    loadStores()
  }, [filterCity, filterCountry])

  const loadStores = async () => {
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
  }

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const uniqueCities = Array.from(new Set(stores.map(s => s.primaryLocationCity).filter(Boolean)))
  const uniqueCountries = Array.from(new Set(stores.map(s => s.primaryLocationCountry).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Stores</h1>
          <p className="text-gray-600">Discover furniture from our partner stores</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city || ''}>{city}</option>
              ))}
            </select>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country || ''}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-20">
            <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {store.bannerUrl && (
                  <div className="h-32 bg-gray-200 overflow-hidden">
                    <img
                      src={store.bannerUrl}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Store className="w-8 h-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
                      {store.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{store.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {store.primaryLocationCity && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{store.primaryLocationCity}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
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

