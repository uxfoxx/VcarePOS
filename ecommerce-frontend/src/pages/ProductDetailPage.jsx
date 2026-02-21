import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { showToast } from '../components/Common/Toast';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, detailLoading } = useSelector(state => state.products);

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const fallbackImage = "https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=600";

  const getImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Detect if URL is a video
  const isVideo = (url) => {
    if (!url) return false;
    return (
      url.startsWith('data:video/') ||
      url.toLowerCase().includes('.mp4') ||
      url.toLowerCase().includes('.webm') ||
      url.toLowerCase().includes('.mov')
    );
  };

  // Build complete gallery with all product images (excluding color selector images)
  const galleryImages = useMemo(() => {
    if (!currentProduct) return [];

    console.log('Building gallery for product:', {
      productId: currentProduct.id,
      productName: currentProduct.name,
      mainImage: currentProduct.image,
      mediaCount: currentProduct.media?.length || 0,
      media: currentProduct.media,
      colorsCount: currentProduct.colors?.length || 0,
      colors: currentProduct.colors?.map(c => ({
        id: c.id,
        name: c.name,
        image: c.productImageInColor,
        colorSelectorImage: c.colorSelectorImage
      }))
    });

    const images = [];
    const seen = new Set();

    const addImage = (url, source, variationId = null) => {
      if (!url || isVideo(url)) return;

      const fullUrl = getImageUrl(url);

      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        images.push({
          url: fullUrl,
          source,
          variationId,
          originalUrl: url
        });
        console.log(`Added image from ${source}:`, { url, fullUrl, variationId });
      }
    };

    // Add product main image first
    if (currentProduct.image) {
      addImage(currentProduct.image, 'main');
    }

    // Add all media images (non-videos)
    if (Array.isArray(currentProduct.media) && currentProduct.media.length > 0) {
      console.log(`Processing ${currentProduct.media.length} media items`);
      currentProduct.media.forEach((mediaUrl, index) => {
        console.log(`Media item ${index}:`, mediaUrl, 'isVideo:', isVideo(mediaUrl));
        if (!isVideo(mediaUrl)) {
          addImage(mediaUrl, 'media');
        }
      });
    }

    // Add all variation images (full-size product images in that color)
    // Note: colorSelectorImage is NOT added here - it's only for the selector thumbnail
    if (Array.isArray(currentProduct.colors) && currentProduct.colors.length > 0) {
      console.log(`Processing ${currentProduct.colors.length} color variations`);
      currentProduct.colors.forEach((variation, index) => {
        console.log(`Color ${index}:`, variation.name, 'image:', variation.productImageInColor);
        if (variation.productImageInColor) {
          addImage(variation.productImageInColor, 'variation', variation.id);
        }
      });
    }

    // If no images found, add fallback
    if (images.length === 0) {
      images.push({
        url: fallbackImage,
        source: 'fallback',
        variationId: null,
        originalUrl: fallbackImage
      });
    }

    console.log('Final gallery images:', images.length, images);
    return images;
  }, [currentProduct]);

  // Fetch product
  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id]);

  // Auto select first variation + size
  useEffect(() => {
    if (currentProduct?.colors?.length > 0) {
      const firstVariation = currentProduct.colors[0];
      setSelectedVariation(firstVariation);
      if (firstVariation.sizes?.length > 0) {
        setSelectedSize(firstVariation.sizes[0]);
      }
      // Also try to select its image if it exists
      const initialImageIndex = galleryImages.findIndex(img => img.variationId === firstVariation.id);
      if (initialImageIndex !== -1) {
        setSelectedImageIndex(initialImageIndex);
      }
    }
  }, [currentProduct, galleryImages]);

  // Max stock based on size or simple product
  const maxQuantity = selectedSize ? selectedSize.stock : currentProduct?.stock || 0;

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);

    // Automatically switch images when variation changes
    const variationImageIndex = galleryImages.findIndex(img => img.variationId === variation.id);
    if (variationImageIndex !== -1) {
      setSelectedImageIndex(variationImageIndex);
    }

    if (variation.sizes?.length > 0) {
      setSelectedSize(variation.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;

    if (currentProduct.colors?.length > 0) {
      if (!selectedVariation || !selectedSize) {
        toast.error("Please select variation and size");
        return;
      }

      if (selectedSize.stock < quantity) {
        toast.error("Insufficient stock for selected size");
        return;
      }
    } else {
      if (currentProduct.stock < quantity) {
        toast.error("Insufficient stock");
        return;
      }
    }

    dispatch(
      addToCart({
        product: currentProduct,
        quantity,
        selectedColorId: selectedVariation?.id,
        selectedSize: selectedSize?.name
      })
    );

    showToast({
      message: "Product added to cart",
      type: "success",
      toastId: `add-to-cart-${currentProduct.id}`
    });
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  // Loading
  if (detailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Product not found
  if (!currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8">This product does not exist.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Image Gallery */}
        <div className="space-y-6">
          {/* Main Image Display */}
          <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden group border border-gray-100/50 shadow-sm">
            <img
              src={imageError[selectedImageIndex] ? fallbackImage : currentImage?.url}
              alt={currentProduct.name}
              className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={() => handleImageError(selectedImageIndex)}
            />

            {/* Image Counter Badge */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-gray-200/50">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-md hover:shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-md hover:shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip - Always visible */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide py-1 px-1">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${selectedImageIndex === index
                    ? "ring-2 ring-primary-600 ring-offset-2 scale-100 shadow-md"
                    : "border border-gray-200 hover:border-primary-300 opacity-70 hover:opacity-100 scale-95 hover:scale-100"
                    }`}
                >
                  <img
                    src={imageError[index] ? fallbackImage : image.url}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover mix-blend-multiply bg-gray-50"
                    onError={() => handleImageError(index)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {currentProduct.name}
            </h1>

            {/* Price Prominence */}
            <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                LKR {currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.category && (
                <span className="mb-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {currentProduct.category}
                </span>
              )}
            </div>

          </div>

          {/* Product Configurations Block */}
          <div className="space-y-8 py-8 pr-2">

            {/* Variation Selection with Circular Swatches */}
            {currentProduct.colors?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Color</h3>
                  <span className="text-sm font-medium text-gray-500">
                    {selectedVariation?.name || 'Select a color'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {currentProduct.colors.map((variation) => {
                    const selectorImageUrl = variation.colorSelectorImage
                      ? getImageUrl(variation.colorSelectorImage)
                      : null;
                    const isSelected = selectedVariation?.id === variation.id;

                    return (
                      <button
                        key={variation.id}
                        onClick={() => handleVariationChange(variation)}
                        className={`group relative rounded-full transition-all duration-300 focus:outline-none ${isSelected ? 'ring-2 ring-primary-600 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                          }`}
                      >
                        {/* Selector Thumbnail */}
                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-200">
                          {selectorImageUrl ? (
                            <>
                              <img
                                src={selectorImageUrl}
                                alt={variation.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div
                                style={{ display: 'none', backgroundColor: variation.colorCode || '#ccc' }}
                                className="w-full h-full"
                              />
                            </>
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: variation.colorCode || '#E5E7EB' }}
                            />
                          )}
                        </div>
                        {/* Hover Tooltip */}
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                          {variation.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection as Aesthetic Pills */}
            {selectedVariation?.sizes?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedVariation.sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    const isOutOfStock = size.stock === 0;

                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 overflow-hidden ${isSelected
                          ? "bg-gray-900 text-white shadow-md transform scale-[1.02]"
                          : isOutOfStock
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {size.name}
                          {!isOutOfStock && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                              }`}>
                              {size.stock} left
                            </span>
                          )}
                        </span>
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-px bg-gray-400 transform -rotate-12"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector as Capsule */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quantity</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 focus:outline-none"
                  >
                    <span className="text-xl font-medium leading-none mb-1">-</span>
                  </button>

                  <span className="w-12 text-center text-base font-semibold text-gray-900">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none focus:outline-none"
                  >
                    <span className="text-xl font-medium leading-none mb-0.5">+</span>
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {maxQuantity > 0 ? (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      In Stock ({maxQuantity} available)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-500">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Out of Stock
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Fast Action Primary Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={maxQuantity === 0}
              className={`py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 transform shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgb(0,0,0,0.18)] flex items-center justify-center gap-2 ${maxQuantity === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:translate-y-0 hover:shadow-none'
                : 'bg-[#0E72BD] text-white hover:bg-[#0b5c99]'
                }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {maxQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/products")}
              className="py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 bg-white"
            >
              Continue Shopping
            </button>
          </div>

          {/* Collapsible/Minimal Detail Footer */}
          <div className="mt-4 pt-10 space-y-10 border-t border-gray-100">
            {/* Description Block */}
            {currentProduct.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Description</h3>
                <div className="pt-1">
                  <div
                    className={`text-gray-600 text-[15px] leading-relaxed opacity-90 transition-all duration-300 relative ${!isDescriptionExpanded ? 'max-h-24 overflow-hidden before:absolute before:bottom-0 before:left-0 before:w-full before:h-12 before:bg-gradient-to-t before:from-white before:to-transparent' : ''
                      }`}
                  >
                    {currentProduct.description}
                  </div>

                  {currentProduct.description.length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-sm font-semibold text-[#0E72BD] hover:text-[#0b5c99] focus:outline-none flex items-center gap-1 transition-colors"
                    >
                      {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Specifications Block */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentProduct.barcode && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="block text-gray-500 text-xs mb-1">SKU</span>
                    <span className="font-semibold text-gray-900">{currentProduct.barcode}</span>
                  </div>
                )}
                {currentProduct.weight && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="block text-gray-500 text-xs mb-1">Weight</span>
                    <span className="font-semibold text-gray-900">{currentProduct.weight} kg</span>
                  </div>
                )}
                {currentProduct.material && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="block text-gray-500 text-xs mb-1">Material</span>
                    <span className="font-semibold text-gray-900 whitespace-pre-wrap">{currentProduct.material}</span>
                  </div>
                )}
                {currentProduct.dimensions && (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                    <span className="block text-gray-500 text-xs mb-1">Dimensions</span>
                    <span className="font-semibold text-gray-900">{currentProduct.dimensions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
