import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import FacebookLoginButton from '../components/auth/FacebookLoginButton'
import InstagramLoginButton from '../components/auth/InstagramLoginButton'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const response = await authApi.login(data)
      setAuth(response.data.user, response.data.token)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }


  const handleGuestLogin = async () => {
    try {
      const response = await authApi.createGuest()
      setAuth(response.data.user, response.data.token)
      toast.success('Browsing as guest')
      navigate('/')
    } catch (error: any) {
      toast.error('Failed to create guest session')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Fria</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
              )}
            </div>

            <button type="submit" className="w-full btn btn-primary">
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <GoogleLoginButton />
              <FacebookLoginButton />
              <InstagramLoginButton />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleGuestLogin}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

