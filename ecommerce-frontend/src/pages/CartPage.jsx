import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const fallbackImage = 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300';

const getImageUrl = (url) => {
  if (!url) return fallbackImage;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalAmount } = useSelector(state => state.cart);

  const handleRemoveItem = (productId, selectedColorId, selectedSize) => {
    dispatch(removeFromCart({ productId, selectedColorId, selectedSize }));
  };

  const handleUpdateQuantity = (productId, selectedColorId, selectedSize, quantity) => {
    dispatch(updateQuantity({ productId, selectedColorId, selectedSize, quantity }));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-12">
            <ShoppingBag className="w-12 h-12 text-primary-300" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 text-lg">Looks like you haven't added anything to your cart yet. Explore our latest collections!</p>
          <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl active:scale-95 gap-2">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Bag <span className="text-primary-600">.</span>
          </h1>
          <p className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span className="font-bold text-gray-900">{totalItems} items</span> in your bag
          </p>
        </div>
        <Link to="/products" className="group text-gray-400 font-bold hover:text-primary-600 flex items-center gap-2 transition-all text-xs">
          <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {items.map(item => {
                // Find selected color object if available
                const selectedColor = item.product.colors?.find(c => c.id === item.selectedColorId);
                // Fix: Use productImageInColor for color-specific images
                const itemImage = selectedColor?.productImageInColor || (item.product.media && item.product.media[0]) || item.product.image;

                return (
                  <div key={item.id} className="p-5 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-6 group hover:bg-gray-50/20 transition-all duration-300">
                    {/* Item Image */}
                    <Link to={`/products/${item.product.id}`} className="w-full sm:w-24 h-32 sm:h-24 bg-gray-50/50 rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-all duration-500 border border-gray-100/30">
                      {itemImage ? (
                        <img
                          src={getImageUrl(itemImage)}
                          alt={item.product.name}
                          className="w-full h-full object-cover mix-blend-multiply p-2 transform group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-primary-500/80 uppercase tracking-[0.2em]">
                              {item.product.category || 'Collection'}
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors cursor-pointer leading-tight">
                              <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                            </h3>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.selectedColorId, item.selectedSize)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-600 text-[10px] font-bold shadow-sm">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {selectedColor && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-600 text-[10px] font-bold shadow-sm">
                              <span
                                className="w-2.5 h-2.5 rounded-full ring-1 ring-gray-100 shadow-sm"
                                style={{ backgroundColor: selectedColor.colorCode }}
                              />
                              {selectedColor.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-50/50 border border-gray-100/50 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => handleUpdateQuantity(
                              item.product.id,
                              item.selectedColorId,
                              item.selectedSize,
                              Math.max(1, item.quantity - 1)
                            )}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-primary-600 transition-all shadow-none hover:shadow-sm disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                          {(() => {
                            let availableStock = item.product.stock || 0;
                            if (item.product.colors?.length > 0) {
                              const colorVariant = item.product.colors.find(c => c.id === item.selectedColorId);
                              if (colorVariant) {
                                const sizeVariant = colorVariant.sizes?.find(s => s.name === item.selectedSize);
                                if (sizeVariant) {
                                  availableStock = sizeVariant.stock;
                                }
                              }
                            }
                            const isMaxStock = item.quantity >= availableStock;

                            return (
                              <button
                                onClick={() => handleUpdateQuantity(
                                  item.product.id,
                                  item.selectedColorId,
                                  item.selectedSize,
                                  item.quantity + 1
                                )}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-none ${isMaxStock
                                  ? 'text-gray-200 cursor-not-allowed'
                                  : 'text-gray-400 hover:bg-white hover:text-primary-600 hover:shadow-sm'
                                  }`}
                                disabled={isMaxStock}
                                title={isMaxStock ? "Max stock reached" : "Increase quantity"}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            );
                          })()}
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <p className="text-xl font-black text-gray-900 tracking-tight">
                            LKR {(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            LKR {item.product.price.toLocaleString()} per unit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-gray-900 rounded-[1.5rem] shadow-xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/10 rounded-full -ml-12 -mb-12 blur-2xl" />

            <h2 className="text-lg font-black mb-6 relative">Summary</h2>

            <div className="space-y-6 relative">
              <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                <span>Subtotal ({totalItems} items)</span>
                <span className="text-white font-bold text-sm">LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                <span>Shipping</span>
                <span className="text-gray-400 font-bold italic">
                  Calculated at checkout
                </span>
              </div>

              <div className="pt-8 border-t border-gray-800 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-300">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white block">
                      LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 relative">
              <Link
                to="/checkout"
                className="w-full py-3.5 bg-white text-gray-900 font-black rounded-xl hover:bg-primary-50 transition-all shadow-[0_4px_20px_rgb(255,255,255,0.05)] active:scale-[0.98] text-center block text-sm tracking-tight"
              >
                Proceed to Checkout
              </Link>

              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Secured Payment</p>
                <div className="flex items-center justify-center gap-5 opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" alt="Visa" className="h-3" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                  <div className="h-4 w-px bg-gray-800 mx-1" />
                  <span className="text-[8px] font-black text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded uppercase">SSL</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;