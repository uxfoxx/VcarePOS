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
import { CustomProductModal } from './CustomProductModal';
import { ProductAddonsModal } from './ProductAddonsModal';

const { Option } = Select;
const { Text } = Typography;

export function ProductGrid({ collapsed }) {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
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

  // Get available addons (raw materials that can be used as addons)
  const getAvailableAddons = (product) => {
    // Return raw materials that are not already used in the product
    const usedMaterialIds = product.rawMaterials?.map(rm => rm.rawMaterialId) || [];
    return state.rawMaterials.filter(material => 
      !usedMaterialIds.includes(material.id) && 
      material.stockQuantity > 0 &&
      // Only include materials that make sense as addons
      ['Hardware', 'Upholstery', 'Finishing', 'Fabric'].includes(material.category)
    );
  };

  const handleAddToCart = (product) => {
    const availableAddons = getAvailableAddons(product);
    
    if (product.hasSizes || availableAddons.length > 0) {
      // Show addons/size selection modal
      setSelectedProduct(product);
      setShowAddonsModal(true);
    } else {
      // Add single product directly
      if (product.stock > 0) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleCustomProductAdd = (customProduct) => {
    dispatch({ type: 'ADD_TO_CART', payload: customProduct });
  };

  const handleProductWithAddonsAdd = (productWithAddons, quantity = 1) => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: productWithAddons });
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
          <PageHeader
            title="Products"
            icon="inventory_2"
            extra={
              <Space>
                <SearchInput
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onSearch={setSearchTerm}
                  className="w-80"
                />
                <ActionButton.Primary
                  icon="build"
                  onClick={() => setShowCustomProductModal(true)}
                >
                  Custom Product
                </ActionButton.Primary>
              </Space>
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
              actionText="Create Custom Product"
              onAction={() => setShowCustomProductModal(true)}
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
                    showAddonsIndicator={getAvailableAddons(product).length > 0}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card>

      {/* Product Detail Modal */}
      <Modal
        title={selectedProduct?.name}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        width={700}
        footer={[
          <ActionButton 
            key="close" 
            onClick={() => {
              setShowDetailModal(false);
              setSelectedProduct(null);
            }}
          >
            Close
          </ActionButton>,
          <ActionButton.Primary
            key="add-to-cart"
            icon="add_shopping_cart"
            onClick={() => {
              setShowDetailModal(false);
              handleAddToCart(selectedProduct);
            }}
            disabled={selectedProduct?.stock === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add to Cart
          </ActionButton.Primary>
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
                  <span className="text-xl font-bold text-blue-600">
                    ${selectedProduct.price?.toFixed(2) || '0.00'}
                  </span>
                  <div>
                    <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                      {selectedProduct.stock} in stock
                    </Tag>
                    {selectedProduct.hasSizes && (
                      <Tag color="purple" className="ml-2">
                        {selectedProduct.sizes?.length || 0} sizes available
                      </Tag>
                    )}
                    {getAvailableAddons(selectedProduct).length > 0 && (
                      <Tag color="orange" className="ml-2">
                        {getAvailableAddons(selectedProduct).length} add-ons available
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="SKU">
                <Text code>{selectedProduct.barcode || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{selectedProduct.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {selectedProduct.weight ? `${selectedProduct.weight} kg` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Material">
                {selectedProduct.material || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {selectedProduct.color || 'N/A'}
              </Descriptions.Item>
              {selectedProduct.dimensions && selectedProduct.dimensions.length && (
                <Descriptions.Item label="Dimensions">
                  {selectedProduct.dimensions.length}×{selectedProduct.dimensions.width}×{selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Available Add-ons Preview */}
            {getAvailableAddons(selectedProduct).length > 0 && (
              <div>
                <Text strong className="block mb-2">Available Add-ons:</Text>
                <div className="flex flex-wrap gap-2">
                  {getAvailableAddons(selectedProduct).slice(0, 5).map(addon => (
                    <Tag key={addon.id} color="orange">
                      {addon.name} (+${addon.unitPrice.toFixed(2)})
                    </Tag>
                  ))}
                  {getAvailableAddons(selectedProduct).length > 5 && (
                    <Tag>+{getAvailableAddons(selectedProduct).length - 5} more</Tag>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Custom Product Modal */}
      <CustomProductModal
        open={showCustomProductModal}
        onClose={() => setShowCustomProductModal(false)}
        onAddToCart={handleCustomProductAdd}
      />

      {/* Product Addons Modal */}
      <ProductAddonsModal
        open={showAddonsModal}
        onClose={() => {
          setShowAddonsModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        availableAddons={selectedProduct ? getAvailableAddons(selectedProduct) : []}
        onAddToCart={handleProductWithAddonsAdd}
      />
    </>
  );
}