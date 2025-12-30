import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import { storeAdminApi, categoriesApi, productColorsApi, productsApi } from '../lib/api'
import { ArrowLeft, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function StoreAdminAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { storeId } = useOutletContext<{ storeId: number }>()
  const isEditing = !!id
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'ecommerce' | 'ar' | 'files' | 'colors'>('basic')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [originalData, setOriginalData] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => categoriesApi.getAll().then(res => res.data),
  })

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then((res: any) => res.data),
    enabled: isEditing && !!id,
  })

  const { data: productColors = [] } = useQuery({
    queryKey: ['product-colors', id],
    queryFn: () => productColorsApi.getByProduct(Number(id)).then(res => res.data),
    enabled: isEditing && !!id,
  })

  // Load product data when editing
  useEffect(() => {
    if (product && isEditing) {
      const formData = {
        category: product.category,
        model: product.model,
        color: product.color || '',
        price: product.price,
        source: product.source || '',
        width: product.sizes?.[0] || '',
        height: product.sizes?.[1] || '',
        depth: product.sizes?.[2] || '',
        description: product.details?.description || '',
        goodToKnow: product.details?.goodToKnow || '',
        guarantee: product.details?.guarantee || '',
        productDetail: product.details?.productDetail || '',
        stockQuantity: product.stockQuantity || 0,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        discountPrice: product.discountPrice || '',
        sku: product.sku || '',
        modelScale: product.modelScale || '',
        modelUnits: product.modelUnits || 'cm',
      }
      reset(formData)
      setOriginalData(formData)
      setExistingImages(product.images || [])
    }
  }, [product, isEditing, reset])

  const onSubmit = async (data: any) => {
    if (!storeId) {
      toast.error('Store ID is required')
      return
    }

    if (!isEditing && !modelFile) {
      toast.error('Please upload a 3D model file')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      if (isEditing && originalData) {
        // Only send changed fields when editing
        if (data.category !== originalData.category) formData.append('Category', data.category)
        if (data.model !== originalData.model) formData.append('Model', data.model)
        if (data.price !== originalData.price) formData.append('Price', data.price?.toString() || '0')
        if (data.color !== originalData.color) {
          if (data.color) formData.append('Color', data.color)
          else formData.append('Color', '')
        }
        if (data.source !== originalData.source) {
          if (data.source) formData.append('Source', data.source)
          else formData.append('Source', '')
        }
        
        // Sizes - check if any changed
        const currentSizes = [data.width || '', data.height || '', data.depth || '']
        const originalSizes = [originalData.width || '', originalData.height || '', originalData.depth || '']
        if (JSON.stringify(currentSizes) !== JSON.stringify(originalSizes)) {
          const sizes = []
          if (data.width) sizes.push(data.width)
          if (data.height) sizes.push(data.height)
          if (data.depth) sizes.push(data.depth)
          formData.append('Sizes', sizes.join(','))
        }

        // Details
        if (data.description !== originalData.description) formData.append('Description', data.description || '')
        if (data.goodToKnow !== originalData.goodToKnow) formData.append('GoodToKnow', data.goodToKnow || '')
        if (data.guarantee !== originalData.guarantee) formData.append('Guarantee', data.guarantee || '')
        if (data.productDetail !== originalData.productDetail) formData.append('ProductDetail', data.productDetail || '')

        // E-commerce
        if (data.stockQuantity !== originalData.stockQuantity) formData.append('StockQuantity', data.stockQuantity?.toString() || '0')
        if (data.isActive !== originalData.isActive) formData.append('IsActive', data.isActive ? 'true' : 'false')
        if (data.isFeatured !== originalData.isFeatured) formData.append('IsFeatured', data.isFeatured ? 'true' : 'false')
        if (data.discountPrice !== originalData.discountPrice) formData.append('DiscountPrice', data.discountPrice || '')
        if (data.sku !== originalData.sku) formData.append('SKU', data.sku || '')

        // AR
        if (data.modelScale !== originalData.modelScale) formData.append('ModelScale', data.modelScale || '')
        if (data.modelUnits !== originalData.modelUnits) formData.append('ModelUnits', data.modelUnits || 'cm')
      } else {
        // Creating new product - send all required fields
        formData.append('Category', data.category)
        formData.append('Model', data.model)
        formData.append('Price', data.price?.toString() || '0')
        if (data.color) formData.append('Color', data.color)
        if (data.source) formData.append('Source', data.source)
        
        const sizes = []
        if (data.width) sizes.push(data.width)
        if (data.height) sizes.push(data.height)
        if (data.depth) sizes.push(data.depth)
        if (sizes.length > 0) formData.append('Sizes', sizes.join(','))

        formData.append('Description', data.description || '')
        formData.append('GoodToKnow', data.goodToKnow || '')
        formData.append('Guarantee', data.guarantee || '')
        formData.append('ProductDetail', data.productDetail || '')
        formData.append('StockQuantity', data.stockQuantity?.toString() || '0')
        formData.append('IsActive', data.isActive ? 'true' : 'false')
        formData.append('IsFeatured', data.isFeatured ? 'true' : 'false')
        if (data.discountPrice) formData.append('DiscountPrice', data.discountPrice)
        if (data.sku) formData.append('SKU', data.sku)
        if (data.modelScale) formData.append('ModelScale', data.modelScale)
        formData.append('ModelUnits', data.modelUnits || 'cm')
      }

      // Add files
      if (modelFile) {
        formData.append('modelFile', modelFile)
      }
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('imageFiles', file)
        })
      }
      
      if (isEditing && id) {
        await storeAdminApi.updateProduct(storeId, Number(id), formData)
        toast.success('Product updated successfully!')
      } else {
        await storeAdminApi.createProduct(storeId, formData)
        toast.success('Product created successfully!')
      }
      navigate('/store-admin/products')
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0])
    }
  }

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Product Details' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'ar', label: 'AR Settings' },
    { id: 'files', label: 'Files' },
    { id: 'colors', label: 'Available Colors' },
  ]

  // Color management
  const [newColor, setNewColor] = useState({ colorName: '', hexCode: '#000000', isAvailable: true, displayOrder: 0 })
  const [editingColor, setEditingColor] = useState<any>(null)

  const createColorMutation = useMutation({
    mutationFn: (data: any) => productColorsApi.create(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-colors', id] })
      setNewColor({ colorName: '', hexCode: '#000000', isAvailable: true, displayOrder: 0 })
      toast.success('Color added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add color')
    },
  })

  const updateColorMutation = useMutation({
    mutationFn: ({ id: colorId, data }: { id: number; data: any }) => productColorsApi.update(colorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-colors', id] })
      setEditingColor(null)
      toast.success('Color updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update color')
    },
  })

  const deleteColorMutation = useMutation({
    mutationFn: (colorId: number) => productColorsApi.delete(colorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-colors', id] })
      toast.success('Color deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete color')
    },
  })

  if (isLoadingProduct) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          to="/store-admin/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Update product information' : 'Create a new product for your store'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Category</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">Category is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name *
              </label>
              <input
                {...register('model', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Modern Sofa"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">Model name is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                {...register('color')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Black, White, Brown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: true, min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">Price is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                {...register('source')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Manufacturer name"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                <input
                  type="number"
                  {...register('width')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  {...register('height')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depth (cm)</label>
                <input
                  type="number"
                  {...register('depth')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Good to Know</label>
              <textarea
                {...register('goodToKnow')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Important information..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guarantee</label>
              <textarea
                {...register('guarantee')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Warranty information..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Details</label>
              <textarea
                {...register('productDetail')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Detailed product information..."
              />
            </div>
          </div>
        )}

        {/* E-commerce Tab */}
        {activeTab === 'ecommerce' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                min="0"
                {...register('stockQuantity')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                defaultValue={0}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                defaultChecked={true}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Featured Product</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
              <input
                type="number"
                step="0.01"
                {...register('discountPrice')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Sale price (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                {...register('sku')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Stock Keeping Unit"
              />
            </div>
          </div>
        )}

        {/* AR Settings Tab */}
        {activeTab === 'ar' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model Scale</label>
              <input
                type="number"
                step="0.1"
                {...register('modelScale')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="1.0"
              />
              <p className="text-xs text-gray-500 mt-1">Scale factor for AR rendering (default: 1.0)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model Units</label>
              <select
                {...register('modelUnits')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                defaultValue="cm"
              >
                <option value="cm">Centimeters</option>
                <option value="m">Meters</option>
                <option value="inches">Inches</option>
              </select>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3D Model File {!isEditing && '*'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleModelFileChange}
                  className="w-full"
                />
                {modelFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <span>{modelFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setModelFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {isEditing && existingImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">Current model file will be replaced if a new one is uploaded</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  className="w-full"
                />
                {imageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isEditing && existingImages.length > 0 && (
                    <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {existingImages.map((img: any, index: number) => (
                        <img
                          key={index}
                          src={typeof img === 'string' ? img : (img?.imageUrl || img)}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && isEditing && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Colors</h3>
              
              {productColors.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {productColors.map((color: any) => (
                    <div key={color.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{color.colorName}</div>
                        <div className="text-sm text-gray-600">{color.hexCode}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingColor(color)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteColorMutation.mutate(color.id)}
                        className="px-3 py-1 border border-red-300 rounded text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No colors added yet</p>
              )}

              {!editingColor ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Add New Color</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color Name</label>
                      <input
                        type="text"
                        value={newColor.colorName}
                        onChange={(e) => setNewColor({ ...newColor, colorName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hex Code</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newColor.hexCode}
                          onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={newColor.hexCode}
                          onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newColor.isAvailable}
                        onChange={(e) => setNewColor({ ...newColor, isAvailable: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">Available</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => createColorMutation.mutate(newColor)}
                      disabled={!newColor.colorName}
                      className="btn btn-primary"
                    >
                      Add Color
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Edit Color</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color Name</label>
                      <input
                        type="text"
                        value={editingColor.colorName}
                        onChange={(e) => setEditingColor({ ...editingColor, colorName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hex Code</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingColor.hexCode}
                          onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={editingColor.hexCode}
                          onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingColor.isAvailable}
                        onChange={(e) => setEditingColor({ ...editingColor, isAvailable: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">Available</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateColorMutation.mutate({ id: editingColor.id, data: editingColor })}
                        className="btn btn-primary"
                      >
                        Update Color
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingColor(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            to="/store-admin/products"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

