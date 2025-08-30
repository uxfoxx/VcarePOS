import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { removeFromCart, updateQuantity } from '../features/cart/cartSlice'

export function CartPage() {
  const dispatch = useDispatch()
  const { items } = useSelector(state => state.cart)

  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.product.price
    const addonPrice = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0
    return total + ((itemPrice + addonPrice) * item.quantity)
  }, 0)

  const deliveryCharge = subtotal > 50000 ? 0 : 300 // Free delivery over Rs.50,000
  const total = subtotal + deliveryCharge

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ itemId }))
      toast.success('Item removed from cart')
    } else {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }))
      toast.success('Cart updated')
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started</p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.category}</p>
                  {item.selectedSize && (
                    <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    Rs.{item.product.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => dispatch(removeFromCart({ itemId: item.id }))}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">
                  {deliveryCharge === 0 ? 'Free' : `Rs.${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              
              {deliveryCharge > 0 && (
                <p className="text-sm text-gray-500">
                  Free delivery on orders over Rs.50,000
                </p>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    Rs.{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full btn-primary text-center mt-6"
            >
              Proceed to Checkout
            </Link>
            
            <Link
              to="/products"
              className="block w-full text-center mt-4 text-primary-600 hover:text-primary-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}