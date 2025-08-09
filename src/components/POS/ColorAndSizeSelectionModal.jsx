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
  Space
} from 'antd';
import { Icon } from '../common/Icon';

const { Text, Title } = Typography;

export function ColorAndSizeSelectionModal({ 
  open, 
  onClose, 
  product, 
  onSelectionComplete
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
    
    onSelectionComplete(selectedColor, selectedSize);
  };

  const getAvailableSizes = () => {
    return selectedColor?.sizes || [];
  };

  const getTotalStock = (color) => {
    return color.sizes.reduce((sum, size) => sum + size.stock, 0);
  };

  const getPriceRange = (color) => {
    if (!color.sizes || color.sizes.length === 0) return null;
    
    const prices = color.sizes.map(size => size.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `LKR ${minPrice.toFixed(2)}`;
    }
    return `LKR ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
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
          disabled={!selectedColor || !selectedSize || selectedSize.stock === 0}
          onClick={handleAddToCart}
          icon={<Icon name="add_shopping_cart" />}
        >
          {!selectedColor 
            ? 'Select a Color' 
            : !selectedSize 
              ? 'Select a Size' 
              : selectedSize.stock === 0
                ? 'Out of Stock'
                : `Add to Cart - LKR ${selectedSize.price.toFixed(2)}`
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
            <div>
              <Title level={4} className="mb-1">{product.name}</Title>
              <Text type="secondary">{product.description}</Text>
              <div className="mt-2">
                <Tag color="blue">{product.category}</Tag>
                <Tag color="green">{colors.length} color{colors.length !== 1 ? 's' : ''} available</Tag>
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
                <Col key={color.id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    className={`cursor-pointer transition-all ${selectedColor?.id === color.id ? 'border-blue-500 shadow-md' : 'hover:border-blue-300'}`}
                    onClick={() => handleColorSelect(color)}
                    cover={
                      <div className="h-32 overflow-hidden relative">
                        <Image
                          alt={color.name}
                          src={color.image || product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                          className="w-full h-full object-cover"
                          preview={false}
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="absolute top-2 left-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: color.colorCode || '#000000' }}
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Tag color="blue">
                            {color.sizes.length} size{color.sizes.length !== 1 ? 's' : ''}
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong>{color.name}</Text>
                          {selectedColor?.id === color.id && (
                            <Icon name="check_circle" className="text-green-500" />
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div className="flex justify-between text-sm">
                            <Text type="secondary">Total Stock:</Text>
                            <Text>{getTotalStock(color)} units</Text>
                          </div>
                          <div className="flex justify-between text-sm">
                            <Text type="secondary">Price Range:</Text>
                            <Text>{getPriceRange(color)}</Text>
                          </div>
                        </div>
                      }
                    />
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
                  <Col key={size.id} xs={24} sm={12} md={8}>
                    <Card
                      hoverable
                      className={`cursor-pointer transition-all ${selectedSize?.id === size.id ? 'border-blue-500 shadow-md' : 'hover:border-blue-300'}`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Text strong className="text-lg">{size.name}</Text>
                            {selectedSize?.id === size.id && (
                              <Icon name="check_circle" className="text-green-500" />
                            )}
                          </div>
                          <div className="space-y-1">
                            {size.dimensions && size.dimensions.length && (
                              <div>
                                <Text type="secondary" className="text-xs">Dimensions:</Text>
                                <Text className="block text-sm">
                                  {size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit || 'cm'}
                                </Text>
                              </div>
                            )}
                            {size.weight && (
                              <div>
                                <Text type="secondary" className="text-xs">Weight:</Text>
                                <Text className="block text-sm">{size.weight} kg</Text>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Tag color="blue" className="text-base px-2 py-1 mb-2">
                            LKR {(size.price || 0).toFixed(2)}
                          </Tag>
                          <div>
                            <Tag color={size.stock > 10 ? 'green' : size.stock > 0 ? 'orange' : 'red'}>
                              {size.stock} in stock
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selectedColor && selectedSize && (
          <div className="bg-green-50 p-4 rounded-lg">
            <Title level={5} className="mb-2">Selection Summary</Title>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text type="secondary">Selected Color:</Text>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: selectedColor.colorCode }}
                  />
                  <Text strong>{selectedColor.name}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">Selected Size:</Text>
                <Text strong className="block mt-1">{selectedSize.name}</Text>
              </div>
              <div>
                <Text type="secondary">Price:</Text>
                <Text strong className="block mt-1 text-blue-600 text-lg">
                  LKR {selectedSize.price.toFixed(2)}
                </Text>
              </div>
              <div>
                <Text type="secondary">Stock Available:</Text>
                <Text strong className="block mt-1">{selectedSize.stock} units</Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}