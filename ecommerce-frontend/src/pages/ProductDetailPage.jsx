import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchProducts } from '../features/products/productsSlice'
import { addToCart } from '../features/cart/cartSlice'
import { CartSidebar } from '../components/Cart/CartSidebar'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { products, loading } = useSelector(state => state.products)
  
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = products.find(p => p.id === id)

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts())
    }
  }, [dispatch, products.length])

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0]
      setSelectedColorId(firstColor.id)
      
      if (firstColor.sizes && firstColor.sizes.length > 0) {
        setSelectedSize(firstColor.sizes[0].name)
      }
    }
  }, [product])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  const selectedColor = product.colors?.find(color => color.id === selectedColorId)
  const selectedSizeData = selectedColor?.sizes?.find(size => size.name === selectedSize)
  const currentPrice = selectedSizeData?.price || product.price
  const currentStock = selectedSizeData?.stock || product.stock
  const hasStock = currentStock > 0
  const isPreorderAvailable = product.allowPreorder && !hasStock
  const isAvailable = currentStock > 0 || isPreorderAvailable

  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      quantity,
      selectedColorId,
      selectedSize,
    }))
    
    // Show immediate feedback
    if (hasStock) {
      toast.success(`${quantity} × ${product.name} added to cart!`, {
        icon: '🛒',
        duration: 2000,
      })
    } else if (isPreorderAvailable) {
      toast.success(`${quantity} × ${product.name} added to cart for pre-order!`, {
        icon: '📦',
        duration: 3000,
      })
    }
  }

  const images = [
    product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=800',
    ...(selectedColor?.image ? [selectedColor.image] : [])
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                {product.category}
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {/* Price */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                Rs.{currentPrice.toFixed(2)}
              </span>
              {hasStock ? (
                <span className="text-sm text-green-600 font-medium">In Stock</span>
              ) : isPreorderAvailable ? (
                <span className="text-sm text-blue-600 font-medium">Available for Pre-order</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColorId(color.id)
                      if (color.sizes && color.sizes.length > 0) {
                        setSelectedSize(color.sizes[0].name)
                      }
                    }}
                    className={`relative w-12 h-12 rounded-full border-2 transition-colors ${
                      selectedColorId === color.id
                        ? 'border-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundImage: color.image ? `url(${color.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: color.colorCode || '#f0f0f0'
                    }}
                  >
                    {selectedColorId === color.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedColor.name}</p>
              )}
            </div>
          )}

          {/* Size Selection */}
          {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedColor.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.name)}
                    disabled={size.stock === 0}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      selectedSize === size.name
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : size.stock === 0
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-xs text-gray-500">
                      {size.stock > 0 ? `${size.stock} available` : 'Out of stock'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg">−</span>
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {currentStock} available
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isAvailable
                    ? (hasStock 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white')
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {hasStock ? 'Add to Cart' : 
                   isPreorderAvailable ? 'Pre-order Now' : 'Out of Stock'}
                </span>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-gray-600 hover:text-red-500 hover:border-red-300 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-600">Free delivery within Colombo</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-600">1 year warranty</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{product.material || 'Premium Wood'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.barcode}</span>
              </div>
              {selectedSizeData && selectedSizeData.dimensions && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">
                    {selectedSizeData.dimensions.length}×{selectedSizeData.dimensions.width}×{selectedSizeData.dimensions.height} {selectedSizeData.dimensions.unit}
                  </span>
                </div>
              )}
              {selectedSizeData && selectedSizeData.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{selectedSizeData.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  )
}