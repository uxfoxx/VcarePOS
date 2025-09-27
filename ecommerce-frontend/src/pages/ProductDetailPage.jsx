import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { showToast } from '../components/Common/Toast';
import { Image, Tag } from 'antd';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, detailLoading } = useSelector(state => state.products);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(id));

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct) {
      // Auto-select first color if available
      if (currentProduct.colors && currentProduct.colors.length > 0) {
        setSelectedColor(currentProduct.colors[0]);
        // Auto-select first size of first color
        if (currentProduct.colors[0].sizes && currentProduct.colors[0].sizes.length > 0) {
          setSelectedSize(currentProduct.colors[0].sizes[0]);
        }
      }
    }
  }, [currentProduct]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Reset size selection when color changes
    if (color.sizes && color.sizes.length > 0) {
      setSelectedSize(color.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;

    // Check if product has colors/sizes and selections are made
    if (currentProduct.colors && currentProduct.colors.length > 0) {
      if (!selectedColor || !selectedSize) {
        alert('Please select color and size');
        return;
      }

      // Check stock for selected size
      if (selectedSize.stock < quantity) {
        alert('Insufficient stock for selected size');
        return;
      }
    } else {
      // Check stock for simple product
      if (currentProduct.stock < quantity) {
        alert('Insufficient stock');
        return;
      }
    }

    dispatch(addToCart({
      product: currentProduct,
      quantity,
      selectedColorId: selectedColor?.id,
      selectedSize: selectedSize?.name
    }));

    // Show success message or redirect to cart
    showToast({
      message: 'Product added to cart',
      type: 'success',
      toastId: `add-to-cart-${currentProduct.id}`
    })
  };

  if (detailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or is no longer available.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = [
    currentProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=600',
    ...(selectedColor?.image ? [selectedColor.image] : [])
  ];

  const maxQuantity = selectedSize ? selectedSize.stock : currentProduct.stock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-w-1 aspect-h-1 w-full mb-4">
            <img
              src={images[selectedImage]}
              alt={currentProduct.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full mb-2">
              {currentProduct.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentProduct.name}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              {currentProduct.description}
            </p>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-primary-600">
              LKR {currentProduct.price.toFixed(2)}
            </span>
          </div>

          {/* Color Selection */}
          {currentProduct.colors && currentProduct.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex space-x-3">
                {currentProduct.colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color)}
                    className={`flex items-center space-x-2 p-3 border rounded-lg ${selectedColor?.id === color.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.colorCode || '#f0f0f0' }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedColor.sizes.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    disabled={size.stock === 0}
                    className={`p-3 border rounded-lg text-center ${selectedSize?.id === size.id
                      ? 'border-primary-600 bg-primary-50'
                      : size.stock === 0
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-xs text-gray-600">
                      {size.stock === 0 ? 'Out of Stock' : `${size.stock} available`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-16 text-center font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
              <span className="text-sm text-gray-600">
                {maxQuantity} available
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${maxQuantity === 0
              ? 'bg-red-100 text-red-800'
              : maxQuantity <= 5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
              }`}>
              {maxQuantity === 0
                ? 'Out of Stock'
                : maxQuantity <= 5
                  ? 'Low Stock'
                  : 'In Stock'
              }
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={maxQuantity === 0 || (currentProduct.colors && currentProduct.colors.length > 0 && (!selectedColor || !selectedSize))}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg"
            >
              {maxQuantity === 0
                ? 'Out of Stock'
                : 'Add to Cart'
              }
            </button>

            <button
              onClick={() => navigate('/products')}
              className="w-full btn-secondary py-3"
            >
              Continue Shopping
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            {/* Other Media */}
            {currentProduct.media && Array.isArray(currentProduct.media) && currentProduct.media.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Media</h4>
                <div className="grid grid-cols-3 gap-4">
                  {currentProduct.media.map((mediaUrl, index) => {
                    const isVideo = mediaUrl.startsWith('data:video/') ||
                      mediaUrl.toLowerCase().includes('.mp4') ||
                      mediaUrl.toLowerCase().includes('.webm') ||
                      mediaUrl.toLowerCase().includes('.mov');

                    return (
                      <div key={index + 1} className="relative w-full h-full bg-gray-100 rounded overflow-hidden">
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            width={200}
                            height={150}
                            className="object-cover rounded-lg"
                            controls
                            style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image
                            src={mediaUrl}
                            alt={`${currentProduct.name} ${index + 2}`}
                            className="object-cover"
                            preview={true}
                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Image
                src={currentProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                alt={currentProduct.name}
                width={200}
                height={150}
                className="object-cover rounded-lg"
                preview={false}
                style={{ aspectRatio: '4/3', objectFit: 'cover' }}
              />
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{currentProduct.barcode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{currentProduct.category}</span>
              </div>
              {selectedSize && selectedSize.dimensions && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">
                    {selectedSize.dimensions.length}×{selectedSize.dimensions.width}×{selectedSize.dimensions.height} {selectedSize.dimensions.unit}
                  </span>
                </div>
              )}
              {selectedSize && selectedSize.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{selectedSize.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;