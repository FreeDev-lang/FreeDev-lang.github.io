import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const response = await authApi.register(data)
      setAuth(response.data.user, response.data.token)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="section flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary-50 py-12">
      <div className="section-inner w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo className="text-3xl" />
          </div>
          <h1 className="text-h2 text-neutral-900">Create account</h1>
          <p className="mt-2 text-body text-neutral-600">Join Fria and transform your space</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-body-sm font-medium text-neutral-700">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="input"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-caption text-red-600">{errors.firstName.message as string}</p>
                )}
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-body-sm font-medium text-neutral-700">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="input"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-caption text-red-600">{errors.lastName.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-body-sm font-medium text-neutral-700">
                <Mail className="h-4 w-4" />
                Email
              </label>
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
              <label className="mb-2 flex items-center gap-2 text-body-sm font-medium text-neutral-700">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-caption text-red-600">{errors.password.message as string}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <UserPlus className="h-5 w-5" />
              Create Account
            </button>
          </form>

          <div className="mt-8 border-t border-secondary-200 pt-6">
            <p className="text-center text-body-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
