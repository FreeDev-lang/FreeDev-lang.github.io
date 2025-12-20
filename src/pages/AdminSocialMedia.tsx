import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { marketingApi, productsApi } from '../lib/api'
import { Facebook, Instagram, Calendar, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSocialMedia() {
  const [activeTab, setActiveTab] = useState<'share' | 'schedule'>('share')
  const [shareForm, setShareForm] = useState({
    productId: '',
    accessToken: '',
    platform: 'facebook' as 'facebook' | 'instagram',
  })
  const [scheduleForm, setScheduleForm] = useState({
    platform: 'facebook' as 'facebook' | 'instagram',
    message: '',
    imageUrl: '',
    linkUrl: '',
    scheduledTime: '',
  })

  const { data: products } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
  })

  const { data: scheduledPosts } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: () => marketingApi.getScheduledPosts().then(res => res.data),
  })

  const shareMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.platform === 'facebook') {
        return marketingApi.shareToFacebook(data)
      } else {
        return marketingApi.shareToInstagram(data)
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`Product shared to ${variables.platform} successfully!`)
      setShareForm({
        productId: '',
        accessToken: '',
        platform: 'facebook',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to share product')
    },
  })

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => marketingApi.schedulePost(data),
    onSuccess: () => {
      toast.success('Post scheduled successfully!')
      setScheduleForm({
        platform: 'facebook',
        message: '',
        imageUrl: '',
        linkUrl: '',
        scheduledTime: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule post')
    },
  })

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareForm.productId || !shareForm.accessToken) {
      toast.error('Please select a product and provide access token')
      return
    }

    shareMutation.mutate({
      productId: parseInt(shareForm.productId),
      accessToken: shareForm.accessToken,
    })
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleForm.message || !scheduleForm.scheduledTime) {
      toast.error('Please fill in message and scheduled time')
      return
    }

    scheduleMutation.mutate({
      platform: scheduleForm.platform,
      message: scheduleForm.message,
      imageUrl: scheduleForm.imageUrl || undefined,
      linkUrl: scheduleForm.linkUrl || undefined,
      scheduledTime: scheduleForm.scheduledTime,
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Marketing</h1>
        <p className="text-gray-600 mt-2">Share products and schedule posts on Facebook and Instagram</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'share'
                ? 'border-primary-600 text-primary-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Product
            </div>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-primary-600 text-primary-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Post
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Product Form */}
        {activeTab === 'share' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Share Product</h2>
            </div>

            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="facebook"
                      checked={shareForm.platform === 'facebook'}
                      onChange={(e) => setShareForm({ ...shareForm, platform: e.target.value as 'facebook' | 'instagram' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span>Facebook</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="instagram"
                      checked={shareForm.platform === 'instagram'}
                      onChange={(e) => setShareForm({ ...shareForm, platform: e.target.value as 'facebook' | 'instagram' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span>Instagram</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={shareForm.productId}
                  onChange={(e) => setShareForm({ ...shareForm, productId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a product</option>
                  {products?.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.model} - {product.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token *
                </label>
                <input
                  type="text"
                  value={shareForm.accessToken}
                  onChange={(e) => setShareForm({ ...shareForm, accessToken: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter Facebook/Instagram access token"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You need to obtain an access token from Facebook/Instagram Developer Console
                </p>
              </div>

              <button
                type="submit"
                disabled={shareMutation.isPending}
                className={`w-full text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  shareForm.platform === 'facebook'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {shareForm.platform === 'facebook' ? (
                  <Facebook className="w-5 h-5" />
                ) : (
                  <Instagram className="w-5 h-5" />
                )}
                {shareMutation.isPending ? 'Sharing...' : `Share to ${shareForm.platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
              </button>
            </form>
          </div>
        )}

        {/* Schedule Post Form */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Schedule Post</h2>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="facebook"
                      checked={scheduleForm.platform === 'facebook'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, platform: e.target.value as 'facebook' | 'instagram' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span>Facebook</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="instagram"
                      checked={scheduleForm.platform === 'instagram'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, platform: e.target.value as 'facebook' | 'instagram' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span>Instagram</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={scheduleForm.message}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Post message"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={scheduleForm.imageUrl}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  value={scheduleForm.linkUrl}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={scheduleMutation.isPending}
                className={`w-full text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  scheduleForm.platform === 'facebook'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </form>
          </div>
        )}

        {/* Scheduled Posts List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scheduledPosts && scheduledPosts.length > 0 ? (
              scheduledPosts.map((post: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {post.platform === 'facebook' ? (
                      <Facebook className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Instagram className="w-4 h-4 text-pink-600" />
                    )}
                    <span className="font-medium text-sm capitalize">{post.platform}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{post.message}</p>
                  <p className="text-xs text-gray-500">
                    Scheduled: {new Date(post.scheduledTime).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No scheduled posts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

