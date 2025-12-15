import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingMethodsApi } from '../lib/api'
import { Plus, Edit, Trash2, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminShipping() {
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: 0,
    freeShippingThreshold: null as number | null,
    estimatedDaysMin: 3,
    estimatedDaysMax: 7,
    isActive: true,
    displayOrder: 0,
  })
  const queryClient = useQueryClient()

  const { data: methods, isLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => shippingMethodsApi.getAllActive().then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => shippingMethodsApi.create(data),
    onSuccess: () => {
      toast.success('Shipping method created')
      setShowModal(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => shippingMethodsApi.update(id, data),
    onSuccess: () => {
      toast.success('Shipping method updated')
      setShowModal(false)
      setEditingMethod(null)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => shippingMethodsApi.delete(id),
    onSuccess: () => {
      toast.success('Shipping method deleted')
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] })
    },
  })

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      cost: 0,
      freeShippingThreshold: null,
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
      isActive: true,
      displayOrder: 0,
    })
  }

  const handleEdit = (method: any) => {
    setEditingMethod(method)
    setForm({
      name: method.name,
      description: method.description || '',
      cost: method.cost,
      freeShippingThreshold: method.freeShippingThreshold,
      estimatedDaysMin: method.estimatedDaysMin,
      estimatedDaysMax: method.estimatedDaysMax,
      isActive: method.isActive,
      displayOrder: method.displayOrder,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Methods</h1>
          <p className="text-gray-600 mt-2">Manage shipping options and delivery methods</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingMethod(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods && methods.length > 0 ? (
          methods.map((method: any) => (
            <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-primary-600" />
                  <div>
                    <h3 className="font-bold text-lg">{method.name}</h3>
                    {method.description && (
                      <p className="text-sm text-gray-600">{method.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  method.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {method.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-semibold">${method.cost.toFixed(2)}</span>
                </div>
                {method.freeShippingThreshold && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free over:</span>
                    <span className="font-semibold">${method.freeShippingThreshold.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold">
                    {method.estimatedDaysMin}-{method.estimatedDaysMax} days
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(method)}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(method.id)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-8">No shipping methods yet</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingMethod ? 'Edit Shipping Method' : 'Create Shipping Method'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
                  <input
                    type="number"
                    value={form.freeShippingThreshold || ''}
                    onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value ? Number(e.target.value) : null })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Days</label>
                  <input
                    type="number"
                    value={form.estimatedDaysMin}
                    onChange={(e) => setForm({ ...form, estimatedDaysMin: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Days</label>
                  <input
                    type="number"
                    value={form.estimatedDaysMax}
                    onChange={(e) => setForm({ ...form, estimatedDaysMax: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  {editingMethod ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingMethod(null)
                    resetForm()
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

