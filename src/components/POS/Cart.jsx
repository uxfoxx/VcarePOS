import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Divider, 
  Radio, 
  Input, 
  Form,
  Badge,
  Image,
  Popconfirm,
  message,
  Steps,
  Result,
  Tooltip
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

export function Cart() {
  const { state, dispatch } = usePOS();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const discount = 0;
  const total = subtotal + tax - discount;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: newQuantity } });
    }
  };

  const handleCheckout = async () => {
    if (state.cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }

    try {
      const values = await form.validateFields();
      
      const transaction = {
        id: `TXN-${Date.now()}`,
        items: state.cart,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        timestamp: new Date(),
        cashier: state.currentUser?.name || 'Unknown',
        customerName: values.customerName || undefined,
        customerPhone: values.customerPhone || undefined,
        customerAddress: values.customerAddress || undefined
      };

      // Update product stock
      state.cart.forEach(item => {
        dispatch({ 
          type: 'UPDATE_PRODUCT_STOCK', 
          payload: { productId: item.product.id, quantity: item.quantity }
        });

        // Update raw material stock based on product usage
        if (item.product.rawMaterials) {
          item.product.rawMaterials.forEach(usage => {
            dispatch({
              type: 'UPDATE_RAW_MATERIAL_STOCK',
              payload: { materialId: usage.rawMaterialId, quantity: usage.quantity * item.quantity }
            });
          });
        }
      });

      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      dispatch({ type: 'CLEAR_CART' });
      form.resetFields();
      setCurrentStep(2);
      
      message.success('Transaction completed successfully!');
      
      // Reset to step 0 after 3 seconds
      setTimeout(() => setCurrentStep(0), 3000);
    } catch (error) {
      message.error('Please fill in required fields');
    }
  };

  const steps = [
    {
      title: 'Cart Review',
      icon: <span className="material-icons">shopping_cart</span>,
    },
    {
      title: 'Customer Info',
      icon: <span className="material-icons">person</span>,
    },
    {
      title: 'Payment',
      icon: <span className="material-icons">payment</span>,
    },
  ];

  const renderCartItems = () => (
    <div className="cart-container">
      {state.cart.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icons text-6xl text-gray-300 mb-4">shopping_cart</span>
          <Title level={4} type="secondary">Cart is empty</Title>
          <Text type="secondary">Add furniture items to get started</Text>
        </div>
      ) : (
        <List
          dataSource={state.cart}
          renderItem={(item) => (
            <List.Item className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-3 border border-gray-200/50">
              <div className="flex items-center space-x-4 w-full">
                <Image
                  src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="object-cover rounded-lg"
                  preview={false}
                  crossOrigin="anonymous"
                />
                
                <div className="flex-1 min-w-0">
                  <Tooltip title={item.product.name}>
                    <Text strong className="block text-sm truncate">
                      {item.product.name}
                    </Text>
                  </Tooltip>
                  <Text type="secondary" className="text-xs">
                    ${item.product.price.toFixed(2)} each
                  </Text>
                  {item.product.dimensions && (
                    <Text type="secondary" className="text-xs block">
                      {item.product.dimensions.length}×{item.product.dimensions.width}×{item.product.dimensions.height} {item.product.dimensions.unit}
                    </Text>
                  )}
                  <Text strong className="text-sm text-[#0E72BD]">
                    Total: ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
                
                <Space align="center">
                  <InputNumber
                    min={1}
                    max={item.product.stock + item.quantity}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item.product.id, value || 1)}
                    size="small"
                    className="w-16"
                  />
                  
                  <Popconfirm
                    title="Remove item from cart?"
                    onConfirm={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id })}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<span className="material-icons">delete</span>}
                      size="small"
                    />
                  </Popconfirm>
                </Space>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const renderCustomerForm = () => (
    <Form form={form} layout="vertical" className="space-y-4">
      <Title level={5} className="flex items-center">
        <span className="material-icons mr-2">person</span>
        Customer Information
      </Title>
      
      <Form.Item name="customerName" label="Customer Name">
        <Input 
          prefix={<span className="material-icons">person</span>} 
          placeholder="Enter customer name (optional)"
          size="large"
        />
      </Form.Item>
      
      <Form.Item name="customerPhone" label="Phone Number">
        <Input 
          prefix={<span className="material-icons">phone</span>} 
          placeholder="Enter phone number (optional)"
          size="large"
        />
      </Form.Item>
      
      <Form.Item name="customerAddress" label="Delivery Address">
        <TextArea 
          placeholder="Enter delivery address (optional)"
          rows={3}
          size="large"
        />
      </Form.Item>
    </Form>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-4">
      <Title level={5} className="flex items-center">
        <span className="material-icons mr-2">payment</span>
        Payment Method
      </Title>
      
      <Radio.Group 
        value={paymentMethod} 
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="w-full"
        size="large"
      >
        <Space direction="vertical" className="w-full">
          <Radio value="cash" className="w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors">
            <Space>
              <span className="material-icons text-green-600">payments</span>
              <div>
                <Text strong>Cash Payment</Text>
                <br />
                <Text type="secondary" className="text-xs">Pay with physical cash</Text>
              </div>
            </Space>
          </Radio>
          
          <Radio value="card" className="w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors">
            <Space>
              <span className="material-icons text-blue-600">credit_card</span>
              <div>
                <Text strong>Card Payment</Text>
                <br />
                <Text type="secondary" className="text-xs">Credit or debit card</Text>
              </div>
            </Space>
          </Radio>
          
          <Radio value="digital" className="w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors">
            <Space>
              <span className="material-icons text-purple-600">smartphone</span>
              <div>
                <Text strong>Digital Payment</Text>
                <br />
                <Text type="secondary" className="text-xs">Mobile wallet or QR code</Text>
              </div>
            </Space>
          </Radio>
        </Space>
      </Radio.Group>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="order-summary">
      <Title level={5} className="mb-4">Order Summary</Title>
      <Space direction="vertical" className="w-full">
        <div className="flex justify-between">
          <Text>Subtotal ({state.cart.length} items):</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Tax (8%):</Text>
          <Text>${tax.toFixed(2)}</Text>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <Text>Discount:</Text>
            <Text className="text-green-600">-${discount.toFixed(2)}</Text>
          </div>
        )}
        <Divider className="my-2" />
        <div className="flex justify-between">
          <Title level={4} className="m-0">Total:</Title>
          <Title level={4} className="m-0 text-[#0E72BD]">
            ${total.toFixed(2)}
          </Title>
        </div>
      </Space>
    </div>
  );

  if (currentStep === 2) {
    return (
      <Card className="vcare-card h-full">
        <Result
          status="success"
          title="Transaction Completed!"
          subTitle="Thank you for your purchase. The transaction has been processed successfully."
          icon={<span className="material-icons text-6xl text-green-500">check_circle</span>}
        />
      </Card>
    );
  }

  return (
    <Card 
      className="vcare-card h-full"
      title={
        <Space>
          <span className="material-icons text-[#0E72BD]">shopping_cart</span>
          <Title level={4} className="m-0">Shopping Cart</Title>
          <Badge count={state.cart.length} showZero color="#0E72BD" />
        </Space>
      }
    >
      <div className="flex flex-col h-full">
        {state.cart.length > 0 && (
          <div className="mb-6">
            <Steps current={currentStep} items={steps} size="small" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4">
          {renderCartItems()}
          {currentStep === 1 && renderCustomerForm()}
          {currentStep === 1 && renderPaymentMethod()}
        </div>

        {state.cart.length > 0 && (
          <>
            {renderOrderSummary()}
            
            <div className="mt-4 space-y-2">
              {currentStep === 0 && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => setCurrentStep(1)}
                  className="bg-[#0E72BD] hover:bg-blue-700 font-semibold"
                >
                  Proceed to Checkout
                </Button>
              )}
              
              {currentStep === 1 && (
                <Space className="w-full">
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    Back to Cart
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleCheckout}
                    className="flex-1 bg-[#0E72BD] hover:bg-blue-700 font-semibold"
                  >
                    Complete Transaction
                  </Button>
                </Space>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}