import React, { useState } from 'react';
import { 
  Modal, 
  Steps, 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Divider, 
  List, 
  Space,
  Radio,
  message,
  Row,
  Col
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { InvoiceModal } from '../Invoices/InvoiceModal';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function CheckoutModal({ open, onClose, cartItems, orderTotal }) {
  const { state, dispatch } = usePOS();
  const [currentStep, setCurrentStep] = useState(0);
  const [customerForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const total = subtotal + tax - couponDiscount;

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

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate customer form if needed
      customerForm.validateFields().then(() => {
        setCurrentStep(currentStep + 1);
      }).catch(() => {
        // Customer details are optional, so we can proceed
        setCurrentStep(currentStep + 1);
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    try {
      const customerData = customerForm.getFieldsValue();
      
      const transaction = {
        id: `TXN-${Date.now()}`,
        items: cartItems,
        subtotal,
        tax,
        discount: couponDiscount,
        total,
        paymentMethod,
        timestamp: new Date(),
        cashier: state.currentUser?.name || 'Unknown',
        customerName: customerData.customerName || 'Walk-in Customer',
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail,
        customerAddress: customerData.customerAddress,
        appliedCoupon: appliedCoupon?.code,
        notes: orderNotes,
        status: 'completed'
      };

      // Update product stock
      cartItems.forEach(item => {
        dispatch({ 
          type: 'UPDATE_PRODUCT_STOCK', 
          payload: { productId: item.product.id, quantity: item.quantity }
        });
      });

      // Update coupon usage if applied
      if (appliedCoupon) {
        dispatch({
          type: 'UPDATE_COUPON',
          payload: {
            ...appliedCoupon,
            usedCount: (appliedCoupon.usedCount || 0) + 1
          }
        });
      }

      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      dispatch({ type: 'CLEAR_CART' });
      
      message.success('Order completed successfully!');
      
      // Set completed transaction and show invoice
      setCompletedTransaction(transaction);
      setShowInvoice(true);
      
      // Close checkout modal
      onClose();
      
      // Reset form states
      setCurrentStep(0);
      setAppliedCoupon(null);
      setOrderNotes('');
      setCouponCode('');
      setPaymentMethod('card');
      customerForm.resetFields();
      paymentForm.resetFields();
      
    } catch (error) {
      message.error('Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Order Summary',
      icon: <Icon name="receipt_long" />,
    },
    {
      title: 'Customer & Details',
      icon: <Icon name="person" />,
    },
    {
      title: 'Payment',
      icon: <Icon name="payment" />,
    },
  ];

  const renderOrderSummary = () => (
    <div className="space-y-4">
      <Title level={4}>Order Summary</Title>
      
      <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
        <List
          dataSource={cartItems}
          renderItem={(item, index) => (
            <List.Item className="px-0 py-2">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Text strong className="text-sm">{item.product.name}</Text>
                  <Text strong className="text-[#0E72BD]">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Text type="secondary">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </Text>
                  <Text type="secondary">SKU: {item.product.barcode}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

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

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <Title level={4}>Customer Information & Order Details</Title>
      
      <Form form={customerForm} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="customerName" label="Customer Name">
              <Input 
                prefix={<Icon name="person" className="text-gray-400" />}
                placeholder="Enter customer name (optional)"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerPhone" label="Phone Number">
              <Input 
                prefix={<Icon name="phone" className="text-gray-400" />}
                placeholder="Enter phone number (optional)"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="customerEmail" label="Email Address">
          <Input 
            prefix={<Icon name="email" className="text-gray-400" />}
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

      <Divider />

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
              <ActionButton.Text 
                icon="close"
                danger 
                size="small"
                onClick={handleRemoveCoupon}
              />
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              prefix={<Icon name="local_offer" className="text-gray-400" />}
              onPressEnter={handleApplyCoupon}
            />
            <ActionButton.Primary onClick={handleApplyCoupon}>
              Apply
            </ActionButton.Primary>
          </div>
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
          rows={3}
        />
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-4">
      <Title level={4}>Payment Method</Title>
      
      <Form form={paymentForm} layout="vertical">
        <Form.Item name="paymentMethod" label="Select Payment Method">
          <Radio.Group 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="card" className="w-full p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="credit_card" className="text-blue-500" size="text-xl" />
                  <div>
                    <Text strong>Credit/Debit Card</Text>
                    <br />
                    <Text type="secondary" className="text-sm">Pay with card</Text>
                  </div>
                </div>
              </Radio>
              <Radio value="cash" className="w-full p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="payments" className="text-green-500" size="text-xl" />
                  <div>
                    <Text strong>Cash</Text>
                    <br />
                    <Text type="secondary" className="text-sm">Pay with cash</Text>
                  </div>
                </div>
              </Radio>
              <Radio value="digital" className="w-full p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="smartphone" className="text-purple-500" size="text-xl" />
                  <div>
                    <Text strong>Digital Wallet</Text>
                    <br />
                    <Text type="secondary" className="text-sm">Apple Pay, Google Pay, etc.</Text>
                  </div>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Title level={5} className="mb-3">Final Order Summary</Title>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Items ({cartItems.length})</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Tax</Text>
            <Text>${tax.toFixed(2)}</Text>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between">
              <Text className="text-green-600">Discount</Text>
              <Text className="text-green-600">-${couponDiscount.toFixed(2)}</Text>
            </div>
          )}
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Title level={4} className="m-0">Total</Title>
            <Title level={4} className="m-0 text-[#0E72BD]">
              ${total.toFixed(2)}
            </Title>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderOrderSummary();
      case 1:
        return renderCustomerDetails();
      case 2:
        return renderPayment();
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        title="Complete Order"
        open={open}
        onCancel={onClose}
        width={800}
        footer={null}
        destroyOnClose
      >
        <div className="space-y-6">
          <Steps current={currentStep} items={steps} />
          
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div>
              {currentStep > 0 && (
                <ActionButton onClick={handlePrev}>
                  <Icon name="arrow_back" className="mr-2" />
                  Previous
                </ActionButton>
              )}
            </div>
            
            <div className="space-x-2">
              <ActionButton onClick={onClose}>
                Cancel
              </ActionButton>
              
              {currentStep < steps.length - 1 ? (
                <ActionButton.Primary onClick={handleNext}>
                  Next
                  <Icon name="arrow_forward" className="ml-2" />
                </ActionButton.Primary>
              ) : (
                <ActionButton.Primary 
                  onClick={handleCompleteOrder}
                  loading={loading}
                  icon="check"
                >
                  Complete Order
                </ActionButton.Primary>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setCompletedTransaction(null);
        }}
        transaction={completedTransaction}
        type="detailed"
      />
    </>
  );
}