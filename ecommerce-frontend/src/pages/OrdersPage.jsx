import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Package, Calendar, CreditCard } from 'lucide-react'
import { fetchOrdersStart } from '../features/orders/ordersSlice'

export function OrdersPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orders, loading } = useSelector(state => state.orders)
  const { customer, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (customer?.id) {
      dispatch(fetchOrdersStart({ customerId: customer.id }))
    }
  }, [dispatch, customer, isAuthenticated, navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    Rs.{order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.product?.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        Rs.{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span>Rs.{order.deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Delivery Area:</span>
                  <span className="capitalize">
                    {order.deliveryArea.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}