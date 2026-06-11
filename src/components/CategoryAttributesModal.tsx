import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../lib/api'
import { X, Plus, Trash2, Lock, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Choice list' },
  { value: 'boolean', label: 'Yes / No' },
]

type AttrForm = {
  name: string
  dataType: string
  options: string // comma-separated in the form, split on save
  unit: string
  isRequired: boolean
  displayOrder: number
}

const emptyAttr: AttrForm = { name: '', dataType: 'text', options: '', unit: '', isRequired: false, displayOrder: 0 }

/**
 * Manage the attributes a category defines (and shows the ones inherited from its parents,
 * read-only). Products in the category inherit all of these and fill in values.
 */
export default function CategoryAttributesModal({ category, onClose }: { category: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AttrForm>({ ...emptyAttr })

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['category-attributes', category.id],
    queryFn: () => categoriesApi.getAttributes(category.id).then((r) => r.data),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['category-attributes', category.id] })
  const onErr = (e: any) => toast.error(e.response?.data?.message || 'Action failed')

  const toPayload = (f: AttrForm) => ({
    name: f.name.trim(),
    dataType: f.dataType,
    options: f.dataType === 'select'
      ? f.options.split(',').map((o) => o.trim()).filter(Boolean)
      : [],
    unit: f.unit.trim() || null,
    isRequired: f.isRequired,
    displayOrder: Number(f.displayOrder) || 0,
  })

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.createAttribute(category.id, toPayload(form)),
    onSuccess: () => { invalidate(); setForm({ ...emptyAttr }); toast.success('Attribute added') },
    onError: onErr,
  })

  const deleteMutation = useMutation({
    mutationFn: (attributeId: number) => categoriesApi.deleteAttribute(attributeId),
    onSuccess: () => { invalidate(); toast.success('Attribute removed') },
    onError: onErr,
  })

  const handleAdd = () => {
    if (!form.name.trim()) return toast.error('Attribute name is required')
    if (form.dataType === 'select' && !form.options.trim())
      return toast.error('Add at least one choice for a choice list')
    createMutation.mutate()
  }

  const own = attributes.filter((a: any) => !a.inherited)
  const inherited = attributes.filter((a: any) => a.inherited)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold">Attributes · {category.displayName || category.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Properties every product in this category inherits — e.g. bed size, number of seats, material.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Inherited (read-only) */}
          {inherited.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Inherited from parents</h4>
              <div className="space-y-2">
                {inherited.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-600">
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">{a.dataType}</span>
                    {a.unit && <span className="text-xs text-gray-500">({a.unit})</span>}
                    <span className="ml-auto text-xs text-gray-400">from {a.sourceCategoryName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Own attributes */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">This category's attributes</h4>
            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : own.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">No attributes yet. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {own.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">{a.dataType}</span>
                    {a.unit && <span className="text-xs text-gray-500">({a.unit})</span>}
                    {a.isRequired && <span className="text-xs text-amber-600">required</span>}
                    {a.dataType === 'select' && a.options?.length > 0 && (
                      <span className="text-xs text-gray-400 truncate max-w-[12rem]">{a.options.join(', ')}</span>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                      title="Remove attribute (clears it from all products in this category)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add attribute</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Attribute name (e.g. Bed size)"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={form.dataType}
                onChange={(e) => setForm({ ...form, dataType: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {form.dataType === 'select' && (
                <input
                  type="text"
                  value={form.options}
                  onChange={(e) => setForm({ ...form, options: e.target.value })}
                  placeholder="Choices, comma-separated (King, Queen, Single)"
                  className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2"
                />
              )}
              {(form.dataType === 'number' || form.dataType === 'text') && (
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Unit (optional, e.g. cm)"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                  className="w-4 h-4"
                />
                Required
              </label>
            </div>
            <button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {createMutation.isPending ? 'Adding…' : 'Add attribute'}
            </button>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Done</button>
        </div>
      </div>
    </div>
  )
}
