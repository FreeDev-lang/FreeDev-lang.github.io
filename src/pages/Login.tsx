import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import FacebookLoginButton from '../components/auth/FacebookLoginButton'
import InstagramLoginButton from '../components/auth/InstagramLoginButton'
import BrandLogo from '../components/BrandLogo'

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
    } catch {
      toast.error('Failed to create guest session')
    }
  }

  return (
    <div className="section flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary-50 py-12">
      <div className="section-inner w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo className="text-3xl" />
          </div>
          <h1 className="text-h2 text-neutral-900">Welcome back</h1>
          <p className="mt-2 text-body text-neutral-600">Sign in to your Fria account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-700">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-caption text-red-600">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-700">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-caption text-red-600">{errors.password.message as string}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-body-sm">
                <span className="bg-white px-2 text-neutral-500">Or continue with</span>
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
              type="button"
              onClick={handleGuestLogin}
              className="btn btn-ghost text-body-sm"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-6 text-center text-body-sm">
            <span className="text-neutral-600">Don&apos;t have an account? </span>
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
