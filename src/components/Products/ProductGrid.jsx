import  { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Modal,
  Image,
  Tag,
  Select,
  Space,
  Typography,
  Input,
  Button
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { ProductCard } from '../common/ProductCard';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CustomProductModal } from './CustomProductModal';
import { ProductAddonsModal } from './ProductAddonsModal';

const { Option } = Select;
const { Text, Title } = Typography;
const { Search } = Input;

export function ProductGrid({ collapsed }) {
  const dispatch = useDispatch();
  const { productsList, loading: productsLoading, error: productsError } = useSelector(state => state.products);
  const { categoriesList, loading: categoriesLoading, error: categoriesError } = useSelector(state => state.categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);

  // Load products and categories from Redux
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Calculate loading state - show loading if still fetching OR if no data but no error
  const isLoading = productsLoading || categoriesLoading || 
    (!productsList.length && !productsError) ||
    (!categoriesList.length && !categoriesError);
  
  // Get categories from state, including only active ones
  const activeCategories = categoriesList?.filter(cat => cat.isActive) || [];
  const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];
  
  // Filter products with null safety
  const filteredProducts = (productsList || [])
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const handleAddToCart = (product) => {
    if (product.hasSizes) {
      // Show size selection modal
      setSelectedProduct(product);
      setSelectedSize(null);
      setShowDetailModal(true);
    } else if (product.isCustom) {
      // Add custom product directly
      dispatch(addToCart({ product }));
    } else {
      // Show addons modal for regular products
      setSelectedProduct(product);
      setShowAddonsModal(true);
    }
  };

  const handleAddToCartWithAddons = (productWithAddons, quantity = 1) => {
    // Add to cart with all necessary parameters
    dispatch(addToCart({ 
      product: productWithAddons, 
      quantity,
      selectedSize: productWithAddons.selectedSize,
      addons: productWithAddons.addons
    }));
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setShowDetailModal(true);
  };

  const handleSizeChange = (sizeName) => {
    setSelectedSize(sizeName);
  };

  const getSelectedSizeData = () => {
    if (!selectedProduct || !selectedProduct.hasSizes || !selectedSize) {
      return null;
    }
    
    return selectedProduct.sizes.find(size => size.name === selectedSize);
  };

  const handleAddSelectedSizeToCart = () => {
    const sizeData = getSelectedSizeData();
    if (sizeData && sizeData.stock > 0) {
      const productWithSize = {
        ...selectedProduct,
        price: sizeData.price,
        selectedSize: selectedSize,
        dimensions: sizeData.dimensions,
        weight: sizeData.weight
      };
      
      // Show addons modal for the selected size
      setShowDetailModal(false);
      setSelectedProduct(productWithSize);
      setShowAddonsModal(true);
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

  // Show error state if there are errors
  if (productsError || categoriesError) {
    return (
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4 flex items-center justify-center h-full">
          <EmptyState
            icon="error_outline"
            title="Failed to Load Products"
            description={productsError || categoriesError || "An error occurred while loading data"}
          />
        </div>
      </Card>
    );
  }

  if (isLoading) {
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

  const selectedSizeData = getSelectedSizeData();

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
            </div>
            <Space>
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
                      price: product.price // Price is already in LKR
                    }}
                    onAddToCart={handleAddToCart}
                    onClick={handleProductClick}
                    showDetails={true}
                    showPriceRange={product.hasSizes && product.sizes?.length > 1}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card>

      {/* Product Detail/Size Selection Modal */}
      <Modal
        title={null}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
          setSelectedSize(null);
        }}
        width={700}
        footer={null}
        closable={true}
        className="product-detail-modal"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <Title level={3}>{selectedProduct.name}</Title>
              <Text type="secondary" className="text-base">
                {selectedProduct.description}
              </Text>
            </div>
            
            {/* Product Image and Basic Info */}
            <div className="flex gap-6">
              <div className="w-1/3">
                <Image
                  src={selectedProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                  alt={selectedProduct.name}
                  className="w-full h-auto object-cover rounded-lg"
                  preview={false}
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </div>
              
              <div className="w-2/3">
                {/* Price and Stock */}
                <div className="mb-6">
                  <Title level={2} className="text-green-600 mb-2">
                    {selectedSizeData 
                      ? `LKR ${(selectedSizeData.price || 0).toFixed(2)}`
                      : selectedProduct.hasSizes
                        ? `From LKR ${Math.min(...(selectedProduct.sizes || []).map(s => s.price || 0) || [0]).toFixed(2)}`
                        : `LKR ${(selectedProduct.price || 0).toFixed(2)}`
                    }
                  </Title>
                  
                  <Tag color={
                    selectedSizeData
                      ? selectedSizeData.stock > 0 ? 'green' : 'red'
                      : selectedProduct.stock > 0 ? 'green' : 'red'
                  } className="text-base px-3 py-1">
                    {selectedSizeData
                      ? `${selectedSizeData.stock} in stock`
                      : `${selectedProduct.stock} in stock`
                    }
                  </Tag>
                </div>
                
                {/* Size Selection */}
                {selectedProduct.hasSizes && (
                  <div className="mb-6">
                    <Title level={5}>Select Size:</Title>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.sizes?.map(size => (
                        <Button
                          key={size.id}
                          type={selectedSize === size.name ? 'primary' : 'default'}
                          onClick={() => handleSizeChange(size?.name)}
                          disabled={size?.stock === 0}
                          className={selectedSize === size.name ? 'bg-blue-600' : ''}
                          size="large"
                        >
                          {size?.name || 'Size'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Size Details */}
                {selectedSizeData && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <Title level={5} className="mb-3">Size Details:</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">Price:</Text>
                          <br />
                          <Text strong>LKR {(selectedSizeData.price || 0).toFixed(2)}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">Stock:</Text>
                          <br />
                          <Text strong>{selectedSizeData.stock} available</Text>
                        </div>
                      </Col>
                      {selectedSizeData.dimensions && (
                        <Col span={12}>
                          <div className="mb-2">
                            <Text type="secondary">Dimensions:</Text>
                            <br />
                            <Text strong>
                              {selectedSizeData.dimensions.length}×{selectedSizeData.dimensions.width}×{selectedSizeData.dimensions.height} {selectedSizeData.dimensions.unit}
                            </Text>
                          </div>
                        </Col>
                      )}
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">Weight:</Text>
                          <br />
                          <Text strong>{selectedSizeData.weight} kg</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
                
                {/* Product Details for non-size products */}
                {!selectedProduct.hasSizes && (
                  <div className="mb-6">
                    <Title level={5} className="mb-3">Product Details:</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">SKU:</Text>
                          <br />
                          <Text strong>{selectedProduct.barcode || 'N/A'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">Category:</Text>
                          <br />
                          <Text strong>{selectedProduct.category}</Text>
                        </div>
                      </Col>
                      {selectedProduct.dimensions && (
                        <Col span={12}>
                          <div className="mb-2">
                            <Text type="secondary">Dimensions:</Text>
                            <br />
                            <Text strong>
                              {selectedProduct.dimensions.length}×{selectedProduct.dimensions.width}×{selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                            </Text>
                          </div>
                        </Col>
                      )}
                      <Col span={12}>
                        <div className="mb-2">
                          <Text type="secondary">Weight:</Text>
                          <br />
                          <Text strong>{selectedProduct.weight} kg</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    size="large"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedProduct(null);
                      setSelectedSize(null);
                    }}
                  >
                    Close
                  </Button>
                  
                  {selectedProduct.hasSizes ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={<Icon name="add_shopping_cart" />}
                      onClick={handleAddSelectedSizeToCart}
                      disabled={!selectedSizeData || selectedSizeData.stock === 0}
                    >
                      {!selectedSizeData 
                        ? 'Select Size' 
                        : selectedSizeData.stock === 0 
                          ? 'Out of Stock' 
                          : `Add to Cart - LKR ${(selectedSizeData.price || 0).toFixed(2)}`
                      }
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      icon={<Icon name="add_shopping_cart" />}
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setShowDetailModal(false);
                      }}
                      disabled={selectedProduct?.stock === 0}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

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