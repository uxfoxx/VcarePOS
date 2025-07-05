import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  InputNumber, 
  Space, 
  Typography, 
  Divider, 
  Badge,
  Popconfirm,
  message,
  Input,
  Button,
  Alert,
  Tag,
  Empty
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { CheckoutModal } from './CheckoutModal';

const { Title, Text } = Typography;

export function Cart() {
  const { state, dispatch } = usePOS();
  const { checkRawMaterialAvailability } = useNotifications();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [materialWarnings, setMaterialWarnings] = useState({ unavailableMaterials: [], lowMaterials: [] });

  // Check raw material availability whenever cart changes
  useEffect(() => {
    if (state.cart.length > 0) {
      const warnings = checkRawMaterialAvailability(state.cart, state.rawMaterials);
      setMaterialWarnings(warnings);
    } else {
      setMaterialWarnings({ unavailableMaterials: [], lowMaterials: [] });
    }
  }, [state.cart, state.rawMaterials, checkRawMaterialAvailability]);

  // Calculate taxes for each item and total
  const calculateTaxes = () => {
    const activeTaxes = state.taxes?.filter(tax => tax.isActive) || [];
    let itemTaxes = [];
    let billTaxes = [];
    
    // Calculate category taxes for each item
    state.cart.forEach(cartItem => {
      const categoryTaxes = activeTaxes.filter(tax => 
        tax.taxType === 'category' && 
        tax.applicableCategories.includes(cartItem.product.category)
      );
      
      categoryTaxes.forEach(tax => {
        const taxAmount = (cartItem.product.price * cartItem.quantity * tax.rate) / 100;
        itemTaxes.push({
          taxId: tax.id,
          taxName: tax.name,
          rate: tax.rate,
          amount: taxAmount,
          productId: cartItem.product.id,
          productName: cartItem.product.name
        });
      });
    });

    // Get full bill taxes
    const fullBillTaxes = activeTaxes.filter(tax => tax.taxType === 'full_bill');
    
    return { itemTaxes, fullBillTaxes };
  };

  const { itemTaxes, fullBillTaxes } = calculateTaxes();
  
  const subtotal = state.cart.reduce((sum, item) => {
    // Include base price
    let itemTotal = item.product.price * item.quantity;

    // Add addon prices if any
    if (item.product.addons) {
      const addonTotal = item.product.addons.reduce((addonSum, addon) => 
        addonSum + addon.price, 0) * item.quantity;
      itemTotal += addonTotal;
    }
    
    return sum + itemTotal;
  }, 0);
  
  const categoryTaxTotal = itemTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const taxableAmount = subtotal + categoryTaxTotal - couponDiscount;
  
  // Calculate full bill taxes on the taxable amount
  const fullBillTaxTotal = fullBillTaxes.reduce((sum, tax) => sum + (taxableAmount * tax.rate) / 100, 0);
  
  const total = taxableAmount + fullBillTaxTotal;

  const handleQuantityChange = (productId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ 
        type: 'REMOVE_FROM_CART', 
        payload: { productId, selectedSize } 
      });
    } else {
      dispatch({ 
        type: 'UPDATE_QUANTITY', 
        payload: { productId, selectedSize, quantity: newQuantity } 
      });
    }
  };

  const handleApplyCoupon = () => {
    const coupon = state.coupons?.find(c => c.code === couponCode && c.isActive);
    if (coupon) {
      // Check if coupon is valid
      const now = new Date();
      const isExpired = coupon.validTo && new Date(coupon.validTo) < now;
      const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
      const meetsMinimum = !coupon.minimumAmount || subtotal >= coupon.minimumAmount;

      if (isExpired) {
        message.error('Coupon has expired');
        return;
      }
      if (isUsedUp) {
        message.error('Coupon usage limit reached');
        return;
      }
      if (!meetsMinimum) {
        message.error(`Minimum order amount is LKR ${coupon.minimumAmount}`);
        return;
      }

      setAppliedCoupon(coupon);
      message.success(`Coupon applied! ${coupon.discountPercent}% discount`);
      setCouponCode('');
    } else {
      message.error('Invalid or expired coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    message.info('Coupon removed');
  };

  const handleProceedToCheckout = () => {
    if (state.cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }
    
    // Show warnings but allow user to proceed
    if (materialWarnings.unavailableMaterials.length > 0) {
      message.warning('Some raw materials are out of stock. Production may be delayed.');
    } else if (materialWarnings.lowMaterials.length > 0) {
      message.warning('Some raw materials are running low. Consider restocking soon.');
    }
    
    setShowCheckoutModal(true);
  };

  return (
    <>
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold m-0">Current Order</h2>
              <Badge count={state.cart.length} size="small" />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full">
          {/* Raw Material Warnings */}
          {(materialWarnings.unavailableMaterials.length > 0 || materialWarnings.lowMaterials.length > 0) && (
            <div className="p-4 border-b">
              {materialWarnings.unavailableMaterials.length > 0 && (
                <Alert
                  type="error"
                  showIcon
                  message="Raw Materials Out of Stock"
                  description={
                    <div className="space-y-1">
                      {materialWarnings.unavailableMaterials.map((material, index) => (
                        <div key={index} className="text-sm">
                          <Text strong>{material.materialName}</Text> needed for{' '}
                          <Text>{material.productName}</Text> - Required: {material.required} {material.unit}, Available: {material.available} {material.unit}
                        </div>
                      ))}
                      <Text type="secondary" className="text-xs block mt-2">
                        You can still proceed with the order, but production may be delayed.
                      </Text>
                    </div>
                  }
                  className="mb-2"
                />
              )}
              
              {materialWarnings.lowMaterials.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="Raw Materials Running Low"
                  description={
                    <div className="space-y-1">
                      {materialWarnings.lowMaterials.map((material, index) => (
                        <div key={index} className="text-sm">
                          <Text strong>{material.materialName}</Text> for{' '}
                          <Text>{material.productName}</Text> - Required: {material.required} {material.unit}, Available: {material.available} {material.unit}
                        </div>
                      ))}
                      <Text type="secondary" className="text-xs block mt-2">
                        Consider restocking these materials soon.
                      </Text>
                    </div>
                  }
                />
              )}
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.cart.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Your cart is empty"
                className="flex flex-col items-center justify-center h-full"
              />
            ) : (
              <List
                dataSource={state.cart}
                renderItem={(item, index) => {
                  // Get category taxes for this item
                  const itemCategoryTaxes = itemTaxes.filter(tax => tax.productId === item.product.id);
                  const itemTaxAmount = itemCategoryTaxes.reduce((sum, tax) => sum + tax.amount, 0);
                  
                  // Calculate addon price if any
                  const addonPrice = item.product.addons ? 
                    item.product.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity : 0;
                  
                  // Calculate total price including addons
                  const itemTotalPrice = (item.product.price * item.quantity) + addonPrice;
                  
                  return (
                    <List.Item className="px-0 py-3 border-b border-gray-100">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge count={index + 1} size="small" color="#0E72BD" />
                            <div>
                              <Text strong className="text-sm">{item.product.name}</Text>
                              {item.selectedSize && (
                                <Text type="secondary" className="text-xs block">
                                  Size: {item.selectedSize}
                                </Text>
                                  Variant: {item.selectedVariant}
                                </Text>
                              )}
                              {item.selectedVariant && (
                                <Text type="secondary" className="text-xs block">
                                  Variant: {item.selectedVariant}
                                </Text>
                              )}
                              {item.product.isCustom && (
                                <Tag color="purple" className="ml-1">Custom</Tag>
                              )}
                            </div>
                          </div>
                          <Popconfirm
                            title="Remove item?"
                            onConfirm={() => dispatch({ 
                              type: 'REMOVE_FROM_CART', 
                              payload: { 
                                productId: item.product.id, 
                                selectedSize: item.selectedSize 
                              } 
                            })}
                          >
                            <ActionButton.Text 
                              icon="close"
                              size="small"
                              className="text-gray-400 hover:text-red-500"
                            />
                          </Popconfirm>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Text className="text-sm">LKR {item.product.price.toFixed(2)}</Text>
                            <InputNumber
                              min={1}
                              max={100}
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item.product.id, item.selectedSize, value || 1)}
                              size="small"
                              className="w-16"
                            />
                          </div>
                          <div className="text-right">
                            <Text strong className="text-blue-600">
                              LKR {itemTotalPrice.toFixed(2)}
                            </Text>
                            {itemTaxAmount > 0 && (
                              <Text type="secondary" className="text-xs block">
                                +LKR {itemTaxAmount.toFixed(2)} tax
                              </Text>
                                Variant: {item.selectedVariant}
                              </Text>
                            )}
                            {item.selectedVariant && (
                              <Text type="secondary" className="text-xs block">
                                Variant: {item.selectedVariant}
                              </Text>
                            )}
                          </div>
                        </div>
                        
                        {/* Show addons if any */}
                        {item.product.addons && item.product.addons.length > 0 && (
                          <div className="mt-1 pl-4 border-l-2 border-blue-200">
                            <Text type="secondary" className="text-xs">Addons:</Text>
                            {item.product.addons.map((addonItem, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <Text type="secondary">
                                  {addonItem.name} × {addonItem.quantity}
                                </Text>
                                <Text type="secondary">
                                  +LKR {addonItem.price.toFixed(2)}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Show category taxes for this item */}
                        {itemCategoryTaxes.length > 0 && (
                          <div className="mt-1">
                            {itemCategoryTaxes.map(tax => (
                              <Text key={tax.taxId} type="secondary" className="text-xs block">
                                {tax.taxName} ({tax.rate}%): +LKR {tax.amount.toFixed(2)}
                              </Text>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-1">
                          <Text type="secondary" className="text-xs">
                            {itemTaxAmount > 0 && ` + LKR ${itemTaxAmount.toFixed(2)} tax`} 
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Subtotal</Text>
                <Text>LKR {subtotal.toFixed(2)}</Text>
              </div>

              {/* Category Taxes */}
              {categoryTaxTotal > 0 && (
                <div className="flex justify-between">
                  <Text>Category Taxes</Text>
                  <Text>LKR {categoryTaxTotal.toFixed(2)}</Text>
                </div>
              )}

              {/* Coupon Section */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text strong className="text-green-800 text-sm">{appliedCoupon.code}</Text>
                        <br />
                        <Text className="text-green-600 text-xs">
                          {appliedCoupon.discountPercent}% discount
                        </Text>
                      </div>
                      <ActionButton.Text 
                        icon="close"
                        danger 
                        size="small"
                        onClick={handleRemoveCoupon}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <Text className="text-green-600 text-sm">Discount</Text>
                      <Text className="text-green-600 text-sm">-LKR {couponDiscount.toFixed(2)}</Text>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      <Input 
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        size="middle"
                        onPressEnter={handleApplyCoupon}
                        className="flex-1"
                      />
                      <Button 
                        size="middle" 
                        type="primary"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Bill Taxes */}
              {fullBillTaxes.map(tax => (
                <div key={tax.id} className="flex justify-between">
                  <Text>{tax.name} ({tax.rate}%)</Text>
                  <Text>LKR {((taxableAmount * tax.rate) / 100).toFixed(2)}</Text>
                </div>
              ))}

              <Divider className="my-2" />
              <div className="flex justify-between">
                <Title level={5} className="m-0">Total</Title>
                <Title level={4} className="m-0 text-blue-600">
                  LKR {total.toFixed(2)}
                </Title>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="border-t border-gray-200 p-4">
            <Button
              type="primary"
              icon={<Icon name="arrow_forward" />}
              size="large"
              block
              onClick={handleProceedToCheckout}
              disabled={state.cart.length === 0}
              className="bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
            >
              Proceed to Checkout
              {(materialWarnings.unavailableMaterials.length > 0 || materialWarnings.lowMaterials.length > 0) && (
                <Icon name="warning" className="ml-2 text-yellow-300" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <CheckoutModal
        open={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={state.cart}
        orderTotal={total}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        itemTaxes={itemTaxes}
        fullBillTaxes={fullBillTaxes}
        categoryTaxTotal={categoryTaxTotal}
        fullBillTaxTotal={fullBillTaxTotal}
      />
    </>
  );
}