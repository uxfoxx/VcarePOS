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
  Rate
} from 'antd';
import { Product } from '../../types';
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

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock', status: 'error' };
    if (stock <= 5) return { color: 'orange', text: `Only ${stock} left`, status: 'warning' };
    return { color: 'green', text: 'In Stock', status: 'success' };
  };

  const getRating = () => Math.floor(Math.random() * 2) + 4; // Mock rating 4-5 stars

  return (
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
                <Skeleton active paragraph={{ rows: 3 }} />
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
            const rating = getRating();
            
            return (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  className="product-grid__item h-full"
                  cover={
                    <div className="relative overflow-hidden">
                      <Image
                        alt={product.name}
                        src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        className="h-48 w-full object-cover"
                        preview={false}
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
                            Limited Stock
                          </Tag>
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <Tooltip title={product.stock === 0 ? "Out of stock" : "Add to cart"} key="add">
                      <Button
                        type="primary"
                        icon={<span className="material-icons">add_shopping_cart</span>}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        block
                        className="font-semibold"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <Meta
                    title={
                      <div>
                        <Tooltip title={product.name}>
                          <Text strong className="text-base line-clamp-1">{product.name}</Text>
                        </Tooltip>
                        <div className="flex items-center justify-between mt-1">
                          <Tag color="blue" className="text-xs">{product.category}</Tag>
                          <Rate disabled defaultValue={rating} className="text-xs" />
                        </div>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size="small" className="w-full">
                        {product.dimensions && (
                          <div className="flex items-center text-gray-500">
                            <span className="material-icons text-xs mr-1">straighten</span>
                            <Text type="secondary" className="text-xs">
                              {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} {product.dimensions.unit}
                            </Text>
                          </div>
                        )}
                        
                        {product.material && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-500">
                              <span className="material-icons text-xs mr-1">texture</span>
                              <Text type="secondary" className="text-xs">{product.material}</Text>
                            </div>
                            {product.color && (
                              <Tag color="purple" className="text-xs">{product.color}</Tag>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <Text strong className="text-xl text-[#0E72BD] block">
                              ${product.price.toFixed(2)}
                            </Text>
                            {product.weight && (
                              <Text type="secondary" className="text-xs">
                                Weight: {product.weight} kg
                              </Text>
                            )}
                          </div>
                          <div className="text-right">
                            <Text type="secondary" className="text-xs block">
                              SKU: {product.barcode || 'N/A'}
                            </Text>
                            <Text type="secondary" className="text-xs">
                              Stock: {product.stock}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Card>
  );
}