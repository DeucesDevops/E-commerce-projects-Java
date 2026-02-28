import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">SHOEAPP</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for stylish and comfortable footwear. We curate the best
              shoes from top brands to keep you stepping in style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=Sneakers" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Running" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Running
                </Link>
              </li>
              <li>
                <Link to="/products?category=Boots" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Boots
                </Link>
              </li>
              <li>
                <Link to="/products?category=Casual" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Casual
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>123 Shoe Street</li>
              <li>New York, NY 10001</li>
              <li>support@shoeapp.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SHOEAPP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
