import { useState, useEffect } from 'react'
import { adminApi } from '../lib/api'
import { Store, CheckCircle, XCircle, Clock, Plus, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreData {
  id: number
  name: string
  slug: string
  description: string | null
  ownerName: string
  status: string
  subscriptionTier: string | null
  primaryLocationCity: string | null
  primaryLocationCountry: string | null
  productCount: number
  createdAt: string
}

export default function AdminStores() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [pendingStores, setPendingStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('')

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

  const handleStatusUpdate = async (storeId: number, newStatus: string) => {
    try {
      await adminApi.updateStoreStatus(storeId, newStatus)
      toast.success('Store status updated')
      loadStores()
    } catch (error: any) {
      toast.error('Failed to update store status')
      console.error(error)
    }
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
        <button className="btn btn-primary flex items-center gap-2">
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
                        onClick={() => window.open(`/stores/${store.slug}`, '_blank')}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Store"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {store.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(store.id, 'Active')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(store.id, 'Suspended')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {store.status === 'Active' && (
                        <button
                          onClick={() => handleStatusUpdate(store.id, 'Suspended')}
                          className="text-red-600 hover:text-red-900"
                          title="Suspend"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {store.status === 'Suspended' && (
                        <button
                          onClick={() => handleStatusUpdate(store.id, 'Active')}
                          className="text-green-600 hover:text-green-900"
                          title="Reactivate"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

