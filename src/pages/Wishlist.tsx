import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { wishlistApi } from '../lib/api'
import { Heart } from 'lucide-react'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getAll().then(res => res.data),
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <Link to="/products" className="text-primary-600 hover:text-primary-700">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

