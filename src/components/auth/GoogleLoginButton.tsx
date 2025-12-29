import { useGoogleLogin } from '@react-oauth/google'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SocialLoginButton from './SocialLoginButton'
import { useState } from 'react'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function GoogleLoginButtonInternal() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  // This hook will only be called when provider is rendered (client ID exists)
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsLoading(true)
      try {
        const response = await authApi.googleLogin({
          provider: 'Google',
          token: codeResponse.code
        })
        setAuth(response.data.user, response.data.token)
        toast.success('Signed in with Google')
        navigate('/')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to sign in with Google')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed')
      setIsLoading(false)
    },
  })

  return (
    <SocialLoginButton
      provider="Google"
      onClick={() => handleGoogleLogin()}
      isLoading={isLoading}
    />
  )
}

// Export wrapper that only renders the button if OAuth is configured
export default function GoogleLoginButton() {
  if (!googleClientId) {
    return (
      <SocialLoginButton
        provider="Google"
        onClick={() => {
          toast.error('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.')
        }}
        disabled
      />
    )
  }

  return <GoogleLoginButtonInternal />
}

