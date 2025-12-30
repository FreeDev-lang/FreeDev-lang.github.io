import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Model3DViewer from '../components/ar/Model3DViewer'
import { productsApi, cartApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ARViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const productId = searchParams.get('productId')
  const modelUrl = searchParams.get('modelUrl')

  // Fetch product data if needed
  const { data: product, isLoading: loading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(Number(productId)).then((res) => res.data),
    enabled: !!productId && !modelUrl,
  })

  const finalModelUrl = modelUrl || product?.rendablePath
  const productName = product?.model || 'Product'

  const handleClose = () => {
    navigate(-1)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart')
      navigate('/login')
      return
    }

    try {
      if (productId) {
        await cartApi.add({
          furnitureItemId: Number(productId),
          quantity: 1,
        })
        toast.success('Added to cart!')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleViewInSpace = () => {
    // Navigate to WebAR page
    const params = new URLSearchParams({ productId: productId || '' })
    if (finalModelUrl) {
      params.set('modelUrl', encodeURIComponent(finalModelUrl))
    }
    navigate(`/webar?${params.toString()}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !productId) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">
            {error ? 'Error' : 'Invalid Product'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Please try again later' : 'No product ID provided'}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // No model available
  if (!finalModelUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">3D Model Not Available</h2>
          <p className="text-gray-600 mb-6">
            This product doesn't have a 3D model for viewing.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Show 3D preview with "View in your space" button (mobile after QR scan)
  return (
    <Model3DViewer
      modelUrl={finalModelUrl}
      productName={productName}
      productId={productId}
      dimensions={
        product?.sizes && product.sizes.length >= 3
          ? {
              width: product.sizes[0],
              height: product.sizes[1],
              depth: product.sizes[2]
            }
          : undefined
      }
      showARButton={true}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
      onViewInSpace={handleViewInSpace}
    />
  )
}
