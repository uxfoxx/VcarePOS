import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Tag, 
  Button, 
  Empty, 
  Image,
  Space,
  Badge
} from 'antd';
import { Icon } from '../common/Icon';

const { Text, Title } = Typography;

export function ColorAndSizeSelectionModal({ 
  open, 
  onClose, 
  product, 
  onColorAndSizeSelected
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Reset selections when modal opens or product changes
  useEffect(() => {
    if (open && product) {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [open, product]);

  if (!product) return null;

  const colors = product.colors || [];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size when color changes
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) return;
    
    onColorAndSizeSelected(selectedColor, selectedSize);
  };

  const getAvailableSizes = () => {
    if (!selectedColor) return [];
    return selectedColor.sizes || [];
  };

  const getTotalStock = (color) => {
    if (!color.sizes) return 0;
    return color.sizes.reduce((total, size) => total + (size.stock || 0), 0);
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="palette" className="text-blue-600" />
          <span>Select Color and Size for {product.name}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          disabled={!selectedColor || !selectedSize}
          onClick={handleAddToCart}
          icon={<Icon name="add_shopping_cart" />}
        >
          {!selectedColor 
            ? 'Select a Color' 
            : !selectedSize 
              ? 'Select a Size' 
              : `Add to Cart - LKR ${(product.price || 0).toFixed(2)}`
          }
        </Button>
      ]}
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Image
              src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
              alt={product.name}
              width={80}
              height={80}
              className="object-cover rounded"
              preview={false}
              style={{ aspectRatio: '1/1', objectFit: 'cover' }}
            />
            <div className="flex-1">
              <Title level={4} className="mb-1">{product.name}</Title>
              <Text type="secondary">{product.description}</Text>
              <div className="mt-2">
                <Tag color="blue">{product.category}</Tag>
                <Text strong className="text-xl text-blue-600 ml-4">
                  LKR {(product.price || 0).toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <Title level={5} className="mb-4">Step 1: Select Color</Title>
          {colors.length === 0 ? (
            <Empty description="No colors available for this product" />
          ) : (
            <Row gutter={[16, 16]}>
              {colors.map(color => (
                <Col key={color.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className={`cursor-pointer transition-all ${selectedColor?.id === color.id ? 'border-blue-500 shadow-md bg-blue-50' : ''}`}
                    onClick={() => handleColorSelect(color)}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div className="text-center space-y-3">
                      {/* Color Image Circle */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden"
                            style={{ 
                              backgroundImage: color.image ? `url(${color.image})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: color.colorCode || '#f0f0f0'
                            }}
                          >
                            {!color.image && (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="palette" className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          {selectedColor?.id === color.id && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon name="check" className="text-white text-sm" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Color Name */}
                      <div>
                        <Text strong className="block">{color.name}</Text>
                        <Badge 
                          count={getTotalStock(color)} 
                          showZero 
                          style={{ backgroundColor: getTotalStock(color) > 0 ? '#52c41a' : '#ff4d4f' }}
                        />
                        <Text type="secondary" className="text-xs block mt-1">
                          {color.sizes?.length || 0} size{(color.sizes?.length || 0) !== 1 ? 's' : ''} available
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Size Selection */}
        {selectedColor && (
          <div>
            <Title level={5} className="mb-4">
              Step 2: Select Size for {selectedColor.name}
            </Title>
            {getAvailableSizes().length === 0 ? (
              <Empty description="No sizes available for this color" />
            ) : (
              <Row gutter={[16, 16]}>
                {getAvailableSizes().map(size => (
                  <Col key={size.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      className={`cursor-pointer transition-all ${selectedSize?.id === size.id ? 'border-blue-500 shadow-md bg-blue-50' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div className="text-center space-y-2">
                        <div className="relative">
                          <Text strong className="text-lg">{size.name}</Text>
                          {selectedSize?.id === size.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon name="check" className="text-white text-sm" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Tag color={size.stock > 0 ? 'green' : 'red'} className="text-sm">
                            {size.stock} in stock
                          </Tag>
                        </div>
                        
                        {size.dimensions && (
                          <Text type="secondary" className="text-xs block">
                            {size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit}
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {(selectedColor || selectedSize) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="mb-3">Selection Summary</Title>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>Product:</Text>
                <Text strong>{product.name}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text>Price:</Text>
                <Text strong className="text-blue-600">LKR {(product.price || 0).toFixed(2)}</Text>
              </div>
              {selectedColor && (
                <div className="flex items-center justify-between">
                  <Text>Color:</Text>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ 
                        backgroundImage: selectedColor.image ? `url(${selectedColor.image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: selectedColor.colorCode || '#f0f0f0'
                      }}
                    />
                    <Text strong>{selectedColor.name}</Text>
                  </div>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center justify-between">
                  <Text>Size:</Text>
                  <Text strong>{selectedSize.name}</Text>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center justify-between">
                  <Text>Stock Available:</Text>
                  <Tag color={selectedSize.stock > 0 ? 'green' : 'red'}>
                    {selectedSize.stock} units
                  </Tag>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}