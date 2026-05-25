import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import SocialLoginButton from './SocialLoginButton'

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || ''

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options?: { scope: string }
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

function loadFacebookSdk(): Promise<void> {
  if (window.FB) return Promise.resolve()

  return new Promise((resolve, reject) => {
    window.fbAsyncInit = () => resolve()

    const existing = document.getElementById('facebook-jssdk')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Facebook SDK failed to load')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Facebook SDK failed to load'))
    document.body.appendChild(script)
  })
}

function FacebookLoginButtonInternal() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFacebookSdk()
      .then(() => {
        window.FB?.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v19.0',
        })
      })
      .catch(() => {
        // SDK load failure handled on click
      })
  }, [])

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    try {
      await loadFacebookSdk()
      if (!window.FB) {
        throw new Error('Facebook SDK unavailable')
      }

      window.FB.login(async (response) => {
        try {
          if (!response.authResponse?.accessToken) {
            toast.error('Facebook sign-in was cancelled')
            return
          }

          const result = await authApi.facebookLogin({
            provider: 'Facebook',
            token: response.authResponse.accessToken,
          })
          setAuth(result.data.user, result.data.token)
          toast.success('Signed in with Facebook')
          navigate('/')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to sign in with Facebook')
        } finally {
          setIsLoading(false)
        }
      }, { scope: 'email' })
    } catch {
      toast.error('Facebook login is unavailable right now')
      setIsLoading(false)
    }
  }

  return (
    <SocialLoginButton
      provider="Facebook"
      onClick={handleFacebookLogin}
      isLoading={isLoading}
    />
  )
}

export default function FacebookLoginButton() {
  if (!facebookAppId) {
    return (
      <SocialLoginButton
        provider="Facebook"
        onClick={() => {
          toast.error('Facebook OAuth is not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.')
        }}
        disabled
      />
    )
  }

  return <FacebookLoginButtonInternal />
}
