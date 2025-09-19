import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById } from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector(state => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We'll process it shortly.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{currentOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(currentOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {currentOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  currentOrder.orderStatus === 'pending_payment'
                    ? 'bg-yellow-100 text-yellow-800'
                    : currentOrder.orderStatus === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {currentOrder.orderStatus === 'pending_payment' ? 'Pending Payment' : 
                   currentOrder.orderStatus === 'processing' ? 'Processing' : 
                   currentOrder.orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{currentOrder.customerName}</p>
              <p className="text-gray-600">{currentOrder.customerEmail}</p>
              {currentOrder.customerPhone && (
                <p className="text-gray-600">{currentOrder.customerPhone}</p>
              )}
              <p className="text-gray-600 mt-2">{currentOrder.customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  {item.selectedSize && (
                    <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    LKR {Number(item.totalPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                   LKR {Number(item.unitPrice).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-primary-600">
              LKR {currentOrder.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {currentOrder.paymentMethod === 'bank_transfer' && currentOrder.orderStatus === 'pending_payment' && (
          <div className="border-t pt-6 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Complete Your Payment
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                <p><strong>Account Name:</strong> VCare Furniture Store</p>
                <p><strong>Account Number:</strong> 8001234567</p>
                <p><strong>Branch:</strong> Colombo Main Branch</p>
                <p><strong>Amount:</strong> LKR {currentOrder.totalAmount.toFixed(2)}</p>
              </div>
              <p className="text-sm text-blue-700 mt-4">
                After making the transfer, please upload your receipt to complete the order.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-6 mt-6 flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="btn-secondary text-center">
            View All Orders
          </Link>
          <Link to="/products" className="btn-primary text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;