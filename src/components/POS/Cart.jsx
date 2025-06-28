import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Divider, 
  Badge,
  Popconfirm,
  message,
  Tabs,
  Form,
  Input,
  Select
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function Cart() {
  const { state, dispatch } = usePOS();
  const [activeTab, setActiveTab] = useState('order');
  const [customerForm] = Form.useForm();
  const [couponForm] = Form.useForm();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const total = subtotal + tax - couponDiscount;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: newQuantity } });
    }
  };

  const handleApplyCoupon = (values) => {
    const coupon = state.coupons?.find(c => c.code === values.couponCode && c.isActive);
    if (coupon) {
      setAppliedCoupon(coupon);
      message.success(`Coupon applied! ${coupon.discountPercent}% discount`);
      couponForm.resetFields();
    } else {
      message.error('Invalid or expired coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    message.info('Coupon removed');
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }

    const customerData = customerForm.getFieldsValue();
    
    const transaction = {
      id: `TXN-${Date.now()}`,
      items: state.cart,
      subtotal,
      tax,
      discount: couponDiscount,
      total,
      paymentMethod: 'card',
      timestamp: new Date(),
      cashier: state.currentUser?.name || 'Unknown',
      customerName: customerData.customerName,
      customerPhone: customerData.customerPhone,
      customerAddress: customerData.customerAddress,
      appliedCoupon: appliedCoupon?.code,
      notes: orderNotes
    };

    // Update product stock
    state.cart.forEach(item => {
      dispatch({ 
        type: 'UPDATE_PRODUCT_STOCK', 
        payload: { productId: item.product.id, quantity: item.quantity }
      });
    });

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    dispatch({ type: 'CLEAR_CART' });
    setAppliedCoupon(null);
    setOrderNotes('');
    customerForm.resetFields();
    couponForm.resetFields();
    
    message.success('Order completed successfully!');
  };

  const renderOrderTab = () => (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="max-h-64 overflow-y-auto">
        {state.cart.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-gray-300 mb-2">restaurant</span>
            <Text type="secondary">No items in order</Text>
          </div>
        ) : (
          <List
            dataSource={state.cart}
            renderItem={(item, index) => (
              <List.Item className="px-0 py-2">
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
                      <Button 
                        type="text" 
                        size="small"
                        icon={<span className="material-icons text-gray-400">close</span>}
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
                    <Text strong className="text-[#0E72BD]">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <Text>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Tax (8%)</Text>
          <Text>${tax.toFixed(2)}</Text>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between">
            <Text className="text-green-600">Coupon ({appliedCoupon.code})</Text>
            <Text className="text-green-600">-${couponDiscount.toFixed(2)}</Text>
          </div>
        )}
        <Divider className="my-2" />
        <div className="flex justify-between">
          <Title level={5} className="m-0">Total</Title>
          <Title level={4} className="m-0 text-[#0E72BD]">
            ${total.toFixed(2)}
          </Title>
        </div>
      </div>
    </div>
  );

  const renderCustomerTab = () => (
    <div className="space-y-4">
      <Title level={5} className="mb-4">Customer Information</Title>
      <Form form={customerForm} layout="vertical">
        <Form.Item name="customerName" label="Customer Name">
          <Input 
            prefix={<span className="material-icons text-gray-400">person</span>}
            placeholder="Enter customer name (optional)"
          />
        </Form.Item>
        
        <Form.Item name="customerPhone" label="Phone Number">
          <Input 
            prefix={<span className="material-icons text-gray-400">phone</span>}
            placeholder="Enter phone number (optional)"
          />
        </Form.Item>
        
        <Form.Item name="customerEmail" label="Email Address">
          <Input 
            prefix={<span className="material-icons text-gray-400">email</span>}
            placeholder="Enter email address (optional)"
            type="email"
          />
        </Form.Item>
        
        <Form.Item name="customerAddress" label="Delivery Address">
          <TextArea 
            placeholder="Enter delivery address (optional)"
            rows={3}
          />
        </Form.Item>
      </Form>
    </div>
  );

  const renderCouponsTab = () => (
    <div className="space-y-4">
      <Title level={5} className="mb-4">Coupons & Notes</Title>
      
      {/* Coupon Section */}
      <div className="space-y-3">
        <Text strong>Apply Coupon Code</Text>
        {appliedCoupon ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="text-green-800">{appliedCoupon.code}</Text>
                <br />
                <Text className="text-green-600 text-sm">
                  {appliedCoupon.discountPercent}% discount applied
                </Text>
              </div>
              <Button 
                type="text" 
                danger 
                size="small"
                onClick={handleRemoveCoupon}
                icon={<span className="material-icons">close</span>}
              />
            </div>
          </div>
        ) : (
          <Form form={couponForm} onFinish={handleApplyCoupon}>
            <div className="flex space-x-2">
              <Form.Item name="couponCode" className="flex-1 mb-0">
                <Input 
                  placeholder="Enter coupon code"
                  prefix={<span className="material-icons text-gray-400">local_offer</span>}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Apply
              </Button>
            </div>
          </Form>
        )}
      </div>

      <Divider />

      {/* Notes Section */}
      <div className="space-y-3">
        <Text strong>Order Notes</Text>
        <TextArea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Add special instructions or notes for this order..."
          rows={4}
        />
      </div>
    </div>
  );

  const tabItems = [
    {
      key: 'order',
      label: (
        <div className="flex items-center space-x-2">
          <span className="material-icons text-sm">shopping_cart</span>
          <span>Order</span>
          <Badge count={state.cart.length} size="small" />
        </div>
      ),
      children: renderOrderTab()
    },
    {
      key: 'customer',
      label: (
        <div className="flex items-center space-x-2">
          <span className="material-icons text-sm">person</span>
          <span>Customer</span>
        </div>
      ),
      children: renderCustomerTab()
    },
    {
      key: 'coupons',
      label: (
        <div className="flex items-center space-x-2">
          <span className="material-icons text-sm">local_offer</span>
          <span>Coupons & Notes</span>
          {appliedCoupon && <Badge dot />}
        </div>
      ),
      children: renderCouponsTab()
    }
  ];

  return (
    <Card 
      className="h-full"
      bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Title level={5} className="m-0">Current Order</Title>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="h-full"
            tabBarStyle={{ padding: '0 16px', margin: 0 }}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <div className="flex space-x-2">
            <Button 
              size="large"
              className="flex-1 bg-red-500 text-white border-red-500 hover:bg-red-600"
            >
              Hold Order
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckout}
              disabled={state.cart.length === 0}
              className="flex-1 bg-green-500 hover:bg-green-600 border-green-500"
            >
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}