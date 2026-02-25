import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createOrder,
  uploadTemporaryReceipt,
  clearError,
  clearUploadedReceipt,
  clearCurrentOrder
} from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { deliveryChargesApi, invoiceSettingsApi } from '../api/apiClient';
import { toast } from 'react-toastify';
import { Package, ShoppingBag, Store, FileText, X, ShieldCheck, RotateCcw } from 'lucide-react';
import TermsContent from '../components/Ecommerce/Policies/TermsContent';
import PrivacyPolicyContent from '../components/Ecommerce/Policies/PrivacyPolicyContent';
import RefundPolicyContent from '../components/Ecommerce/Policies/RefundPolicyContent';

const fallbackImage = 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300';

const getImageUrl = (url) => {
  if (!url) return fallbackImage;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector(state => state.cart);
  const { customer } = useSelector(state => state.auth);
  const {
    loading,
    error,
    currentOrder,
    uploadingTempReceipt,
    tempReceiptError,
    uploadedReceiptDetails
  } = useSelector(state => state.orders);

  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: customer ? `${customer.firstName} ${customer.lastName}` : '',
    email: customer?.email || '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [tempReceiptFile, setTempReceiptFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loadingDeliverySettings, setLoadingDeliverySettings] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [policiesAccepted, setPoliciesAccepted] = useState({
    terms: false,
    privacy: false,
    refund: false
  });
  const [activePolicyModal, setActivePolicyModal] = useState(null); // 'terms', 'privacy', 'refund' or null

  useEffect(() => {
    // Scroll to top smoothly when step changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0 && !loading && !currentOrder) {
      navigate('/cart');
    }
  }, [currentOrder, items.length, loading, navigate]);

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
    dispatch(clearUploadedReceipt());
    dispatch(clearCurrentOrder())
  }, [dispatch]);

  useEffect(() => {
    const loadDeliverySettings = async () => {
      setLoadingDeliverySettings(true);
      try {
        const settings = await deliveryChargesApi.getActive();
        setDeliverySettings(settings);
      } catch (error) {
        console.error('Failed to load delivery settings:', error);
      } finally {
        setLoadingDeliverySettings(false);
      }
    };
    loadDeliverySettings();
  }, []);

  // Load bank accounts
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        const accounts = await invoiceSettingsApi.getBankAccounts();
        setBankAccounts(Array.isArray(accounts) ? accounts : []);
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
      }
    };
    loadBankAccounts();
  }, []);

  useEffect(() => {
    // Show success modal when order is created
    if (currentOrder && !loading) {
      setShowSuccessModal(true);
    }
  }, [currentOrder, loading]);

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Debug logging for checkout weight
  useEffect(() => {
    console.log('CheckoutPage: items with weights', items.map(item => ({
      name: item.product.name,
      qty: item.quantity,
      weight: item.product.weight,
      selectedSize: item.selectedSize,
      sizeWeight: item.product.colors?.find(c => c.id === item.selectedColorId)?.sizes?.find(s => s.name === item.selectedSize)?.weight
    })));
  }, [items]);

  // Calculate total cart weight
  const totalWeight = useMemo(() => {
    const calculatedWeight = items.reduce((sum, item) => {
      // Find weight based on specific variant or fallback to product weight
      let weight = parseFloat(item.product.weight || 0);

      if (item.selectedColorId && item.product.colors) {
        const color = item.product.colors.find(c => c.id === item.selectedColorId);
        if (color && item.selectedSize && color.sizes) {
          const size = color.sizes.find(s => s.name === item.selectedSize);
          if (size && size.weight) {
            weight = parseFloat(size.weight);
          }
        }
      }

      return sum + (weight * item.quantity);
    }, 0);
    console.log('CheckoutPage: totalWeight calculated', calculatedWeight);
    return calculatedWeight;
  }, [items]);

  // Filter active delivery settings for e-commerce
  const activeDeliverySettings = deliverySettings.filter(s => s.is_active);

  // Function to calculate delivery charge based on weight
  const calculateDeliveryCharge = (deliverySetting, weight) => {
    if (!deliverySetting) return 0;

    if (deliverySetting.type === 'free_delivery') {
      return 0;
    } else if (deliverySetting.type === 'inside_colombo') {
      return parseFloat(deliverySetting.inside_colombo_amount || 0);
    } else if (deliverySetting.type === 'out_of_colombo') {
      const baseWeight = parseFloat(deliverySetting.out_of_colombo_base_weight || 0);
      const baseAmount = parseFloat(deliverySetting.out_of_colombo_base_amount || 0);
      const perKgAmount = parseFloat(deliverySetting.out_of_colombo_per_kg_amount || 0);

      if (weight <= baseWeight) {
        return baseAmount;
      } else {
        const extraWeight = weight - baseWeight;
        return baseAmount + (extraWeight * perKgAmount);
      }
    }
    return 0;
  };

  const handleDeliveryTypeChange = (settingType) => {
    setSelectedDeliveryType(settingType);
    const setting = activeDeliverySettings.find(s => s.type === settingType);
    const charge = calculateDeliveryCharge(setting, totalWeight);
    setDeliveryCharge(charge);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      setTempReceiptFile(file);
    }
  };

  const handleUploadReceipt = () => {
    if (tempReceiptFile) {
      dispatch(uploadTemporaryReceipt({ file: tempReceiptFile }));
    }
  };

  const validateStep1 = () => {
    return customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.address.trim() &&
      selectedDeliveryType;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'bank_transfer' && !uploadedReceiptDetails) {
      toast.error('Please upload your bank transfer receipt before placing the order');
      return;
    }

    const selectedDeliverySetting = activeDeliverySettings.find(s => s.type === selectedDeliveryType);

    const orderData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      paymentMethod,
      items: items.map(item => ({
        productId: item.product.id,
        selectedColorId: item.selectedColorId,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
      })),
      deliveryLocation: paymentMethod === 'store_pickup' ? 'Store Pickup' : (selectedDeliverySetting?.type || null),
      deliveryType: paymentMethod === 'store_pickup' ? 'store_pickup' : (selectedDeliverySetting?.type || null),
      deliveryCharge: paymentMethod === 'store_pickup' ? 0 : (deliveryCharge || 0),
      totalWeight: totalWeight,
      terms_accepted: policiesAccepted.terms,
      privacy_policy_accepted: policiesAccepted.privacy,
      refund_policy_accepted: policiesAccepted.refund
    };

    if (!orderData.terms_accepted || !orderData.privacy_policy_accepted || !orderData.refund_policy_accepted) {
      toast.error('Please accept all policies before placing your order');
      return;
    }

    // Include receipt details if bank transfer
    if (paymentMethod === 'bank_transfer' && uploadedReceiptDetails) {
      orderData.receiptDetails = uploadedReceiptDetails;
    }

    dispatch(createOrder(orderData));
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/order-success/${currentOrder.id}`);
  };

  const steps = [
    { number: 1, title: 'Customer Information', completed: currentStep > 1 },
    { number: 2, title: 'Payment Method', completed: currentStep > 2 },
    { number: 3, title: 'Review & Place Order', completed: false },
  ];

  const PolicyModal = ({ type, onClose }) => {
    const getContent = () => {
      switch (type) {
        case 'terms':
          return {
            title: 'Terms & Conditions',
            icon: FileText,
            color: 'bg-gray-900',
            content: <TermsContent isModal={true} />
          };
        case 'privacy':
          return {
            title: 'Privacy Policy',
            icon: ShieldCheck,
            color: 'bg-blue-600',
            content: <PrivacyPolicyContent isModal={true} />
          };
        case 'refund':
          return {
            title: 'Refund & Return Policy',
            icon: RotateCcw,
            color: 'bg-primary-600',
            content: <RefundPolicyContent isModal={true} />
          };
        default:
          return null;
      }
    };

    const config = getContent();
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className={`${config.color} p-6 text-white flex justify-between items-center`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {config.content}
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const allPoliciesAccepted = policiesAccepted.terms && policiesAccepted.privacy && policiesAccepted.refund;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 text-gray-500'
                }`}>
                {step.completed ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      className="input-field"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleCustomerInfoChange}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      name="address"
                      value={customerInfo.address}
                      onChange={handleCustomerInfoChange}
                      rows={3}
                      className="input-field"
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>

                  {activeDeliverySettings.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Options
                      </label>
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          <span className="text-sm text-gray-600">Total Order Weight:</span>
                          <span className="text-sm font-semibold">{totalWeight.toFixed(2)} kg</span>
                        </div>
                      </div>

                      {loadingDeliverySettings ? (
                        <p className="text-sm text-gray-500">Loading delivery options...</p>
                      ) : (
                        <div className="space-y-3">
                          {/* No Delivery Option */}
                          {/* <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedDeliveryType === '' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="delivery"
                                value=""
                                checked={selectedDeliveryType === ''}
                                onChange={(e) => handleDeliveryTypeChange(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900">No Delivery</p>
                                    <p className="text-sm text-gray-600">Customer pickup</p>
                                  </div>
                                  <p className="font-semibold text-gray-900">Rs. 0.00</p>
                                </div>
                              </div>
                            </div>
                          </label> */}

                          {/* Delivery Options */}
                          {activeDeliverySettings.map((setting) => {
                            const charge = calculateDeliveryCharge(setting, totalWeight);
                            let displayName = '';
                            let description = '';

                            if (setting.type === 'free_delivery') {
                              displayName = 'Free Delivery';
                              description = 'Free delivery on all orders';
                            } else if (setting.type === 'inside_colombo') {
                              displayName = 'Inside Colombo';
                              description = 'Flat rate for Colombo area';
                            } else if (setting.type === 'out_of_colombo') {
                              displayName = 'Out of Colombo';
                              const baseWeight = parseFloat(setting.out_of_colombo_base_weight || 0);
                              const baseAmount = parseFloat(setting.out_of_colombo_base_amount || 0);
                              const perKgAmount = parseFloat(setting.out_of_colombo_per_kg_amount || 0);
                              description = `Rs. ${baseAmount.toFixed(2)} for first ${baseWeight} kg, then Rs. ${perKgAmount.toFixed(2)} per kg`;
                            }

                            return (
                              <label
                                key={setting.type}
                                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedDeliveryType === setting.type ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <div className="flex items-start">
                                  <input
                                    type="radio"
                                    name="delivery"
                                    value={setting.type}
                                    checked={selectedDeliveryType === setting.type}
                                    onChange={(e) => handleDeliveryTypeChange(e.target.value)}
                                    className="mt-1 mr-3"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">{displayName}</p>
                                        <p className="text-sm text-gray-600">{description}</p>
                                      </div>
                                      <p className="font-semibold text-blue-600">Rs. {charge.toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Delivery Charge Breakdown */}
                      {deliveryCharge > 0 && selectedDeliveryType && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-semibold text-blue-900 mb-2">Delivery Charge Breakdown</p>
                          {(() => {
                            const setting = activeDeliverySettings.find(s => s.type === selectedDeliveryType);
                            if (setting?.type === 'out_of_colombo') {
                              const baseWeight = parseFloat(setting.out_of_colombo_base_weight || 0);
                              const baseAmount = parseFloat(setting.out_of_colombo_base_amount || 0);
                              const perKgAmount = parseFloat(setting.out_of_colombo_per_kg_amount || 0);
                              const extraWeight = Math.max(0, totalWeight - baseWeight);

                              return (
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Base charge (up to {baseWeight} kg):</span>
                                    <span>Rs. {baseAmount.toFixed(2)}</span>
                                  </div>
                                  {extraWeight > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-700">Extra weight ({extraWeight.toFixed(2)} kg × Rs. {perKgAmount.toFixed(2)}):</span>
                                      <span>Rs. {(extraWeight * perKgAmount).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="pt-2 mt-2 border-t border-blue-300 flex justify-between font-semibold">
                                    <span className="text-blue-900">Total Delivery Charge:</span>
                                    <span className="text-blue-600">Rs. {deliveryCharge.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Flat Rate:</span>
                                <span className="font-semibold text-blue-600">Rs. {deliveryCharge.toFixed(2)}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!validateStep1()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay when your order is delivered to your doorstep
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span className="font-medium">Bank Transfer</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Transfer to our bank account and upload receipt
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="store_pickup"
                        checked={paymentMethod === 'store_pickup'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Store className="w-6 h-6 text-orange-600" />
                          <span className="font-medium">Store Pickup</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pick up your order from our store and pay on counter
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Place Order */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Customer Info Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Delivery Information</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {customerInfo.name}<br />
                    <strong>Email:</strong> {customerInfo.email}<br />
                    {customerInfo.phone && (
                      <>
                        <strong>Phone:</strong> {customerInfo.phone}<br />
                      </>
                    )}
                    <strong>Address:</strong> {customerInfo.address}<br />
                    {selectedDeliveryType && (
                      <>
                        <strong>Delivery Type:</strong> {
                          activeDeliverySettings.find(s => s.type === selectedDeliveryType)?.type === 'free_delivery' ? 'Free Delivery' :
                            activeDeliverySettings.find(s => s.type === selectedDeliveryType)?.type === 'inside_colombo' ? 'Inside Colombo' :
                              activeDeliverySettings.find(s => s.type === selectedDeliveryType)?.type === 'out_of_colombo' ? 'Out of Colombo' :
                                selectedDeliveryType
                        }<br />
                        <strong>Delivery Charge:</strong> Rs. {deliveryCharge.toFixed(2)}<br />
                        <strong>Total Weight:</strong> {totalWeight.toFixed(2)} kg
                      </>
                    )}
                  </p>
                </div>

                {/* Payment Method Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                      paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                        paymentMethod === 'store_pickup' ? 'Store Pickup' : paymentMethod}
                  </p>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Bank Transfer Details</h4>
                      {(() => {
                        const defaultBank = bankAccounts.find(b => b.is_default) || bankAccounts[0];
                        if (!defaultBank) return (
                          <p className="text-sm text-blue-700">Loading bank details...</p>
                        );
                        return (
                          <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>Bank:</strong> {defaultBank.bank_name}</p>
                            <p><strong>Account Name:</strong> {defaultBank.account_holder_name}</p>
                            <p><strong>Account Number:</strong> {defaultBank.account_number}</p>
                            {defaultBank.branch_name && <p><strong>Branch:</strong> {defaultBank.branch_name}</p>}
                            <p className="mt-2 text-blue-700">
                              Please transfer LKR {(totalAmount + deliveryCharge).toFixed(2)} and upload your receipt below.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Bank Transfer Receipt Upload */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Upload Bank Transfer Receipt</h3>

                    {tempReceiptError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <p className="text-sm text-red-800">{tempReceiptError}</p>
                      </div>
                    )}

                    {uploadedReceiptDetails ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-800 font-medium">Receipt uploaded successfully!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          File: {uploadedReceiptDetails.originalFilename} ({(uploadedReceiptDetails.fileSize / 1024).toFixed(2)} KB)
                        </p>
                        <button
                          onClick={() => {
                            dispatch(clearUploadedReceipt());
                            setTempReceiptFile(null);
                          }}
                          className="text-sm text-green-600 hover:text-green-800 mt-2"
                        >
                          Upload different receipt
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Receipt File *
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="input-field"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: JPEG, PNG, PDF (Max 5MB)
                          </p>
                        </div>

                        <button
                          onClick={handleUploadReceipt}
                          disabled={!tempReceiptFile || uploadingTempReceipt}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingTempReceipt ? (
                            <div className="flex items-center space-x-2">
                              <LoadingSpinner size="small" />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            'Upload Receipt'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Review */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-600" />
                    Review Items
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {items.map(item => {
                      const selectedColor = item.product.colors?.find(c => c.id === item.selectedColorId);
                      const itemImage = selectedColor?.productImageInColor || (item.product.media && item.product.media[0]) || item.product.image;

                      return (
                        <div key={item.id} className="flex gap-5 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100/50">
                            <img
                              src={getImageUrl(itemImage)}
                              alt={item.product.name}
                              className="w-full h-full object-cover mix-blend-multiply p-1"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <h4 className="font-bold text-gray-900 truncate text-base">{item.product.name}</h4>
                              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">{item.product.category || 'Collection'}</p>

                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.selectedSize && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                                {selectedColor && (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold">
                                    <span
                                      className="w-2 h-2 rounded-full ring-1 ring-white"
                                      style={{ backgroundColor: selectedColor.colorCode }}
                                    />
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
                                LKR {(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Policy Acceptance */}
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Policy Agreement</h4>
                  <div className="space-y-4">
                    {[
                      { id: 'terms', label: 'Terms & Conditions' },
                      { id: 'privacy', label: 'Privacy Policy' },
                      { id: 'refund', label: 'Refund & Return Policy' }
                    ].map((policy) => (
                      <div key={policy.id} className="flex items-start gap-3">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            id={`policy-${policy.id}`}
                            type="checkbox"
                            checked={policiesAccepted[policy.id]}
                            onChange={(e) => setPoliciesAccepted({
                              ...policiesAccepted,
                              [policy.id]: e.target.checked
                            })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          />
                        </div>
                        <div className="text-xs">
                          <label htmlFor={`policy-${policy.id}`} className="font-medium text-gray-700 cursor-pointer">
                            I have read and agree to the{' '}
                          </label>
                          <button
                            type="button"
                            onClick={() => setActivePolicyModal(policy.id)}
                            className="text-primary-600 font-bold hover:underline"
                          >
                            {policy.label}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || (paymentMethod === 'bank_transfer' && !uploadedReceiptDetails) || !allPoliciesAccepted}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="small" />
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      paymentMethod === 'bank_transfer' && !uploadedReceiptDetails
                        ? 'Upload Receipt First'
                        : 'Place Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50" />

            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 relative">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              Summary
            </h2>

            <div className="space-y-4 mb-6 relative max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {items.map(item => {
                const selectedColor = item.product.colors?.find(c => c.id === item.selectedColorId);
                const itemImage = selectedColor?.productImageInColor || (item.product.media && item.product.media[0]) || item.product.image;

                return (
                  <div key={item.id} className="flex gap-3 group">
                    <div className="w-12 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={getImageUrl(itemImage)}
                        alt={item.product.name}
                        className="w-full h-full object-cover mix-blend-multiply p-0.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-gray-900 truncate uppercase tracking-tight">{item.product.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Qty {item.quantity}</span>
                        {(item.selectedSize || selectedColor) && <span className="text-[9px] text-gray-300">•</span>}
                        {item.selectedSize && (
                          <span className="text-[9px] text-gray-500 font-bold uppercase">{item.selectedSize}</span>
                        )}
                        {selectedColor && (
                          <div
                            className="w-1.5 h-1.5 rounded-full border border-gray-200"
                            style={{ backgroundColor: selectedColor.colorCode }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] font-black text-primary-600 mt-0.5">
                        LKR {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3 relative">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Delivery</span>
                {paymentMethod === 'store_pickup' ? (
                  <span className="text-green-500 font-bold uppercase tracking-wider">Free</span>
                ) : selectedDeliveryType ? (
                  <span className="text-primary-600 font-bold italic">
                    LKR {deliveryCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="text-gray-400 font-bold italic">Pending Selection</span>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-gray-900 block leading-none">
                      LKR {(totalAmount + deliveryCharge).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">VAT Included</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 opacity-40">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Secure Checkout</p>
              <div className="flex gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" alt="Visa" className="h-2" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Order Placed Successfully!
              </h3>

              <p className="text-gray-600 mb-4">
                Your order #{currentOrder.id} has been placed successfully.
              </p>

              {paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Your bank transfer receipt has been uploaded and your order is being processed.
                    You will receive an email confirmation once your payment is verified and your order is ready for delivery.
                  </p>
                </div>
              )}

              <button
                onClick={handleCloseSuccessModal}
                className="w-full btn-primary"
              >
                View Order Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar for Easy Access */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 lg:hidden flex items-center justify-between gap-4 shadow-[0_-8px_30px_rgb(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Due</span>
          <span className="text-lg font-black text-gray-900 leading-none">LKR {(totalAmount + deliveryCharge).toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="px-4 py-3 bg-gray-50 text-gray-900 font-bold rounded-xl text-[10px] uppercase tracking-widest border border-gray-200"
            >
              Back
            </button>
          )}

          {currentStep === 1 ? (
            <button
              onClick={() => document.querySelector('form')?.requestSubmit()}
              className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
            >
              Continue
            </button>
          ) : currentStep === 2 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
            >
              Review
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={loading || (paymentMethod === 'bank_transfer' && !uploadedReceiptDetails) || !allPoliciesAccepted}
              className="px-6 py-3 bg-primary-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:bg-gray-200"
            >
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          )}
        </div>
      </div>

      {/* Spacer for sticky bottom bar */}
      <div className="h-20 lg:hidden" />

      {activePolicyModal && (
        <PolicyModal
          type={activePolicyModal}
          onClose={() => setActivePolicyModal(null)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;