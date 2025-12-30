import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { storeAdminApi } from '../lib/api'
import { MapPin, Plus, Edit, Trash2, X, Phone, Mail, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import MapPicker from '../components/MapPicker'

interface Location {
  id: number
  name: string
  address: string | null
  city: string | null
  stateProvince: string | null
  country: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  isPrimary: boolean
  status: string
}

export default function StoreAdminLocations() {
  const { storeId } = useOutletContext<{ storeId: number }>()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    stateProvince: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    isPrimary: false
  })

  useEffect(() => {
    if (storeId) {
      loadLocations()
    }
  }, [storeId])

  const loadLocations = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const response = await storeAdminApi.getLocations(storeId)
      setLocations(response.data)
    } catch (error: any) {
      toast.error('Failed to load locations')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        stateProvince: location.stateProvince || '',
        country: location.country || '',
        postalCode: location.postalCode || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        phone: location.phone || '',
        email: location.email || '',
        isPrimary: location.isPrimary
      })
    } else {
      setEditingLocation(null)
      setFormData({
        name: '',
        address: '',
        city: '',
        stateProvince: '',
        country: '',
        postalCode: '',
        latitude: '',
        longitude: '',
        phone: '',
        email: '',
        isPrimary: false
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!storeId) return

    try {
      const data = {
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        stateProvince: formData.stateProvince || null,
        country: formData.country || null,
        postalCode: formData.postalCode || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        phone: formData.phone || null,
        email: formData.email || null,
        isPrimary: formData.isPrimary
      }

      if (editingLocation) {
        await storeAdminApi.updateLocation(storeId, editingLocation.id, data)
        toast.success('Location updated successfully')
      } else {
        await storeAdminApi.addLocation(storeId, data)
        toast.success('Location added successfully')
      }

      setShowModal(false)
      loadLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save location')
      console.error(error)
    }
  }

  const handleDelete = async (locationId: number) => {
    if (!storeId) return
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      await storeAdminApi.deleteLocation(storeId, locationId)
      toast.success('Location deleted successfully')
      loadLocations()
    } catch (error: any) {
      toast.error('Failed to delete location')
      console.error(error)
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Locations</h1>
          <p className="text-gray-600 mt-1">Manage your physical store locations and points of sale</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
          <p className="text-gray-600 mb-6">Add your first store location to get started</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
          >
            Add Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                </div>
                {location.isPrimary && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                    Primary
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {location.address && (
                  <p className="flex items-start gap-2">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span>{location.address}</span>
                  </p>
                )}
                {(location.city || location.country) && (
                  <p>
                    {location.city && location.country
                      ? `${location.city}, ${location.country}`
                      : location.city || location.country}
                  </p>
                )}
                {location.postalCode && <p>{location.postalCode}</p>}
                {location.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {location.phone}
                  </p>
                )}
                {location.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {location.email}
                  </p>
                )}
                {location.latitude && location.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <Navigation className="w-4 h-4" />
                    View on Map
                  </a>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleOpenModal(location)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Main Store, Downtown Branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location on Map
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Click on the map to set the location coordinates
                </p>
                <MapPicker
                  latitude={formData.latitude ? parseFloat(formData.latitude) : null}
                  longitude={formData.longitude ? parseFloat(formData.longitude) : null}
                  onLocationSelect={(lat, lng) => {
                    setFormData({
                      ...formData,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    })
                  }}
                  height="400px"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                  Set as primary location
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingLocation ? 'Update' : 'Add'} Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

