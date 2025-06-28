import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Divider, 
  Input, 
  Form,
  Badge,
  Popconfirm,
  message,
  Select
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Title, Text } = Typography;
const { Option } = Select;

export function Cart() {
  const { state, dispatch } = usePOS();
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [note, setNote] = useState('');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + tax - discountAmount;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: newQuantity } });
    }
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }

    const transaction = {
      id: `TXN-${Date.now()}`,
      items: state.cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod: 'card',
      timestamp: new Date(),
      cashier: state.currentUser?.name || 'Unknown',
      customerName: customerName || undefined,
      note: note || undefined
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
    setCustomerName('');
    setDiscount(0);
    setCouponCode('');
    setNote('');
    
    message.success('Order completed successfully!');
  };

  return (
    <Card 
      className="h-full"
      bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Title level={5} className="m-0">Current Order</Title>
            <Badge count={state.cart.length} showZero color="#0E72BD" />
          </div>
          <Button 
            type="text" 
            icon={<span className="material-icons">add</span>}
            className="text-blue-500"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 300px)' }}>
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
                      <span className="material-icons text-gray-400 text-sm">close</span>
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
                  
                  <div className="flex items-center justify-between mt-1">
                    <Text type="secondary" className="text-xs">Quantity</Text>
                    <div className="flex items-center space-x-2">
                      <Text type="secondary" className="text-xs">Discount(%)</Text>
                      <InputNumber
                        min={0}
                        max={100}
                        value={0}
                        size="small"
                        className="w-16"
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Order Summary and Actions */}
      <div className="border-t border-gray-200 p-4 space-y-4">
        {/* Add Items */}
        <div className="flex space-x-2">
          <Button 
            block 
            icon={<span className="material-icons">add</span>}
            className="text-blue-500 border-blue-500"
          >
            Add
          </Button>
          <Button 
            block
            className="text-orange-500 border-orange-500"
          >
            Discount
          </Button>
          <Button 
            block
            className="text-purple-500 border-purple-500"
          >
            Coupon Code
          </Button>
          <Button 
            block
            className="text-green-500 border-green-500"
          >
            Note
          </Button>
        </div>

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Tax</Text>
            <Text>${tax.toFixed(2)}</Text>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Title level={5} className="m-0">Payable Amount</Title>
            <Title level={4} className="m-0 text-[#0E72BD]">
              ${total.toFixed(2)}
            </Title>
          </div>
        </div>

        {/* Action Buttons */}
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
    </Card>
  );
}