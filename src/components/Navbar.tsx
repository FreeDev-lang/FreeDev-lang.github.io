import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, X, Search, Globe } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useLanguageStore, getLanguageName, type Language } from '../store/languageStore'
import { useTranslation } from '../utils/i18n'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuthStore()
  const { totalItems } = useCartStore()
  const { language, setLanguage } = useLanguageStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Fria</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/products?featured=true" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.featured')}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${e.currentTarget.value}`)
                  }
                }}
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <Globe className="w-5 h-5" />
                <span className="hidden md:block text-sm">{getLanguageName(language)}</span>
              </button>
              <div className={`absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 ${isLangMenuOpen ? 'block' : 'hidden'} group-hover:block`}>
                <button
                  onClick={() => {
                    setLanguage('en')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'en' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('fr')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'fr' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                >
                  Français
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'ar' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                >
                  العربية
                </button>
              </div>
            </div>

            {isAuthenticated() && (
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
                <Heart className="w-6 h-6" />
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="w-6 h-6" />
                  <span className="hidden md:block">{user.firstName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t('nav.profile')}
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t('nav.orders')}
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-primary-600 hover:bg-primary-50 font-medium">
                      {t('nav.adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                {t('nav.signIn')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              {t('nav.products')}
            </Link>
            <Link to="/products?featured=true" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              {t('nav.featured')}
            </Link>
            {!user && (
              <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

