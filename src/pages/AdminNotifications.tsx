import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { marketingApi, notificationsApi } from '../lib/api'
import { Send, Bell, Users, Star, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminNotifications() {
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    imageUrl: '',
    clickAction: '/',
    data: '',
  })

  const { data: banners } = useQuery({
    queryKey: ['marketing-banners'],
    queryFn: () => marketingApi.getAllBanners().then(res => res.data),
  })

  const { data: featuredProducts } = useQuery({
    queryKey: ['marketing-featured'],
    queryFn: () => marketingApi.getFeaturedProducts().then(res => res.data),
  })

  const sendNotificationMutation = useMutation({
    mutationFn: (data: any) => marketingApi.sendNotification(data),
    onSuccess: () => {
      toast.success('Notification sent successfully!')
      setNotificationForm({
        title: '',
        body: '',
        imageUrl: '',
        clickAction: '/',
        data: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    },
  })

  const sendFeaturedNotificationMutation = useMutation({
    mutationFn: () => marketingApi.sendFeaturedProductNotification(),
    onSuccess: () => {
      toast.success('Featured products notification sent!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    },
  })

  const notifyBannerMutation = useMutation({
    mutationFn: (bannerId: number) => marketingApi.notifyBanner(bannerId),
    onSuccess: () => {
      toast.success('Banner notification sent!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    },
  })

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notificationForm.title || !notificationForm.body) {
      toast.error('Please fill in title and body')
      return
    }

    sendNotificationMutation.mutate({
      title: notificationForm.title,
      body: notificationForm.body,
      imageUrl: notificationForm.imageUrl || undefined,
      clickAction: notificationForm.clickAction || '/',
      data: notificationForm.data || undefined,
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
        <p className="text-gray-600 mt-2">Send push notifications to all mobile app users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Notification Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Send Custom Notification</h2>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Notification title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={notificationForm.body}
                onChange={(e) => setNotificationForm({ ...notificationForm, body: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Notification message"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={notificationForm.imageUrl}
                onChange={(e) => setNotificationForm({ ...notificationForm, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Click Action (optional)
              </label>
              <input
                type="text"
                value={notificationForm.clickAction}
                onChange={(e) => setNotificationForm({ ...notificationForm, clickAction: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/products/123"
              />
            </div>

            <button
              type="submit"
              disabled={sendNotificationMutation.isPending}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Featured Products Notification */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Products</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Notify users about new featured products ({featuredProducts?.length || 0} featured)
            </p>
            <button
              onClick={() => sendFeaturedNotificationMutation.mutate()}
              disabled={sendFeaturedNotificationMutation.isPending || !featuredProducts?.length}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5" />
              {sendFeaturedNotificationMutation.isPending ? 'Sending...' : 'Notify About Featured Products'}
            </button>
          </div>

          {/* Banner Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Active Banners</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Send notifications for active sale banners
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {banners?.filter((b: any) => b.isActive).map((banner: any) => (
                <div
                  key={banner.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{banner.title}</p>
                    <p className="text-xs text-gray-500 truncate">{banner.description}</p>
                  </div>
                  <button
                    onClick={() => notifyBannerMutation.mutate(banner.id)}
                    disabled={notifyBannerMutation.isPending}
                    className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Notify
                  </button>
                </div>
              ))}
              {!banners?.filter((b: any) => b.isActive).length && (
                <p className="text-gray-500 text-sm text-center py-4">No active banners</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

