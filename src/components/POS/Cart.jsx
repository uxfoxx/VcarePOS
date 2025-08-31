import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Space, 
  InputNumber, 
  Button, 
  Divider, 
  Input,
  Tag,
  Image,
  Alert,
  message,
  Popconfirm
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} from '../../features/cart/cartSlice';
import { 
  fetchTaxes 
} from '../../features/taxes/taxesSlice';
import { 
  fetchCoupons, 
  validateCoupon 
} from '../../features/coupons/couponsSlice';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { CheckoutModal } from './CheckoutModal';

const { Title, Text } = Typography;
const { Search } = Input;

export function Cart() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const cart = useSelector(state => state.cart.cart);
  const taxes = useSelector(state => state.taxes.taxesList);
  const coupons = useSelector(state => state.coupons.couponsList);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTaxes());
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price;
    const addonsPrice = (item.addons || []).reduce((addonSum, addon) => 
      addonSum + (addon.price * addon.quantity), 0
    );
    return sum + ((itemPrice + addonsPrice) * item.quantity);
  }, 0);

  // Calculate category taxes
  const categoryTaxTotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const categoryTaxes = taxes.filter(tax => 
      tax.isActive && 
      tax.taxType === 'category' && 
      tax.applicableCategories.includes(item.product.category)
    );
    
    return sum + categoryTaxes.reduce((taxSum, tax) => 
      taxSum + (itemTotal * tax.rate / 100), 0
    );
  }, 0);

  // Apply coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (subtotal * appliedCoupon.discountPercent) / 100;
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = appliedCoupon.discountAmount;
    }
  }

  // Calculate full bill taxes (applied after discount)
  const taxableAmount = subtotal + categoryTaxTotal - couponDiscount;
  const fullBillTaxes = taxes.filter(tax => 
    tax.isActive && tax.taxType === 'full_bill'
  );
  const fullBillTaxTotal = fullBillTaxes.reduce((sum, tax) => 
    sum + (taxableAmount * tax.rate / 100), 0
  );

  const totalTax = categoryTaxTotal + fullBillTaxTotal;
  const total = subtotal + totalTax - couponDiscount;

  const handleQuantityChange = (productId, selectedColorId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ productId, selectedColorId, selectedSize }));
    } else {
      dispatch(updateQuantity({ productId, selectedColorId, selectedSize, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId, selectedColorId, selectedSize) => {
    dispatch(removeFromCart({ productId, selectedColorId, selectedSize }));
    message.success('Item removed from cart');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setAppliedCoupon(null);
    setCouponCode('');
    message.success('Cart cleared');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    
    try {
      // Find coupon in the list
      const coupon = coupons.find(c => 
        c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive
      );
      
      if (!coupon) {
        message.error('Invalid coupon code');
        setCouponLoading(false);
        return;
      }

      // Validate coupon
      dispatch(validateCoupon({ code: couponCode, amount: subtotal }));
      
      // For demo purposes, we'll apply it directly
      // In a real app, you'd wait for the validation response
      setAppliedCoupon(coupon);
      message.success(`Coupon "${coupon.code}" applied successfully!`);
      setCouponCode('');
    } catch (error) {
      message.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    message.success('Coupon removed');
  };

  const canCheckout = cart.length > 0 && hasPermission('transactions', 'edit');

  return (
    <>
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={4} className="m-0">Shopping Cart</Title>
              <Text type="secondary" className="text-sm">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
              </Text>
            </div>
            {cart.length > 0 && (
              <Popconfirm
                title="Clear all items from cart?"
                onConfirm={handleClearCart}
                okText="Clear"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <ActionButton.Text 
                  icon="delete_sweep"
                  danger
                  size="small"
                >
                  Clear Cart
                </ActionButton.Text>
              </Popconfirm>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 300px)' }}>
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="shopping_cart" className="text-6xl text-gray-300 mb-4" />
                <Title level={4} type="secondary">Cart is Empty</Title>
                <Text type="secondary">Add products to get started</Text>
              </div>
            </div>
          ) : (
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3 w-full">
                    <Image
                      src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="object-cover rounded"
                      preview={false}
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    
                    <div className="flex-1">
                      <Text strong className="block">{item.product.name}</Text>
                      <Text type="secondary" className="text-xs">
                        SKU: {item.product.barcode}
                      </Text>
                      {item.selectedSize && (
                        <Tag size="small" color="blue" className="mt-1">
                          {item.selectedSize}
                        </Tag>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <Tag size="small" color="green" className="mt-1">
                          +{item.addons.length} addon{item.addons.length !== 1 ? 's' : ''}
                        </Tag>
                      )}
                      <div className="mt-1">
                        <Text strong className="text-blue-600">
                          LKR {item.product.price.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <InputNumber
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(
                          item.product.id, 
                          item.selectedColorId, 
                          item.selectedSize, 
                          value
                        )}
                        size="small"
                        className="w-16"
                      />
                      
                      <ActionButton.Text
                        icon="delete"
                        danger
                        size="small"
                        onClick={() => handleRemoveItem(
                          item.product.id, 
                          item.selectedColorId, 
                          item.selectedSize
                        )}
                      />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            {/* Coupon Section */}
            <div className="mb-4">
              {!appliedCoupon ? (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onPressEnter={handleApplyCoupon}
                    className="flex-1"
                  />
                  <ActionButton
                    onClick={handleApplyCoupon}
                    loading={couponLoading}
                    icon="local_offer"
                  >
                    Apply
                  </ActionButton>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
                  <div>
                    <Text strong className="text-green-800">
                      Coupon Applied: {appliedCoupon.code}
                    </Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {appliedCoupon.description}
                    </Text>
                  </div>
                  <ActionButton.Text
                    icon="close"
                    onClick={handleRemoveCoupon}
                    size="small"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Subtotal:</Text>
                <Text>LKR {subtotal.toFixed(2)}</Text>
              </div>
              
              {categoryTaxTotal > 0 && (
                <div className="flex justify-between">
                  <Text>Category Tax:</Text>
                  <Text>LKR {categoryTaxTotal.toFixed(2)}</Text>
                </div>
              )}
              
              {fullBillTaxTotal > 0 && (
                <div className="flex justify-between">
                  <Text>Sales Tax:</Text>
                  <Text>LKR {fullBillTaxTotal.toFixed(2)}</Text>
                </div>
              )}
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <Text>Discount:</Text>
                  <Text>-LKR {couponDiscount.toFixed(2)}</Text>
                </div>
              )}
              
              <Divider className="my-2" />
              
              <div className="flex justify-between">
                <Title level={4} className="m-0">Total:</Title>
                <Title level={4} className="m-0 text-blue-600">
                  LKR {total.toFixed(2)}
                </Title>
              </div>
            </div>

            <ActionButton.Primary
              block
              size="large"
              onClick={() => setShowCheckout(true)}
              disabled={!canCheckout}
              icon="payment"
              className="mt-4"
            >
              {canCheckout ? 'Proceed to Checkout' : 'No Permission to Checkout'}
            </ActionButton.Primary>
          </div>
        )}
      </Card>

      {/* Checkout Modal */}
      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cart}
        subtotal={subtotal}
        categoryTaxTotal={categoryTaxTotal}
        fullBillTaxTotal={fullBillTaxTotal}
        totalTax={totalTax}
        discount={couponDiscount}
        total={total}
        appliedCoupon={appliedCoupon?.code}
        appliedTaxes={{
          categoryTaxes: taxes.filter(t => t.isActive && t.taxType === 'category'),
          fullBillTaxes: taxes.filter(t => t.isActive && t.taxType === 'full_bill')
        }}
      />
    </>
  );
}