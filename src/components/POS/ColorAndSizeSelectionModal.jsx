import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Space, 
  Card, 
  Row, 
  Col, 
  Image,
  Tag,
  Alert,
  message
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;

export function ColorAndSizeSelectionModal({ 
  open, 
  onClose, 
  product, 
  onColorAndSizeSelected 
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (open && product && product.colors && product.colors.length > 0) {
      // Auto-select first color
      const firstColor = product.colors[0];
      setSelectedColor(firstColor);
      
      // Auto-select first size if available
      if (firstColor.sizes && firstColor.sizes.length > 0) {
        setSelectedSize(firstColor.sizes[0]);
      }
    } else if (open) {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [open, product]);

  if (!product) return null;

  const handleConfirm = () => {
    if (!selectedColor) {
      message.error('Please select a color');
      return;
    }
    
    if (!selectedSize) {
      message.error('Please select a size');
      return;
    }

    if (selectedSize.stock <= 0) {
      message.error('Selected size is out of stock');
      return;
    }

    onColorAndSizeSelected(selectedColor, selectedSize, selectedSize);
    onClose();
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Auto-select first available size for the new color
    if (color.sizes && color.sizes.length > 0) {
      const firstAvailableSize = color.sizes.find(size => size.stock > 0) || color.sizes[0];
      setSelectedSize(firstAvailableSize);
    } else {
      setSelectedSize(null);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="palette" className="text-purple-600" />
          <span>Select Color & Size</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Product Summary */}
        <Card size="small">
          <div className="flex items-center space-x-4">
            <Image
              src={selectedColor?.image || product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt={product.name}
              width={80}
              height={80}
              className="object-cover rounded"
              preview={false}
              style={{ aspectRatio: '1/1', objectFit: 'cover' }}
            />
            <div className="flex-1">
              <Title level={4} className="mb-1">{product.name}</Title>
              <Text type="secondary">{product.category}</Text>
              <br />
              <Text strong className="text-blue-600 text-lg">
                LKR {(selectedSize?.price || product.price).toFixed(2)}
              </Text>
            </div>
          </div>
        </Card>

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <Title level={5} className="mb-4">
              <Icon name="palette" className="mr-2 text-blue-600" />
              Select Color
            </Title>
            
            <Row gutter={[16, 16]}>
              {product.colors.map(color => (
                <Col key={color.id} span={8}>
                  <Card
                    size="small"
                    hoverable
                    className={`cursor-pointer transition-all ${
                      selectedColor?.id === color.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleColorSelect(color)}
                  >
                    <div className="text-center space-y-2">
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-gray-300 mx-auto"
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
                      <Text strong className="block">{color.name}</Text>
                      <Text type="secondary" className="text-xs">
                        {color.sizes?.length || 0} size{(color.sizes?.length || 0) !== 1 ? 's' : ''}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Size Selection */}
        {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
          <div>
            <Title level={5} className="mb-4">
              <Icon name="straighten" className="mr-2 text-green-600" />
              Select Size for {selectedColor.name}
            </Title>
            
            <Row gutter={[16, 16]}>
              {selectedColor.sizes.map(size => (
                <Col key={size.id} span={8}>
                  <Card
                    size="small"
                    hoverable={size.stock > 0}
                    className={`cursor-pointer transition-all ${
                      selectedSize?.id === size.id ? 'border-green-500 bg-green-50' : ''
                    } ${size.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => size.stock > 0 && setSelectedSize(size)}
                  >
                    <div className="text-center space-y-2">
                      <Text strong className="block">{size.name}</Text>
                      <Text className="text-blue-600 font-semibold">
                        LKR {(size.price || product.price).toFixed(2)}
                      </Text>
                      <div className="space-y-1">
                        <Tag color={size.stock > 5 ? 'green' : size.stock > 0 ? 'orange' : 'red'}>
                          {size.stock > 0 ? `${size.stock} in stock` : 'Out of stock'}
                        </Tag>
                        {size.dimensions && (
                          <Text type="secondary" className="text-xs block">
                            {size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit}
                          </Text>
                        )}
                        {size.weight && (
                          <Text type="secondary" className="text-xs block">
                            Weight: {size.weight} kg
                          </Text>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Selection Summary */}
        {selectedColor && selectedSize && (
          <Alert
            message="Selection Summary"
            description={
              <div className="space-y-1">
                <Text>Color: <strong>{selectedColor.name}</strong></Text>
                <br />
                <Text>Size: <strong>{selectedSize.name}</strong></Text>
                <br />
                <Text>Price: <strong className="text-blue-600">LKR {(selectedSize.price || product.price).toFixed(2)}</strong></Text>
                <br />
                <Text>Stock: <strong>{selectedSize.stock} units available</strong></Text>
              </div>
            }
            type="info"
            showIcon
          />
        )}

        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            onClick={handleConfirm}
            loading={loading}
            disabled={!selectedColor || !selectedSize || selectedSize.stock <= 0}
            icon="check"
          >
            Continue
          </ActionButton.Primary>
        </div>
      </div>
    </Modal>
  );
}