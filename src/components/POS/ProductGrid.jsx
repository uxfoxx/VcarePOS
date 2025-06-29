import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Empty,
  Modal,
  Descriptions,
  Image,
  Tag,
  Select,
  Space,
  Typography
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { SearchInput } from '../common/SearchInput';
import { ProductCard } from '../common/ProductCard';
import { PageHeader } from '../common/PageHeader';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

const { Option } = Select;
const { Text } = Typography;

export function ProductGrid({ collapsed }) {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get categories from state, including only active ones
  const activeCategories = state.categories?.filter(cat => cat.isActive) || [];
  const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];
  
  // Filter products
  const filteredProducts = state.products
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
    } else {
      // Add single product directly
      if (product.stock > 0) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    }
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
      
      dispatch({ type: 'ADD_TO_CART', payload: productWithSize });
      setShowDetailModal(false);
      setSelectedProduct(null);
      setSelectedSize(null);
    }
  };

  // Determine grid columns based on sidebar state
  const getColSpan = () => {
    if (collapsed) {
      // When collapsed, show 4 products per row
      return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    } else {
      // When expanded, show 2 products per row
      return { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 };
    }
  };

  const tabItems = categoryNames.map(category => ({
    key: category,
    label: category,
    children: null
  }));

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

  const selectedSizeData = getSelectedSizeData();

  return (
    <>
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4 border-b border-gray-200">
          <PageHeader
            title="Products"
            icon="inventory_2"
            extra={
              <SearchInput
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-80"
              />
            }
          />
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
                    product={product}
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
        title={selectedProduct?.name}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
          setSelectedSize(null);
        }}
        width={700}
        footer={[
          <ActionButton 
            key="close" 
            onClick={() => {
              setShowDetailModal(false);
              setSelectedProduct(null);
              setSelectedSize(null);
            }}
          >
            Close
          </ActionButton>,
          selectedProduct?.hasSizes ? (
            <ActionButton.Primary
              key="add-to-cart"
              icon="add_shopping_cart"
              onClick={handleAddSelectedSizeToCart}
              disabled={!selectedSizeData || selectedSizeData.stock === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {!selectedSizeData 
                ? 'Select Size' 
                : selectedSizeData.stock === 0 
                  ? 'Out of Stock' 
                  : `Add to Cart - $${selectedSizeData.price.toFixed(2)}`
              }
            </ActionButton.Primary>
          ) : (
            <ActionButton.Primary
              key="add-to-cart"
              icon="add_shopping_cart"
              onClick={() => {
                handleAddToCart(selectedProduct);
                setShowDetailModal(false);
              }}
              disabled={selectedProduct?.stock === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add to Cart
            </ActionButton.Primary>
          )
        ]}
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Image and Basic Info */}
            <div className="flex gap-4">
              <Image
                src={selectedProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                alt={selectedProduct.name}
                width={200}
                height={150}
                className="object-cover rounded"
                preview={false}
              />
              <div className="flex-1">
                <PageHeader
                  title={selectedProduct.name}
                  subtitle={selectedProduct.description}
                  level={4}
                />
                <div className="mt-2 space-y-2">
                  {selectedSizeData ? (
                    <>
                      <span className="text-xl font-bold text-blue-600">
                        ${selectedSizeData.price.toFixed(2)}
                      </span>
                      <div>
                        <Tag color={selectedSizeData.stock > 0 ? 'green' : 'red'}>
                          {selectedSizeData.stock} in stock
                        </Tag>
                      </div>
                      <div>
                        <Text type="secondary">Selected Size: </Text>
                        <Tag color="blue">{selectedSize}</Tag>
                      </div>
                    </>
                  ) : selectedProduct.hasSizes ? (
                    <>
                      <span className="text-xl font-bold text-blue-600">
                        From ${selectedProduct.sizes?.length > 0 
                          ? Math.min(...selectedProduct.sizes.map(s => s.price)).toFixed(2)
                          : selectedProduct.price?.toFixed(2) || '0.00'
                        }
                      </span>
                      <div>
                        <Text type="secondary">Multiple sizes available</Text>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-blue-600">
                        ${selectedProduct.price?.toFixed(2) || '0.00'}
                      </span>
                      <div>
                        <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                          {selectedProduct.stock} in stock
                        </Tag>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {selectedProduct.hasSizes && (
              <div className="space-y-4">
                <Text strong className="text-lg">Select Size:</Text>
                
                <Select
                  placeholder="Choose a size"
                  value={selectedSize}
                  onChange={handleSizeChange}
                  className="w-full"
                  size="large"
                >
                  {selectedProduct.sizes?.map(size => (
                    <Option key={size.id} value={size.name} disabled={size.stock === 0}>
                      <div className="flex items-center justify-between">
                        <span>{size.name}</span>
                        <div className="flex items-center space-x-2">
                          <span>${size.price.toFixed(2)}</span>
                          <Tag color={size.stock > 0 ? 'green' : 'red'} size="small">
                            {size.stock > 0 ? `${size.stock} available` : 'Out of stock'}
                          </Tag>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>

                {/* Show size details when selected */}
                {selectedSizeData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Text strong className="block mb-2">Size Details:</Text>
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="Price">
                        ${selectedSizeData.price.toFixed(2)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Stock">
                        {selectedSizeData.stock} available
                      </Descriptions.Item>
                      {selectedSizeData.dimensions && (
                        <Descriptions.Item label="Dimensions">
                          {selectedSizeData.dimensions.length}×{selectedSizeData.dimensions.width}×{selectedSizeData.dimensions.height} {selectedSizeData.dimensions.unit}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Weight">
                        {selectedSizeData.weight} kg
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </div>
            )}

            {/* Product Details for non-size products */}
            {!selectedProduct.hasSizes && (
              <Descriptions bordered size="small">
                <Descriptions.Item label="SKU">
                  {selectedProduct.barcode || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {selectedProduct.category}
                </Descriptions.Item>
                <Descriptions.Item label="Stock">
                  {selectedProduct.stock} available
                </Descriptions.Item>
                <Descriptions.Item label="Color">
                  {selectedProduct.color}
                </Descriptions.Item>
                {selectedProduct.dimensions && (
                  <Descriptions.Item label="Dimensions">
                    {selectedProduct.dimensions.length}×{selectedProduct.dimensions.width}×{selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Weight">
                  {selectedProduct.weight} kg
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}