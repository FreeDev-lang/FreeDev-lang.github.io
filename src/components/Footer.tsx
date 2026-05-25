import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import type { ReactNode } from 'react'
import BrandLogo from './BrandLogo'

type FooterLinkItem = {
  text: string
  path: string
  icon?: LucideIcon
}

type LinkSection = {
  title: string
  links: FooterLinkItem[]
}

const linkSections: LinkSection[] = [
  {
    title: 'Products',
    links: [
      { text: 'All Products', path: '/products' },
      { text: 'Featured', path: '/products?featured=true' },
      { text: 'Chairs', path: '/products?category=CHAIRS' },
      { text: 'Tables', path: '/products?category=TABLES' },
    ],
  },
  {
    title: 'Website',
    links: [
      { text: 'Home', path: '/' },
      { text: 'Privacy Policy', path: '/' },
      { text: 'Become Plus Member', path: '/pricing' },
      { text: 'Create Your Store', path: '/create-store' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { text: '+1-212-456-7890', path: '/', icon: Phone },
      { text: 'contact@example.com', path: '/', icon: Mail },
      { text: '794 Francisco, 94102', path: '/', icon: MapPin },
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
      className="group inline-flex items-center gap-2 text-body-sm text-neutral-400 transition-colors duration-brand hover:text-white"
    >
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 text-neutral-500 transition-colors duration-brand group-hover:text-primary-400"
          aria-hidden
        />
      )}
      {children}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="mt-auto bg-neutral-900 text-neutral-300">
      <div className="section-inner py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <BrandLogo
              size="md"
              className="[&>span:first-child]:text-white [&>span:last-child]:text-primary-400"
            />
            <p className="mt-5 max-w-sm text-body-sm leading-relaxed text-neutral-400">
              Fria is a modern furniture brand built for real homes. Discover curated pieces,
              preview them in AR, and create spaces that feel unmistakably yours.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-neutral-700 text-neutral-400 transition-all duration-brand hover:border-primary-500 hover:bg-neutral-800 hover:text-primary-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-8">
            {linkSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-caption font-semibold uppercase tracking-wider text-neutral-500">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <FooterLink to={link.path} icon={link.icon}>
                        {link.text}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="section-inner flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-caption text-neutral-500">© 2025 Fria</p>
          <p className="text-caption text-neutral-600">
            Modern furniture with AR preview
          </p>
        </div>
      </div>
    </footer>
  )
}
