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
  message
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { CheckoutModal } from './CheckoutModal';

const { Title, Text } = Typography;

export function Cart() {
  const { state, dispatch } = usePOS();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: newQuantity } });
    }
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
                renderItem={(item, index) => (
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
                        <Text strong className="text-[#0E72BD]">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Text>
                      </div>
                      
                      <div className="mt-1">
                        <Text type="secondary" className="text-xs">
                          SKU: {item.product.barcode} | Stock: {item.product.stock}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
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
                <div className="flex justify-between">
                  <Text>Tax (8%)</Text>
                  <Text>${tax.toFixed(2)}</Text>
                </div>
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
      />
    </>
  );
}