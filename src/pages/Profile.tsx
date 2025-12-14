import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi, addressesApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then(res => res.data),
  })

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

