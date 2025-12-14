import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import { Shield, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then(res => res.data),
  })

  const makeAdminMutation = useMutation({
    mutationFn: (id: number) => adminApi.makeAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User is now an admin')
    },
  })

  const removeAdminMutation = useMutation({
    mutationFn: (id: number) => adminApi.removeAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Admin status removed')
    },
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage users and admin permissions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.isAdmin ? (
                    <button
                      onClick={() => removeAdminMutation.mutate(user.id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => makeAdminMutation.mutate(user.id)}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

