import { ButtonHTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'

interface SocialLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'Google' | 'Facebook' | 'Instagram'
  icon?: LucideIcon
  isLoading?: boolean
}

export default function SocialLoginButton({
  provider,
  icon: Icon,
  isLoading = false,
  className = '',
  ...props
}: SocialLoginButtonProps) {
  const getProviderStyles = () => {
    switch (provider) {
      case 'Google':
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      case 'Facebook':
        return 'bg-[#1877F2] border-[#1877F2] text-white hover:bg-[#166FE5]'
      case 'Instagram':
        return 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] border-transparent text-white hover:opacity-90'
      default:
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
    }
  }

  const getProviderIcon = () => {
    if (Icon) return <Icon className="w-5 h-5" />
    
    switch (provider) {
      case 'Google':
        return <span className="text-lg font-bold">G</span>
      case 'Facebook':
        return <span className="text-lg font-bold">f</span>
      case 'Instagram':
        return <span className="text-lg font-bold">📷</span>
      default:
        return null
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-3 px-6 py-3 rounded-lg
        border-2 font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getProviderStyles()}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        getProviderIcon()
      )}
      <span>Continue with {provider}</span>
    </button>
  )
}
















