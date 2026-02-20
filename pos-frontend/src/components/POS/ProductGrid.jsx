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

  // Find product by exact SKU or barcode match (case-insensitive)
  const findProductByExactMatch = useCallback((searchValue) => {
    if (!searchValue || !Array.isArray(products)) return null;

    const normalizedSearch = searchValue.trim().toLowerCase();

    // Search for exact match in products and variants
    return products.find(product => {
      // Check main product SKU and barcode
      if (product.sku?.toLowerCase() === normalizedSearch ||
        product.barcode?.toLowerCase() === normalizedSearch) {
        return true;
      }

      // Check variants SKU and barcode
      if (product.variants && Array.isArray(product.variants)) {
        return product.variants.some(variant =>
          variant.sku?.toLowerCase() === normalizedSearch ||
          variant.barcode?.toLowerCase() === normalizedSearch
        );
      }

      return false;
    });
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

  // Handle search field submit (Enter key or search button click)
  const handleSearchSubmit = useCallback((value) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      // If empty, just update search term to show all products
      setSearchTerm('');
      return;
    }

    // Try to find exact match by SKU or barcode
    const exactMatch = findProductByExactMatch(trimmedValue);

    if (exactMatch) {
      // Found exact match - add to cart and clear search
      message.success({
        content: `Found and adding: ${exactMatch.name}`,
        duration: 2,
        style: { marginTop: '60px' }
      });
      handleAddToCart(exactMatch);
      setSearchTerm(''); // Clear search field after adding
    } else {
      // No exact match - keep search term to filter products
      setSearchTerm(trimmedValue);
    }
  }, [findProductByExactMatch, handleAddToCart]);

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
            </div>
            <Space>
              <Search
                id="product-search-input"
                placeholder="Search by product name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearchSubmit}
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