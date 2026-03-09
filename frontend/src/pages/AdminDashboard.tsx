import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { Product, Order } from '../types'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from '../services/api'
import { useAuth } from '../context/AuthContext'

type Tab = 'products' | 'orders'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

const EMPTY_PRODUCT: Partial<Product> = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: 0,
  imageUrl: '',
  sizes: [],
  colors: [],
  featured: false,
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-700',
  CONFIRMED: 'text-blue-700',
  PROCESSING: 'text-blue-700',
  SHIPPED: 'text-purple-700',
  DELIVERED: 'text-green-700',
  PAID: 'text-green-700',
  CANCELLED: 'text-red-700',
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getProducts().catch(() => [] as Product[]),
      getAllOrders().catch(() => [] as Order[]),
    ]).then(([p, o]) => {
      setProducts(p)
      setOrders(o)
    }).finally(() => setLoading(false))
  }, [user])

  if (!authLoading && !user) return <Navigate to="/login" replace />
  if (!authLoading && user && user.role !== 'ADMIN') return <Navigate to="/" replace />

  const loadProducts = () =>
    getProducts()
      .then(setProducts)
      .catch(() => {})

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct.brand || !editingProduct.price) {
      setFormError('Name, brand, and price are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingProduct.id) {
        await updateProduct(editingProduct.id, editingProduct)
      } else {
        await createProduct(editingProduct)
      }
      await loadProducts()
      setEditingProduct(null)
    } catch {
      setFormError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await deleteProduct(id)
      await loadProducts()
    } catch {
      alert('Failed to delete product.')
    }
  }

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      const updated = await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch {
      alert('Failed to update order status.')
    }
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {(['products', 'orders'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'products' ? `Products (${products.length})` : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {/* ── Products Tab ── */}
      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <button
              onClick={() => {
                setEditingProduct({ ...EMPTY_PRODUCT })
                setFormError('')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {/* Edit / Create Modal */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingProduct.id ? 'Edit Product' : 'New Product'}
                  </h3>
                  <button onClick={() => setEditingProduct(null)}>
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                {(
                  [
                    { label: 'Name', field: 'name', type: 'text' },
                    { label: 'Brand', field: 'brand', type: 'text' },
                    { label: 'Category', field: 'category', type: 'text' },
                    { label: 'Price ($)', field: 'price', type: 'number' },
                    { label: 'Image URL', field: 'imageUrl', type: 'text' },
                  ] as { label: string; field: keyof Product; type: string }[]
                ).map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={String((editingProduct as Record<string, unknown>)[field] ?? '')}
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          [field]:
                            type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingProduct.description ?? ''}
                    rows={3}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(editingProduct.sizes ?? []).join(', ')}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        sizes: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="7, 8, 9, 10, 11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(editingProduct.colors ?? []).join(', ')}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        colors: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Black, White, Red"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? false}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span className="font-medium text-gray-700">Featured product</span>
                </label>

                {formError && (
                  <p className="text-red-600 text-sm">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProduct}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Brand</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Featured</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{p.brand}</td>
                    <td className="py-3 pr-4 text-gray-500">{p.category}</td>
                    <td className="py-3 pr-4 text-gray-900">${p.price.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      {p.featured && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...p })
                            setFormError('')
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="text-center text-gray-400 py-12">No products found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Orders Tab ── */}
      {tab === 'orders' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">#{order.id}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium ${
                        STATUS_COLORS[order.status] ?? 'text-gray-700'
                      }`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-12">No orders found.</p>
          )}
        </div>
      )}
    </div>
  )
}
