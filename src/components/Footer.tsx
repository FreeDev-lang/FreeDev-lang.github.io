import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Smartphone,
  ArrowUpRight,
} from 'lucide-react'
import type { ReactNode } from 'react'
import BrandLogo from './BrandLogo'
import { useTranslation } from '../utils/i18n'

type FooterLinkItem = {
  text?: string
  textKey?: string
  path: string
  icon?: LucideIcon
}

type LinkSection = {
  titleKey: string
  links: FooterLinkItem[]
}

const linkSections: LinkSection[] = [
  {
    titleKey: 'footer.shop',
    links: [
      { textKey: 'footer.allProducts', path: '/products' },
      { textKey: 'nav.featured', path: '/products?featured=true' },
      { textKey: 'nav.stores', path: '/stores' },
      { textKey: 'nav.wishlist', path: '/wishlist' },
    ],
  },
  {
    titleKey: 'footer.account',
    links: [
      { textKey: 'nav.signIn', path: '/login' },
      { textKey: 'nav.orders', path: '/orders' },
      { textKey: 'nav.profile', path: '/profile' },
      { textKey: 'nav.cart', path: '/cart' },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com' },
]

function FooterLink({
  to,
  children,
  icon: Icon,
}: {
  to: string
  children: ReactNode
  icon?: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-body-sm text-neutral-400 transition-colors duration-brand hover:text-accent-300"
    >
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 text-neutral-500 transition-colors duration-brand group-hover:text-accent-400"
          aria-hidden
        />
      )}
      {children}
    </Link>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto bg-midnight bg-midnight-radial text-neutral-300">
      <div className="section-inner py-14 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <BrandLogo size="md" tone="light" />
            <span className="mt-4 block h-px w-12 bg-accent-400" aria-hidden />
            <p className="mt-5 max-w-sm text-body-sm leading-relaxed text-neutral-400">
              {t('footer.tagline')}
            </p>
            <div className="mt-7 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-neutral-700/80 text-neutral-400 transition-all duration-brand hover:border-accent-400 hover:text-accent-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-7">
            {linkSections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="mb-4 font-sans text-eyebrow font-semibold uppercase text-accent-400/90">
                  {t(section.titleKey)}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.textKey ?? link.text}>
                      <FooterLink to={link.path} icon={link.icon}>
                        {link.textKey ? t(link.textKey) : link.text}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Get the app */}
            <div>
              <h3 className="mb-4 font-sans text-eyebrow font-semibold uppercase text-accent-400/90">
                {t('footer.theApp')}
              </h3>
              <p className="mb-4 text-body-sm leading-relaxed text-neutral-400">
                {t('footer.appPitch')}
              </p>
              <Link to="/download" className="btn btn-accent btn-sm">
                <Smartphone className="h-4 w-4" />
                {t('nav.getApp')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800/80">
        <div className="section-inner flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-caption text-neutral-500">© 2026 Fria</p>
          <p className="font-display text-caption italic text-neutral-500">
            {t('footer.signature')}
          </p>
          <p className="text-caption text-neutral-500">
            {t('footer.credit')}{' '}
            <a
              href="https://oniva-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold tracking-wide text-neutral-400 transition-colors duration-brand hover:text-accent-300"
            >
              Oniva Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
