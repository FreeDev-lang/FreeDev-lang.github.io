import { ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

interface GoogleOAuthWrapperProps {
  children: ReactNode
}

export default function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  // Only wrap with GoogleOAuthProvider if client ID is configured
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    )
  }
  
  // Render children without OAuth provider if not configured
  return <>{children}</>
}












