import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById } from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { invoiceSettingsApi } from '../api/apiClient';
import { CheckCircle2, Package, ShoppingBag, ArrowRight, User, Mail, Phone, MapPin, CreditCard, Store } from 'lucide-react';

const fallbackImage = 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300';

const getImageUrl = (url) => {
  if (!url) return fallbackImage;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector(state => state.orders);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [invoiceInfo, setInvoiceInfo] = useState(null);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accounts, info] = await Promise.all([
          invoiceSettingsApi.getBankAccounts(),
          invoiceSettingsApi.getInvoiceInfo()
        ]);
        setBankAccounts(Array.isArray(accounts) ? accounts : []);
        setInvoiceInfo(info);
      } catch (error) {
        console.error('Failed to load settings data:', error);
      }
    };
    loadData();
  }, []);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Order Confirmed <span className="text-primary-600">.</span></h1>
        <p className="text-base text-gray-400 font-medium">
          Thank you for your purchase. We've sent a confirmation email to <span className="text-gray-900 font-bold">{currentOrder.customerEmail}</span>
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Order Details */}
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Order Reference</span>
                <span className="font-black text-gray-900">#{currentOrder.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Placed On</span>
                <span className="font-bold text-gray-700">
                  {new Date(currentOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Payment</span>
                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                  <CreditCard className="w-3.5 h-3.5" />
                  {currentOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                    currentOrder.paymentMethod === 'store_pickup' ? 'Store Pickup (Pay at Counter)' : 'Bank Transfer'}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentOrder.orderStatus === 'pending_payment'
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                  : currentOrder.orderStatus === 'processing'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                  {currentOrder.orderStatus === 'pending_payment' ? 'Pending Payment' :
                    currentOrder.orderStatus === 'processing' ? 'Processing' :
                      currentOrder.orderStatus === 'shipped' && currentOrder.paymentMethod === 'store_pickup' ? 'Ready for Pickup' :
                        currentOrder.orderStatus === 'shipped' ? 'Shipped' :
                          currentOrder.orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              {currentOrder.paymentMethod === 'store_pickup' ? 'Pickup At' : 'Shipping To'}
            </h2>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 space-y-3">
              {currentOrder.paymentMethod === 'store_pickup' ? (
                <>
                  <div className="flex items-start gap-3">
                    <Store className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="font-bold text-gray-900 text-sm">{invoiceInfo?.business_name || 'Our Store'}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {invoiceInfo?.business_address || 'Address loading...'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 pt-1">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-500 font-medium text-xs">{invoiceInfo?.phone_number}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="font-bold text-gray-900 text-sm">{currentOrder.customerName}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-500 font-medium text-xs">{currentOrder.customerEmail}</p>
                  </div>
                  {currentOrder.customerPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-500 font-medium text-xs">{currentOrder.customerPhone}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">{currentOrder.customerAddress}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-100 pt-10">
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Items Ordered
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {currentOrder.items.map((item, index) => {
              // Try to find color info if available from product (might need to match by ID)
              const selectedColor = item.product?.colors?.find(c => c.id === item.selectedColorId);
              const itemImage = selectedColor?.productImageInColor || item.productImage || (item.product?.media && item.product?.media[0]);

              return (
                <div key={index} className="flex gap-5 p-4 bg-gray-50/30 border border-gray-100 rounded-2xl group transition-all">
                  <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                    <img
                      src={getImageUrl(itemImage)}
                      alt={item.productName}
                      className="w-full h-full object-cover mix-blend-multiply p-1"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate text-base">{item.productName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.selectedSize && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-gray-100 text-gray-500 text-[10px] font-bold">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {selectedColor && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-gray-100 text-gray-500 text-[10px] font-bold">
                            <div className="w-2 h-2 rounded-full ring-1 ring-gray-100" style={{ backgroundColor: selectedColor.colorCode }} />
                            {selectedColor.name}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[10px] font-bold">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">
                        LKR {Number(item.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        LKR {Number(item.unitPrice).toLocaleString()} per unit
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-100 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="mb-4 md:mb-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Final Settlement</span>
              <h3 className="text-lg font-black">Grand Total</h3>
            </div>
            <div className="text-center md:text-right">
              <span className="text-3xl font-black text-white block">
                LKR {currentOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {currentOrder.deliveryCharge > 0 && (
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Included Delivery Charges</p>
              )}
            </div>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {currentOrder.paymentMethod === 'bank_transfer' && currentOrder.orderStatus === 'pending_payment' && (
          <div className="border-t pt-6 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Complete Your Payment
              </h3>
              {(() => {
                const defaultBank = bankAccounts.find(b => b.is_default) || bankAccounts[0];
                if (!defaultBank) return (
                  <p className="text-sm text-blue-700">Loading bank details...</p>
                );
                return (
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Bank:</strong> {defaultBank.bank_name}</p>
                    <p><strong>Account Name:</strong> {defaultBank.account_holder_name}</p>
                    <p><strong>Account Number:</strong> {defaultBank.account_number}</p>
                    {defaultBank.branch_name && <p><strong>Branch:</strong> {defaultBank.branch_name}</p>}
                    <p><strong>Amount:</strong> LKR {currentOrder.totalAmount.toFixed(2)}</p>
                  </div>
                );
              })()}
              <p className="text-sm text-blue-700 mt-4">
                After making the transfer, please upload your receipt to complete the order.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="flex-1 py-4 bg-gray-50 text-gray-900 font-black rounded-2xl hover:bg-gray-100 transition-all text-center text-sm tracking-tight uppercase border border-gray-100">
            View Order History
          </Link>
          <Link to="/products" className="flex-1 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-primary-50 transition-all text-center text-sm tracking-tight uppercase border-2 border-gray-100 flex items-center justify-center gap-2 group">
            Continue Shopping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;