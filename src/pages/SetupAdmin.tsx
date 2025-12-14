import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { setupApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function SetupAdmin() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    try {
      await setupApi.createAdmin(data)
      toast.success('Admin user created! You can now login.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin')
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
          <h1 className="text-3xl font-bold text-gray-900">Create Admin Account</h1>
          <p className="text-gray-600 mt-2">Set up your first admin user</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className="input"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className="input"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input"
                placeholder="admin@fria.com"
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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
              )}
            </div>

            <button type="submit" className="w-full btn btn-primary">
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

