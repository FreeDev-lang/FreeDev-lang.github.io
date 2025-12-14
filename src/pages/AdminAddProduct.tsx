import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../lib/api'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: any) => {
    if (!modelFile) {
      toast.error('Please upload a 3D model file')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Add all form fields
      formData.append('Category', data.category)
      formData.append('Model', data.model)
      if (data.color) formData.append('Color', data.color)
      formData.append('Price', data.price)
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
      
      // E-commerce fields
      formData.append('StockQuantity', data.stockQuantity || '0')
      formData.append('IsActive', data.isActive ? 'true' : 'false')
      formData.append('IsFeatured', data.isFeatured ? 'true' : 'false')
      if (data.discountPrice) formData.append('DiscountPrice', data.discountPrice)
      if (data.sku) formData.append('SKU', data.sku)
      
      // AR fields
      if (data.modelScale) formData.append('ModelScale', data.modelScale)
      if (data.modelUnits) formData.append('ModelUnits', data.modelUnits || 'cm')
      
      // Files
      formData.append('modelFile', modelFile)
      imageFiles.forEach((file) => {
        formData.append('imageFiles', file)
      })

      await productsApi.create(formData)
      toast.success('Product created successfully!')
      navigate('/admin/products')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product')
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">Create a new furniture item for your store</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
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
                  <option value="Sofa">Sofa</option>
                  <option value="Chair">Chair</option>
                  <option value="Table">Table</option>
                  <option value="Bed">Bed</option>
                  <option value="Cabinet">Cabinet</option>
                  <option value="Shelf">Shelf</option>
                  <option value="Lamp">Lamp</option>
                  <option value="Other">Other</option>
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
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dimensions (cm)</h2>
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

          {/* E-commerce Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">E-commerce Settings</h2>
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

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    defaultChecked
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isFeatured')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </div>

          {/* AR Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AR Settings</h2>
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
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input"
                  placeholder="Product description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Good to Know</label>
                <textarea
                  {...register('goodToKnow')}
                  rows={3}
                  className="input"
                  placeholder="Additional information..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guarantee</label>
                <textarea
                  {...register('guarantee')}
                  rows={2}
                  className="input"
                  placeholder="Warranty information..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Details</label>
                <textarea
                  {...register('productDetail')}
                  rows={3}
                  className="input"
                  placeholder="Detailed product information..."
                />
              </div>
            </div>
          </div>

          {/* Files */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Files</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3D Model File (GLB) <span className="text-red-500">*</span>
                </label>
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
                {!modelFile && (
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
                {imageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
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
      </form>
    </div>
  )
}

