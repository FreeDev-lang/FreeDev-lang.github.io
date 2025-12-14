import { Link } from 'react-router-dom'
import { Share2, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold">Fria</span>
            </div>
            <p className="text-gray-400">
              Modern furniture with AR experience. Transform your space with style.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
              <li><Link to="/products?category=CHAIRS" className="hover:text-white transition-colors">Chairs</Link></li>
              <li><Link to="/products?category=TABLES" className="hover:text-white transition-colors">Tables</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                <span className="text-2xl">f</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                <Share2 className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Fria. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

