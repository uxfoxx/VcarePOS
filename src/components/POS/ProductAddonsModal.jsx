import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Checkbox, 
  Typography, 
  Space, 
  Divider, 
  List, 
  Tag,
  InputNumber,
  message,
  Button
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Group: CheckboxGroup } = Checkbox;

export function ProductAddonsModal({ open, onClose, product, onAddToCart }) {
  const { state } = usePOS();
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Filter raw materials that can be used as addons (only those with enough stock)
  const availableAddons = state.rawMaterials.filter(material => 
    material.stockQuantity > 0
  );

  // Reset selections when modal opens or product changes
  useEffect(() => {
    if (open) {
      setSelectedAddons([]);
      setQuantity(1);
    }
  }, [open, product]);

  // Calculate total price whenever selected addons or quantity changes
  useEffect(() => {
    if (!product) return;
    
    const basePrice = product.price;
    const addonsPrice = selectedAddons.reduce((sum, addon) => {
      const material = state.rawMaterials.find(m => m.id === addon.id);
      return sum + (material ? material.unitPrice * addon.quantity : 0);
    }, 0);
    
    setTotalPrice((basePrice + addonsPrice) * quantity);
  }, [selectedAddons, quantity, product, state.rawMaterials]);

  const handleAddonChange = (addonId, checked) => {
    if (checked) {
      // Add the addon
      const material = state.rawMaterials.find(m => m.id === addonId);
      if (material) {
        setSelectedAddons([...selectedAddons, { id: addonId, quantity: 1 }]);
      }
    } else {
      // Remove the addon
      setSelectedAddons(selectedAddons.filter(addon => addon.id !== addonId));
    }
  };

  const handleAddonQuantityChange = (addonId, value) => {
    setSelectedAddons(selectedAddons.map(addon => 
      addon.id === addonId ? { ...addon, quantity: value } : addon
    ));
  };

  const handleSubmit = () => {
    if (!product) return;
    
    try {
      setLoading(true);
      
      // Create a copy of the product with addons
      const productWithAddons = {
        ...product,
        addons: selectedAddons.map(addon => {
          const material = state.rawMaterials.find(m => m.id === addon.id);
          return {
            id: addon.id,
            name: material.name,
            quantity: addon.quantity,
            price: material.unitPrice * addon.quantity
          };
        }),
        // Calculate the total price including addons
        addonPrice: selectedAddons.reduce((sum, addon) => {
          const material = state.rawMaterials.find(m => m.id === addon.id);
          return sum + (material ? material.unitPrice * addon.quantity : 0);
        }, 0)
      };
      
      // Add to cart with quantity
      onAddToCart(productWithAddons, quantity);
      
      message.success('Product added to cart with addons');
      onClose();
    } catch (error) {
      message.error('Failed to add product to cart');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      title={
        <Space>
          <Icon name="add_circle" className="text-blue-600" />
          <span>Add {product.name} with Addons</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={600}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <Text strong className="text-lg">{product.name}</Text>
              <div>
                <Text type="secondary">{product.description}</Text>
              </div>
              <div className="mt-1">
                <Tag color="blue">{product.category}</Tag>
                <Tag color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}>
                  {product.stock} in stock
                </Tag>
              </div>
            </div>
            <div className="text-right">
              <Text strong className="text-xl text-blue-600">${product.price.toFixed(2)}</Text>
              <div className="mt-2">
                <Text strong>Quantity:</Text>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={setQuantity}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Addons Selection */}
        <div className="space-y-4">
          <Title level={5}>Available Addons</Title>
          
          {availableAddons.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Icon name="category" className="text-gray-300 text-2xl mb-2" />
              <Text type="secondary">No addons available</Text>
            </div>
          ) : (
            <List
              dataSource={availableAddons}
              renderItem={material => {
                const isSelected = selectedAddons.some(addon => addon.id === material.id);
                return (
                  <List.Item
                    key={material.id}
                    className="flex justify-between items-center border rounded-lg p-3 mb-2"
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleAddonChange(material.id, e.target.checked)}
                      />
                      <div className="ml-3">
                        <Text strong>{material.name}</Text>
                        <div>
                          <Text type="secondary" className="text-sm">
                            ${material.unitPrice.toFixed(2)} per {material.unit}
                          </Text>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div>
                        <InputNumber
                          min={1}
                          max={material.stockQuantity}
                          value={selectedAddons.find(addon => addon.id === material.id)?.quantity || 1}
                          onChange={(value) => handleAddonQuantityChange(material.id, value)}
                          size="small"
                          className="w-16"
                        />
                        <Text className="ml-2">{material.unit}</Text>
                      </div>
                    )}
                  </List.Item>
                );
              }}
            />
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Base Price:</Text>
              <Text>${product.price.toFixed(2)}</Text>
            </div>
            
            {selectedAddons.length > 0 && (
              <>
                <div className="flex justify-between">
                  <Text>Addons:</Text>
                  <Text>
                    ${selectedAddons.reduce((sum, addon) => {
                      const material = state.rawMaterials.find(m => m.id === addon.id);
                      return sum + (material ? material.unitPrice * addon.quantity : 0);
                    }, 0).toFixed(2)}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Quantity:</Text>
                  <Text>× {quantity}</Text>
                </div>
              </>
            )}
            
            <Divider className="my-2" />
            
            <div className="flex justify-between">
              <Text strong>Total:</Text>
              <Text strong className="text-blue-600 text-lg">${totalPrice.toFixed(2)}</Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<Icon name="add_shopping_cart" />}
            className="bg-blue-600"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}