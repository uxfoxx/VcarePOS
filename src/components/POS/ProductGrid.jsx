import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Typography, 
  Image, 
  Space, 
  Badge,
  Tooltip,
  Empty,
  Skeleton,
  Rate,
  Modal,
  Descriptions,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Meta } = Card;
const { Title, Text } = Typography;
const { Option } = Select;

export function ProductGrid() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = ['All', ...new Set(state.products.map(p => p.category))];
  
  const filteredProducts = state.products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode?.includes(searchTerm) ||
                           product.material?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return a.name.localeCompare(b.name);
      }
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock', status: 'error' };
    if (stock <= 5) return { color: 'orange', text: `Only ${stock} left`, status: 'warning' };
    return { color: 'green', text: 'In Stock', status: 'success' };
  };

  const getRating = () => Math.floor(Math.random() * 2) + 4; // Mock rating 4-5 stars

  const renderProductDetailModal = () => (
    <Modal
      title={
        <Space>
          <span className="material-icons text-[#0E72BD]">inventory_2</span>
          <Title level={4} className="m-0">Product Details</Title>
        </Space>
      }
      open={showDetailModal}
      onCancel={() => setShowDetailModal(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setShowDetailModal(false)}>
          Close
        </Button>,
        <Button
          key="add-to-cart"
          type="primary"
          icon={<span className="material-icons">add_shopping_cart</span>}
          onClick={() => {
            handleAddToCart(selectedProduct);
            setShowDetailModal(false);
          }}
          disabled={selectedProduct?.stock === 0}
          className="bg-[#0E72BD] hover:bg-blue-700"
        >
          {selectedProduct?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      ]}
    >
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Image
                src={selectedProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=500'}
                alt={selectedProduct.name}
                className="w-full rounded-lg"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
                crossOrigin="anonymous"
              />
            </div>
            
            <div className="md:w-1/2 space-y-4">
              <div>
                <Title level={3} className="m-0">{selectedProduct.name}</Title>
                <Text type="secondary" className="text-lg">{selectedProduct.category}</Text>
              </div>
              
              <div className="flex items-center space-x-4">
                <Title level={2} className="m-0 text-[#0E72BD]">
                  ${selectedProduct.price.toFixed(2)}
                </Title>
                <Rate disabled defaultValue={getRating()} />
              </div>
              
              <div className="flex items-center space-x-2">
                <Tag 
                  color={getStockStatus(selectedProduct.stock).color}
                  className="text-sm px-3 py-1"
                >
                  {getStockStatus(selectedProduct.stock).text}
                </Tag>
                {selectedProduct.stock <= 5 && selectedProduct.stock > 0 && (
                  <Tag color="orange" className="text-sm">
                    <span className="material-icons text-xs mr-1">local_fire_department</span>
                    Limited Stock
                  </Tag>
                )}
              </div>
              
              {selectedProduct.description && (
                <div>
                  <Text strong>Description:</Text>
                  <br />
                  <Text>{selectedProduct.description}</Text>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Detailed Specifications */}
          <div>
            <Title level={4} className="mb-4">Product Specifications</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Product ID">
                <Text code>{selectedProduct.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="SKU/Barcode">
                {selectedProduct.barcode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{selectedProduct.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Stock Quantity">
                <Text strong>{selectedProduct.stock} units</Text>
              </Descriptions.Item>
              
              {selectedProduct.material && (
                <Descriptions.Item label="Material">
                  {selectedProduct.material}
                </Descriptions.Item>
              )}
              
              {selectedProduct.color && (
                <Descriptions.Item label="Color">
                  <Tag color="purple">{selectedProduct.color}</Tag>
                </Descriptions.Item>
              )}
              
              {selectedProduct.weight && (
                <Descriptions.Item label="Weight">
                  {selectedProduct.weight} kg
                </Descriptions.Item>
              )}
              
              {selectedProduct.dimensions && (
                <Descriptions.Item label="Dimensions" span={2}>
                  <Space>
                    <span className="material-icons text-gray-400">straighten</span>
                    <Text>
                      {selectedProduct.dimensions.length} × {selectedProduct.dimensions.width} × {selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          {/* Raw Materials Used */}
          {selectedProduct.rawMaterials && selectedProduct.rawMaterials.length > 0 && (
            <>
              <Divider />
              <div>
                <Title level={4} className="mb-4">Raw Materials Used</Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.rawMaterials.map((usage, index) => {
                    const material = state.rawMaterials.find(m => m.id === usage.rawMaterialId);
                    return material ? (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>{material.name}</Text>
                            <br />
                            <Text type="secondary" className="text-xs">{material.category}</Text>
                          </div>
                          <div className="text-right">
                            <Text strong>{usage.quantity} {material.unit}</Text>
                            <br />
                            <Text type="secondary" className="text-xs">per unit</Text>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );

  return (
    <>
      <Card 
        className="vcare-card h-full"
        title={
          <Space className="w-full justify-between">
            <Space>
              <span className="material-icons text-[#0E72BD] text-xl">inventory_2</span>
              <Title level={4} className="m-0">Furniture Catalog</Title>
              <Badge count={filteredProducts.length} showZero color="#0E72BD" />
            </Space>
          </Space>
        }
        extra={
          <Space wrap className="flex-wrap">
            <Input
              placeholder="Search furniture or scan barcode..."
              prefix={<span className="material-icons">search</span>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-40"
              placeholder="Category"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Select
              value={sortBy}
              onChange={setSortBy}
              className="w-36"
              placeholder="Sort by"
            >
              <Option value="name">Name A-Z</Option>
              <Option value="price-low">Price: Low to High</Option>
              <Option value="price-high">Price: High to Low</Option>
              <Option value="stock">Stock Level</Option>
            </Select>
          </Space>
        }
      >
        {loading ? (
          <Row gutter={[16, 16]}>
            {[...Array(8)].map((_, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card>
                  <Skeleton.Image className="w-full h-48" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : filteredProducts.length === 0 ? (
          <Empty
            image={<span className="material-icons text-6xl text-gray-300">inventory_2</span>}
            description={
              <div>
                <Title level={4} type="secondary">No furniture items found</Title>
                <Text type="secondary">Try adjusting your search or filter criteria</Text>
              </div>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              
              return (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    className="product-grid__item h-full cursor-pointer"
                    cover={
                      <div className="relative overflow-hidden" onClick={() => handleProductClick(product)}>
                        <Image
                          alt={product.name}
                          src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          className="h-48 w-full object-cover"
                          preview={false}
                          crossOrigin="anonymous"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge 
                            count={stockStatus.text}
                            style={{ 
                              backgroundColor: stockStatus.color === 'red' ? '#ff4d4f' : 
                                              stockStatus.color === 'orange' ? '#fa8c16' : '#52c41a'
                            }}
                          />
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute top-2 left-2">
                            <Tag color="orange" className="text-xs font-semibold">
                              <span className="material-icons text-xs mr-1">local_fire_department</span>
                              Limited
                            </Tag>
                          </div>
                        )}
                        {/* Click to view details overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              type="primary" 
                              ghost 
                              icon={<span className="material-icons">visibility</span>}
                              className="text-white border-white"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                    actions={[
                      <Tooltip title={product.stock === 0 ? "Out of stock" : "Add to cart"} key="add">
                        <Button
                          type="primary"
                          icon={<span className="material-icons">add_shopping_cart</span>}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0}
                          block
                          className="font-semibold"
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </Tooltip>
                    ]}
                    onClick={() => handleProductClick(product)}
                  >
                    <Meta
                      title={
                        <div className="space-y-2">
                          <Tooltip title={product.name}>
                            <Text strong className="text-base line-clamp-2 leading-tight">
                              {product.name}
                            </Text>
                          </Tooltip>
                          <div className="flex items-center justify-between">
                            <Tag color="blue" className="text-xs">{product.category}</Tag>
                            <Text type="secondary" className="text-xs">
                              Stock: {product.stock}
                            </Text>
                          </div>
                        </div>
                      }
                      description={
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Text strong className="text-xl text-[#0E72BD]">
                              ${product.price.toFixed(2)}
                            </Text>
                            <Rate disabled defaultValue={getRating()} className="text-xs" />
                          </div>
                          
                          <div className="text-center">
                            <Text type="secondary" className="text-xs">
                              Click to view full details
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Product Detail Modal */}
      {renderProductDetailModal()}
    </>
  );
}