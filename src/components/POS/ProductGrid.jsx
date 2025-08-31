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
  message,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { ProductCard } from '../common/ProductCard';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CustomProductModal } from './CustomProductModal';
import { ProductAddonsModal } from './ProductAddonsModal';
import { ColorAndSizeSelectionModal } from './ColorAndSizeSelectionModal';
import { addToCart } from '../../features/cart/cartSlice';

const { Option } = Select;
const { Text, Title } = Typography;
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
  const [scannerInput, setScannerInput] = useState('');

  React.useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

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

  const handleBarcodeScan = (scannedValue) => {
    if (!scannedValue || !scannedValue.trim()) {
      return;
    }

    // Search for product by barcode/SKU
    const foundProduct = products.find(product => 
      product.barcode && product.barcode.toLowerCase() === scannedValue.toLowerCase()
    );

    if (foundProduct) {
      // Check if product is out of stock
      if (foundProduct.stock <= 0) {
        message.warning(`${foundProduct.name} is out of stock`);
        setScannerInput('');
        return;
      }

      // If product has color/size variations, show selection modal
      if (foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedProduct(foundProduct);
        setShowColorSizeModal(true);
        message.success(`Product found: ${foundProduct.name}. Please select color and size.`);
      } else {
        // Simple product without variations - add directly to cart
        dispatch(addToCart({ 
          product: foundProduct, 
          quantity: 1,
          selectedColorId: null,
          selectedSize: null
        }));
        message.success(`${foundProduct.name} added to cart!`);
      }
    } else {
      message.error(`No product found with barcode: ${scannedValue}`);
    }

    // Clear the scanner input
    setScannerInput('');
  };
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
              <Text type="secondary" className="text-sm">
                Scan barcode or search manually to add items to cart
              </Text>
            </div>
            <Space>
              <Search
                placeholder="Scan barcode or search by product name/SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setScannerInput(e.target.value);
                }}
                onSearch={(value) => {
                  setSearchTerm(value);
                  // If the search was triggered by Enter key and looks like a barcode scan
                  if (value && value.trim()) {
                    handleBarcodeScan(value.trim());
                  }
                }}
                onPressEnter={(e) => {
                  const value = e.target.value;
                  if (value && value.trim()) {
                    handleBarcodeScan(value.trim());
                  }
                }}
                className="w-80"
                size="large"
                enterButton={
                  <Button type="primary" icon={<Icon name="qr_code_scanner" />}>
                    Scan
                  </Button>
                }
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
    </>
  );
}