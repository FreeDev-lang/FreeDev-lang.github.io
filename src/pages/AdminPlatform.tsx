import { useQuery, useMutation } from '@tanstack/react-query'
import { platformApi } from '../lib/api'
import { Shield, Power, RefreshCw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { SuperAdminRoute } from '../components/AdminRoute'

function AdminPlatformContent() {
  const { data: status } = useQuery({
    queryKey: ['platform-status'],
    queryFn: () => platformApi.getStatus().then(res => res.data),
  })

  const shutdownMutation = useMutation({
    mutationFn: () => platformApi.shutdown(),
    onSuccess: () => {
      toast.success('Platform shutdown initiated')
    },
    onError: () => {
      toast.error('Failed to shutdown platform')
    },
  })

  const restartMutation = useMutation({
    mutationFn: () => platformApi.restart(),
    onSuccess: () => {
      toast.success('Platform restart initiated')
    },
    onError: () => {
      toast.error('Failed to restart platform')
    },
  })

  const handleShutdown = () => {
    if (window.confirm('Are you sure you want to shutdown the platform? This will stop accepting requests.')) {
      shutdownMutation.mutate()
    }
  }

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart the platform?')) {
      restartMutation.mutate()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Management</h1>
        <p className="text-gray-600 mt-2">SuperAdmin only - Manage platform operations</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Platform Status</h2>
            <p className={`text-lg font-semibold ${status?.isShutdown ? 'text-red-600' : 'text-green-600'}`}>
              {status?.isShutdown ? 'Platform is Shutdown' : 'Platform is Operational'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{status?.message}</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-900 mb-2">Warning</h3>
            <p className="text-sm text-yellow-800">
              Platform shutdown will stop the application from accepting new requests. 
              This action should only be performed during maintenance or emergencies.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Power className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Shutdown Platform</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Stop the platform from accepting new requests. This is a critical operation.
          </p>
          <button
            onClick={handleShutdown}
            disabled={shutdownMutation.isPending || status?.isShutdown}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {shutdownMutation.isPending ? 'Shutting down...' : 'Shutdown Platform'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Restart Platform</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Restart the platform to resume normal operations after a shutdown.
          </p>
          <button
            onClick={handleRestart}
            disabled={restartMutation.isPending || !status?.isShutdown}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {restartMutation.isPending ? 'Restarting...' : 'Restart Platform'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPlatform() {
  return (
    <SuperAdminRoute>
      <AdminPlatformContent />
    </SuperAdminRoute>
  )
}

