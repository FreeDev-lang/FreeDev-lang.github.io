import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isAdmin: boolean
  isSuperAdmin?: boolean
  isMaker?: boolean // platform owner: only role that can shut down or disable/delete accounts
  isActive?: boolean
  isGuest: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  isGuest: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        try {
          localStorage.removeItem('auth-storage')
        } catch {
          /* ignore */
        }
        set({ user: null, token: null })
      },
      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token && !user.isGuest
      },
      isGuest: () => {
        const { user } = get()
        return !!user?.isGuest
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

