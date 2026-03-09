import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import type { Order } from '../types'
import { getMyOrders } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  if (!authLoading && !user) return <Navigate to="/login" replace />

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="mt-2 text-gray-500">When you place an order, it will appear here.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} &middot;{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
