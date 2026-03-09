import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Package, ChevronLeft } from 'lucide-react'
import type { Order } from '../types'
import { getOrder, cancelOrder } from '../services/api'
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!user) return
    getOrder(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id, user])

  if (!authLoading && !user) return <Navigate to="/login" replace />

  if (loading || authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto" />
        <p className="mt-4 text-gray-500">Order not found.</p>
        <Link
          to="/orders"
          className="mt-4 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>
    )
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const updated = await cancelOrder(order.id)
      setOrder(updated)
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/orders"
        className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <div key={item.id} className="px-6 py-4 flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-gray-500 mt-0.5">
                  Size {item.size} &middot; {item.color} &times; {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Delivery Information</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium text-gray-800">Name: </span>
            {order.customerName}
          </p>
          <p>
            <span className="font-medium text-gray-800">Email: </span>
            {order.customerEmail}
          </p>
          <p>
            <span className="font-medium text-gray-800">Address: </span>
            {order.shippingAddress}
          </p>
        </div>
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="px-6 py-2.5 border border-red-300 text-red-600 font-medium rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  )
}
