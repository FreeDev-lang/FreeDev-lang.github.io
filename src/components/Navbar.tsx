import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Globe, Store, ChevronDown, Smartphone } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useLanguageStore, getLanguageName } from '../store/languageStore'
import { useTranslation } from '../utils/i18n'
import { storeAdminApi } from '../lib/api'
import BrandLogo from './BrandLogo'
import { dropdownMotion, drawerVariants, overlayMotion, popoverOrigin } from '../utils/motion'

const NAV_LINKS: Array<{ to: string; label?: string; labelKey?: string }> = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/products', labelKey: 'nav.products' },
  { to: '/stores', labelKey: 'nav.stores' },
]

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'ar' as const, label: 'العربية' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hasStores, setHasStores] = useState(false)

  const langRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  const { user, logout, isAuthenticated } = useAuthStore()
  const { totalItems } = useCartStore()
  const { language, setLanguage } = useLanguageStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    closeMobile()
    setIsLangOpen(false)
    setIsAccountOpen(false)
  }, [location.pathname, closeMobile])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    const checkStores = async () => {
      if (isAuthenticated()) {
        try {
          const response = await storeAdminApi.getMyStores()
          setHasStores(response.data.length > 0)
        } catch {
          setHasStores(false)
        }
      } else {
        setHasStores(false)
      }
    }
    checkStores()
  }, [user, isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    closeMobile()
    navigate('/')
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`)
      closeMobile()
      setSearch('')
    }
  }

  const selectLanguage = (code: (typeof LANGUAGES)[number]['code']) => {
    setLanguage(code)
    setIsLangOpen(false)
    closeMobile()
  }

  const navLabel = (link: (typeof NAV_LINKS)[number]) =>
    link.labelKey ? t(link.labelKey) : link.label!

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`)

  const SearchForm = ({ className = '' }: { className?: string }) => (
    <form onSubmit={handleSearch} className={`flex items-center gap-2 input-search px-4 py-2.5 ${className}`}>
      <Search size={18} className="text-neutral-500 shrink-0" />
      <input
        className="w-full min-w-0 bg-transparent outline-none text-body-sm placeholder:text-neutral-400"
        type="text"
        placeholder={t('nav.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </form>
  )

  const LanguageMenu = ({ variant }: { variant: 'dropdown' | 'list' }) => {
    if (variant === 'list') {
      return (
        <div className="space-y-1">
          <p className="text-caption text-neutral-500 uppercase tracking-wider px-1 mb-2">Language</p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => selectLanguage(lang.code)}
              className={`w-full text-left px-3 py-2.5 rounded-btn text-body-sm transition-colors duration-brand ${
                language === lang.code
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-700 hover:bg-secondary-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )
    }

    return (
      <div ref={langRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsLangOpen((v) => !v)
            setIsAccountOpen(false)
          }}
          className="btn-ghost gap-1.5 px-2.5 py-2"
          aria-expanded={isLangOpen}
          aria-haspopup="listbox"
        >
          <Globe size={18} />
          <span className="hidden lg:inline text-body-sm">{getLanguageName(language)}</span>
          <ChevronDown
            size={14}
            className={`hidden lg:block transition-transform duration-brand ${isLangOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isLangOpen && (
            <motion.div
              {...dropdownMotion}
              style={popoverOrigin('top-right')}
              className="absolute right-0 mt-2 w-44 surface-overlay py-1.5 z-50"
              role="listbox"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={language === lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className={`block w-full text-left px-4 py-2.5 text-body-sm transition-colors duration-brand ${
                    language === lang.code
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-neutral-700 hover:bg-secondary-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const AccountMenu = ({ variant }: { variant: 'dropdown' | 'list' }) => {
    if (!user) {
      if (variant === 'list') {
        return (
          <Link to="/login" onClick={closeMobile} className="btn btn-primary btn-pill w-full">
            {t('nav.signIn')}
          </Link>
        )
      }
      return (
        <Link to="/login" className="btn btn-primary btn-pill btn-sm lg:btn-lg px-6">
          {t('nav.signIn')}
        </Link>
      )
    }

    const links = (
      <>
        <Link
          to="/profile"
          onClick={closeMobile}
          className="block px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-secondary-50 rounded-btn mx-1"
        >
          {t('nav.profile')}
        </Link>
        <Link
          to="/orders"
          onClick={closeMobile}
          className="block px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-secondary-50 rounded-btn mx-1"
        >
          {t('nav.orders')}
        </Link>
        {isAuthenticated() && (
          <Link
            to="/wishlist"
            onClick={closeMobile}
            className="block px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-secondary-50 rounded-btn mx-1"
          >
            {t('nav.wishlist')}
          </Link>
        )}
        {hasStores && (
          <Link
            to="/store-admin/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-primary-700 font-medium hover:bg-primary-50 rounded-btn mx-1"
          >
            <Store className="w-4 h-4" />
            Store Admin
          </Link>
        )}
        {user.isAdmin && (
          <Link
            to="/admin/dashboard"
            onClick={closeMobile}
            className="block px-4 py-2.5 text-body-sm text-primary-700 font-medium hover:bg-primary-50 rounded-btn mx-1"
          >
            {t('nav.adminPanel')}
          </Link>
        )}
        <div className="divider my-1.5 mx-3" />
        <button
          type="button"
          onClick={handleLogout}
          className="block w-[calc(100%-0.5rem)] text-left px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-secondary-50 rounded-btn mx-1"
        >
          {t('nav.logout')}
        </button>
      </>
    )

    if (variant === 'list') {
      return (
        <div className="space-y-1">
          <p className="text-caption text-neutral-500 uppercase tracking-wider px-1 mb-2">Account</p>
          <p className="px-3 py-1 text-body-sm font-semibold text-neutral-900">{user.firstName}</p>
          {links}
        </div>
      )
    }

    return (
      <div ref={accountRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsAccountOpen((v) => !v)
            setIsLangOpen(false)
          }}
          className="btn-ghost gap-2 px-2.5 py-2"
          aria-expanded={isAccountOpen}
          aria-haspopup="menu"
        >
          <User size={18} />
          <span className="hidden lg:inline text-body-sm max-w-[8rem] truncate">{user.firstName}</span>
          <ChevronDown
            size={14}
            className={`hidden lg:block transition-transform duration-brand ${isAccountOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isAccountOpen && (
            <motion.div
              {...dropdownMotion}
              style={popoverOrigin('top-right')}
              className="absolute right-0 mt-2 w-52 surface-overlay py-1.5 z-50"
              role="menu"
            >
              {links}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const CartLink = ({ showLabel = true }: { showLabel?: boolean }) => (
    <Link
      to="/cart"
      onClick={closeMobile}
      className="relative inline-flex items-center gap-2 nav-link py-2"
    >
      <ShoppingCart size={18} />
      {showLabel && <span>Cart</span>}
      {totalItems > 0 && (
        <span className="absolute -top-0.5 left-3.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-pill bg-primary-600 text-white text-[10px] font-bold leading-none">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-brand border-b ${
          isScrolled
            ? 'bg-secondary-50/85 backdrop-blur-md shadow-card-default border-secondary-200/70'
            : 'bg-secondary-50/90 backdrop-blur-sm border-secondary-200/40'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 max-w-content mx-auto py-3 lg:py-4">
            <BrandLogo onClick={closeMobile} />

            {/* Desktop navigation */}
            <nav className="hidden sm:flex items-center gap-3 lg:gap-6 flex-1 justify-end min-w-0">
              <div className="hidden lg:flex items-center gap-1 xl:gap-5 mr-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={`${link.to}-${link.label ?? link.labelKey}`}
                    to={link.to}
                    className={isActive(link.to) ? 'nav-link-active px-2 py-1.5' : 'nav-link px-2 py-1.5'}
                  >
                    {navLabel(link)}
                  </Link>
                ))}
              </div>

              <SearchForm className="hidden xl:flex w-52 2xl:w-64 shrink-0" />

              <Link to="/download" className="hidden md:inline-flex btn btn-accent btn-sm shrink-0">
                <Smartphone size={15} />
                {t('nav.getApp')}
              </Link>

              <CartLink />

              <LanguageMenu variant="dropdown" />
              <AccountMenu variant="dropdown" />
            </nav>

            {/* Mobile: cart + menu trigger */}
            <div className="flex sm:hidden items-center gap-1">
              <CartLink showLabel={false} />
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="btn-icon"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              {...overlayMotion}
              className="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-[2px] sm:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              variants={drawerVariants.right}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 z-[70] h-full w-[min(100vw,20rem)] bg-secondary-50 shadow-overlay border-l border-secondary-200 flex flex-col sm:hidden"
              aria-modal="true"
              role="dialog"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-200/80">
                <BrandLogo onClick={closeMobile} />
                <button type="button" onClick={closeMobile} className="btn-icon" aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                <SearchForm className="w-full" />

                <Link to="/download" onClick={closeMobile} className="btn btn-accent w-full">
                  <Smartphone size={16} />
                  {t('nav.getApp')}
                </Link>

                <nav className="space-y-1">
                  <p className="text-caption text-neutral-500 uppercase tracking-wider px-1 mb-2">Menu</p>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={`mobile-${link.to}-${link.label ?? link.labelKey}`}
                      to={link.to}
                      onClick={closeMobile}
                      className={`block px-3 py-2.5 rounded-btn text-body-sm font-medium transition-colors duration-brand ${
                        isActive(link.to)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-800 hover:bg-secondary-100'
                      }`}
                    >
                      {navLabel(link)}
                    </Link>
                  ))}
                </nav>

                <div className="divider" />

                <LanguageMenu variant="list" />
                <AccountMenu variant="list" />
              </div>

              <div className="px-5 py-4 border-t border-secondary-200/80 bg-secondary-50/50">
                <CartLink />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
