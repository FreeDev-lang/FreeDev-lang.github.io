import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { motion } from 'framer-motion'

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(8).then(res => res.data),
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 mr-2" />
              <span className="text-primary-200 text-sm font-medium">AR-Enabled Shopping</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Space
              <br />
              <span className="text-primary-200">With Fria</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover modern furniture designed for your lifestyle. Visualize in AR before you buy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all transform hover:scale-105"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-all"
              >
                Featured Collection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-2">Handpicked selections for your home</p>
          </div>
          <Link
            to="/products?featured=true"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            View All
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading featured products...</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AR Preview</h3>
              <p className="text-gray-600">See how furniture looks in your space before buying</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Premium materials and craftsmanship</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

