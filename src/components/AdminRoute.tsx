import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!user?.isAdmin && !user?.isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

interface SuperAdminRouteProps {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!user?.isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <>{children}</>
}

