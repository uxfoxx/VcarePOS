import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, MapPin, CheckCircle, Package, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { createOrderStart } from '../features/orders/ordersSlice'

export function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items } = useSelector(state => state.cart)
  const { customer, isAuthenticated } = useSelector(state => state.auth)
  const { loading, currentOrder } = useSelector(state => state.orders)

  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || 'Colombo',
    postalCode: customer?.postalCode || '',
    deliveryArea: 'inside_colombo',
    paymentMethod: 'cod',
    notes: ''
  })
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)

  // Handle successful order creation
  React.useEffect(() => {
    if (currentOrder && !loading) {
      toast.success('Order placed successfully!')
      setShowOrderConfirmation(true)
    }
  }, [currentOrder, loading])

  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.product.price
    const addonPrice = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0
    return total + ((itemPrice + addonPrice) * item.quantity)
  }, 0)

  const deliveryCharge = formData.deliveryArea === 'inside_colombo' ? 300 : 600
  const total = subtotal + deliveryCharge

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const orderData = {
      customer: formData,
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedColorId: item.selectedColorId,
        selectedSize: item.selectedSize,
        addons: item.addons || []
      })),
      deliveryArea: formData.deliveryArea,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    }

    dispatch(createOrderStart(orderData))
  }

  const handleContinueShopping = () => {
    setShowOrderConfirmation(false)
    navigate('/products')
  }

  const handleViewOrders = () => {
    setShowOrderConfirmation(false)
    navigate('/orders')
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  // Order Confirmation Modal
  if (showOrderConfirmation && currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="font-mono text-sm font-medium">{currentOrder.orderId}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-lg font-bold text-primary-600">
                  Rs.{currentOrder.total.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium capitalize">
                  {formData.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {currentOrder.status === 'confirmed' ? 'Confirmed' : 'Pending Payment'}
                </span>
              </div>
            </div>
            
            {formData.paymentMethod === 'bank_transfer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Payment Instructions
                </h3>
                <p className="text-sm text-blue-700">
                  Please transfer Rs.{currentOrder.total.toFixed(2)} to our bank account. 
                  Upload your receipt through your account to confirm payment.
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-8">
              Thank you for your order! We'll send you an email confirmation shortly.
              {formData.paymentMethod === 'cod' && ' Your order will be delivered within 3-5 business days.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleViewOrders}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                View My Orders
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Options</h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="deliveryArea"
                    value="inside_colombo"
                    checked={formData.deliveryArea === 'inside_colombo'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">Inside Colombo</span>
                    </div>
                    <p className="text-sm text-gray-600">Delivery charge: Rs.300</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="deliveryArea"
                    value="outside_colombo"
                    checked={formData.deliveryArea === 'outside_colombo'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">Outside Colombo</span>
                    </div>
                    <p className="text-sm text-gray-600">Delivery charge: Rs.600</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">Bank Transfer</span>
                    </div>
                    <p className="text-sm text-gray-600">Transfer to our bank account</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                rows={3}
                className="input"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      Rs.{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">Rs.{deliveryCharge.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span className="text-primary-600">Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}