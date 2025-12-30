import { X } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'
import FacebookLoginButton from './FacebookLoginButton'
import InstagramLoginButton from './InstagramLoginButton'

interface FederatedLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailLogin: () => void
}

export default function FederatedLoginModal({
  isOpen,
  onClose,
  onEmailLogin,
}: FederatedLoginModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to FRIA
          </h2>
          <p className="text-gray-600">
            Choose your preferred sign-in method
          </p>
        </div>

        <div className="space-y-4">
          <GoogleLoginButton />
          <FacebookLoginButton />
          <InstagramLoginButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={onEmailLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
          >
            <span>📧</span>
            <span>Continue with Email</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}











