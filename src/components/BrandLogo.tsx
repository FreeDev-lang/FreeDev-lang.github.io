import { Link } from 'react-router-dom'

type BrandLogoProps = {
  /** sm: header/mobile drawer · md: footer · lg: marketing hero */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  sm: 'text-3xl sm:text-4xl',
  md: 'text-4xl',
  lg: 'text-5xl sm:text-6xl',
}

export default function BrandLogo({ size = 'sm', className = '', onClick }: BrandLogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Fria home"
      className={`inline-flex items-baseline font-semibold tracking-tight ${sizeClasses[size]} ${className}`}
    >
      <span className="text-neutral-900">Fri</span>
      <span className="text-primary-600">a</span>
    </Link>
  )
}
