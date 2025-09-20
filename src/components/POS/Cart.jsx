import { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  InputNumber, 
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
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../../features/cart/cartSlice';
import { fetchTaxes } from '../../features/taxes/taxesSlice';
import { fetchCoupons } from '../../features/coupons/couponsSlice';
import { useReduxNotifications as useNotifications } from '../../hooks/useReduxNotifications';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon'; 
import { CheckoutModal } from '../POS/CheckoutModal';

const { Title, Text } = Typography;

export function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.cart);
  const taxes = useSelector(state => state.taxes.taxesList);
  const coupons = useSelector(state => state.coupons.couponsList);
  const { checkRawMaterialAvailability } = useNotifications();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [materialWarnings, setMaterialWarnings] = useState({ unavailableMaterials: [], lowMaterials: [] });

  // Check raw material availability and reset coupon when cart is cleared
  useEffect(() => {
    if (cart && cart.length > 0) {
      const warnings = checkRawMaterialAvailability(cart);
      setMaterialWarnings(warnings);
    } else {
      setMaterialWarnings({ unavailableMaterials: [], lowMaterials: [] });
      setAppliedCoupon(null); // Reset applied coupon when cart is empty
      setCouponCode(''); // Reset coupon code input when cart is empty
    }
  }, [cart, checkRawMaterialAvailability]);

  // Fetch taxes and coupons on mount
  useEffect(() => {
    dispatch(fetchTaxes());
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Early return if cart is not properly initialized
  if (!cart) {
    return (
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold m-0">Current Order</h2>
              <Badge count={0} size="small" />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full items-center justify-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Loading cart..."
            className="flex flex-col items-center justify-center h-full"
          />
        </div>
      </Card>
    );
  }

  // Calculate taxes for each item and total
  const calculateTaxes = () => {
    const activeTaxes = Array.isArray(taxes) ? taxes.filter(tax => tax.isActive) : [];
    let itemTaxes = [];
    
    // Calculate category taxes for each item
    cart.forEach(cartItem => {
      const categoryTaxes = activeTaxes.filter(tax =>
        tax.taxType === 'category' &&
        Array.isArray(tax.applicableCategories) &&
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
    const fullBillTaxes = activeTaxes.filter(tax => tax && tax.taxType === 'full_bill');
    
    return { itemTaxes, fullBillTaxes };
  };

  const { itemTaxes, fullBillTaxes } = calculateTaxes();
  
  const subtotal = cart.reduce((sum, item) => {
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
  
  const categoryTaxTotal = itemTaxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);
  
  // Calculate coupon discount based on type
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (subtotal * (appliedCoupon.discountPercent || 0)) / 100;
      // Apply maximum discount limit if specified
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'fixed') {
      couponDiscount = appliedCoupon.discountAmount || 0;
    }
  }
  
  const taxableAmount = subtotal + categoryTaxTotal - couponDiscount;
  
  // Calculate full bill taxes on the taxable amount
  const fullBillTaxTotal = fullBillTaxes.reduce((sum, tax) => sum + (taxableAmount * tax.rate) / 100, 0);
  
  const total = taxableAmount + fullBillTaxTotal;

  const handleQuantityChange = (productId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      // Find the cart item to get the selectedColorId
      const cartItem = cart.find(item => 
        item.product.id === productId && item.selectedSize === selectedSize
      );
      dispatch(removeFromCart({ 
        productId, 
        selectedColorId: cartItem?.selectedColorId,
        selectedSize 
      }));
    } else {
      // Find the cart item to get the selectedColorId
      const cartItem = cart.find(item => 
        item.product.id === productId && item.selectedSize === selectedSize
      );
      dispatch(updateQuantity({ 
        productId, 
        selectedColorId: cartItem?.selectedColorId,
        selectedSize, 
        quantity: newQuantity 
      }));
    }
  };

  const handleApplyCoupon = () => {
    const coupon = coupons?.find(c => c.code === couponCode && c.isActive);
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

      // Check category restrictions
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        const cartCategories = cart.map(item => item.product.category);
        const hasApplicableProducts = coupon.applicableCategories.some(category => 
          cartCategories.includes(category)
        );
        if (!hasApplicableProducts) {
          message.error(`This coupon is only valid for: ${coupon.applicableCategories.join(', ')}`);
          return;
        }
      }

      setAppliedCoupon(coupon);
      const discountText = coupon.discountType === 'percentage' 
        ? `${coupon.discountPercent}% discount`
        : `LKR ${coupon.discountAmount} discount`;
      message.success(`Coupon applied! ${discountText}`);
      setCouponCode(''); // Clear the coupon code input
    } else {
      message.error('Invalid or expired coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode(''); // Clear the coupon code input when removing coupon
    message.info('Coupon removed');
  };

  const handleCheckoutSuccess = () => {
    // Clear cart, coupon code, and applied coupon after successful checkout
    dispatch(clearCart());
    setAppliedCoupon(null);
    setCouponCode('');
    setShowCheckoutModal(false);
    message.success('Checkout completed successfully');
  };

  const handleCloseCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCouponCode(''); // Clear coupon code input when closing checkout modal
    // Clear applied coupon only if cart is empty
    if (cart.length === 0) {
      setAppliedCoupon(null);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
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
              <Badge count={cart.length} size="small" />
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
            {cart.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Your cart is empty"
                className="flex flex-col items-center justify-center h-full"
              />
            ) : (
              <List
                dataSource={cart}
                renderItem={(item, index) => {
                  // Get category taxes for this item
                  const itemCategoryTaxes = itemTaxes.filter(tax => tax.productId === item.product.id);
                  const itemTaxAmount = itemCategoryTaxes.reduce((sum, tax) => sum + tax.amount, 0);
                  
                  // Calculate addon price if any
                  const addonPrice = item.product.addons ? 
                    item.product.addons.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0) * item.quantity : 0;
                  
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
                              )}
                              {item.selectedColor && (
                                <Text type="secondary" className="text-xs block">
                                  Color: {item.selectedColor.name}
                                </Text>
                              )}
                              {item.product.isCustom && (
                                <Tag color="purple" className="ml-1">Custom</Tag>
                              )}
                            </div>
                          </div>
                          <Popconfirm
                            title="Remove item?"
                            onConfirm={() => dispatch(removeFromCart({ 
                              productId: item.product.id, 
                              selectedColorId: item.selectedColorId,
                              selectedSize: item.selectedSize 
                            }))}
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
                              LKR {(itemTotalPrice || 0).toFixed(2)}
                            </Text>
                            {itemTaxAmount > 0 && (
                              <Text type="secondary" className="text-xs block">
                                +LKR {(itemTaxAmount || 0).toFixed(2)} tax
                              </Text>
                            )}
                          </div>
                        </div>
                        
                        {/* Show addons if any */ }
                        {item.product.addons && Array.isArray(item.product.addons) && item.product.addons.length > 0 && (
                          <div className="mt-1 pl-4 border-l-2 border-blue-200">
                            <Text type="secondary" className="text-xs block mb-1">
                              <Icon name="add_circle" className="mr-1" />
                              Add-ons:
                            </Text>
                            {item.product.addons.map((addonItem, idx) => (
                              <div key={idx} className="flex justify-between text-xs mb-1 bg-blue-50 px-2 py-1 rounded">
                                <Text type="secondary">
                                  <Icon name="fiber_manual_record" className="mr-1 text-xs" />
                                  {addonItem.name || 'Add-on'} × {addonItem.quantity || 1}
                                </Text>
                                <Text type="secondary" className="font-medium">
                                  +LKR {(addonItem.price || 0).toFixed(2)}
                                </Text>
                              </div>
                            ))}
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              Total Add-ons: +LKR {item.product.addons.reduce((sum, addon) => sum + (addon.price || 0), 0).toFixed(2)}
                            </div>
                          </div>
                        )}
                        
                        {/* Show category taxes for this item */}
                        {itemCategoryTaxes.length > 0 && (
                          <div className="mt-1">
                            {itemCategoryTaxes.map(tax => (
                              <Text key={tax.taxId} type="secondary" className="text-xs block">
                                {tax.taxName || 'Tax'} ({tax.rate || 0}%): +LKR {(tax.amount || 0).toFixed(2)}
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
                <Text>LKR {(subtotal || 0).toFixed(2)}</Text>
              </div>

              {/* Category Taxes */}
              {categoryTaxTotal > 0 && (
                <div className="flex justify-between">
                  <Text>Category Taxes</Text>
                  <Text>LKR {(categoryTaxTotal || 0).toFixed(2)}</Text>
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
                          {appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discountPercent}% discount`
                            : `LKR ${appliedCoupon.discountAmount} discount`
                          }
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
                      <Text className="text-green-600 text-sm">-LKR {(couponDiscount || 0).toFixed(2)}</Text>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      <Input 
                        placeholder="Enter coupon code"
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
                  <Text>LKR {((taxableAmount * (tax.rate || 0)) / 100).toFixed(2)}</Text>
                </div>
              ))}

              <Divider className="my-2" />
              <div className="flex justify-between">
                <Title level={5} className="m-0">Total</Title>
                <Title level={4} className="m-0 text-blue-600">
                  LKR {(total || 0).toFixed(2)}
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
              disabled={cart.length === 0}
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
        onClose={handleCloseCheckoutModal}
        onSubmit={handleCheckoutSuccess}
        cartItems={cart}
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