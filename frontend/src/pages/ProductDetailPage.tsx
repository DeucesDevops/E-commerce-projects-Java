import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Minus, Plus, ChevronLeft, Check } from 'lucide-react'
import type { Product } from '../types'
import { getProduct } from '../services/api'
import { useCart } from '../context/CartContext'

const FALLBACK_PRODUCT: Product = {
  id: 1,
  name: 'Air Max Pulse',
  description:
    'The Air Max Pulse draws inspiration from the icons that came before it. Visible Air in the heel provides lightweight, all-day cushioning while the padded, low-cut collar looks sleek and feels great. This is the next chapter in the Air Max legacy.',
  brand: 'Nike',
  category: 'Sneakers',
  price: 149.99,
  imageUrl: '',
  sizes: ['7', '8', '9', '10', '11', '12'],
  colors: ['Black', 'White', 'Red'],
  featured: true,
  createdAt: '2025-01-01',
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showSizeError, setShowSizeError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await getProduct(Number(id))
        setProduct(data)
      } catch {
        // Use fallback if API unavailable
        setProduct({ ...FALLBACK_PRODUCT, id: Number(id) || 1 })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    if (!selectedSize || !selectedColor) {
      setShowSizeError(true)
      return
    }
    setShowSizeError(false)
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-gray-200 rounded-2xl aspect-square" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 text-lg">Product not found</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        to="/products"
        className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl font-bold text-gray-300 uppercase tracking-widest">
                {product.brand}
              </span>
              <span className="text-lg text-gray-400 mt-2">{product.name}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            {product.brand}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-2xl font-bold text-gray-900 mt-3">${product.price.toFixed(2)}</p>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Size
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    setShowSizeError(false)
                  }}
                  className={`py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    selectedSize === size
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Color
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setShowSizeError(false)
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                    selectedColor === color
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Quantity
            </h3>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-lg font-semibold text-gray-900 w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {showSizeError && (
            <p className="mt-4 text-sm text-red-600">
              Please select both a size and a color before adding to cart.
            </p>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`mt-8 w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all ${
              addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="h-5 w-5" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
