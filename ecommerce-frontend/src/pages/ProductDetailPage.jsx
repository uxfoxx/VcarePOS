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

  const fallbackImage = "https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=600";

  // Helper function to properly construct image URLs
  const getImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      return `https://vcaresl.com/api${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
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

  // Build complete gallery with all product images
  const galleryImages = useMemo(() => {
    if (!currentProduct) return [];

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
      }
    };

    // Add product main image first
    if (currentProduct.image) {
      addImage(currentProduct.image, 'main');
    }

    // Add all media images (non-videos)
    if (Array.isArray(currentProduct.media)) {
      currentProduct.media.forEach(mediaUrl => {
        if (!isVideo(mediaUrl)) {
          addImage(mediaUrl, 'media');
        }
      });
    }

    // Add all variation images
    if (Array.isArray(currentProduct.colors)) {
      currentProduct.colors.forEach(variation => {
        if (variation.image) {
          addImage(variation.image, 'variation', variation.id);
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
      setSelectedVariation(currentProduct.colors[0]);
      if (currentProduct.colors[0].sizes?.length > 0) {
        setSelectedSize(currentProduct.colors[0].sizes[0]);
      }
    }
  }, [currentProduct]);

  // When variation changes, update the displayed image to that variation's image
  useEffect(() => {
    if (selectedVariation?.image && galleryImages.length > 0) {
      const variationImageIndex = galleryImages.findIndex(
        img => img.variationId === selectedVariation.id
      );
      if (variationImageIndex !== -1) {
        setSelectedImageIndex(variationImageIndex);
      }
    }
  }, [selectedVariation, galleryImages]);

  // Max stock based on size or simple product
  const maxQuantity = selectedSize ? selectedSize.stock : currentProduct?.stock || 0;

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
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
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden group">
            <img
              src={imageError[selectedImageIndex] ? fallbackImage : currentImage?.url}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
              onError={() => handleImageError(selectedImageIndex)}
            />

            {/* Image Counter Badge */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip - Always visible */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary-600 ring-2 ring-primary-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={imageError[index] ? fallbackImage : image.url}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProduct.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">{currentProduct.description}</p>
          </div>

          {/* Price */}
          <div className="border-t border-b py-4">
            <span className="text-3xl font-bold text-primary-600">
              LKR {currentProduct.price.toFixed(2)}
            </span>
          </div>

          {/* Variation Selection with Thumbnails */}
          {currentProduct.colors?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Variation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentProduct.colors.map((variation) => {
                  const variationImageUrl = getImageUrl(variation.image);
                  return (
                    <button
                      key={variation.id}
                      onClick={() => handleVariationChange(variation)}
                      className={`relative group p-3 border-2 rounded-lg transition-all hover:shadow-md ${
                        selectedVariation?.id === variation.id
                          ? "border-primary-600 bg-primary-50 ring-2 ring-primary-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Variation Thumbnail */}
                      {variation.image ? (
                        <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100">
                          <img
                            src={variationImageUrl}
                            alt={variation.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = fallbackImage;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-full border-4 border-white shadow-sm"
                            style={{ backgroundColor: variation.colorCode || '#ccc' }}
                          />
                        </div>
                      )}

                      {/* Variation Name */}
                      <div className="text-center">
                        <div className="font-medium text-sm truncate">{variation.name}</div>
                        {selectedVariation?.id === variation.id && (
                          <div className="text-xs text-primary-600 mt-1">Selected</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedVariation?.sizes?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedVariation.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    disabled={size.stock === 0}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedSize?.id === size.id
                        ? "border-primary-600 bg-primary-50 ring-2 ring-primary-200"
                        : size.stock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-xs mt-1">
                      {size.stock === 0 ? "Out of Stock" : `${size.stock} available`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border-2 border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl font-semibold">-</span>
                </button>

                <span className="px-6 py-2 text-lg font-medium border-x-2 border-gray-200 min-w-[60px] text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl font-semibold">+</span>
                </button>
              </div>

              <span className="text-sm text-gray-600">
                {maxQuantity} available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={maxQuantity === 0}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {maxQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full btn-secondary py-3 text-lg font-semibold"
            >
              Continue Shopping
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-3">
            <h3 className="text-lg font-semibold mb-3">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{currentProduct.barcode || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{currentProduct.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-medium ${maxQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {maxQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
