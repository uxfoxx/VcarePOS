import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

const fallbackImage = 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300';

const getImageUrl = (url) => {
  if (!url) return fallbackImage;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Debug logging for product card rendering
  console.log('E-commerce ProductCard: Rendering product', {
    productId: product.id,
    productName: product.name,
    stock: product.stock,
    hasColors: product.colors && product.colors.length > 0,
    colorsCount: product.colors?.length || 0
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // For products with colors/sizes, redirect to product detail page
    if (product.colors && product.colors.length > 0) {
      navigate(`/products/${product.id}`);
      return;
    }

    // For simple products, add directly to cart
    dispatch(addToCart({
      product,
      quantity: 1,
      selectedColorId: null,
      selectedSize: null
    }));
  };


  const renderPrice = () => {
    return `LKR ${(product.price || 0).toFixed(2)}`;
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
      {/* Image Container with seamless overflow and hover scale */}
      <Link to={`/products/${product.id}`} className="relative block w-full overflow-hidden bg-gray-50/50" style={{ aspectRatio: '4/3' }}>
        <img
          src={(() => {
            if (product.media && Array.isArray(product.media) && product.media.length > 0) {
              const imageMedia = product.media.find(
                (m) =>
                  !m.startsWith('data:video/') &&
                  !m.toLowerCase().endsWith('.mp4') &&
                  !m.toLowerCase().endsWith('.webm') &&
                  !m.toLowerCase().endsWith('.mov')
              );
              if (imageMedia) {
                return getImageUrl(imageMedia);
              }
            }
            return getImageUrl(product.image) || fallbackImage;
          })()}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
          crossOrigin="anonymous"
        />

        {/* Minimal Category Pill */}
        {product.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-gray-800 shadow-sm border border-white/20">
              {product.category}
            </span>
          </div>
        )}

        {/* Minimal Stock Pill if Low or Out */}
        {product.stock <= 5 && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm border ${product.stock === 0
              ? 'bg-red-50/90 text-red-600 border-red-100'
              : 'bg-orange-50/90 text-orange-600 border-orange-100'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${product.stock === 0 ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`} />
              {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-5 space-y-4">
        <Link to={`/products/${product.id}`} className="flex-grow space-y-2 block">

          {/* Price Prominence Hierarchy */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              {renderPrice()}
            </span>
          </div>

          {/* Title & SKU */}
          <div className="space-y-1">
            <h3
              className="text-base font-semibold text-gray-800 leading-snug group-hover:text-[#0E72BD] transition-colors"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.name}
            </h3>
            {product.barcode && (
              <p className="text-xs font-mono text-gray-400">
                {product.barcode}
              </p>
            )}
          </div>
        </Link>

        {/* Variations & Secondary Action Row */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">

          {/* Color Swatches Replacement */}
          <div className="flex -space-x-1 hover:space-x-1 transition-all duration-300">
            {product.colors && product.colors.length > 0 ? (
              <>
                {product.colors.slice(0, 4).map((color, idx) => (
                  <div
                    key={color.id || idx}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: color.colorCode || '#E5E7EB' }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-500 ring-1 ring-black/5">
                    +{product.colors.length - 4}
                  </div>
                )}
              </>
            ) : (
              <div className="w-5 h-5 opacity-0" /> // Spacer to keep layout balanced if no colors
            )}
          </div>

          {/* Hidden Add to Cart / Select Button revealing on hover */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`
              inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold transition-all duration-300
              ${product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-[#0E72BD] hover:shadow-md hover:-translate-y-0.5 group-hover:bg-[#0E72BD]'
              }
            `}
          >
            {product.stock === 0 ? (
              <span className="text-xs">Out of Stock</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {product.colors && product.colors.length > 0 ? 'Select' : 'Add'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;