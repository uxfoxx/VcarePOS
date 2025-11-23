import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { showToast } from '../components/Common/Toast';
import { Image } from 'antd';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, detailLoading } = useSelector(state => state.products);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product
  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id]);

  // Auto select color + size
  useEffect(() => {
    if (currentProduct?.colors?.length > 0) {
      setSelectedColor(currentProduct.colors[0]);
      if (currentProduct.colors[0].sizes?.length > 0) {
        setSelectedSize(currentProduct.colors[0].sizes[0]);
      }
    }
  }, [currentProduct]);

  // Detect video
  const isVideo = (url) => {
    if (!url) return false;
    return (
      url.startsWith('data:video/') ||
      url.toLowerCase().includes('.mp4') ||
      url.toLowerCase().includes('.webm') ||
      url.toLowerCase().includes('.mov')
    );
  };

  // Find first image from media[]
  const getFirstImageFromMedia = (mediaList) => {
    if (!Array.isArray(mediaList)) return null;
    const firstImage = mediaList.find(url => !isVideo(url));
    return firstImage ? `https://vcaresl.com/api${firstImage}` : null;
  };

  const fallbackImage =
    "https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=600";

  const firstMediaImage = getFirstImageFromMedia(currentProduct?.media);

  // MAIN DISPLAY IMAGE PRIORITY:
  // 1. First image from media[]
  // 2. Selected color image
  // 3. Product image
  // 4. Fallback
  const currentImage =
    firstMediaImage ||
    selectedColor?.image ||
    currentProduct?.image ||
    fallbackImage;

  // Thumbnails list
  const images = [
    currentImage,
    ...(selectedColor?.image ? [selectedColor.image] : [])
  ];

  // Max stock based on size or simple product
  const maxQuantity = selectedSize ? selectedSize.stock : currentProduct?.stock || 0;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (color.sizes?.length > 0) {
      setSelectedSize(color.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;

    if (currentProduct.colors?.length > 0) {
      if (!selectedColor || !selectedSize) return alert("Please select color and size");

      if (selectedSize.stock < quantity)
        return alert("Insufficient stock for selected size");
    } else {
      if (currentProduct.stock < quantity)
        return alert("Insufficient stock");
    }

    dispatch(
      addToCart({
        product: currentProduct,
        quantity,
        selectedColorId: selectedColor?.id,
        selectedSize: selectedSize?.name
      })
    );

    showToast({
      message: "Product added to cart",
      type: "success",
      toastId: `add-to-cart-${currentProduct.id}`
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Images */}
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
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-primary-600" : "border-gray-200"
                    }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {currentProduct.name}
          </h1>
          <p className="text-gray-600 text-lg mb-6">{currentProduct.description}</p>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-primary-600">
              LKR {currentProduct.price.toFixed(2)}
            </span>
          </div>

          {/* Color Selection */}
          {currentProduct.colors?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex space-x-3">
                {currentProduct.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color)}
                    className={`flex items-center space-x-2 p-3 border rounded-lg ${selectedColor?.id === color.id
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200"
                      }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedColor?.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedColor.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    disabled={size.stock === 0}
                    className={`p-3 border rounded-lg text-center ${selectedSize?.id === size.id
                      ? "border-primary-600 bg-primary-50"
                      : size.stock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200"
                      }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-xs">
                      {size.stock === 0 ? "Out of Stock" : `${size.stock} available`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-full"
              >
                -
              </button>

              <span className="w-16 text-center text-lg">{quantity}</span>

              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="w-10 h-10 border rounded-full disabled:opacity-50"
              >
                +
              </button>

              <span className="text-sm text-gray-600">{maxQuantity} available</span>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={maxQuantity === 0}
            className="w-full btn-primary py-3 mb-4 disabled:opacity-50"
          >
            {maxQuantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            onClick={() => navigate("/products")}
            className="w-full btn-secondary py-3"
          >
            Continue Shopping
          </button>

          {/* Media Section */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Product Media</h3>

            {currentProduct.media?.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {currentProduct.media.map((url, index) => {
                  const video = isVideo(url);
                  return (
                    <div key={index} className="rounded overflow-hidden">
                      {video ? (
                        <video
                          src={`https://vcaresl.com/api${url}`}
                          controls
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <Image
                          src={`https://vcaresl.com/api${url}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Image
                src={currentProduct.image || fallbackImage}
                width={200}
                className="object-cover rounded-lg"
              />
            )}

            <div className="space-y-2 text-sm mt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span>{currentProduct.barcode || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span>{currentProduct.category}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
