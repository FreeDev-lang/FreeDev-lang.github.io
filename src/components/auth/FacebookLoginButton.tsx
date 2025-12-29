import toast from 'react-hot-toast'
import { useState } from 'react'
import SocialLoginButton from './SocialLoginButton'

export default function FacebookLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleFacebookLogin = async () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || ''
    
    if (!facebookAppId) {
      toast.error('Facebook App ID not configured')
      return
    }

    setIsLoading(true)
    try {
      // Facebook Login requires SDK initialization
      // For now, show a message that Facebook login needs to be configured
      // In production, you would:
      // 1. Load Facebook SDK script
      // 2. Call FB.login() to get access token
      // 3. Send token to backend
      
      toast('Facebook login requires Facebook SDK configuration. Please configure Facebook App ID in environment variables and load the Facebook SDK.', { duration: 4000 })
      
      // TODO: Implement Facebook SDK integration
      // Example:
      // window.FB.login((response: any) => {
      //   if (response.authResponse) {
      //     const accessToken = response.authResponse.accessToken
      //     // Call backend API
      //   }
      // }, { scope: 'email' })
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign in with Facebook')
    } finally {
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

