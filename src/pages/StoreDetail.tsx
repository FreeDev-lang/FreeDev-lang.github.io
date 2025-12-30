import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { storesApi } from '../lib/api'
import { MapPin, ShoppingBag, Phone, Mail, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'

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
}

interface Location {
  id: number
  name: string
  address: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  isPrimary: boolean
}

interface CarouselSlide {
  imageUrl: string
  link: string | null
  title: string | null
  subtitle: string | null
  active: boolean
  order: number
  startDate?: string | null
  endDate?: string | null
}

interface FlashSale {
  productId: number
  discount: number
  start: string
  end: string
  active: boolean
}

interface Banner {
  imageUrl: string
  link?: string | null
  position: string
  active: boolean
  order: number
}

interface StoreCustomization {
  carouselSlides: CarouselSlide[] | null
  featuredProducts: number[] | null
  flashSales: FlashSale[] | null
  banners: Banner[] | null
}

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<StoreData | null>(null)
  const [customization, setCustomization] = useState<StoreCustomization | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slug) {
      loadStoreData()
    }
  }, [slug])

  const loadStoreData = async () => {
    setIsLoading(true)
    try {
      // Load store
      const storeResponse = await storesApi.getBySlug(slug!)
      setStore(storeResponse.data)

      // Load customization
      try {
        const customResponse = await storesApi.getCustomization(storeResponse.data.id)
        setCustomization(customResponse.data)
      } catch (e) {
        // Customization might not exist
      }

      // Load products
      try {
        const productsResponse = await storesApi.getProducts(storeResponse.data.id)
        setProducts(productsResponse.data)
      } catch (e) {
        console.error('Failed to load products', e)
      }

      // Load locations
      try {
        const locationsResponse = await storesApi.getLocations(storeResponse.data.id)
        setLocations(locationsResponse.data)
      } catch (e) {
        console.error('Failed to load locations', e)
      }
    } catch (error: any) {
      toast.error('Failed to load store')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter carousel slides by active status and date range
  const activeSlides = customization?.carouselSlides?.filter(slide => {
    if (!slide.active) return false
    const now = new Date()
    if (slide.startDate && new Date(slide.startDate) > now) return false
    if (slide.endDate && new Date(slide.endDate) < now) return false
    return true
  }).sort((a, b) => a.order - b.order) || []

  useEffect(() => {
    if (activeSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [activeSlides.length])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h2>
          <Link to="/stores" className="text-primary-600 hover:text-primary-700">
            Browse all stores
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      {activeSlides.length > 0 && (
        <div className="relative h-96 bg-gray-200 overflow-hidden">
          {activeSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title || 'Store Banner'}
                className="w-full h-full object-cover"
              />
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    {slide.title && (
                      <h2 className="text-4xl font-bold mb-2">{slide.title}</h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-xl">{slide.subtitle}</p>
                    )}
                    {slide.link && (
                      <Link
                        to={slide.link}
                        className="mt-4 inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Shop Now
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {activeSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store Info Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-6">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mb-4">{store.description}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {store.primaryLocationCity && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{store.primaryLocationCity}, {store.primaryLocationCountry}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{store.productCount} products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banners Section */}
        {customization?.banners && customization.banners.filter(b => b.active).length > 0 && (
          <div className="mb-8 space-y-4">
            {customization.banners
              .filter(banner => banner.active)
              .sort((a, b) => a.order - b.order)
              .map((banner, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {banner.link ? (
                    <Link to={banner.link}>
                      <img
                        src={banner.imageUrl}
                        alt="Store Banner"
                        className="w-full h-48 md:h-64 object-cover"
                      />
                    </Link>
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt="Store Banner"
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Flash Sales Section */}
        {customization?.flashSales && customization.flashSales.filter(s => s.active).length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">🔥 Flash Sales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customization.flashSales
                .filter(sale => {
                  if (!sale.active) return false
                  const now = new Date()
                  return new Date(sale.start) <= now && new Date(sale.end) >= now
                })
                .slice(0, 4)
                .map((sale, index) => {
                  const product = products.find(p => p.id === sale.productId)
                  if (!product) return null
                  
                  const discountPrice = product.price * (1 - sale.discount / 100)
                  const timeRemaining = new Date(sale.end).getTime() - new Date().getTime()
                  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60))
                  
                  return (
                    <Link
                      key={index}
                      to={`/products/${product.id}`}
                      className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-colors"
                    >
                      {product.images && product.images.length > 0 && (
                        <img
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].imageUrl}
                          alt={product.model}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <p className="font-semibold text-sm mb-1">{product.model}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold">{discountPrice.toFixed(2)}</span>
                        <span className="text-sm line-through opacity-75">{product.price.toFixed(2)}</span>
                        <span className="text-sm font-bold bg-red-600 px-2 py-1 rounded">{sale.discount}% OFF</span>
                      </div>
                      {hoursLeft > 0 && (
                        <p className="text-xs opacity-90">Ends in {hoursLeft}h</p>
                      )}
                    </Link>
                  )
                })}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {customization?.featuredProducts && customization.featuredProducts.length > 0
                ? 'Featured Products'
                : 'Products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(customization?.featuredProducts && customization.featuredProducts.length > 0
                ? products.filter(p => customization.featuredProducts!.includes(p.id))
                : products
              ).slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length > 8 && (
              <div className="text-center mt-6">
                <Link
                  to={`/stores/${slug}/products`}
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Store Locations */}
        {locations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{location.name}</h3>
                  {location.address && (
                    <p className="text-gray-600 text-sm mb-2">{location.address}</p>
                  )}
                  {(location.city || location.country) && (
                    <p className="text-gray-600 text-sm mb-4">
                      {location.city}, {location.country}
                    </p>
                  )}
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Mail className="w-4 h-4" />
                      <span>{location.email}</span>
                    </div>
                  )}
                  {location.latitude && location.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

