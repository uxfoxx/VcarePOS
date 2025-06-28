import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Empty,
  Modal,
  Descriptions,
  Tabs,
  Image,
  Tag
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { SearchInput } from '../common/SearchInput';
import { ProductCard } from '../common/ProductCard';
import { PageHeader } from '../common/PageHeader';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

export function ProductGrid({ collapsed }) {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Get categories from state, including only active ones
  const activeCategories = state.categories?.filter(cat => cat.isActive) || [];
  const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];
  
  // Use allProducts which includes all variations as individual products
  const filteredProducts = state.allProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
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

        {/* Category Tabs */}
        <div className="px-4 pt-4 border-b border-gray-200">
          <Tabs 
            activeKey={selectedCategory} 
            onChange={setSelectedCategory}
            type="card"
            size="small"
            items={tabItems}
          />
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {filteredProducts.length === 0 ? (
            <Empty
              image={<Icon name="inventory_2" className="text-6xl text-gray-300 mb-4" />}
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
                    showVariationInfo={true}
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
        onCancel={() => setShowDetailModal(false)}
        width={600}
        footer={[
          <ActionButton key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </ActionButton>,
          <ActionButton.Primary
            key="add-to-cart"
            icon="add_shopping_cart"
            onClick={() => {
              handleAddToCart(selectedProduct);
              setShowDetailModal(false);
            }}
            disabled={selectedProduct?.stock === 0}
            className="bg-[#0E72BD] hover:bg-blue-700"
          >
            Add to Cart
          </ActionButton.Primary>
        ]}
      >
        {selectedProduct && (
          <div className="space-y-4">
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
                  <span className="text-xl font-bold text-[#0E72BD]">
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.isVariation && (
                    <div>
                      <Tag color="blue">
                        Variation: {selectedProduct.variationName}
                      </Tag>
                      <br />
                      <span className="text-sm text-gray-500">
                        Part of: {selectedProduct.parentProductName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
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
              <Descriptions.Item label="Material">
                {selectedProduct.material}
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
              {selectedProduct.isVariation && (
                <Descriptions.Item label="Product Type">
                  <Tag color="purple">Product Variation</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </>
  );
}