import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../lib/api'
import { Plus, Edit, Trash2, Folder, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
    imagePath: '',
    iconName: '',
    isActive: true,
    displayOrder: 0,
    slug: '',
  })
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => categoriesApi.getAll(true).then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => categoriesApi.create(data),
    onSuccess: () => {
      toast.success('Category created successfully')
      setShowModal(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => categoriesApi.update(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully')
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    },
  })

  const resetForm = () => {
    setForm({
      name: '',
      displayName: '',
      description: '',
      imagePath: '',
      iconName: '',
      isActive: true,
      displayOrder: 0,
      slug: '',
    })
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      displayName: category.displayName || '',
      description: category.description || '',
      imagePath: category.imagePath || '',
      iconName: category.iconName || '',
      isActive: category.isActive,
      displayOrder: category.displayOrder,
      slug: category.slug || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }

    const data = {
      ...form,
      displayName: form.displayName || form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (category: any) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will fail if there are products in this category.`)) {
      deleteMutation.mutate(category.id)
    }
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingCategory(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.length > 0 ? (
          categories.map((category: any) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                category.isActive ? 'border-gray-200' : 'border-gray-300 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{category.displayName || category.name}</h3>
                    <p className="text-sm text-gray-500">{category.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{category.productCount} products</span>
                </div>
                {category.slug && (
                  <div className="text-xs text-gray-500">
                    /{category.slug}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                  disabled={category.productCount > 0}
                  title={category.productCount > 0 ? 'Cannot delete category with products' : 'Delete category'}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-8">No categories yet</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name * <span className="text-xs text-gray-500">(e.g., CHAIRS)</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      if (!editingCategory && !form.slug) {
                        setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="CHAIRS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name <span className="text-xs text-gray-500">(e.g., Chairs)</span>
                  </label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Chairs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Category description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Path/URL</label>
                  <input
                    type="text"
                    value={form.imagePath}
                    onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter image URL or path"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={form.iconName}
                    onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., chair-icon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="chairs"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly name</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="0"
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

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update'
                    : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
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

