import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import { Shield, ShieldOff, Crown, Ban, CheckCircle2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { user: me } = useAuthStore()
  const isMaker = !!me?.isMaker

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then(res => res.data),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  const onErr = (e: any) => toast.error(e.response?.data?.message || 'Action failed')

  const makeAdminMutation = useMutation({
    mutationFn: (id: number) => adminApi.makeAdmin(id),
    onSuccess: () => { invalidate(); toast.success('User is now an admin') },
    onError: onErr,
  })
  const removeAdminMutation = useMutation({
    mutationFn: (id: number) => adminApi.removeAdmin(id),
    onSuccess: () => { invalidate(); toast.success('Admin status removed') },
    onError: onErr,
  })
  const disableMutation = useMutation({
    mutationFn: (id: number) => adminApi.disableUser(id),
    onSuccess: () => { invalidate(); toast.success('Account disabled') },
    onError: onErr,
  })
  const enableMutation = useMutation({
    mutationFn: (id: number) => adminApi.enableUser(id),
    onSuccess: () => { invalidate(); toast.success('Account enabled') },
    onError: onErr,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => { invalidate(); toast.success('Account deleted') },
    onError: onErr,
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  const roleBadge = (user: any) => {
    if (user.isMaker) return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-accent-100 text-accent-800"><Crown className="w-3 h-3" />Owner</span>
    if (user.isSuperAdmin) return <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">Super Admin</span>
    if (user.isAdmin) return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Admin</span>
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">User</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage users and admin permissions
          {isMaker && <span className="ml-2 text-accent-700">· You are the platform owner — only you can disable or delete accounts.</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user: any) => {
              const isSelf = user.id === me?.id
              const isActive = user.isActive !== false
              return (
                <tr key={user.id} className={isActive ? '' : 'bg-red-50/50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{roleBadge(user)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isActive
                      ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                      : <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Disabled</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Admin promotion (any super admin) */}
                      {user.isAdmin ? (
                        <button
                          onClick={() => removeAdminMutation.mutate(user.id)}
                          disabled={user.isMaker}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          title={user.isMaker ? 'The owner is always an admin' : 'Remove admin'}
                        >
                          <ShieldOff className="w-4 h-4" />Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => makeAdminMutation.mutate(user.id)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Shield className="w-4 h-4" />Make Admin
                        </button>
                      )}

                      {/* Account control — Maker only */}
                      {isMaker && !user.isMaker && !isSelf && (
                        <>
                          {isActive ? (
                            <button
                              onClick={() => disableMutation.mutate(user.id)}
                              className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                              title="Disable account (blocks sign-in)"
                            >
                              <Ban className="w-4 h-4" />Disable
                            </button>
                          ) : (
                            <button
                              onClick={() => enableMutation.mutate(user.id)}
                              className="text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />Enable
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete ${user.email}? This cannot be undone.`)) {
                                deleteMutation.mutate(user.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            title="Delete account"
                          >
                            <Trash2 className="w-4 h-4" />Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
