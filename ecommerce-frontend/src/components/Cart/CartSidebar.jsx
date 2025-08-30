import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { closeCart, removeFromCart, updateQuantity } from '../../features/cart/cartSlice'

export function CartSidebar() {
  const dispatch = useDispatch()
  const { items, isOpen } = useSelector(state => state.cart)

  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.product.price
    const addonPrice = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0
    return total + ((itemPrice + addonPrice) * item.quantity)
  }, 0)

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ itemId }))
      toast.success('Item removed from cart')
    } else {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => dispatch(closeCart())}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started</p>
                <Link
                  to="/products"
                  onClick={() => dispatch(closeCart())}
                  className="btn-primary"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-sm font-medium text-primary-600">
                        Rs.{item.product.price.toFixed(2)}
                      </p>
                      {item.addons && item.addons.length > 0 && (
                        <div className="text-xs text-gray-500">
                          + {item.addons.length} addon(s)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart({ itemId: item.id }))}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Subtotal</span>
                <span className="text-lg font-bold text-primary-600">
                  Rs.{subtotal.toFixed(2)}
                </span>
              </div>
              <Link
                to="/checkout"
                onClick={() => dispatch(closeCart())}
                className="block w-full btn-primary text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}