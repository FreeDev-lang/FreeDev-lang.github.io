import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activityLogsApi } from '../lib/api'

export default function AdminActivityLogs() {
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    fromDate: '',
    toDate: '',
    page: 1,
    pageSize: 50,
  })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => activityLogsApi.getAll(filters).then(res => res.data),
  })

  const getActionColor = (action: string) => {
    if (action.includes('Delete') || action.includes('Refund')) return 'text-red-600'
    if (action.includes('Create') || action.includes('Add')) return 'text-green-600'
    if (action.includes('Update') || action.includes('Change')) return 'text-blue-600'
    return 'text-gray-600'
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">View all system activity and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Filter by user ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., PriceChange, Refund"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <input
              type="text"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., Product, Order"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Entity</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {log.entityType} {log.entityId && `#${log.entityId}`}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.description || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No activity logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

