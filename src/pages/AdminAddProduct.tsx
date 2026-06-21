import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { productsApi, categoriesApi, productColorsApi, storesApi } from '../lib/api'
import { ArrowLeft, Upload, X, Plus, Trash2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type ExistingImage = { id: number; url: string; displayOrder: number }

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm()
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'ecommerce' | 'ar' | 'files' | 'attributes' | 'colors'>('basic')
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  // Per-product attribute values, keyed by categoryAttributeId.
  const [attrValues, setAttrValues] = useState<Record<number, string>>({})
  const queryClient = useQueryClient()
  const selectedCategory = watch('category')

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => categoriesApi.getAll().then(res => res.data),
  })

  // Stores for the owning-store selector (multi-store marketplace).
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll().then(res => res.data),
  })

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then(res => res.data),
    enabled: isEditing && !!id,
  })

  const { data: productColors = [] } = useQuery({
    queryKey: ['product-colors', id],
    queryFn: () => productColorsApi.getByProduct(Number(id)).then(res => res.data),
    enabled: isEditing && !!id,
  })

  // Effective category attributes for this product (own + inherited), with current values.
  const { data: productAttributes = [] } = useQuery({
    queryKey: ['product-attributes', id],
    queryFn: () => productsApi.getAttributes(Number(id)).then(res => res.data),
    enabled: isEditing && !!id,
  })

  // Load product data when editing
  useEffect(() => {
    if (product && isEditing) {
      const formData = {
        category: product.category,
        model: product.model,
        nameFr: product.nameFr || '',
        nameAr: product.nameAr || '',
        storeId: product.storeId ?? '',
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
        stockQuantity: product.stockQuantity ?? 0,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        discountPrice: product.discountPrice || '',
        sku: product.sku || '',
        modelScale: product.modelScale || '',
        modelUnits: product.modelUnits || 'cm',
      }
      reset(formData)
      // imageDetails carries ids (needed for delete); fall back to plain urls for older payloads.
      setExistingImages(
        product.imageDetails?.length
          ? product.imageDetails
          : (product.images || []).map((url: string, i: number) => ({ id: -1 - i, url, displayOrder: i }))
      )
    }
  }, [product, isEditing, reset])

  // Seed attribute value inputs once the effective attributes load.
  useEffect(() => {
    if (productAttributes.length > 0) {
      const seeded: Record<number, string> = {}
      for (const a of productAttributes) seeded[a.categoryAttributeId] = a.value ?? ''
      setAttrValues(seeded)
    }
  }, [productAttributes])

  const onSubmit = async (data: any) => {
    if (!isEditing && !modelFile) {
      toast.error('Please upload a 3D model file')
      return
    }

    setIsSubmitting(true)
    try {
      // Full-state submit: send EVERY field every time. The previous "diff only changed fields"
      // logic compared form strings against typed values and silently dropped real edits
      // (numbers/booleans never matched), so toggles and cleared fields didn't save. The backend
      // applies all provided fields, so sending the whole form is both correct and simpler.
      const formData = new FormData()
      formData.append('Category', data.category ?? '')
      formData.append('Model', data.model ?? '')
      formData.append('NameFr', data.nameFr ?? '')
      formData.append('NameAr', data.nameAr ?? '')
      // Owning store (multi-store marketplace). Only sent when chosen; the backend leaves it unchanged otherwise.
      if (data.storeId !== '' && data.storeId != null) formData.append('StoreId', data.storeId.toString())
      formData.append('Price', data.price !== '' && data.price != null ? data.price.toString() : '0')
      formData.append('Color', data.color ?? '')
      formData.append('Source', data.source ?? '')

      const sizes: number[] = []
      // Always send three slots so a cleared dimension persists as 0 rather than sticking.
      sizes.push(Number(data.width) || 0, Number(data.height) || 0, Number(data.depth) || 0)
      formData.append('Sizes', sizes.join(','))

      formData.append('Description', data.description ?? '')
      formData.append('GoodToKnow', data.goodToKnow ?? '')
      formData.append('Guarantee', data.guarantee ?? '')
      formData.append('ProductDetail', data.productDetail ?? '')

      formData.append('StockQuantity', data.stockQuantity !== '' && data.stockQuantity != null ? data.stockQuantity.toString() : '0')
      formData.append('IsActive', data.isActive ? 'true' : 'false')
      formData.append('IsFeatured', data.isFeatured ? 'true' : 'false')
      formData.append('DiscountPrice', data.discountPrice ? data.discountPrice.toString() : '')
      formData.append('SKU', data.sku ?? '')

      formData.append('ModelScale', data.modelScale ? data.modelScale.toString() : '')
      formData.append('ModelUnits', data.modelUnits || 'cm')

      // Files — only append new uploads (model file is optional when editing).
      if (modelFile) formData.append('modelFile', modelFile)
      imageFiles.forEach((file) => formData.append('imageFiles', file))

      let productId = Number(id)
      if (isEditing && id) {
        await productsApi.update(productId, formData)
      } else {
        const res = await productsApi.create(formData)
        productId = res.data.id
      }

      // Save attribute values (only meaningful once the product exists).
      if (productId && Object.keys(attrValues).length > 0) {
        const payload = Object.entries(attrValues).map(([attrId, value]) => ({
          categoryAttributeId: Number(attrId),
          value: value === '' ? null : value,
        }))
        await productsApi.setAttributes(productId, payload)
      }

      toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!')
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      navigate('/admin/products')
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExistingImage = async (imageId: number) => {
    if (imageId < 0 || !id) return // legacy URL-only entry without a real id
    if (!window.confirm('Remove this image?')) return
    try {
      await productsApi.deleteImage(Number(id), imageId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image removed')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to remove image')
    }
  }

  const handleSetPrimaryImage = async (imageId: number) => {
    if (imageId < 0 || !id) return
    try {
      await productsApi.setPrimaryImage(Number(id), imageId)
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Primary image updated')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to set primary image')
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
    { id: 'attributes', label: 'Attributes' },
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
    mutationFn: ({ id: colorId, data }: { id: number, data: any }) => productColorsApi.update(colorId, data),
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

  const handleAddColor = () => {
    if (!newColor.colorName.trim()) {
      toast.error('Color name is required')
      return
    }
    if (!isEditing || !id) {
      toast.error('Please save the product first before adding colors')
      return
    }
    createColorMutation.mutate(newColor)
  }

  const handleUpdateColor = () => {
    if (!editingColor?.colorName?.trim()) {
      toast.error('Color name is required')
      return
    }
    updateColorMutation.mutate({ id: editingColor.id, data: editingColor })
  }

  const handleDeleteColor = (colorId: number) => {
    if (window.confirm('Are you sure you want to delete this color?')) {
      deleteColorMutation.mutate(colorId)
    }
  }

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
                      Store
                    </label>
                    <select {...register('storeId')} className="input">
                      <option value="">No store (platform)</option>
                      {stores.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">The store that owns and fulfils this product.</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Français)
                    </label>
                    <input
                      type="text"
                      {...register('nameFr')}
                      className="input"
                      placeholder="e.g., Canapé moderne"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      {...register('nameAr')}
                      className="input"
                      placeholder="مثال: أريكة عصرية"
                    />
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

            {/* Attributes Tab — category-defined properties (bed size, seats, …) */}
            {activeTab === 'attributes' && (
              <div className="space-y-6">
                {!isEditing ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Save the product first, then its category's attributes will appear here to fill in.
                    </p>
                  </div>
                ) : productAttributes.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      The category <strong>{selectedCategory}</strong> has no attributes yet. Define them in
                      {' '}<Link to="/admin/categories" className="text-primary-600 underline">Categories → Attributes</Link>,
                      then reopen this product. (If you just changed the category, save first.)
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      These properties come from the product's category and its parents. Fill in what applies.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {productAttributes.map((attr: any) => (
                        <div key={attr.categoryAttributeId}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {attr.name}
                            {attr.unit && <span className="text-gray-400"> ({attr.unit})</span>}
                            {attr.isRequired && <span className="text-red-500"> *</span>}
                          </label>
                          {attr.dataType === 'select' ? (
                            <select
                              value={attrValues[attr.categoryAttributeId] ?? ''}
                              onChange={(e) => setAttrValues((v) => ({ ...v, [attr.categoryAttributeId]: e.target.value }))}
                              className="input"
                            >
                              <option value="">— Select —</option>
                              {attr.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : attr.dataType === 'boolean' ? (
                            <select
                              value={attrValues[attr.categoryAttributeId] ?? ''}
                              onChange={(e) => setAttrValues((v) => ({ ...v, [attr.categoryAttributeId]: e.target.value }))}
                              className="input"
                            >
                              <option value="">—</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              type={attr.dataType === 'number' ? 'number' : 'text'}
                              value={attrValues[attr.categoryAttributeId] ?? ''}
                              onChange={(e) => setAttrValues((v) => ({ ...v, [attr.categoryAttributeId]: e.target.value }))}
                              className="input"
                              placeholder={attr.name}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Values are saved when you click “Update Product”.</p>
                  </>
                )}
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
                  {/* Existing images when editing — deletable, with set-primary */}
                  {isEditing && existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current images <span className="text-gray-400">(first is the primary)</span>:</p>
                      <div className="grid grid-cols-4 gap-4">
                        {existingImages.map((image, index) => (
                          <div key={image.id} className="group relative">
                            <img
                              src={image.url}
                              alt={`Existing ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg border-2 ${index === 0 ? 'border-primary-500' : 'border-transparent'}`}
                            />
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded">Primary</span>
                            )}
                            {image.id >= 0 && (
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {index !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(image.id)}
                                    className="bg-white/90 text-primary-600 rounded-full p-1 hover:bg-white"
                                    title="Make primary"
                                  >
                                    <Star className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExistingImage(image.id)}
                                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
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

            {/* Available Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                {!isEditing ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Please save the product first, then you can add available colors.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Color</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Color Name</label>
                          <input
                            type="text"
                            value={newColor.colorName}
                            onChange={(e) => setNewColor({ ...newColor, colorName: e.target.value })}
                            className="input"
                            placeholder="e.g., Black, White"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hex Code</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={newColor.hexCode}
                              onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                              className="h-10 w-20 rounded border border-gray-300"
                            />
                            <input
                              type="text"
                              value={newColor.hexCode}
                              onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                              className="input flex-1"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddColor}
                            disabled={createColorMutation.isPending}
                            className="btn btn-primary w-full"
                          >
                            {createColorMutation.isPending ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" />Add Color</>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Colors</h3>
                      {productColors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No colors added yet. Add your first color above.</p>
                      ) : (
                        <div className="space-y-3">
                          {productColors.map((color: any) => (
                            <div
                              key={color.id}
                              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                            >
                              <div
                                className="w-12 h-12 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color.hexCode || '#000000' }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{color.colorName}</p>
                                <p className="text-sm text-gray-500">{color.hexCode}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingColor({ ...color })}
                                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteColor(color.id)}
                                  disabled={deleteColorMutation.isPending}
                                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {editingColor && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">Edit Color</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Color Name</label>
                              <input
                                type="text"
                                value={editingColor.colorName}
                                onChange={(e) => setEditingColor({ ...editingColor, colorName: e.target.value })}
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Hex Code</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={editingColor.hexCode}
                                  onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                                  className="h-10 w-20 rounded border border-gray-300"
                                />
                                <input
                                  type="text"
                                  value={editingColor.hexCode}
                                  onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                                  className="input flex-1"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingColor(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateColor}
                                disabled={updateColorMutation.isPending}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                              >
                                {updateColorMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
              disabled={isSubmitting || (!isEditing && !modelFile)}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
