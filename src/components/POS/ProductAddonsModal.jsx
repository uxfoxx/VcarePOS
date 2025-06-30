import React, { useState } from 'react';
import { 
  Modal, 
  Typography,
  Row,
  Col,
  Card,
  Space,
  Checkbox,
  InputNumber,
  message,
  Alert,
  Divider
} from 'antd';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function ProductAddonsModal({ 
  open, 
  onClose, 
  product, 
  availableAddons = [], 
  onAddToCart 
}) {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonQuantities, setAddonQuantities] = useState({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleAddonChange = (addonId, checked) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonId]);
      setAddonQuantities({
        ...addonQuantities,
        [addonId]: 1
      });
    } else {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
      const newQuantities = { ...addonQuantities };
      delete newQuantities[addonId];
      setAddonQuantities(newQuantities);
    }
  };

  const handleQuantityChange = (addonId, quantity) => {
    setAddonQuantities({
      ...addonQuantities,
      [addonId]: quantity
    });
  };

  const handleSizeChange = (sizeName) => {
    setSelectedSize(sizeName);
  };

  const getSelectedSizeData = () => {
    if (!product?.hasSizes || !selectedSize) {
      return null;
    }
    return product.sizes.find(size => size.name === selectedSize);
  };

  const calculateTotalPrice = () => {
    let basePrice = product?.price || 0;
    
    // Use size-specific price if available
    const sizeData = getSelectedSizeData();
    if (sizeData) {
      basePrice = sizeData.price;
    }

    const addonsCost = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      const quantity = addonQuantities[addonId] || 1;
      return sum + (addon ? addon.unitPrice * quantity : 0);
    }, 0);

    return (basePrice + addonsCost) * productQuantity;
  };

  const handleAddToCart = () => {
    if (product?.hasSizes && !selectedSize) {
      message.error('Please select a size');
      return;
    }

    const sizeData = getSelectedSizeData();
    
    // Check stock availability
    const availableStock = sizeData ? sizeData.stock : product?.stock || 0;
    if (productQuantity > availableStock) {
      message.error(`Only ${availableStock} units available`);
      return;
    }

    // Check addon stock availability
    for (const addonId of selectedAddons) {
      const addon = availableAddons.find(a => a.id === addonId);
      const requiredQuantity = (addonQuantities[addonId] || 1) * productQuantity;
      if (addon && requiredQuantity > addon.stockQuantity) {
        message.error(`Only ${addon.stockQuantity} ${addon.unit} of ${addon.name} available`);
        return;
      }
    }

    const selectedAddonDetails = selectedAddons.map(addonId => {
      const addon = availableAddons.find(a => a.id === addonId);
      return {
        ...addon,
        quantity: addonQuantities[addonId] || 1,
        totalCost: addon.unitPrice * (addonQuantities[addonId] || 1)
      };
    });

    const productWithAddons = {
      ...product,
      selectedSize,
      addons: selectedAddonDetails,
      addonsCost: selectedAddonDetails.reduce((sum, addon) => sum + addon.totalCost, 0),
      originalPrice: sizeData ? sizeData.price : product.price,
      price: calculateTotalPrice() / productQuantity, // Price per unit including addons
      hasAddons: selectedAddonDetails.length > 0
    };

    onAddToCart(productWithAddons, productQuantity);
    handleClose();
    message.success('Product with addons added to cart');
  };

  const handleClose = () => {
    setSelectedAddons([]);
    setAddonQuantities({});
    setProductQuantity(1);
    setSelectedSize(null);
    onClose();
  };

  if (!product) return null;

  const sizeData = getSelectedSizeData();
  const totalPrice = calculateTotalPrice();
  const addonsCost = selectedAddons.reduce((sum, addonId) => {
    const addon = availableAddons.find(a => a.id === addonId);
    const quantity = addonQuantities[addonId] || 1;
    return sum + (addon ? addon.unitPrice * quantity : 0);
  }, 0);

  return (
    <Modal
      title={
        <Space>
          <Icon name="add_circle" className="text-blue-600" />
          <span>Add Product with Options</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Product Info */}
        <Card size="small">
          <div className="flex items-center space-x-4">
            <img
              src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <Title level={5} className="mb-1">{product.name}</Title>
              <Text type="secondary" className="block">{product.description}</Text>
              <Text strong className="text-blue-600">
                ${sizeData ? sizeData.price.toFixed(2) : product.price?.toFixed(2) || '0.00'}
                {selectedSize && ` (${selectedSize})`}
              </Text>
            </div>
          </div>
        </Card>

        {/* Size Selection */}
        {product.hasSizes && product.sizes && product.sizes.length > 0 && (
          <Card size="small" title="Select Size">
            <Row gutter={[8, 8]}>
              {product.sizes.map(size => (
                <Col key={size.id} span={8}>
                  <Card
                    size="small"
                    className={`cursor-pointer transition-all ${
                      selectedSize === size.name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-blue-300'
                    }`}
                    onClick={() => handleSizeChange(size.name)}
                  >
                    <div className="text-center">
                      <Text strong>{size.name}</Text>
                      <br />
                      <Text className="text-blue-600">${size.price.toFixed(2)}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {size.stock} available
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Product Quantity */}
        <Card size="small" title="Quantity">
          <div className="flex items-center space-x-4">
            <Text>Quantity:</Text>
            <InputNumber
              min={1}
              max={sizeData ? sizeData.stock : product.stock}
              value={productQuantity}
              onChange={setProductQuantity}
              className="w-24"
            />
            <Text type="secondary">
              (Max: {sizeData ? sizeData.stock : product.stock} available)
            </Text>
          </div>
        </Card>

        {/* Available Addons */}
        {availableAddons.length > 0 && (
          <Card size="small" title="Available Add-ons">
            <div className="space-y-3">
              {availableAddons.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                const quantity = addonQuantities[addon.id] || 1;
                
                return (
                  <div key={addon.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleAddonChange(addon.id, e.target.checked)}
                        />
                        <div>
                          <Text strong>{addon.name}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            {addon.category} • ${addon.unitPrice.toFixed(2)}/{addon.unit}
                          </Text>
                        </div>
                      </div>
                      <Text strong className="text-blue-600">
                        ${addon.unitPrice.toFixed(2)}
                      </Text>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Text className="text-sm">Quantity:</Text>
                          <InputNumber
                            min={1}
                            max={Math.floor(addon.stockQuantity / productQuantity)}
                            value={quantity}
                            onChange={(value) => handleQuantityChange(addon.id, value)}
                            size="small"
                            className="w-20"
                          />
                          <Text type="secondary" className="text-xs">
                            {addon.unit} (Stock: {addon.stockQuantity})
                          </Text>
                        </div>
                        <Text strong className="text-green-600">
                          +${(addon.unitPrice * quantity).toFixed(2)}
                        </Text>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Pricing Summary */}
        <Card size="small" title="Order Summary">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Product ({productQuantity}x):</Text>
              <Text>
                ${((sizeData ? sizeData.price : product.price) * productQuantity).toFixed(2)}
              </Text>
            </div>
            
            {selectedAddons.length > 0 && (
              <>
                <div className="flex justify-between">
                  <Text>Add-ons:</Text>
                  <Text>+${(addonsCost * productQuantity).toFixed(2)}</Text>
                </div>
                <div className="ml-4 space-y-1">
                  {selectedAddons.map(addonId => {
                    const addon = availableAddons.find(a => a.id === addonId);
                    const quantity = addonQuantities[addonId] || 1;
                    return (
                      <div key={addonId} className="flex justify-between text-sm">
                        <Text type="secondary">
                          {addon?.name} ({quantity}x{productQuantity} = {quantity * productQuantity})
                        </Text>
                        <Text type="secondary">
                          ${(addon?.unitPrice * quantity * productQuantity).toFixed(2)}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            <Divider className="my-2" />
            <div className="flex justify-between">
              <Text strong className="text-lg">Total:</Text>
              <Text strong className="text-lg text-blue-600">
                ${totalPrice.toFixed(2)}
              </Text>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex justify-end space-x-2">
          <ActionButton onClick={handleClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            onClick={handleAddToCart}
            icon="add_shopping_cart"
            disabled={product.hasSizes && !selectedSize}
          >
            Add to Cart
          </ActionButton.Primary>
        </div>
      </div>
    </Modal>
  );
}