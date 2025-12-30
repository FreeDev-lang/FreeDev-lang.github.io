import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { storeAdminApi } from '../lib/api'

interface StoreAdminRouteProps {
  children: React.ReactNode
}

export default function StoreAdminRoute({ children }: StoreAdminRouteProps) {
  const { isAuthenticated } = useAuthStore()
  const [hasStores, setHasStores] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStores = async () => {
      if (!isAuthenticated()) {
        setHasStores(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await storeAdminApi.getMyStores()
        setHasStores(response.data.length > 0)
      } catch (error) {
        setHasStores(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkStores()
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!hasStores) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

