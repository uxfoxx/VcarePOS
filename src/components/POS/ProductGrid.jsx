import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Image, 
  Badge,
  Empty,
  Modal,
  Descriptions,
  Tabs
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Meta } = Card;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

export function ProductGrid() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Categories for furniture
  const categories = ['All', 'Tables', 'Chairs'];
  
  const filteredProducts = state.products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <>
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="m-0">Products</Title>
            <Input
              placeholder="Search products..."
              prefix={<span className="material-icons text-gray-400">search</span>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              allowClear
            />
          </div>
        }
      >
        {/* Category Tabs */}
        <div className="px-4 pt-4 border-b border-gray-200">
          <Tabs 
            activeKey={selectedCategory} 
            onChange={setSelectedCategory}
            type="card"
            size="small"
          >
            {categories.map(category => (
              <TabPane tab={category} key={category} />
            ))}
          </Tabs>
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {filteredProducts.length === 0 ? (
            <Empty
              image={<span className="material-icons text-6xl text-gray-300">inventory_2</span>}
              description="No products found"
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card
                    hoverable
                    className="h-full cursor-pointer"
                    cover={
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          alt={product.name}
                          src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                          className="w-full h-full object-cover"
                          preview={false}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge 
                            count={`$${product.price.toFixed(2)}`}
                            style={{ backgroundColor: '#0E72BD' }}
                          />
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge 
                            count={product.category}
                            style={{ backgroundColor: product.category === 'Tables' ? '#52c41a' : '#fa8c16' }}
                          />
                        </div>
                      </div>
                    }
                    onClick={() => handleProductClick(product)}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <div className="space-y-2">
                      <div>
                        <Text strong className="text-sm line-clamp-2 leading-tight">
                          {product.name}
                        </Text>
                        <Text type="secondary" className="text-xs block">
                          ${product.price.toFixed(2)}
                        </Text>
                        <Text type="secondary" className="text-xs block">
                          Stock: {product.stock} units
                        </Text>
                      </div>
                      
                      <Button
                        type="primary"
                        size="small"
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className="bg-[#0E72BD] hover:bg-blue-700"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
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
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>,
          <Button
            key="add-to-cart"
            type="primary"
            onClick={() => {
              handleAddToCart(selectedProduct);
              setShowDetailModal(false);
            }}
            disabled={selectedProduct?.stock === 0}
            className="bg-[#0E72BD] hover:bg-blue-700"
          >
            Add to Cart
          </Button>
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
              />
              <div className="flex-1">
                <Title level={4}>{selectedProduct.name}</Title>
                <Text type="secondary">{selectedProduct.description}</Text>
                <div className="mt-2">
                  <Text strong className="text-xl text-[#0E72BD]">
                    ${selectedProduct.price.toFixed(2)}
                  </Text>
                </div>
              </div>
            </div>
            
            <Descriptions bordered size="small">
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
            </Descriptions>
          </div>
        )}
      </Modal>
    </>
  );
}