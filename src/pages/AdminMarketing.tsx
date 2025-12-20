import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marketingApi, productsApi } from '../lib/api'
import { Plus, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMarketing() {
  const [activeTab, setActiveTab] = useState<'banners' | 'featured'>('banners')
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    imageFile: null as File | null,
    linkUrl: '',
    linkText: '',
    displayOrder: 0,
    isActive: true,
    validFrom: '',
    validTo: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: banners } = useQuery({
    queryKey: ['marketing-banners'],
    queryFn: () => marketingApi.getAllBanners().then(res => res.data),
  })

  const { data: featuredProducts } = useQuery({
    queryKey: ['marketing-featured'],
    queryFn: () => marketingApi.getFeaturedProducts().then(res => res.data),
  })

  const { data: allProducts } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
  })

  const createBannerMutation = useMutation({
    mutationFn: (formData: FormData) => marketingApi.createBanner(formData),
    onSuccess: () => {
      toast.success('Banner created successfully')
      setShowBannerModal(false)
      resetBannerForm()
      queryClient.invalidateQueries({ queryKey: ['marketing-banners'] })
    },
  })

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, formData }: any) => marketingApi.updateBanner(id, formData),
    onSuccess: () => {
      toast.success('Banner updated successfully')
      setShowBannerModal(false)
      setEditingBanner(null)
      resetBannerForm()
      queryClient.invalidateQueries({ queryKey: ['marketing-banners'] })
    },
  })

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => marketingApi.deleteBanner(id),
    onSuccess: () => {
      toast.success('Banner deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['marketing-banners'] })
    },
  })

  const setFeaturedMutation = useMutation({
    mutationFn: (data: any) => marketingApi.setFeaturedProducts(data),
    onSuccess: () => {
      toast.success('Featured products updated')
      queryClient.invalidateQueries({ queryKey: ['marketing-featured'] })
    },
  })

  const resetBannerForm = () => {
    setBannerForm({
      title: '',
      description: '',
      imageFile: null,
      linkUrl: '',
      linkText: '',
      displayOrder: 0,
      isActive: true,
      validFrom: '',
      validTo: '',
    })
    setImagePreview(null)
  }

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title,
      description: banner.description || '',
      imageFile: null,
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      validFrom: banner.validFrom ? banner.validFrom.split('T')[0] : '',
      validTo: banner.validTo ? banner.validTo.split('T')[0] : '',
    })
    setImagePreview(banner.imageUrl || null)
    setShowBannerModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerForm({ ...bannerForm, imageFile: file })
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveBanner = () => {
    const formData = new FormData()
    formData.append('title', bannerForm.title)
    if (bannerForm.description) formData.append('description', bannerForm.description)
    if (bannerForm.imageFile) formData.append('imageFile', bannerForm.imageFile)
    if (bannerForm.linkUrl) formData.append('linkUrl', bannerForm.linkUrl)
    if (bannerForm.linkText) formData.append('linkText', bannerForm.linkText)
    formData.append('displayOrder', bannerForm.displayOrder.toString())
    formData.append('isActive', bannerForm.isActive.toString())
    if (bannerForm.validFrom) formData.append('validFrom', new Date(bannerForm.validFrom).toISOString())
    if (bannerForm.validTo) formData.append('validTo', new Date(bannerForm.validTo).toISOString())

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, formData })
    } else {
      createBannerMutation.mutate(formData)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Management</h1>
          <p className="text-gray-600 mt-2">Manage homepage banners and featured products</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('banners')}
            className={`pb-4 px-2 font-medium ${
              activeTab === 'banners'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Homepage Banners
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`pb-4 px-2 font-medium ${
              activeTab === 'featured'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Featured Products
          </button>
        </div>
      </div>

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                resetBannerForm()
                setEditingBanner(null)
                setShowBannerModal(true)
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Banner
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners && banners.length > 0 ? (
              banners.map((banner: any) => (
                <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {banner.imageUrl && (
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{banner.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{banner.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBanner(banner)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteBannerMutation.mutate(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">No banners yet</p>
            )}
          </div>
        </div>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Current Featured Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product: any) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-2">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.model}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="text-sm font-medium">{product.model}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-4">No featured products</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Products to Feature (hold Ctrl/Cmd to select multiple)
              </label>
              <select
                multiple
                className="w-full border border-gray-300 rounded-lg p-2 min-h-[200px]"
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => Number(option.value))
                  setFeaturedMutation.mutate({ productIds: selected })
                }}
              >
                {allProducts && allProducts.map((product: any) => (
                  <option
                    key={product.id}
                    value={product.id}
                    selected={featuredProducts?.some((fp: any) => fp.id === product.id)}
                  >
                    {product.model} ({product.category})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Selected products will be featured on the homepage
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBanner ? 'Edit Banner' : 'Create Banner'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Image will be resized to 1920x600 pixels
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                  <input
                    type="text"
                    value={bannerForm.linkText}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Shop Now"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={bannerForm.displayOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={bannerForm.validFrom}
                    onChange={(e) => setBannerForm({ ...bannerForm, validFrom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                  <input
                    type="date"
                    value={bannerForm.validTo}
                    onChange={(e) => setBannerForm({ ...bannerForm, validTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBanner}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowBannerModal(false)
                    setEditingBanner(null)
                    resetBannerForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

