import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../lib/api'
import { Search, Download, UserX, UserCheck, Key, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const queryClient = useQueryClient()

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: () => customersApi.getAll(searchTerm || undefined).then(res => res.data),
  })

  const { data: customerDetail } = useQuery({
    queryKey: ['customer-detail', selectedCustomer?.id],
    queryFn: () => customersApi.getById(selectedCustomer.id).then(res => res.data),
    enabled: !!selectedCustomer,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => customersApi.resetPassword(selectedCustomer.id, data),
    onSuccess: () => {
      toast.success('Password reset successfully')
      setShowResetPassword(false)
      setNewPassword('')
    },
    onError: () => {
      toast.error('Failed to reset password')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => customersApi.deactivate(id),
    onSuccess: () => {
      toast.success('Customer deactivated')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: number) => customersApi.activate(id),
    onSuccess: () => {
      toast.success('Customer activated')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const exportMutation = useMutation({
    mutationFn: () => customersApi.export(),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Customers exported successfully')
    },
  })

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    resetPasswordMutation.mutate({ newPassword })
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage customer accounts and view customer data</p>
        </div>
        <button
          onClick={() => exportMutation.mutate()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers && customers.length > 0 ? (
              customers.map((customer: any) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{customer.firstName} {customer.lastName}</td>
                  <td className="py-3 px-4">{customer.email}</td>
                  <td className="py-3 px-4">{customer.phoneNumber || 'N/A'}</td>
                  <td className="py-3 px-4">{customer.totalOrders}</td>
                  <td className="py-3 px-4">${customer.totalSpent.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-primary-600 hover:text-primary-700"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowResetPassword(true)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Reset Password"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      {customer.isActive ? (
                        <button
                          onClick={() => deactivateMutation.mutate(customer.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Deactivate"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => activateMutation.mutate(customer.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Activate"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && customerDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1">{customerDetail.firstName} {customerDetail.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1">{customerDetail.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1">{customerDetail.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Orders</label>
                  <p className="mt-1">{customerDetail.totalOrders}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Spent</label>
                  <p className="mt-1">${customerDetail.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customerDetail.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {customerDetail.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Orders ({customerDetail.orders.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customerDetail.orders.map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded p-2">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary-600 hover:underline">
                        {order.orderNumber}
                      </Link>
                      <span className="ml-2 text-sm text-gray-600">
                        ${order.totalAmount.toFixed(2)} - {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Reset Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setShowResetPassword(false)
                    setNewPassword('')
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

