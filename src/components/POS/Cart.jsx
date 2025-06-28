import React, { useState } from 'react';
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
  Button
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { CheckoutModal } from './CheckoutModal';

const { Title, Text } = Typography;

export function Cart() {
  const { state, dispatch } = usePOS();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');

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
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const categoryTaxTotal = itemTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const taxableAmount = subtotal + categoryTaxTotal - couponDiscount;
  
  // Calculate full bill taxes on the taxable amount
  const fullBillTaxTotal = fullBillTaxes.reduce((sum, tax) => sum + (taxableAmount * tax.rate) / 100, 0);
  
  const total = taxableAmount + fullBillTaxTotal;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: newQuantity } });
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
        message.error(`Minimum order amount is $${coupon.minimumAmount}`);
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
              <Icon name="shopping_cart" className="text-[#0E72BD]" />
              <Title level={5} className="m-0">Current Order</Title>
              <Badge count={state.cart.length} size="small" />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.cart.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="shopping_cart" className="text-4xl text-gray-300 mb-2" />
                <Text type="secondary">No items in cart</Text>
              </div>
            ) : (
              <List
                dataSource={state.cart}
                renderItem={(item, index) => {
                  // Get category taxes for this item
                  const itemCategoryTaxes = itemTaxes.filter(tax => tax.productId === item.product.id);
                  const itemTaxAmount = itemCategoryTaxes.reduce((sum, tax) => sum + tax.amount, 0);
                  
                  return (
                    <List.Item className="px-0 py-3 border-b border-gray-100">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge count={index + 1} size="small" color="#0E72BD" />
                            <Text strong className="text-sm">{item.product.name}</Text>
                          </div>
                          <Popconfirm
                            title="Remove item?"
                            onConfirm={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id })}
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
                            <Text className="text-sm">${item.product.price.toFixed(2)}</Text>
                            <InputNumber
                              min={1}
                              max={item.product.stock + item.quantity}
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item.product.id, value || 1)}
                              size="small"
                              className="w-16"
                            />
                          </div>
                          <div className="text-right">
                            <Text strong className="text-[#0E72BD]">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </Text>
                            {itemTaxAmount > 0 && (
                              <>
                                <br />
                                <Text type="secondary" className="text-xs">
                                  +${itemTaxAmount.toFixed(2)} tax
                                </Text>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Show category taxes for this item */}
                        {itemCategoryTaxes.length > 0 && (
                          <div className="mt-1">
                            {itemCategoryTaxes.map(tax => (
                              <Text key={tax.taxId} type="secondary" className="text-xs block">
                                {tax.taxName} ({tax.rate}%): +${tax.amount.toFixed(2)}
                              </Text>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-1">
                          <Text type="secondary" className="text-xs">
                            SKU: {item.product.barcode} | Stock: {item.product.stock}
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
          {state.cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Subtotal</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </div>

                {/* Category Taxes */}
                {categoryTaxTotal > 0 && (
                  <div className="flex justify-between">
                    <Text>Category Taxes</Text>
                    <Text>${categoryTaxTotal.toFixed(2)}</Text>
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
                        <Text className="text-green-600 text-sm">-${couponDiscount.toFixed(2)}</Text>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Text className="text-sm font-medium">Apply Coupon</Text>
                      <div className="flex space-x-1">
                        <Input 
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          size="small"
                          onPressEnter={handleApplyCoupon}
                        />
                        <Button 
                          size="small" 
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
                    <Text>${((taxableAmount * tax.rate) / 100).toFixed(2)}</Text>
                  </div>
                ))}

                <Divider className="my-2" />
                <div className="flex justify-between">
                  <Title level={5} className="m-0">Total</Title>
                  <Title level={4} className="m-0 text-[#0E72BD]">
                    ${total.toFixed(2)}
                  </Title>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="border-t border-gray-200 p-4">
            <ActionButton.Primary
              icon="arrow_forward"
              size="large"
              block
              onClick={handleProceedToCheckout}
              disabled={state.cart.length === 0}
              className="bg-[#0E72BD] hover:bg-blue-700 font-semibold"
            >
              Proceed to Checkout
            </ActionButton.Primary>
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