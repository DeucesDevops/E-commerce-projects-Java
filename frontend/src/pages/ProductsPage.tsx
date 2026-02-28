import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '../types'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

const ALL_CATEGORIES = [
  'Sneakers',
  'Running',
  'Boots',
  'Casual',
  'Canvas',
  'Skate',
  'Retro',
  'Tennis',
]

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1, name: 'Air Max Pulse', description: 'Visible Air cushioning for everyday comfort.', brand: 'Nike',
    category: 'Sneakers', price: 149.99, imageUrl: '', sizes: ['7','8','9','10','11','12'], colors: ['Black','White','Red'], featured: true, createdAt: '2025-01-01',
  },
  {
    id: 2, name: 'Ultraboost Light', description: 'Our lightest Ultraboost ever for runners.', brand: 'Adidas',
    category: 'Running', price: 189.99, imageUrl: '', sizes: ['7','8','9','10','11'], colors: ['White','Black','Blue'], featured: true, createdAt: '2025-01-02',
  },
  {
    id: 3, name: 'Classic Leather', description: 'Timeless design with soft leather upper.', brand: 'Reebok',
    category: 'Casual', price: 89.99, imageUrl: '', sizes: ['6','7','8','9','10','11','12'], colors: ['White','Black','Cream'], featured: false, createdAt: '2025-01-03',
  },
  {
    id: 4, name: 'Suede XL', description: 'An icon of street culture since 1968.', brand: 'Puma',
    category: 'Sneakers', price: 74.99, imageUrl: '', sizes: ['7','8','9','10','11'], colors: ['Navy','Green','Red'], featured: false, createdAt: '2025-01-04',
  },
  {
    id: 5, name: 'GEL-Kayano 30', description: 'Premium stability for long-distance running.', brand: 'ASICS',
    category: 'Running', price: 159.99, imageUrl: '', sizes: ['7','8','9','10','11','12'], colors: ['Black','Blue','Orange'], featured: true, createdAt: '2025-01-05',
  },
  {
    id: 6, name: 'Old Skool', description: 'The iconic sidestripe skate shoe.', brand: 'Vans',
    category: 'Skate', price: 69.99, imageUrl: '', sizes: ['6','7','8','9','10','11','12'], colors: ['Black/White','Navy','Red'], featured: false, createdAt: '2025-01-06',
  },
  {
    id: 7, name: 'Chuck Taylor All Star', description: 'The original canvas sneaker that started it all.', brand: 'Converse',
    category: 'Canvas', price: 59.99, imageUrl: '', sizes: ['5','6','7','8','9','10','11','12'], colors: ['Black','White','Red'], featured: false, createdAt: '2025-01-07',
  },
  {
    id: 8, name: 'Iron Ranger', description: 'Handcrafted leather boots built to last a lifetime.', brand: 'Red Wing',
    category: 'Boots', price: 349.99, imageUrl: '', sizes: ['7','8','9','10','11','12'], colors: ['Amber','Black','Copper'], featured: false, createdAt: '2025-01-08',
  },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const categoryParam = searchParams.get('category') || ''
  const searchParam = searchParams.get('search') || ''

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  )

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
  }, [categoryParam])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const category = selectedCategories.length === 1 ? selectedCategories[0] : undefined
        const data = await getProducts(category, searchParam || undefined)
        setProducts(data)
      } catch {
        // API unavailable: use fallback data with client-side filtering
        let filtered = FALLBACK_PRODUCTS
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((p) => selectedCategories.includes(p.category))
        }
        if (searchParam) {
          const q = searchParam.toLowerCase()
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          )
        }
        setProducts(filtered)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategories, searchParam])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      // Update URL
      const params = new URLSearchParams(searchParams)
      if (next.length === 1) {
        params.set('category', next[0])
      } else {
        params.delete('category')
      }
      setSearchParams(params, { replace: true })
      return next
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    const params = new URLSearchParams(searchParams)
    params.delete('category')
    params.delete('search')
    setSearchParams(params, { replace: true })
  }

  const hasActiveFilters = selectedCategories.length > 0 || searchParam

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {searchParam ? `Results for "${searchParam}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {selectedCategories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
            >
              {cat}
              <button onClick={() => toggleCategory(cat)} className="hover:text-indigo-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {searchParam && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              Search: {searchParam}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'fixed inset-0 z-40 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'
          } lg:block lg:w-56 flex-shrink-0`}
        >
          <div
            className={`${
              sidebarOpen
                ? 'fixed right-0 top-0 h-full w-72 bg-white p-6 shadow-xl overflow-y-auto z-50'
                : ''
            } lg:relative lg:w-auto lg:p-0 lg:shadow-none`}
          >
            {sidebarOpen && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Category
              </h3>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-square" />
                  <div className="mt-3 h-3 bg-gray-200 rounded w-1/3" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-2/3" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
