import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { productsApi, categoriesApi } from '../lib/api'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'ecommerce' | 'ar' | 'files'>('basic')
  const [existingImages, setExistingImages] = useState<string[]>([])

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => categoriesApi.getAll().then(res => res.data),
  })

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then(res => res.data),
    enabled: isEditing && !!id,
  })

  // Load product data when editing
  useEffect(() => {
    if (product && isEditing) {
      reset({
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
      })
      setExistingImages(product.images || [])
    }
  }, [product, isEditing, reset])

  const onSubmit = async (data: any) => {
    if (!isEditing && !modelFile) {
      toast.error('Please upload a 3D model file')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Send all fields - form is pre-populated when editing, so all fields have values
      // This allows user to change just one field (like stock) and submit successfully
      formData.append('Category', data.category)
      formData.append('Model', data.model)
      formData.append('Price', data.price?.toString() || '0')
      
      // Optional fields
      if (data.color) formData.append('Color', data.color)
      if (data.source) formData.append('Source', data.source)
      
      // Sizes
      const sizes = []
      if (data.width) sizes.push(data.width)
      if (data.height) sizes.push(data.height)
      if (data.depth) sizes.push(data.depth)
      if (sizes.length > 0) {
        formData.append('Sizes', sizes.join(','))
      }
      
      // Details
      if (data.description) formData.append('Description', data.description)
      if (data.goodToKnow) formData.append('GoodToKnow', data.goodToKnow)
      if (data.guarantee) formData.append('Guarantee', data.guarantee)
      if (data.productDetail) formData.append('ProductDetail', data.productDetail)
      
      // E-commerce fields - always send these
      formData.append('StockQuantity', (data.stockQuantity !== undefined && data.stockQuantity !== null && data.stockQuantity !== '') ? data.stockQuantity.toString() : '0')
      formData.append('IsActive', data.isActive ? 'true' : 'false')
      formData.append('IsFeatured', data.isFeatured ? 'true' : 'false')
      if (data.discountPrice) formData.append('DiscountPrice', data.discountPrice)
      if (data.sku) formData.append('SKU', data.sku)
      
      // AR fields
      if (data.modelScale) formData.append('ModelScale', data.modelScale)
      formData.append('ModelUnits', data.modelUnits || 'cm')
      
      // Files - only append new files (model file is optional when editing)
      if (modelFile) {
        formData.append('modelFile', modelFile)
      }
      imageFiles.forEach((file) => {
        formData.append('imageFiles', file)
      })
      
      if (isEditing && id) {
        await productsApi.update(Number(id), formData)
        toast.success('Product updated successfully!')
      } else {
        await productsApi.create(formData)
        toast.success('Product created successfully!')
      }
      navigate('/admin/products')
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
  ]

  if (isEditing && isLoadingProduct) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading product...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="text-gray-600 mt-2">{isEditing ? 'Update product information' : 'Create a new furniture item for your store'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="input"
                    >
                      <option value="">Select category</option>
                      {categories && categories.map((cat: any) => (
                        <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('model', { required: 'Model name is required' })}
                      className="input"
                      placeholder="e.g., Modern Sofa"
                    />
                    {errors.model && (
                      <p className="text-red-500 text-sm mt-1">{errors.model.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      {...register('color')}
                      className="input"
                      placeholder="e.g., Black, White"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { required: 'Price is required', min: 0 })}
                      className="input"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('discountPrice', { min: 0 })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      {...register('sku')}
                      className="input"
                      placeholder="e.g., SOFA-001"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
                    <input
                      type="url"
                      {...register('source')}
                      className="input"
                      placeholder="https://example.com/product"
                    />
                    <p className="text-xs text-gray-500 mt-1">Link to original product page (optional)</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions (cm)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                      <input
                        type="number"
                        {...register('width', { min: 0 })}
                        className="input"
                        placeholder="Width"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                      <input
                        type="number"
                        {...register('height', { min: 0 })}
                        className="input"
                        placeholder="Height"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Depth</label>
                      <input
                        type="number"
                        {...register('depth', { min: 0 })}
                        className="input"
                        placeholder="Depth"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="input"
                    placeholder="Product description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Good to Know</label>
                  <textarea
                    {...register('goodToKnow')}
                    rows={4}
                    className="input"
                    placeholder="Additional information, care instructions, etc..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guarantee/Warranty</label>
                  <textarea
                    {...register('guarantee')}
                    rows={3}
                    className="input"
                    placeholder="Warranty information..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Details</label>
                  <textarea
                    {...register('productDetail')}
                    rows={4}
                    className="input"
                    placeholder="Detailed product specifications, materials, etc..."
                  />
                </div>
              </div>
            )}

            {/* E-commerce Tab */}
            {activeTab === 'ecommerce' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      {...register('stockQuantity', { min: 0 })}
                      className="input"
                      defaultValue={0}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      defaultChecked
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isFeatured')}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>
            )}

            {/* AR Settings Tab */}
            {activeTab === 'ar' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Scale</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('modelScale', { min: 0.1 })}
                      className="input"
                      placeholder="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Scale factor for AR rendering (default: 1.0)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Units</label>
                    <select {...register('modelUnits')} className="input" defaultValue="cm">
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                      <option value="inches">Inches</option>
                    </select>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The 3D model file will be uploaded in the Files tab. 
                    Make sure the model scale matches your dimensions for accurate AR visualization.
                  </p>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3D Model File (GLB) {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing && (
                    <p className="text-sm text-gray-500 mb-2">
                      {product?.rendablePath ? 'Current model file exists. Upload a new file to replace it.' : 'No model file currently uploaded.'}
                    </p>
                  )}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={handleModelFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">GLB or GLTF files only</p>
                      {modelFile && (
                        <p className="text-sm text-green-600 mt-2">{modelFile.name}</p>
                      )}
                    </div>
                  </div>
                  {!isEditing && !modelFile && (
                    <p className="text-red-500 text-sm mt-1">3D model file is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFilesChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  {/* Existing images when editing */}
                  {isEditing && existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current images:</p>
                      <div className="grid grid-cols-4 gap-4">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* New images to upload */}
                  {imageFiles.length > 0 && (
                    <div className="mt-4">
                      {isEditing && existingImages.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">New images to add:</p>
                      )}
                      <div className="grid grid-cols-4 gap-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  const tabIds = tabs.map(t => t.id)
                  const currentIndex = tabIds.indexOf(activeTab)
                  if (index < currentIndex) {
                    setActiveTab(tab.id as any)
                  } else if (index > currentIndex) {
                    // Could add validation here before allowing next tab
                    setActiveTab(tab.id as any)
                  }
                }}
                className={`px-3 py-1 text-xs rounded ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !modelFile}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
