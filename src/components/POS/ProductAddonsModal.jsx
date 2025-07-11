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
  Button,
  Card,
  Row,
  Col,
  Input,
  Image
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Group: CheckboxGroup } = Checkbox;
const { Search } = Input;

export function ProductAddonsModal({ open, onClose, product, onAddToCart }) {
  const { rawMaterials } = usePOS();
  const [loading, setLoading] = useState(false);
  const [editablePrice, setEditablePrice] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter raw materials that can be used as addons (only those with enough stock)
  const availableAddons = (rawMaterials || []).filter(material => 
    material.stockQuantity > 0 &&
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selections when modal opens or product changes
  useEffect(() => {
    if (open) {
      setSelectedAddons([]);
      setQuantity(1);
      setSearchTerm('');
    }
  }, [open, product]);

  // Calculate total price whenever selected addons or quantity changes
  useEffect(() => {
    if (!product) return;
    
    const basePrice = product.price;
    const addonsTotalPrice = selectedAddons.reduce((sum, addon) => {
      const material = (rawMaterials || []).find(m => m.id === addon.id);
      return sum + (material ? material.unitPrice * addon.quantity : 0);
    }, 0);
    
    const calculatedTotal = (basePrice + addonsTotalPrice) * quantity;
    setTotalPrice(calculatedTotal);
    
    // Only set editable price initially or when it's 0
    if (editablePrice === 0) {
      setEditablePrice(calculatedTotal);
    }
  }, [selectedAddons, quantity, product, rawMaterials]);

  const handleAddonChange = (addonId, checked) => {
    if (checked) {
      // Add the addon
      const material = (rawMaterials || []).find(m => m.id === addonId);
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
          const material = rawMaterials.find(m => m.id === addon.id);
          return {
            id: addon.id,
            name: material.name,
            quantity: addon.quantity,
            price: material.unitPrice * addon.quantity
          };
        }),
        // Use the editable price instead of calculated price
        price: editablePrice / quantity,
        // Preserve variant and size information
        selectedVariant: product.selectedVariant,
        selectedSize: product.selectedSize
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
      width={800}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
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
            </div>
            <div className="text-right">
              <Text strong className="text-xl text-blue-600">LKR {product.price.toFixed(2)}</Text>
              <div className="mt-2">
                <Text strong>Quantity: </Text>
                <InputNumber
                  min={1}
                  max={product.stock || 1}
                  value={quantity}
                  onChange={setQuantity}
                  className="ml-2"
                  step={1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Addons Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Title level={5}>Available Addons</Title>
            <Search
              placeholder="Search addons..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              allowClear
            />
          </div>
          
          {availableAddons.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Icon name="category" className="text-gray-300 text-2xl mb-2" />
              <Text type="secondary">No addons available</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableAddons.map(material => {
                const isSelected = selectedAddons.some(addon => addon.id === material.id);
                return (
                  <Card
                    key={material.id}
                    size="small"
                    className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}
                    onClick={() => handleAddonChange(material.id, !isSelected)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleAddonChange(material.id, e.target.checked)}
                          className="mr-3"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon name="category" className="text-blue-600" />
                          </div>
                          <div>
                            <Text strong>{material.name}</Text>
                            <div>
                              <Text type="secondary" className="text-sm">
                                LKR {material.unitPrice.toFixed(2)} per {material.unit}
                              </Text>
                            </div>
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
                            step={1}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Text className="ml-2">{material.unit}</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Addons Summary */}
        {selectedAddons.length > 0 && (
          <div className="border rounded-lg p-4">
            <Title level={5}>Selected Addons</Title>
            <List
              dataSource={selectedAddons}
              renderItem={addon => {
                const material = (rawMaterials || []).find(m => m.id === addon.id);
                if (!material) return null;
                
                return (
                  <List.Item
                    key={addon.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <Text strong>{material.name}</Text>
                      <div>
                        <Text type="secondary" className="text-sm">
                          {addon.quantity} {material.unit} × LKR {material.unitPrice.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                    <Text strong>LKR {(material.unitPrice * addon.quantity).toFixed(2)}</Text>
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Base Price:</Text>
              <Text>LKR {(product.price || 0).toFixed(2)} × {quantity}</Text>
            </div>
            
            {selectedAddons.length > 0 && (
              <>
                <div className="flex justify-between">
                  <Text>Addons:</Text>
                  <Text>
                    LKR {selectedAddons.reduce((sum, addon) => {
                      const material = (rawMaterials || []).find(m => m.id === addon.id);
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

            <div className="flex justify-between items-center">
              <Text strong>Final Price:</Text>
              <InputNumber
                className="w-32"
                min={0}
                value={editablePrice}
                onChange={(value) => setEditablePrice(value)}
                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                step={100}
              />
            </div>

            <Text type="secondary" className="text-xs block">
              Suggested price: LKR {totalPrice.toFixed(2)} (calculated from base price and addons)
            </Text>

            <Divider className="my-2" />
            
            <div className="flex justify-between">
              <Text strong>Total:</Text>
              <Text strong className="text-blue-600 text-lg">LKR {editablePrice.toFixed(2)}</Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            onClick={handleSubmit}
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