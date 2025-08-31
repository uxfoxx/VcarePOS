import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { addToCart } from '../../features/cart/cartSlice'

export function ProductCard({ product }) {
  const dispatch = useDispatch()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // For products with colors, we'll add the first available color/size
    let selectedColorId = null
    let selectedSize = null
    
    if (product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0]
      selectedColorId = firstColor.id
      
      if (firstColor.sizes && firstColor.sizes.length > 0) {
        selectedSize = firstColor.sizes[0].name
      }
    }
    
    dispatch(addToCart({
      product,
      quantity: 1,
      selectedColorId,
      selectedSize,
    }))
    
    // Show immediate feedback
    const hasStock = product.stock > 0
    const isPreorderAvailable = product.allowPreorder && !hasStock
    
    if (hasStock) {
      toast.success(`${product.name} added to cart!`, {
        icon: '🛒',
        duration: 2000,
      })
    } else if (isPreorderAvailable) {
      toast.success(`${product.name} added to cart for pre-order!`, {
        icon: '📦',
        duration: 3000,
      })
    }
  }

  const getLowestPrice = () => {
    if (product.colors && product.colors.length > 0) {
      // Find the lowest price among all color/size combinations
      let minPrice = product.price
      product.colors.forEach(color => {
        if (color.sizes && color.sizes.length > 0) {
          color.sizes.forEach(size => {
            if (size.price && size.price < minPrice) {
              minPrice = size.price
            }
          })
        }
      })
      return minPrice
    }
    return product.price
  }

  const hasStock = product.stock > 0
  const isPreorderAvailable = product.allowPreorder && !hasStock
  const isAvailable = hasStock || isPreorderAvailable

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <Link to={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Stock Badge */}
          {!hasStock && !isPreorderAvailable && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Pre-order Badge */}
          {isPreorderAvailable && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
                Pre-order
              </span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">
                Rs.{getLowestPrice().toFixed(2)}
              </span>
              {product.colors && product.colors.length > 0 && (
                <span className="text-sm text-gray-500 ml-1">onwards</span>
              )}
            </div>
            {product.colors && product.colors.length > 0 && (
              <span className="text-xs text-gray-500">
                {product.colors.length} color{product.colors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isAvailable
              ? (hasStock 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : isPreorderAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed')
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>
            {hasStock ? 'Add to Cart' : 
             isPreorderAvailable ? 'Pre-order Now' : 'Out of Stock'}
          </span>
        </button>
      </div>
    </div>
  )
}