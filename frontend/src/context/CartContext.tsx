import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, size: string, color: string) => void
  removeFromCart: (productId: number, size: string, color: string) => void
  updateQuantity: (productId: number, size: string, color: string, qty: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, size: string, color: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      )
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }]
    })
  }

  const removeFromCart = (productId: number, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color)
      )
    )
  }

  const updateQuantity = (productId: number, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity: qty }
          : item
      )
    )
  }

  const clearCart = () => setCart([])

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
