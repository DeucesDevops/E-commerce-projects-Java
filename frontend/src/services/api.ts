import axios from 'axios'
import type { Product, AuthResponse, Order } from '../types'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getProducts = async (category?: string, search?: string): Promise<Product[]> => {
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (search) params.search = search
  const response = await api.get<Product[]>('/products', { params })
  return response.data
}

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products/featured')
  return response.data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  return response.data
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
  return response.data
}

export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const response = await api.post<Order>('/orders', order)
  return response.data
}

export const getOrders = async (userId: number): Promise<Order[]> => {
  const response = await api.get<Order[]>(`/orders/user/${userId}`)
  return response.data
}

export default api
