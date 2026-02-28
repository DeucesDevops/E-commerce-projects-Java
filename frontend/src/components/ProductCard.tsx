import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-3xl font-bold text-gray-300 uppercase tracking-widest">
              {product.brand}
            </span>
            <span className="text-sm text-gray-400 mt-1">{product.category}</span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-full text-sm shadow-lg">
            View Details
          </span>
        </div>
      </div>

      <div className="mt-3 px-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 mt-0.5 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  )
}
