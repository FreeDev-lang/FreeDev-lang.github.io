import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { storeAdminApi } from '../lib/api'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploader from '../components/ImageUploader'

export default function StoreAdminProfile() {
  const { storeId } = useOutletContext<{ storeId: number; store: any }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primaryLocationCity: '',
    primaryLocationCountry: '',
    logoUrl: '',
    bannerUrl: ''
  })

  useEffect(() => {
    if (storeId) {
      loadStoreData()
    }
  }, [storeId])

  const loadStoreData = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getDashboard(storeId)
      setStoreData(response.data.store)
      setFormData({
        name: response.data.store.name || '',
        description: response.data.store.description || '',
        primaryLocationCity: response.data.store.primaryLocationCity || '',
        primaryLocationCountry: response.data.store.primaryLocationCountry || '',
        logoUrl: response.data.store.logoUrl || '',
        bannerUrl: response.data.store.bannerUrl || ''
      })
    } catch (error: any) {
      toast.error('Failed to load store data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    try {
      const url = await handleImageUpload('logo', file)
      setFormData({ ...formData, logoUrl: url })
    } catch (error) {
      console.error('Failed to upload logo', error)
    }
  }

  const handleBannerUpload = async (file: File) => {
    try {
      const url = await handleImageUpload('banner', file)
      setFormData({ ...formData, bannerUrl: url })
    } catch (error) {
      console.error('Failed to upload banner', error)
    }
  }

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
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

  const handleSave = async () => {
    if (!storeId) return

    setIsSaving(true)
    try {
      await storeAdminApi.updateProfile(storeId, formData)
      toast.success('Store profile updated successfully')
      loadStoreData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store profile')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
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

  if (!storeData) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h2>
          <p className="text-gray-600">Unable to load store data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Profile</h1>
        <p className="text-gray-600 mt-1">Manage your store information and settings</p>
      </div>

      <div className="space-y-6">
        {/* Store Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Store Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              storeData.status === 'Active' 
                ? 'bg-green-100 text-green-800'
                : storeData.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {storeData.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Store ID:</span>
              <span className="ml-2 font-medium">{storeData.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Slug:</span>
              <span className="ml-2 font-medium">{storeData.slug}</span>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <span className="ml-2 font-medium">{storeData.ownerName}</span>
            </div>
            <div>
              <span className="text-gray-500">Products:</span>
              <span className="ml-2 font-medium">{storeData.productCount}</span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter store name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your store..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.primaryLocationCity}
                  onChange={(e) => setFormData({ ...formData, primaryLocationCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.primaryLocationCountry}
                  onChange={(e) => setFormData({ ...formData, primaryLocationCountry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Images */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo
              </label>
              <ImageUploader
                type="logo"
                currentUrl={formData.logoUrl}
                onUpload={handleLogoUpload}
                onRemove={() => setFormData({ ...formData, logoUrl: '' })}
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Banner
              </label>
              <ImageUploader
                type="banner"
                currentUrl={formData.bannerUrl}
                onUpload={handleBannerUpload}
                onRemove={() => setFormData({ ...formData, bannerUrl: '' })}
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                <input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

