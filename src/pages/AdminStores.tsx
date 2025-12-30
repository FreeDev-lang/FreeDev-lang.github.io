import { useState, useEffect } from 'react'
import { adminApi } from '../lib/api'
import { Store, CheckCircle, XCircle, Clock, Plus, Eye, Edit, Trash2, BarChart3, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreData {
  id: number
  name: string
  slug: string
  description: string | null
  ownerName: string
  ownerId: number
  status: string
  subscriptionTier: string | null
  primaryLocationCity: string | null
  primaryLocationCountry: string | null
  productCount: number
  createdAt: string
  logoUrl?: string | null
  bannerUrl?: string | null
}

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

interface StoreStats {
  store: StoreData
  stats: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
  }
}

export default function AdminStores() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [pendingStores, setPendingStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('')
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null)
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: ''
  })
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primaryLocationCity: '',
    primaryLocationCountry: '',
    ownerId: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadStores()
  }, [filterStatus])

  const loadStores = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (filterStatus) params.status = filterStatus
      
      const [allResponse, pendingResponse] = await Promise.all([
        adminApi.getAllStores(params),
        adminApi.getPendingStores()
      ])
      
      setStores(allResponse.data)
      setPendingStores(pendingResponse.data)
    } catch (error: any) {
      toast.error('Failed to load stores')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await adminApi.getAllUsers()
      setUsers(response.data)
    } catch (error: any) {
      toast.error('Failed to load users')
      console.error(error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadStoreStats = async (storeId: number) => {
    try {
      const response = await adminApi.getStoreStats(storeId)
      setStoreStats(response.data)
    } catch (error: any) {
      toast.error('Failed to load store statistics')
      console.error(error)
    }
  }

  const handleCreateStore = async () => {
    if (!formData.name || !formData.ownerId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await adminApi.createStore({
        name: formData.name,
        description: formData.description || null,
        primaryLocationCity: formData.primaryLocationCity || null,
        primaryLocationCountry: formData.primaryLocationCountry || null
      }, formData.ownerId)
      
      toast.success('Store created successfully')
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        primaryLocationCity: '',
        primaryLocationCountry: '',
        ownerId: 0
      })
      loadStores()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create store')
      console.error(error)
    }
  }

  const handleUpdateStore = async () => {
    if (!selectedStore) return

    try {
      await adminApi.updateStore(selectedStore.id, {
        name: formData.name || selectedStore.name,
        description: formData.description !== undefined ? formData.description : selectedStore.description,
        primaryLocationCity: formData.primaryLocationCity || selectedStore.primaryLocationCity,
        primaryLocationCountry: formData.primaryLocationCountry || selectedStore.primaryLocationCountry
      })
      
      toast.success('Store updated successfully')
      setShowEditModal(false)
      setSelectedStore(null)
      loadStores()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store')
      console.error(error)
    }
  }

  const handleDeleteStore = async () => {
    if (!selectedStore) return

    try {
      await adminApi.deleteStore(selectedStore.id)
      toast.success('Store deleted successfully')
      setShowDeleteConfirm(false)
      setSelectedStore(null)
      loadStores()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete store')
      console.error(error)
    }
  }

  const handleStatusUpdate = async (storeId: number, newStatus: string) => {
    try {
      await adminApi.updateStoreStatus(storeId, newStatus)
      toast.success('Store status updated')
      setShowStatusModal(false)
      setStatusForm({ status: '', reason: '' })
      loadStores()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store status')
      console.error(error)
    }
  }

  const openStatusModal = (store: StoreData) => {
    setSelectedStore(store)
    setStatusForm({
      status: store.status,
      reason: ''
    })
    setShowStatusModal(true)
  }

  const openEditModal = (store: StoreData) => {
    setSelectedStore(store)
    setFormData({
      name: store.name,
      description: store.description || '',
      primaryLocationCity: store.primaryLocationCity || '',
      primaryLocationCountry: store.primaryLocationCountry || '',
      ownerId: store.ownerId
    })
    setShowEditModal(true)
  }

  const openDetailsModal = async (store: StoreData) => {
    setSelectedStore(store)
    setShowDetailsModal(true)
    await loadStoreStats(store.id)
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      primaryLocationCity: '',
      primaryLocationCountry: '',
      ownerId: 0
    })
    setShowCreateModal(true)
    loadUsers()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Suspended
          </span>
        )
      case 'Disabled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3" />
            Disabled
          </span>
        )
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const displayStores = activeTab === 'pending' ? pendingStores : stores

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-1">Manage all stores on the platform</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Store
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Stores ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Approval ({pendingStores.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'all' && (
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      )}

      {/* Stores Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : displayStores.length === 0 ? (
        <div className="text-center py-20">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500">{store.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {store.primaryLocationCity || 'N/A'}
                      {store.primaryLocationCountry && `, ${store.primaryLocationCountry}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.productCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(store.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailsModal(store)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/stores/${store.slug}`, '_blank')}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Store"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(store)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Store"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openStatusModal(store)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Change Status"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStore(store)
                          setShowDeleteConfirm(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Store</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter store description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner *
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">Loading users...</div>
                ) : (
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={0}>Select owner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.primaryLocationCity}
                    onChange={(e) => setFormData({ ...formData, primaryLocationCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.primaryLocationCountry}
                    onChange={(e) => setFormData({ ...formData, primaryLocationCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStore}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Store</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedStore(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.primaryLocationCity}
                    onChange={(e) => setFormData({ ...formData, primaryLocationCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.primaryLocationCountry}
                    onChange={(e) => setFormData({ ...formData, primaryLocationCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedStore(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStore}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Update Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      {showDetailsModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Store Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedStore(null)
                  setStoreStats(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Store Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Store Name</label>
                    <p className="text-sm text-gray-900">{selectedStore.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Slug</label>
                    <p className="text-sm text-gray-900">{selectedStore.slug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner</label>
                    <p className="text-sm text-gray-900">{selectedStore.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedStore.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm text-gray-900">{selectedStore.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">
                      {selectedStore.primaryLocationCity || 'N/A'}
                      {selectedStore.primaryLocationCountry && `, ${selectedStore.primaryLocationCountry}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStore.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {storeStats && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Total Products</div>
                      <div className="text-2xl font-bold text-gray-900">{storeStats.stats.totalProducts}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Total Orders</div>
                      <div className="text-2xl font-bold text-gray-900">{storeStats.stats.totalOrders}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Total Revenue</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${storeStats.stats.totalRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Avg Order Value</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${storeStats.stats.averageOrderValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    openEditModal(selectedStore)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Store
                </button>
                <button
                  onClick={() => window.open(`/stores/${selectedStore.slug}`, '_blank')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Store Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Change Store Status</h2>
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStore(null)
                  setStatusForm({ status: '', reason: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedStore.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <div className="mb-2">{getStatusBadge(selectedStore.status)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status *
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a reason or note for this status change..."
                />
              </div>

              {statusForm.status && statusForm.status !== selectedStore.status && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Status Change:</strong> {selectedStore.status} → {statusForm.status}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStore(null)
                  setStatusForm({ status: '', reason: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!statusForm.status) {
                    toast.error('Please select a status')
                    return
                  }
                  if (statusForm.status === selectedStore.status) {
                    toast.error('Please select a different status')
                    return
                  }
                  handleStatusUpdate(selectedStore.id, statusForm.status)
                }}
                disabled={!statusForm.status || statusForm.status === selectedStore.status}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Store</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedStore.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedStore(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStore}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
