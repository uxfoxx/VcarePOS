import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Space, 
  Card, 
  InputNumber, 
  Checkbox, 
  Divider,
  Row,
  Col,
  Image,
  Tag,
  Alert,
  message
} from 'antd';
import { useSelector } from 'react-redux';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;

export function ProductAddonsModal({ 
  open, 
  onClose, 
  product, 
  onAddToCart 
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && product) {
      setQuantity(1);
      setSelectedAddons([]);
    }
  }, [open, product]);

  if (!product) return null;

  const handleAddonChange = (addon, checked) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, { ...addon, quantity: 1 }]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    }
  };

  const handleAddonQuantityChange = (addonId, addonQuantity) => {
    setSelectedAddons(selectedAddons.map(addon => 
      addon.id === addonId ? { ...addon, quantity: addonQuantity } : addon
    ));
  };

  const calculateTotal = () => {
    const productTotal = product.price * quantity;
    const addonsTotal = selectedAddons.reduce((sum, addon) => 
      sum + (addon.price * addon.quantity), 0
    );
    return productTotal + addonsTotal;
  };

  const handleAddToCart = () => {
    try {
      setLoading(true);
      
      const productWithAddons = {
        ...product,
        addons: selectedAddons
      };

      onAddToCart(productWithAddons, quantity);
      
      message.success(`${product.name} added to cart with ${selectedAddons.length} add-on(s)!`);
      onClose();
    } catch (error) {
      message.error('Failed to add product to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="add_circle" className="text-blue-600" />
          <span>Product Options</span>
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
              src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
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
                LKR {product.price.toFixed(2)}
              </Text>
              {product.selectedSize && (
                <div className="mt-1">
                  <Tag color="blue">Size: {product.selectedSize}</Tag>
                </div>
              )}
              {product.selectedColor && (
                <div className="mt-1">
                  <Tag color="purple">Color: {product.selectedColor.name}</Tag>
                </div>
              )}
            </div>
            <div className="text-right">
              <Text type="secondary" className="block mb-2">Quantity</Text>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
                className="w-20"
              />
            </div>
          </div>
        </Card>

        {/* Add-ons Section */}
        {product.hasAddons && product.addons && product.addons.length > 0 ? (
          <div>
            <Title level={5} className="mb-4">
              <Icon name="add_circle" className="mr-2 text-green-600" />
              Available Add-ons
            </Title>
            
            <div className="space-y-3">
              {product.addons.map(addon => {
                const isSelected = selectedAddons.find(a => a.id === addon.id);
                
                return (
                  <Card key={addon.id} size="small" className={isSelected ? 'border-blue-500 bg-blue-50' : ''}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={!!isSelected}
                          onChange={(e) => handleAddonChange(addon, e.target.checked)}
                        />
                        <div>
                          <Text strong>{addon.name}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            {addon.quantity} {addon.unit} • LKR {addon.price.toFixed(2)}
                          </Text>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <Text className="text-sm">Qty:</Text>
                          <InputNumber
                            min={1}
                            max={10}
                            value={isSelected.quantity}
                            onChange={(value) => handleAddonQuantityChange(addon.id, value)}
                            size="small"
                            className="w-16"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Icon name="add_circle" className="text-4xl text-gray-300 mb-2" />
            <Text type="secondary">No add-ons available for this product</Text>
          </div>
        )}

        {/* Order Summary */}
        <Card size="small" className="bg-blue-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Product ({quantity}x):</Text>
              <Text>LKR {(product.price * quantity).toFixed(2)}</Text>
            </div>
            {selectedAddons.length > 0 && (
              <>
                {selectedAddons.map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <Text type="secondary">{addon.name} ({addon.quantity}x):</Text>
                    <Text type="secondary">LKR {(addon.price * addon.quantity).toFixed(2)}</Text>
                  </div>
                ))}
                <Divider className="my-2" />
              </>
            )}
            <div className="flex justify-between">
              <Title level={5} className="m-0">Total:</Title>
              <Title level={5} className="m-0 text-blue-600">
                LKR {calculateTotal().toFixed(2)}
              </Title>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            onClick={handleAddToCart}
            loading={loading}
            icon="add_shopping_cart"
          >
            Add to Cart
          </ActionButton.Primary>
        </div>
      </div>
    </Modal>
  );
}