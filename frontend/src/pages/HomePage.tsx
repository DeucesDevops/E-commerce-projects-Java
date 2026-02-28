import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Product } from '../types'
import { getFeaturedProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Air Max Pulse',
    description: 'The Air Max Pulse draws inspiration from the icons that came before it. Visible Air in the heel provides unbelievable cushioning.',
    brand: 'Nike',
    category: 'Sneakers',
    price: 149.99,
    imageUrl: '',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red'],
    featured: true,
    createdAt: '2025-01-01',
  },
  {
    id: 2,
    name: 'Ultraboost Light',
    description: 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.',
    brand: 'Adidas',
    category: 'Running',
    price: 189.99,
    imageUrl: '',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Blue'],
    featured: true,
    createdAt: '2025-01-02',
  },
  {
    id: 3,
    name: 'Classic Leather',
    description: 'A clean, versatile shoe with soft leather and a timeless design that pairs with everything.',
    brand: 'Reebok',
    category: 'Casual',
    price: 89.99,
    imageUrl: '',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Cream'],
    featured: true,
    createdAt: '2025-01-03',
  },
  {
    id: 4,
    name: 'Suede XL',
    description: 'The Suede hit the scene in 1968 and has been an icon of street culture ever since.',
    brand: 'Puma',
    category: 'Sneakers',
    price: 74.99,
    imageUrl: '',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Navy', 'Green', 'Red'],
    featured: true,
    createdAt: '2025-01-04',
  },
  {
    id: 5,
    name: 'GEL-Kayano 30',
    description: 'Premium stability running shoe designed for long-distance comfort and support.',
    brand: 'ASICS',
    category: 'Running',
    price: 159.99,
    imageUrl: '',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'Blue', 'Orange'],
    featured: true,
    createdAt: '2025-01-05',
  },
  {
    id: 6,
    name: 'Old Skool',
    description: 'The iconic sidestripe shoe that has been a staple of skate and street culture for decades.',
    brand: 'Vans',
    category: 'Skate',
    price: 69.99,
    imageUrl: '',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black/White', 'Navy', 'Red'],
    featured: true,
    createdAt: '2025-01-06',
  },
]

const CATEGORIES = [
  { name: 'Sneakers', color: 'from-indigo-500 to-indigo-700' },
  { name: 'Running', color: 'from-emerald-500 to-emerald-700' },
  { name: 'Boots', color: 'from-amber-500 to-amber-700' },
  { name: 'Casual', color: 'from-rose-500 to-rose-700' },
  { name: 'Canvas', color: 'from-cyan-500 to-cyan-700' },
  { name: 'Skate', color: 'from-violet-500 to-violet-700' },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedProducts()
        setFeaturedProducts(data.length > 0 ? data : FALLBACK_PRODUCTS)
      } catch {
        setFeaturedProducts(FALLBACK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Step Into
              <span className="block text-indigo-400">Style</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-lg">
              Discover the latest collection of premium footwear. From iconic sneakers to performance
              running shoes, find your perfect pair today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors text-lg"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products?category=Sneakers"
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors text-lg"
              >
                Browse Sneakers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="mt-1 text-gray-500">Handpicked styles just for you</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-square" />
                <div className="mt-3 h-3 bg-gray-200 rounded w-1/3" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-2/3" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
          >
            View All Products
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-1 text-gray-500">Find exactly what you are looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`bg-gradient-to-br ${cat.color} rounded-xl p-6 text-center text-white hover:shadow-lg hover:scale-105 transition-all duration-200`}
              >
                <span className="text-lg font-bold">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Stay Updated</h2>
          <p className="mt-2 text-indigo-100 max-w-lg mx-auto">
            Subscribe to our newsletter for the latest drops, exclusive deals, and style inspiration.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
