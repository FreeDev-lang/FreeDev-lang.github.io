import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Globe } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useLanguageStore, getLanguageName } from '../store/languageStore'
import { useTranslation } from '../utils/i18n'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { user, logout, isAuthenticated } = useAuthStore()
  const { totalItems } = useCartStore()
  const { language, setLanguage } = useLanguageStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`)
    }
  }

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          {/* Logo */}
          <Link to="/" className="relative text-4xl font-semibold text-slate-700">
            <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
            <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
              plus
            </p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link to="/">Home</Link>
            <Link to="/products">{t('nav.products')}</Link>
            <Link to="/stores">Stores</Link>
            <Link to="/">About</Link>
            <Link to="/">Contact</Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder={t('nav.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-2 text-slate-600">
              <ShoppingCart size={18} />
              Cart
              {totalItems > 0 && (
                <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                  {totalItems}
                </button>
              )}
            </Link>

            {/* Language Selector */}
            <div className="relative group">
              <button 
                className="flex items-center gap-1 p-2 text-slate-600 hover:text-green-600 transition-colors"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <Globe size={18} />
                <span className="hidden lg:block text-sm">{getLanguageName(language)}</span>
              </button>
              <div className={`absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 ${isLangMenuOpen ? 'block' : 'hidden'} group-hover:block z-50`}>
                <button
                  onClick={() => {
                    setLanguage('en')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'en' ? 'bg-green-50 text-green-600 font-medium' : 'text-slate-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('fr')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'fr' ? 'bg-green-50 text-green-600 font-medium' : 'text-slate-700'}`}
                >
                  Français
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar')
                    setIsLangMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${language === 'ar' ? 'bg-green-50 text-green-600 font-medium' : 'text-slate-700'}`}
                >
                  العربية
                </button>
              </div>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-green-600 transition-colors">
                  <User size={18} />
                  <span className="hidden lg:block">{user.firstName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/profile" className="block px-4 py-2 text-slate-700 hover:bg-gray-100">
                    {t('nav.profile')}
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-slate-700 hover:bg-gray-100">
                    {t('nav.orders')}
                  </Link>
                  {isAuthenticated() && (
                    <Link to="/wishlist" className="block px-4 py-2 text-slate-700 hover:bg-gray-100">
                      {t('nav.wishlist')}
                    </Link>
                  )}
                  {user.isAdmin && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-green-600 hover:bg-green-50 font-medium">
                      {t('nav.adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-gray-100"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                {t('nav.signIn')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-slate-600"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile User Button */}
          <div className="sm:hidden">
            {user ? (
              <div className="relative">
                <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                  {user.firstName}
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <hr className="border-gray-300" />
    </nav>
  )
}

