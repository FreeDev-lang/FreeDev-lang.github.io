import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authApi, addressesApi, storeAdminApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Store, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

export default function Profile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [hasStores, setHasStores] = useState(false)
  const [stores, setStores] = useState<any[]>([])

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then(res => res.data),
  })

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await storeAdminApi.getMyStores()
        setStores(response.data)
        setHasStores(response.data.length > 0)
      } catch (error) {
        setHasStores(false)
      }
    }
    loadStores()
  }, [])

  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateMe(data),
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Store Admin Panel Link */}
      {hasStores && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Store Management</h2>
                <p className="text-sm text-gray-600">
                  You have {stores.length} store{stores.length !== 1 ? 's' : ''} to manage
                </p>
              </div>
            </div>
            <Link
              to="/store-admin/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Store className="w-5 h-5" />
              Go to Store Admin
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input {...register('firstName')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input {...register('lastName')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input {...register('phoneNumber')} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
          {addresses && addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((addr: any) => (
                <div key={addr.id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-medium">{addr.streetAddress}</p>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs text-primary-600">Default</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No addresses saved</p>
          )}
        </div>
      </div>
    </div>
  )
}

