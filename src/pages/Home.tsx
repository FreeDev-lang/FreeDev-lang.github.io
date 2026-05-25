import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Truck, BadgeCheck } from 'lucide-react'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import { fadeUp, sectionEntrance } from '../utils/motion'

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(8).then(res => res.data),
  })

  return (
    <div>
      <HeroSection />

      <section className="section section-inner">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-h2-md text-neutral-900">Featured Products</h2>
            <p className="mt-2 text-body text-neutral-500">Handpicked selections for your home</p>
          </div>
          <Link
            to="/products?featured=true"
            className="nav-link inline-flex items-center gap-2"
          >
            View All
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <motion.div
            className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            variants={sectionEntrance}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {featured.map((product: any) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-body text-neutral-500">Loading featured products...</p>
          </div>
        )}
      </section>

      <section className="section bg-secondary-100">
        <div className="section-inner">
          <div className="card-grid grid grid-cols-1 gap-card-gap-md md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-pill bg-primary-100">
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-h3 mb-2">AR Preview</h3>
              <p className="text-body-sm text-neutral-600">See how furniture looks in your space before buying</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-pill bg-primary-100">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-h3 mb-2">Fast Delivery</h3>
              <p className="text-body-sm text-neutral-600">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-pill bg-primary-100">
                <BadgeCheck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-h3 mb-2">Quality Guaranteed</h3>
              <p className="text-body-sm text-neutral-600">Premium materials and craftsmanship</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
