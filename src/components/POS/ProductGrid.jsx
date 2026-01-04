import React, { useState, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Space,
  Select,
  Input,
  message,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { ProductCard } from '../common/ProductCard';
import { ActionButton } from '../common/ActionButton';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CustomProductModal } from './CustomProductModal';
import { ProductAddonsModal } from './ProductAddonsModal';
import { ColorAndSizeSelectionModal } from './ColorAndSizeSelectionModal';
import { addToCart } from '../../features/cart/cartSlice';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { BARCODE_SCANNER_CONFIG, DEFAULT_SCANNER_OPTIONS } from '../../config/barcodeConfig';

const { Option } = Select;
const { Search } = Input;

export function ProductGrid({ collapsed }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.productsList);
  const categories = useSelector(state => state.categories.categoriesList);
  const loading = useSelector(state => state.products.loading || state.categories.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showColorSizeModal, setShowColorSizeModal] = useState(false);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);

  // Barcode scanner functionality
  const findProductByBarcode = useCallback((barcode) => {
    if (!Array.isArray(products)) return null;

    // Search for product by barcode (including variants)
    return products.find(product =>
      product.barcode === barcode ||
      product.sku === barcode ||
      (product.variants && product.variants.some(variant =>
        variant.barcode === barcode || variant.sku === barcode
      ))
    );
  }, [products]);

  const handleAddToCart = useCallback((product) => {
    if (product.colors && product.colors.length > 0) {
      // Show color and size selection modal
      setSelectedProduct(product);
      setShowColorSizeModal(true);
    } else if (product.isCustom) {
      dispatch(addToCart({ product }));
    } else {
      setSelectedProduct(product);
      setShowAddonsModal(true);
    }
  }, [dispatch]);

  const handleBarcodeScanned = useCallback((barcode) => {
    console.log('Barcode scanned:', barcode);

    const product = findProductByBarcode(barcode);

    if (product) {
      message.success(`Product found: ${product.name}`);
      handleAddToCart(product);
    } else {
      message.warning(`No product found with barcode: ${barcode}`);
    }
  }, [findProductByBarcode, handleAddToCart]);

  const handleScannerError = useCallback((error) => {
    console.error('Barcode scanner error:', error);
    message.error('Barcode scanner error: ' + error.message);
  }, []);

  // Toggle scanner on/off
  const toggleScanner = useCallback(() => {
    setIsScannerActive(prev => {
      const newState = !prev;
      if (newState) {
        message.success('Barcode scanner activated');
      } else {
        message.info('Barcode scanner deactivated');
      }
      return newState;
    });
  }, []);

  // Initialize barcode scanner (only active when button is pressed)
  const { status: scannerStatus } = useBarcodeScanner({
    ...DEFAULT_SCANNER_OPTIONS,
    enabled: isScannerActive && BARCODE_SCANNER_CONFIG.ENABLED,
    onScan: handleBarcodeScanned,
    onError: handleScannerError
  });

  React.useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle ESC key to exit scanner mode
  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isScannerActive) {
        toggleScanner();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isScannerActive, toggleScanner]);

  // Get categories from state, including only active ones
  const activeCategories = Array.isArray(categories) ? categories.filter(cat => cat?.isActive) : [];
  const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];

  // Filter products
  const filteredProducts = Array.isArray(products) ? products
    .filter(product => {
      // Skip variants as they'll be shown through their parent product
      if (product.isVariant) return false;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) : [];

  const handleColorAndSizeSelected = (selectedColor, selectedSize, _selectedSizeData) => {
    // Close color/size modal
    setShowColorSizeModal(false);

    // Create product with selected color and size
    const productWithColorAndSize = {
      ...selectedProduct,
      selectedColorId: selectedColor.id,
      selectedColor: selectedColor,
      selectedSize: selectedSize.name,
      selectedSizeData: selectedSize,
      // Use the raw materials from the selected color
      rawMaterials: selectedSize?.rawMaterials || []
    };

    // Show addons modal for the selected color/size combination
    setSelectedProduct(productWithColorAndSize);
    setShowAddonsModal(true);
  };

  const handleAddToCartWithAddons = (productWithAddons, quantity = 1) => {
    dispatch(addToCart({
      product: productWithAddons,
      quantity,
      selectedColorId: productWithAddons.selectedColorId,
      selectedSize: productWithAddons.selectedSize,
      addons: productWithAddons.addons
    }));

    // Show success notification with product details
    message.success({
      content: (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Added to cart!</p>
            <p className="text-sm text-gray-600">
              {productWithAddons.name}
              {productWithAddons.selectedSize && ` - Size: ${productWithAddons.selectedSize}`}
              {productWithAddons.selectedColor && ` - ${productWithAddons.selectedColor.name}`}
            </p>
            {quantity > 1 && <p className="text-xs text-gray-500">Quantity: {quantity}</p>}
          </div>
        </div>
      ),
      duration: 3,
      className: 'custom-cart-notification',
      style: {
        marginTop: '60px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }
    });
  };

  const handleAddCustomProduct = (customProduct) => {
    addToCart(customProduct);
  };

  // Determine grid columns based on sidebar state
  const getColSpan = () => {
    if (collapsed) {
      // When collapsed, show 4 products per row
      return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    } else {
      // When expanded, show 3 products per row
      return { xs: 24, sm: 12, md: 8, lg: 8, xl: 8 };
    }
  };

  if (loading) {
    return (
      <Card
        className="h-full"
        // bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
        styles={{
          body: { padding: 0, height: 'calc(100vh - 200px)' }
        }}
      >
        <div className="p-4">
          <LoadingSkeleton type="product-grid" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="h-full"
        // bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
        styles={{
          body: { padding: 0, height: 'calc(100vh - 200px)' }
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold m-0">Products</h2>
              {/* Scanner status indicator */}
              {BARCODE_SCANNER_CONFIG.ENABLED && (
                <div className="text-sm text-gray-500 mt-1">
                  Scanner: <span className={`font-medium ${
                    isScannerActive
                      ? (scannerStatus === 'idle' ? 'text-green-600' :
                         scannerStatus === 'scanning' ? 'text-blue-600' :
                         scannerStatus === 'processing' ? 'text-yellow-600' :
                         scannerStatus === 'error' ? 'text-red-600' :
                         'text-gray-600')
                      : 'text-gray-400'
                    }`}>
                    {isScannerActive ? scannerStatus : 'inactive'}
                  </span>
                </div>
              )}
            </div>
            <Space>
              <Search
                placeholder="Search by product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="w-80"
                size="large"
              />
              {/* Scan button to activate barcode scanner */}
              {BARCODE_SCANNER_CONFIG.ENABLED && (
                <ActionButton.Primary
                  size="large"
                  onClick={toggleScanner}
                  style={{
                    backgroundColor: isScannerActive ? '#52c41a' : undefined,
                    borderColor: isScannerActive ? '#52c41a' : undefined
                  }}
                  title={isScannerActive ? 'Click to deactivate scanner' : 'Click to activate scanner'}
                >
                  {isScannerActive ? 'Stop Scan' : 'Scan'}
                </ActionButton.Primary>
              )}
              <ActionButton.Primary
                size="large"
                icon="add"
                onClick={() => setShowCustomProductModal(true)}
              >
                Custom Product
              </ActionButton.Primary>
            </Space>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pt-4 border-b border-gray-200">
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-48"
            size="large"
          >
            {categoryNames.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="inventory_2"
              title="No Products Found"
              description={
                searchTerm ?
                  `No products found for "${searchTerm}"` :
                  selectedCategory === 'All' ?
                    'No products available' :
                    `No products found in "${selectedCategory}" category`
              }
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => (
                <Col key={product.id} {...getColSpan()}>
                  <ProductCard
                    product={{
                      ...product,
                      price: product.price,
                      hasColors: product.colors && product.colors.length > 0
                    }}
                    onAddToCart={handleAddToCart}
                    onClick={() => handleAddToCart(product)}
                    showDetails={true}
                    showPriceRange={false}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card>

      {/* Color and Size Selection Modal */}
      <ColorAndSizeSelectionModal
        open={showColorSizeModal}
        onClose={() => setShowColorSizeModal(false)}
        product={selectedProduct}
        onColorAndSizeSelected={handleColorAndSizeSelected}
      />

      {/* Custom Product Modal */}
      <CustomProductModal
        open={showCustomProductModal}
        onClose={() => setShowCustomProductModal(false)}
        onAddToCart={handleAddCustomProduct}
      />

      {/* Product Addons Modal */}
      <ProductAddonsModal
        open={showAddonsModal}
        onClose={() => setShowAddonsModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithAddons}
      />

      {/* Enhanced Scanner Mode Overlay */}
      {isScannerActive && BARCODE_SCANNER_CONFIG.ENABLED && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="text-center space-y-8 animate-fadeIn">
            {/* Scanner Icon with Pulse Animation */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-25 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="relative flex items-center justify-center w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                <svg
                  className="w-24 h-24 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Message */}
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-white">
                {scannerStatus === 'idle' && 'Ready to Scan'}
                {scannerStatus === 'scanning' && 'Scanning...'}
                {scannerStatus === 'processing' && 'Processing Barcode...'}
                {scannerStatus === 'error' && 'Scan Error'}
              </h2>
              <p className="text-xl text-gray-300">
                {scannerStatus === 'idle' && 'Point your scanner at a barcode'}
                {scannerStatus === 'scanning' && 'Reading barcode data'}
                {scannerStatus === 'processing' && 'Looking up product'}
                {scannerStatus === 'error' && 'Invalid barcode detected'}
              </p>
            </div>

            {/* Scanning Animation */}
            {scannerStatus === 'scanning' && (
              <div className="relative w-64 h-2 mx-auto bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 animate-slideRight"
                  style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }}
                ></div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2 text-gray-400">
              <p className="text-lg">Press <kbd className="px-3 py-1 bg-gray-700 text-white rounded-md font-mono text-sm">ESC</kbd> or click the button below to exit</p>
            </div>

            {/* Stop Button */}
            <button
              onClick={toggleScanner}
              className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              Stop Scanner
            </button>

            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                scannerStatus === 'idle' ? 'bg-green-500 animate-pulse' :
                scannerStatus === 'scanning' ? 'bg-blue-500 animate-pulse' :
                scannerStatus === 'processing' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`}></div>
              <span className="text-gray-300 uppercase tracking-wider">
                {scannerStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideRight {
          animation: slideRight 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}