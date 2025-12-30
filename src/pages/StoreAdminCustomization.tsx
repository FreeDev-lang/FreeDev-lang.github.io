import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { storeAdminApi, productsApi } from '../lib/api'
import { Plus, Trash2, Edit, X, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploader from '../components/ImageUploader'

interface CarouselSlide {
  imageUrl: string
  link?: string
  title?: string
  subtitle?: string
  order: number
  active: boolean
  startDate?: string
  endDate?: string
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
  link?: string
  position: string
  active: boolean
  order: number
}

interface SpecialDeal {
  type: string
  configuration?: Record<string, any>
  startDate?: string
  endDate?: string
  active: boolean
}

interface CustomizationData {
  carouselSlides?: CarouselSlide[]
  featuredProducts?: number[]
  flashSales?: FlashSale[]
  banners?: Banner[]
  specialDeals?: SpecialDeal[]
  themeSettings?: Record<string, any>
}

export default function StoreAdminCustomization() {
  const { storeId } = useOutletContext<{ storeId: number }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customization, setCustomization] = useState<CustomizationData>({})
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'carousel' | 'featured' | 'flash' | 'banners' | 'deals' | 'theme'>('carousel')
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null)
  const [editingDeal, setEditingDeal] = useState<SpecialDeal | null>(null)
  const [showSlideModal, setShowSlideModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false)
  const [showDealModal, setShowDealModal] = useState(false)

  useEffect(() => {
    if (storeId) {
      loadCustomization()
      loadProducts()
    }
  }, [storeId])

  const loadCustomization = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getCustomization(storeId)
      setCustomization({
        carouselSlides: response.data.carouselSlides || [],
        featuredProducts: response.data.featuredProducts || [],
        flashSales: response.data.flashSales || [],
        banners: response.data.banners || [],
        specialDeals: response.data.specialDeals || [],
        themeSettings: response.data.themeSettings || {}
      })
    } catch (error: any) {
      console.error('Failed to load customization', error)
      setCustomization({
        carouselSlides: [],
        featuredProducts: [],
        flashSales: [],
        banners: [],
        specialDeals: [],
        themeSettings: {}
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    if (!storeId) return

    try {
      const response = await productsApi.getAll()
      const storeProducts = response.data.filter((p: any) => p.storeId === storeId)
      setProducts(storeProducts)
    } catch (error) {
      console.error('Failed to load products', error)
    }
  }

  const handleSave = async () => {
    if (!storeId) return

    setIsSaving(true)
    try {
      await storeAdminApi.updateCustomization(storeId, customization)
      toast.success('Customization saved successfully')
      loadCustomization()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save customization')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      imageUrl: '',
      link: '',
      title: '',
      subtitle: '',
      order: (customization.carouselSlides?.length || 0) + 1,
      active: true
    }
    setEditingSlide(newSlide)
    setShowSlideModal(true)
  }

  const handleEditSlide = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setShowSlideModal(true)
  }

  const handleImageUpload = async (type: 'carousel' | 'banner' | 'logo', file: File) => {
    if (!storeId) return

    try {
      const response = await storeAdminApi.uploadImage(storeId, type, file)
      toast.success('Image uploaded successfully')
      return response.data.url
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
      throw error
    }
  }

  const handleSlideImageUpload = async (file: File) => {
    try {
      const url = await handleImageUpload('carousel', file)
      if (editingSlide) {
        setEditingSlide({ ...editingSlide, imageUrl: url })
      }
    } catch (error) {
      console.error('Failed to upload slide image', error)
    }
  }

  const handleBannerImageUpload = async (file: File) => {
    try {
      const url = await handleImageUpload('banner', file)
      if (editingBanner) {
        setEditingBanner({ ...editingBanner, imageUrl: url })
      }
    } catch (error) {
      console.error('Failed to upload banner image', error)
    }
  }

  const handleSaveSlide = () => {
    if (!editingSlide) return

    const slides = customization.carouselSlides || []
    const existingIndex = slides.findIndex(s => s.order === editingSlide.order && s !== editingSlide)
    
    if (existingIndex >= 0) {
      slides[existingIndex] = editingSlide
    } else {
      slides.push(editingSlide)
    }

    setCustomization({ ...customization, carouselSlides: slides })
    setShowSlideModal(false)
    setEditingSlide(null)
  }

  const handleDeleteSlide = (order: number) => {
    const slides = (customization.carouselSlides || []).filter(s => s.order !== order)
    setCustomization({ ...customization, carouselSlides: slides })
  }

  const handleAddBanner = () => {
    const newBanner: Banner = {
      imageUrl: '',
      link: '',
      position: 'top',
      active: true,
      order: (customization.banners?.length || 0) + 1
    }
    setEditingBanner(newBanner)
    setShowBannerModal(true)
  }

  const handleSaveBanner = () => {
    if (!editingBanner) return

    const banners = customization.banners || []
    const existingIndex = banners.findIndex(b => b.order === editingBanner.order && b !== editingBanner)
    
    if (existingIndex >= 0) {
      banners[existingIndex] = editingBanner
    } else {
      banners.push(editingBanner)
    }

    setCustomization({ ...customization, banners: banners })
    setShowBannerModal(false)
    setEditingBanner(null)
  }

  const handleDeleteBanner = (order: number) => {
    const banners = (customization.banners || []).filter(b => b.order !== order)
    setCustomization({ ...customization, banners: banners })
  }

  const handleToggleFeatured = (productId: number) => {
    const featured = customization.featuredProducts || []
    const index = featured.indexOf(productId)
    
    if (index >= 0) {
      featured.splice(index, 1)
    } else {
      featured.push(productId)
    }
    
    setCustomization({ ...customization, featuredProducts: featured })
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Store Customization</h1>
          <p className="text-gray-600 mt-1">Customize your store's appearance and promotional content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'carousel', label: 'Carousel Slides' },
            { id: 'featured', label: 'Featured Products' },
            { id: 'flash', label: 'Flash Sales' },
            { id: 'banners', label: 'Banners' },
            { id: 'deals', label: 'Special Deals' },
            { id: 'theme', label: 'Theme Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Slides Tab */}
      {activeTab === 'carousel' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Carousel Slides</h2>
            <button
              onClick={handleAddSlide}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Slide
            </button>
          </div>

          {(!customization.carouselSlides || customization.carouselSlides.length === 0) ? (
            <div className="text-center py-12 text-gray-500">
              No carousel slides yet. Add your first slide to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customization.carouselSlides.map((slide, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">{slide.title || 'Untitled Slide'}</div>
                    <div className="text-sm text-gray-600">{slide.subtitle}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded ${slide.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {slide.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-gray-500">Order: {slide.order}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.order)}
                        className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Products</h2>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products available. Add products to feature them.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => {
                const isFeatured = customization.featuredProducts?.includes(product.id) || false
                return (
                  <div
                    key={product.id}
                    onClick={() => handleToggleFeatured(product.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isFeatured
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={() => handleToggleFeatured(product.id)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.model}</div>
                        <div className="text-sm text-gray-600">${product.price}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Flash Sales Tab */}
      {activeTab === 'flash' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Flash Sales</h2>
            <button
              onClick={() => {
                setEditingFlashSale({
                  productId: 0,
                  discount: 0,
                  start: new Date().toISOString().split('T')[0],
                  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  active: true
                })
                setShowFlashSaleModal(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Flash Sale
            </button>
          </div>
          {(!customization.flashSales || customization.flashSales.length === 0) ? (
            <div className="text-center py-12 text-gray-500">
              No flash sales yet. Create your first flash sale to boost sales.
            </div>
          ) : (
            <div className="space-y-4">
              {customization.flashSales.map((sale, index) => {
                const product = products.find(p => p.id === sale.productId)
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {product?.model || `Product #${sale.productId}`}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium text-red-600">{sale.discount}% OFF</span>
                          {' • '}
                          <span>{new Date(sale.start).toLocaleDateString()} - {new Date(sale.end).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sale.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingFlashSale(sale)
                            setShowFlashSaleModal(true)
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const sales = (customization.flashSales || []).filter((_, i) => i !== index)
                            setCustomization({ ...customization, flashSales: sales })
                          }}
                          className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Banners</h2>
            <button
              onClick={handleAddBanner}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Banner
            </button>
          </div>
          {(!customization.banners || customization.banners.length === 0) ? (
            <div className="text-center py-12 text-gray-500">
              No banners yet. Add your first banner to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {customization.banners.map((banner, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Position: {banner.position}</div>
                      <div className="text-sm text-gray-600">Order: {banner.order}</div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {banner.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBanner(banner)
                          setShowBannerModal(true)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.order)}
                        className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Special Deals Tab */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Special Deals</h2>
            <button
              onClick={() => {
                setEditingDeal({
                  type: 'bundle',
                  configuration: {},
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  active: true
                })
                setShowDealModal(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Special Deal
            </button>
          </div>
          {(!customization.specialDeals || customization.specialDeals.length === 0) ? (
            <div className="text-center py-12 text-gray-500">
              No special deals yet. Create deals to attract more customers.
            </div>
          ) : (
            <div className="space-y-4">
              {customization.specialDeals.map((deal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">{deal.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {deal.startDate && deal.endDate && (
                          <span>{new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          deal.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {deal.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingDeal(deal)
                          setShowDealModal(true)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const deals = (customization.specialDeals || []).filter((_, i) => i !== index)
                          setCustomization({ ...customization, specialDeals: deals })
                        }}
                        className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Theme Settings Tab */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={customization.themeSettings?.primaryColor || '#C9A035'}
                  onChange={(e) => setCustomization({
                    ...customization,
                    themeSettings: { ...customization.themeSettings, primaryColor: e.target.value }
                  })}
                  className="w-20 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={customization.themeSettings?.primaryColor || '#C9A035'}
                  onChange={(e) => setCustomization({
                    ...customization,
                    themeSettings: { ...customization.themeSettings, primaryColor: e.target.value }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="#C9A035"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={customization.themeSettings?.secondaryColor || '#FFFFFF'}
                  onChange={(e) => setCustomization({
                    ...customization,
                    themeSettings: { ...customization.themeSettings, secondaryColor: e.target.value }
                  })}
                  className="w-20 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={customization.themeSettings?.secondaryColor || '#FFFFFF'}
                  onChange={(e) => setCustomization({
                    ...customization,
                    themeSettings: { ...customization.themeSettings, secondaryColor: e.target.value }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <select
                value={customization.themeSettings?.fontFamily || 'Inter'}
                onChange={(e) => setCustomization({
                  ...customization,
                  themeSettings: { ...customization.themeSettings, fontFamily: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
              <textarea
                value={customization.themeSettings?.storeDescription || ''}
                onChange={(e) => setCustomization({
                  ...customization,
                  themeSettings: { ...customization.themeSettings, storeDescription: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter your store description..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {showSlideModal && editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Carousel Slide</h2>
              <button onClick={() => setShowSlideModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <ImageUploader
                  type="carousel"
                  currentUrl={editingSlide.imageUrl}
                  onUpload={handleSlideImageUpload}
                  onRemove={() => setEditingSlide({ ...editingSlide, imageUrl: '' })}
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                  <input
                    type="text"
                    value={editingSlide.imageUrl}
                    onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                <input
                  type="text"
                  value={editingSlide.link}
                  onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={editingSlide.order}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="slideActive"
                    checked={editingSlide.active}
                    onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="slideActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSlideModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlide}
                disabled={!editingSlide.imageUrl}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && editingBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Banner</h2>
              <button onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <ImageUploader
                  type="banner"
                  currentUrl={editingBanner.imageUrl}
                  onUpload={handleBannerImageUpload}
                  onRemove={() => setEditingBanner({ ...editingBanner, imageUrl: '' })}
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                  <input
                    type="text"
                    value={editingBanner.imageUrl}
                    onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <select
                  value={editingBanner.position}
                  onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                <input
                  type="text"
                  value={editingBanner.link}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={editingBanner.order}
                    onChange={(e) => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bannerActive"
                    checked={editingBanner.active}
                    onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="bannerActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBannerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBanner}
                disabled={!editingBanner.imageUrl}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flash Sale Modal */}
      {showFlashSaleModal && editingFlashSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
              <button onClick={() => setShowFlashSaleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <select
                  value={editingFlashSale.productId}
                  onChange={(e) => setEditingFlashSale({ ...editingFlashSale, productId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="0">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.model} - ${p.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingFlashSale.discount}
                  onChange={(e) => setEditingFlashSale({ ...editingFlashSale, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={editingFlashSale.start.split('T')[0]}
                    onChange={(e) => setEditingFlashSale({ ...editingFlashSale, start: new Date(e.target.value).toISOString() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={editingFlashSale.end.split('T')[0]}
                    onChange={(e) => setEditingFlashSale({ ...editingFlashSale, end: new Date(e.target.value).toISOString() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flashSaleActive"
                  checked={editingFlashSale.active}
                  onChange={(e) => setEditingFlashSale({ ...editingFlashSale, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="flashSaleActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFlashSaleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const sales = customization.flashSales || []
                  const existingIndex = sales.findIndex((s, i) => i !== sales.indexOf(editingFlashSale) && s.productId === editingFlashSale.productId)
                  
                  if (existingIndex >= 0) {
                    sales[existingIndex] = editingFlashSale
                  } else {
                    sales.push(editingFlashSale)
                  }
                  
                  setCustomization({ ...customization, flashSales: sales })
                  setShowFlashSaleModal(false)
                  setEditingFlashSale(null)
                }}
                disabled={!editingFlashSale.productId || editingFlashSale.discount <= 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Save Flash Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Deal Modal */}
      {showDealModal && editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Special Deal</h2>
              <button onClick={() => setShowDealModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type *</label>
                <select
                  value={editingDeal.type}
                  onChange={(e) => setEditingDeal({ ...editingDeal, type: e.target.value, configuration: {} })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bundle">Bundle Deal</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                  <option value="minimum_purchase">Minimum Purchase Discount</option>
                  <option value="category_wide">Category-Wide Sale</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editingDeal.startDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingDeal({ ...editingDeal, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editingDeal.endDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingDeal({ ...editingDeal, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dealActive"
                  checked={editingDeal.active}
                  onChange={(e) => setEditingDeal({ ...editingDeal, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="dealActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDealModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const deals = customization.specialDeals || []
                  const existingIndex = deals.findIndex((d, i) => i !== deals.indexOf(editingDeal) && d.type === editingDeal.type)
                  
                  if (existingIndex >= 0) {
                    deals[existingIndex] = editingDeal
                  } else {
                    deals.push(editingDeal)
                  }
                  
                  setCustomization({ ...customization, specialDeals: deals })
                  setShowDealModal(false)
                  setEditingDeal(null)
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

