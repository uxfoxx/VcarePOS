import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EcommerceInvoiceModal from '../components/Orders/EcommerceInvoiceModal';
import { Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  if (path.startsWith('uploads')) return `${API_URL}/${path}`;
  return `${API_URL}/uploads/${path}`;
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { customer } = useSelector(state => state.auth);
  const { orders, loading } = useSelector(state => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (customer) {
      dispatch(fetchOrders({ customerId: customer.id }));
    }
  }, [dispatch, customer]);

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'Pending Payment';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Order Card Header */}
              <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                    <h3 className="text-lg font-bold text-gray-900">#{order.id}</h3>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Placed</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-primary-600">LKR {order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusColor(order.orderStatus)}`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Items Preview */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ordered Items ({order.items.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                          <div className="w-14 h-14 bg-white flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1">
                            {item.productImage ? (
                              <img
                                src={getImageUrl(item.productImage)}
                                alt={item.productName}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} • {item.colorName || 'Default'}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="flex items-center justify-center bg-gray-50/50 rounded-xl p-3 border border-dashed border-gray-200">
                          <p className="text-xs font-bold text-gray-400">+{order.items.length - 2} more items</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Footer / Actions */}
                  <div className="flex flex-col justify-end items-end gap-3 min-w-[240px]">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {order.paymentMethod === 'store_pickup' ? 'Pickup from' : 'Delivering to'}
                      </p>
                      <p className="text-sm text-gray-600 max-w-[200px] truncate leading-tight italic">
                        {order.paymentMethod === 'store_pickup' ? 'Our Store' : order.customerAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2">
                      <button
                        onClick={() => handleViewInvoice(order)}
                        className="flex-1 sm:flex-none text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        View Invoice
                      </button>
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EcommerceInvoiceModal
        order={selectedOrder}
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
      />
    </div>
  );
};

export default OrdersPage;