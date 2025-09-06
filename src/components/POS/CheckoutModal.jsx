import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Row, 
  Col,
  message,
  Steps,
  Card,
  Alert
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { createTransaction } from '../../features/transactions/transactionsSlice';
import { clearCart } from '../../features/cart/cartSlice';
import { fetchUsers } from '../../features/users/usersSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function CheckoutModal({ 
  open, 
  onClose, 
  cartItems, 
  subtotal, 
  categoryTaxTotal, 
  fullBillTaxTotal, 
  totalTax, 
  discount, 
  total, 
  appliedCoupon,
  appliedTaxes 
}) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const users = useSelector(state => state.users.usersList);
  const loading = useSelector(state => state.transactions.loading);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [customerData, setCustomerData] = useState({});
  const [paymentData, setPaymentData] = useState({});

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
      form.resetFields();
      setCurrentStep(0);
      setCustomerData({});
      setPaymentData({});
    }
  }, [open, dispatch, form]);

  const steps = [
    {
      title: 'Customer',
      description: 'Customer Information',
      icon: <Icon name="person" />
    },
    {
      title: 'Payment',
      description: 'Payment Details',
      icon: <Icon name="payment" />
    },
    {
      title: 'Review',
      description: 'Order Review',
      icon: <Icon name="receipt" />
    }
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        const values = await form.validateFields(['customerName', 'customerPhone']);
        setCustomerData(values);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        const values = await form.validateFields(['paymentMethod', 'salesperson']);
        setPaymentData(values);
        setCurrentStep(2);
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const allValues = await form.validateFields();
      
      const transactionData = {
        items: cartItems.map(cartItem => ({
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            price: cartItem.product.price,
            barcode: cartItem.product.barcode,
            category: cartItem.product.category,
            image: cartItem.product.image
          },
          quantity: cartItem.quantity,
          selectedColorId: cartItem.selectedColorId,
          selectedSize: cartItem.selectedSize,
          addons: cartItem.addons || []
        })),
        subtotal,
        categoryTaxTotal,
        fullBillTaxTotal,
        totalTax,
        discount,
        total,
        paymentMethod: allValues.paymentMethod,
        customerName: allValues.customerName || 'Walk-in Customer',
        customerPhone: allValues.customerPhone,
        customerEmail: allValues.customerEmail,
        customerAddress: allValues.customerAddress,
        appliedCoupon,
        notes: allValues.notes,
        status: 'completed',
        appliedTaxes,
        cashier: `${currentUser.firstName} ${currentUser.lastName}`,
        salesperson: allValues.salesperson,
        salespersonId: users.find(u => `${u.firstName} ${u.lastName}` === allValues.salesperson)?.id
      };

      dispatch(createTransaction(transactionData));
      dispatch(clearCart());
      
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Please fill in all required fields');
    }
  };

  const renderCustomerStep = () => (
    <div className="space-y-4">
      <Title level={5}>Customer Information</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="customerPhone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="customerEmail" label="Email (Optional)">
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="customerAddress" label="Address (Optional)">
            <Input placeholder="Enter address" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <Title level={5}>Payment Information</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select placeholder="Select payment method">
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="digital">Digital Payment</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="salesperson"
            label="Sales Person"
            rules={[{ required: true, message: 'Please select sales person' }]}
          >
            <Select placeholder="Select sales person" showSearch>
              {users.filter(user => user.isActive).map(user => (
                <Option key={user.id} value={`${user.firstName} ${user.lastName}`}>
                  {user.firstName} {user.lastName} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="notes" label="Order Notes (Optional)">
        <TextArea
          rows={3}
          placeholder="Enter any special notes for this order"
        />
      </Form.Item>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <Title level={5}>Order Review</Title>
      
      {/* Customer Summary */}
      <Card size="small" title="Customer Details">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Name:</Text>
            <Text strong>{customerData.customerName || 'Walk-in Customer'}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Phone:</Text>
            <Text>{customerData.customerPhone || 'N/A'}</Text>
          </div>
          {customerData.customerEmail && (
            <div className="flex justify-between">
              <Text>Email:</Text>
              <Text>{customerData.customerEmail}</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Summary */}
      <Card size="small" title="Payment Details">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Payment Method:</Text>
            <Text strong className="capitalize">{paymentData.paymentMethod}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Sales Person:</Text>
            <Text>{paymentData.salesperson}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Cashier:</Text>
            <Text>{currentUser.firstName} {currentUser.lastName}</Text>
          </div>
        </div>
      </Card>

      {/* Order Total */}
      <Card size="small" title="Order Summary">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Subtotal:</Text>
            <Text>LKR {subtotal.toFixed(2)}</Text>
          </div>
          {totalTax > 0 && (
            <div className="flex justify-between">
              <Text>Tax:</Text>
              <Text>LKR {totalTax.toFixed(2)}</Text>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <Text>Discount:</Text>
              <Text>-LKR {discount.toFixed(2)}</Text>
            </div>
          )}
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Title level={5} className="m-0">Total:</Title>
            <Title level={5} className="m-0 text-blue-600">
              LKR {total.toFixed(2)}
            </Title>
          </div>
        </div>
      </Card>

      <Alert
        message="Ready to Process"
        description="Please review all details before completing the transaction."
        type="info"
        showIcon
      />
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <Icon name="shopping_cart" className="text-blue-600" />
          <span>Checkout</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        <Steps current={currentStep} items={steps} />
        
        <Form
          form={form}
          layout="vertical"
          preserve={true}
        >
          <div className="min-h-[300px]">
            {currentStep === 0 && renderCustomerStep()}
            {currentStep === 1 && renderPaymentStep()}
            {currentStep === 2 && renderReviewStep()}
          </div>
        </Form>

        <Divider />

        <div className="flex justify-between">
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
                onClick={handleSubmit}
                loading={loading}
                icon="check"
              >
                Complete Transaction
              </ActionButton.Primary>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}