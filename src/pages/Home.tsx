import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { motion } from 'framer-motion'
import { useTypewriter } from '../hooks/useTypewriter'

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(8).then(res => res.data),
  })

  const fullText = "Transform Your Space\nWith Fria"
  const typedText = useTypewriter(fullText, 80)
  
  // Parse the typed text to render with gold "Fria"
  const renderTypedText = () => {
    if (!typedText.includes('\n')) {
      // First line is still typing
      return (
        <>
          <span className="text-black">{typedText}</span>
          <span className="inline-block w-0.5 h-8 md:h-12 bg-black ml-1 animate-pulse"></span>
        </>
      )
    }
    
    const lines = typedText.split('\n')
    const firstLine = lines[0]
    const secondLine = lines[1] || ''
    
    // Check if "With " has been typed
    if (secondLine.startsWith('With ')) {
      const afterWith = secondLine.substring(5) // Everything after "With "
      const friaLength = Math.min(afterWith.length, 4) // "Fria" is 4 characters
      const friaTyped = afterWith.substring(0, friaLength)
      const afterFria = afterWith.substring(4)
      
      return (
        <>
          <span className="text-black">{firstLine}</span>
          <br />
          <span className="text-black">With </span>
          <span className="text-gold-500" style={{ color: '#FFD700' }}>{friaTyped}</span>
          {afterFria && <span className="text-black">{afterFria}</span>}
          <span className="inline-block w-0.5 h-8 md:h-12 bg-black ml-1 animate-pulse"></span>
        </>
      )
    } else {
      // "With " hasn't been typed yet, but second line exists
      return (
        <>
          <span className="text-black">{firstLine}</span>
          <br />
          <span className="text-black">{secondLine}</span>
          <span className="inline-block w-0.5 h-8 md:h-12 bg-black ml-1 animate-pulse"></span>
        </>
      )
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative text-black overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-background.jpg)', // Replace with your image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 mr-2 text-black" />
              <span className="text-black text-sm font-medium">AR-Enabled Shopping</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 min-h-[4rem] md:min-h-[5rem]">
              {renderTypedText()}
            </h1>
            <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
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
                className="inline-flex items-center px-8 py-4 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all"
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

