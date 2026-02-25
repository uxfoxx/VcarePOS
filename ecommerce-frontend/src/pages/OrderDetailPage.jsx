import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Package, MapPin, CreditCard, ChevronRight, Store, Phone, Mail, User } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ordersApi, invoiceSettingsApi } from '../api/apiClient';
import EcommerceInvoiceModal from '../components/Orders/EcommerceInvoiceModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    if (path.startsWith('uploads')) return `${API_URL}/${path}`;
    return `${API_URL}/uploads/${path}`;
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const { customer } = useSelector(state => state.auth);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceInfo, setInvoiceInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [orderRes, infoRes] = await Promise.all([
                    ordersApi.getById(orderId),
                    invoiceSettingsApi.getInvoiceInfo().catch(() => null)
                ]);
                setOrder(orderRes);
                setInvoiceInfo(infoRes);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId && customer) {
            fetchData();
        }
    }, [orderId, customer]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending_payment': return 'Pending Payment';
            case 'processing': return 'Processing';
            case 'shipped': return 'Shipped';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-500">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-[1000px] mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-600 mb-8">{error || "We couldn't find the order you're looking for."}</p>
                <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to My Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-gray-500 mb-6 space-x-2">
                <Link to="/profile" className="hover:text-primary-600 transition-colors">Profile</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/orders" className="hover:text-primary-600 transition-colors">My Orders</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">Order #{order.id}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                    <p className="text-gray-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        View Invoice
                    </button>
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${getStatusColor(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-500" />
                                Items Ordered ({order.items?.length || 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item, index) => (
                                <div key={index} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                                        {item.productImage || item.color_image ? (
                                            <img
                                                src={getImageUrl(item.productImage || item.color_image)}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                            {item.productName}
                                        </h3>

                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900">LKR {Number(item.unitPrice).toFixed(2)}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2">
                                                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                                {(item.selectedSize || item.colorName) && (
                                                    <div className="flex items-center gap-3">
                                                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                                        {item.selectedSize && item.colorName && <span className="text-gray-300">|</span>}
                                                        {item.colorName && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span>Color:</span>
                                                                {item.colorCode && (
                                                                    <span
                                                                        className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm block"
                                                                        style={{ backgroundColor: item.colorCode }}
                                                                    />
                                                                )}
                                                                <span className="text-gray-700">{item.colorName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className="text-right sm:w-32 flex flex-col justify-center border-t sm:border-t-0 pt-4 sm:pt-0">
                                        <p className="text-sm text-gray-500 mb-1">Total</p>
                                        <p className="text-lg font-bold text-primary-600">
                                            LKR {Number(item.totalPrice).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals Footer */}
                        <div className="bg-gray-50 p-6 border-t border-gray-200">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>LKR {Number(order.totalAmount - (order.deliveryCharge || 0)).toFixed(2)}</span>
                                </div>
                                {order.deliveryCharge > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span>LKR {Number(order.deliveryCharge).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                                    <span>Total Amount</span>
                                    <span className="text-primary-600">LKR {Number(order.totalAmount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Shipping & Billing */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            {order.paymentMethod === 'store_pickup' ? (
                                <Store className="w-5 h-5 text-gray-400" />
                            ) : (
                                <MapPin className="w-5 h-5 text-gray-400" />
                            )}
                            <h2 className="text-base font-bold text-gray-900">
                                {order.paymentMethod === 'store_pickup' ? 'Pickup Details' : 'Shipping Details'}
                            </h2>
                        </div>
                        <div className="p-5">
                            {order.paymentMethod === 'store_pickup' ? (
                                <>
                                    <p className="font-semibold text-gray-900 mb-2">{invoiceInfo?.business_name || 'Our Store'}</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-4">
                                        {invoiceInfo?.business_address || 'Address loading...'}
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Phone: <span className="font-medium text-gray-900">{invoiceInfo?.phone_number}</span></p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-gray-900 mb-2">{order.customerName}</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-4">
                                        {order.customerAddress}
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Phone: <span className="font-medium text-gray-900">{order.customerPhone}</span></p>
                                        <p>Email: <span className="font-medium text-gray-900">{order.customerEmail}</span></p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h2 className="text-base font-bold text-gray-900">Payment Information</h2>
                        </div>
                        <div className="p-5">
                            <p className="font-medium text-gray-900 mb-1">
                                {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                                    order.paymentMethod === 'store_pickup' ? 'Store Pickup (Pay at Counter)' : 'Bank Transfer'}
                            </p>
                            {order.paymentMethod === 'bank_transfer' && order.orderStatus === 'pending_payment' && (
                                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800 font-medium">Awaiting payment verification</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EcommerceInvoiceModal
                order={order}
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
            />
        </div>
    );
};

export default OrderDetailPage;
