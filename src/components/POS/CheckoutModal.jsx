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
import { InventoryLabelModal } from '../Invoices/InventoryLabelModal';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function CheckoutModal({ 
  open, 
  onClose, 
  cartItems, 
  orderTotal, 
  appliedCoupon, 
  couponDiscount,
  itemTaxes,
  fullBillTaxes,
  categoryTaxTotal,
  fullBillTaxTotal
}) {
  const { state, dispatch } = usePOS();
  const [currentStep, setCurrentStep] = useState(0);
  const [customerForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showInventoryLabels, setShowInventoryLabels] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxableAmount = subtotal + (categoryTaxTotal || 0) - (couponDiscount || 0);
  const total = taxableAmount + (fullBillTaxTotal || 0);

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
        categoryTaxTotal: categoryTaxTotal || 0,
        fullBillTaxTotal: fullBillTaxTotal || 0,
        totalTax: (categoryTaxTotal || 0) + (fullBillTaxTotal || 0),
        discount: couponDiscount || 0,
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
        status: 'completed',
        appliedTaxes: {
          itemTaxes: itemTaxes || [],
          fullBillTaxes: fullBillTaxes || []
        }
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
      
      // Set completed transaction and show options
      setCompletedTransaction(transaction);
      
      // Close checkout modal
      onClose();
      
      // Reset form states
      setCurrentStep(0);
      setOrderNotes('');
      setPaymentMethod('card');
      customerForm.resetFields();
      paymentForm.resetFields();
      
    } catch (error) {
      message.error('Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOrderComplete = () => {
    setCompletedTransaction(null);
    setShowInvoice(false);
    setShowInventoryLabels(false);
  };

  const handleShowInvoice = () => {
    setShowInvoice(true);
  };

  const handleShowInventoryLabels = () => {
    setShowInventoryLabels(true);
  };

  const steps = [
    {
      title: 'Order Summary',
      icon: <Icon name="receipt_long" />,
    },
    {
      title: 'Customer Details',
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
          renderItem={(item, index) => {
            // Get category taxes for this item
            const itemCategoryTaxes = (itemTaxes || []).filter(tax => tax.productId === item.product.id);
            const itemTaxAmount = itemCategoryTaxes.reduce((sum, tax) => sum + tax.amount, 0);
            
            return (
              <List.Item className="px-0 py-2">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong className="text-sm">{item.product.name}</Text>
                    <Text strong className="text-blue-600">
                      ${(item.product.price * item.quantity + itemTaxAmount).toFixed(2)}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Text type="secondary">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                      {itemTaxAmount > 0 && ` + $${itemTaxAmount.toFixed(2)} tax`}
                    </Text>
                    <Text type="secondary">SKU: {item.product.barcode}</Text>
                  </div>
                  {itemCategoryTaxes.length > 0 && (
                    <div className="mt-1">
                      {itemCategoryTaxes.map(tax => (
                        <Text key={tax.taxId} type="secondary" className="text-xs block">
                          {tax.taxName} ({tax.rate}%): +${tax.amount.toFixed(2)}
                        </Text>
                      ))}
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <Text>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </div>
        
        {categoryTaxTotal > 0 && (
          <div className="flex justify-between">
            <Text>Category Taxes</Text>
            <Text>${categoryTaxTotal.toFixed(2)}</Text>
          </div>
        )}
        
        {appliedCoupon && (
          <div className="flex justify-between">
            <Text className="text-green-600">Coupon ({appliedCoupon.code})</Text>
            <Text className="text-green-600">-${couponDiscount.toFixed(2)}</Text>
          </div>
        )}
        
        {fullBillTaxes && fullBillTaxes.map(tax => (
          <div key={tax.id} className="flex justify-between">
            <Text>{tax.name} ({tax.rate}%)</Text>
            <Text>${((taxableAmount * tax.rate) / 100).toFixed(2)}</Text>
          </div>
        ))}
        
        <Divider className="my-2" />
        <div className="flex justify-between">
          <Title level={5} className="m-0">Total</Title>
          <Title level={4} className="m-0 text-blue-600">
            ${total.toFixed(2)}
          </Title>
        </div>
      </div>
    </div>
  );

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <Title level={4}>Customer Information</Title>
      
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
          
          {categoryTaxTotal > 0 && (
            <div className="flex justify-between">
              <Text>Category Taxes</Text>
              <Text>${categoryTaxTotal.toFixed(2)}</Text>
            </div>
          )}
          
          {appliedCoupon && (
            <div className="flex justify-between">
              <Text className="text-green-600">Discount</Text>
              <Text className="text-green-600">-${couponDiscount.toFixed(2)}</Text>
            </div>
          )}
          
          {fullBillTaxes && fullBillTaxes.map(tax => (
            <div key={tax.id} className="flex justify-between">
              <Text>{tax.name}</Text>
              <Text>${((taxableAmount * tax.rate) / 100).toFixed(2)}</Text>
            </div>
          ))}
          
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Title level={4} className="m-0">Total</Title>
            <Title level={4} className="m-0 text-blue-600">
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

      {/* Post-Order Success Modal */}
      {completedTransaction && (
        <Modal
          title="Order Completed Successfully!"
          open={!!completedTransaction && !showInvoice && !showInventoryLabels}
          onCancel={handleCloseOrderComplete}
          width={600}
          footer={[
            <ActionButton key="close" onClick={handleCloseOrderComplete}>
              Close
            </ActionButton>,
            <ActionButton 
              key="inventory-labels" 
              icon="label"
              onClick={handleShowInventoryLabels}
            >
              Print Inventory Labels
            </ActionButton>,
            <ActionButton.Primary 
              key="invoice" 
              icon="receipt_long"
              onClick={handleShowInvoice}
            >
              View Invoice
            </ActionButton.Primary>
          ]}
          destroyOnClose
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" className="text-green-600 text-2xl" />
            </div>
            <Title level={3} className="text-green-600 mb-2">Order Completed!</Title>
            <Text type="secondary" className="text-lg block mb-4">
              Order {completedTransaction.id} has been processed successfully.
            </Text>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <Text strong className="text-lg block">{completedTransaction.items.length}</Text>
                    <Text type="secondary" className="text-sm">Items</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <Text strong className="text-lg block">
                      {completedTransaction.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Text>
                    <Text type="secondary" className="text-sm">Total Quantity</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <Text strong className="text-lg block text-blue-600">
                      ${completedTransaction.total.toFixed(2)}
                    </Text>
                    <Text type="secondary" className="text-sm">Total Amount</Text>
                  </div>
                </Col>
              </Row>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm">
                <Icon name="info" className="mr-2 text-blue-600" />
                You can now print inventory labels for each item or view the detailed invoice.
              </Text>
            </div>
          </div>
        </Modal>
      )}

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

      {/* Inventory Labels Modal */}
      <InventoryLabelModal
        open={showInventoryLabels}
        onClose={() => {
          setShowInventoryLabels(false);
          setCompletedTransaction(null);
        }}
        transaction={completedTransaction}
      />
    </>
  );
}