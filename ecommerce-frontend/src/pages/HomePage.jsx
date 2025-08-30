import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowRight, Star, Truck, Shield, Headphones } from 'lucide-react'
import { fetchProducts } from '../features/products/productsSlice'
import { ProductCard } from '../components/Products/ProductCard'
import { CartSidebar } from '../components/Cart/CartSidebar'

export function HomePage() {
  const dispatch = useDispatch()
  const { products, loading } = useSelector(state => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  // Get featured products (first 8 products)
  const featuredProducts = products.slice(0, 8)

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Free Delivery',
      description: 'Free delivery within Colombo for orders over Rs.50,000'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: '1 Year Warranty',
      description: 'Comprehensive warranty on all furniture items'
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Premium Quality',
      description: 'Handcrafted furniture made from the finest materials'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transform Your Space with 
                <span className="text-primary-200"> Premium Furniture</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Discover our curated collection of handcrafted furniture that combines 
                timeless design with modern functionality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Premium Furniture"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VCare Furniture?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional furniture and service that exceeds your expectations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">
              Discover our most popular furniture pieces
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Latest Collections
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  )
}