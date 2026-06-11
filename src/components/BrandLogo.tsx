import { Link } from 'react-router-dom'

type BrandLogoProps = {
  /** sm: header/mobile drawer · md: footer · lg: marketing hero */
  size?: 'sm' | 'md' | 'lg'
  /** ink (light surfaces) or porcelain (midnight surfaces) */
  tone?: 'ink' | 'light'
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-4xl',
  lg: 'text-5xl sm:text-6xl',
}

/**
 * The Fria wordmark — editorial serif with the brand's gold full-stop
 * (the web sibling of the app's "F·" launcher mark).
 */
export default function BrandLogo({ size = 'sm', tone = 'ink', className = '', onClick }: BrandLogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Fria home"
      className={`inline-flex items-baseline font-display font-semibold tracking-tight ${sizeClasses[size]} ${className}`}
    >
      <span className={tone === 'light' ? 'text-secondary-50' : 'text-neutral-900'}>Fria</span>
      <span className="text-accent-400">.</span>
    </Link>
  )
}
