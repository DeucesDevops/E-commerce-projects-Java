export interface Product {
  id: number
  name: string
  description: string
  brand: string
  category: string
  price: number
  imageUrl: string
  sizes: string[]
  colors: string[]
  featured: boolean
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface Order {
  id: number
  userId: number
  status: string
  totalAmount: number
  shippingAddress: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface AuthResponse {
  token: string
  userId: number
  name: string
  email: string
  role: string
}
