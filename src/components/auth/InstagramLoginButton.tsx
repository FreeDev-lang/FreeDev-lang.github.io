import toast from 'react-hot-toast'
import SocialLoginButton from './SocialLoginButton'

// Instagram uses Facebook OAuth, so we can use Facebook SDK
// For Instagram Basic Display API, we need to use Facebook Login with Instagram permissions
export default function InstagramLoginButton() {
  const isLoading = false

  const handleInstagramLogin = async () => {
    // Instagram uses Facebook's OAuth system
    // In production, you would:
    // 1. Use Facebook Login SDK with Instagram permissions
    // 2. Get access token
    // 3. Exchange for Instagram access token
    // 4. Send to backend
    
    toast('Instagram login uses Facebook OAuth. Please use Facebook login with Instagram permissions.', { duration: 4000 })
  }

  return (
    <SocialLoginButton
      provider="Instagram"
      onClick={handleInstagramLogin}
      isLoading={isLoading}
    />
  )
}

