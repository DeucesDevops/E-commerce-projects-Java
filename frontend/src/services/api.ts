import axios from 'axios'
import type { Product, AuthResponse, Order } from '../types'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login if the server returns 401 (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ────────────────────────────────────────────────────────
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  return response.data
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
  return response.data
}

// ─── PRODUCTS ────────────────────────────────────────────────────
export const getProducts = async (category?: string, search?: string): Promise<Product[]> => {
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (search) params.q = search
  const response = await api.get<Product[]>('/products', { params })
  return response.data
}

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products', { params: { featured: true } })
  return response.data
}

// Admin only
export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await api.post<Product>('/products', product)
  return response.data
}

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, product)
  return response.data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`)
}

// ─── CART ────────────────────────────────────────────────────────
// These call cart-service. The api-gateway adds X-User-Id from the JWT token.
export interface CartApiItem {
  productId: number
  name: string
  brand: string
  size: string
  color: string
  price: number
  quantity: number
  imageUrl: string
}

export const getCart = async (): Promise<CartApiItem[]> => {
  const response = await api.get<CartApiItem[]>('/cart')
  return response.data
}

export const addToCartApi = async (item: CartApiItem): Promise<void> => {
  await api.post('/cart/add', item)
}

export const updateCartItemApi = async (productId: number, size: string, quantity: number): Promise<void> => {
  await api.put('/cart/update', { productId, size, quantity })
}

export const removeFromCartApi = async (productId: number, size: string): Promise<void> => {
  await api.delete('/cart/remove', { params: { productId, size } })
}

export const clearCartApi = async (): Promise<void> => {
  await api.delete('/cart/clear')
}

// ─── ORDERS ──────────────────────────────────────────────────────
export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const response = await api.post<Order>('/orders', order)
  return response.data
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders')
  return response.data
}

export const getOrder = async (id: number): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`)
  return response.data
}

export const cancelOrder = async (id: number): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${id}/cancel`)
  return response.data
}

// Admin only
export const getAllOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders/all')
  return response.data
}

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${id}/status`, { status })
  return response.data
}

// ─── PAYMENTS ────────────────────────────────────────────────────
// Step 1: ask payment-service to create a Stripe PaymentIntent
// Returns the clientSecret the frontend passes to Stripe.js
export const createPaymentIntent = async (orderId: number, amount: number): Promise<string> => {
  const response = await api.post<{ clientSecret: string }>('/payments/create-intent', {
    orderId,
    amount,
  })
  return response.data.clientSecret
}

// Step 2: tell payment-service that Stripe confirmed the payment
export const confirmPayment = async (
  paymentIntentId: string,
  customerEmail: string,
  customerName: string
): Promise<void> => {
  await api.post('/payments/confirm', { paymentIntentId, customerEmail, customerName })
}

export default api
