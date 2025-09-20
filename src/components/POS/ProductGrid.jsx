import React, { useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Modal,
  Row,
  Col,
  Space,
  Tag,
  Image,
  Select,
  Input,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { addToCart } from '../../features/cart/cartSlice';
import * as productsSlice from '../../features/products/productsSlice';
import { ProductCard } from '../common/ProductCard';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CustomProductModal } from './CustomProductModal';
import { ProductAddonsModal } from './ProductAddonsModal';
import { ColorAndSizeSelectionModal } from './ColorAndSizeSelectionModal';

const { Option } = Select;
const { Text, Title } = Typography;
const { Search } = Input;

export function ProductGrid({ collapsed, isScanning, toggleScanning }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.productsList);
  const scannedProduct = useSelector(state => state.products.scannedProduct);
  const productsLoading = useSelector(state => state.products.loading);
  const categories = useSelector(state => state.categories.categoriesList);
  const loading = useSelector(state => state.categories.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showColorSizeModal, setShowColorSizeModal] = useState(false);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);

  React.useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle scanned product
  React.useEffect(() => {
    if (scannedProduct) {
      // Check if product is out of stock
      if (scannedProduct.stock === 0) {
        message.error(`${scannedProduct.name} is out of stock`);
        dispatch(productsSlice.clearScannedProduct());
        toggleScanning(false);
        return;
      }
      
      // Show success message
      message.success(`Product scanned: ${scannedProduct.name}`);
      
      // Handle product based on its structure
      if (scannedProduct.colors && scannedProduct.colors.length > 0) {
        // Product has color/size variations - show selection modal
        setSelectedProduct(scannedProduct);
        setShowColorSizeModal(true);
      } else {
        // Simple product - show addons modal
        setSelectedProduct(scannedProduct);
        setShowAddonsModal(true);
      }
    }
  }, [scannedProduct, dispatch]);

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

  const handleAddToCart = (product) => {
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
  };

  const handleColorAndSizeSelected = (selectedColor, selectedSize, selectedSizeData) => {
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
    
    // Clear scanned product from Redux state after successful addition
    dispatch(productsSlice.clearScannedProduct());
    toggleScanning(false);
    
    // Show success message for scanned products
    if (productWithAddons.barcode) {
      message.success(`${productWithAddons.name} added to cart`);
    }
  };

  const handleAddCustomProduct = (customProduct) => {
    dispatch(addToCart({ product: customProduct }));
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

  if (loading || productsLoading) {
    return (
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
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
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold m-0">Products</h2>
              {isScanning && (
                <Text type="secondary" className="text-sm flex items-center mt-1">
                  <Icon name="qr_code_scanner" className="mr-1" />
                  <span className="text-green-600 font-medium">Barcode scanner active - scan any product to add to cart</span>
                </Text>
              )}
            </div>
            <Space>
              <ActionButton
                size="large"
                icon={isScanning ? "stop" : "qr_code_scanner"}
                onClick={() => toggleScanning(!isScanning)}
                type={isScanning ? "default" : "primary"}
                className={isScanning ? "border-red-500 text-red-600" : ""}
              >
                {isScanning ? 'Stop Scanning' : 'Scan Barcode'}
              </ActionButton>
              <Search
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="w-80"
                size="large"
              />
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
        onClose={() => {
          setShowColorSizeModal(false);
          // Clear scanned product if modal is closed without adding to cart
          if (scannedProduct) {
            dispatch(productsSlice.clearScannedProduct());
            toggleScanning(false);
          }
        }}
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
        onClose={() => {
          setShowAddonsModal(false);
          // Clear scanned product if modal is closed without adding to cart
          if (scannedProduct) {
            dispatch(productsSlice.clearScannedProduct());
            toggleScanning(false);
          }
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithAddons}
      />
    </>
  );
}