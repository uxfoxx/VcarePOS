import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Divider, 
  List, 
  Space,
  Radio,
  message,
  Row,
  Col,
  Tag
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { EnhancedStepper } from '../common/EnhancedStepper';
import { InvoiceModal } from '../Invoices/InvoiceModal';
import { InventoryLabelModal } from '../Invoices/InventoryLabelModal';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../features/users/usersSlice';
import { clearCart } from '../../features/cart/cartSlice';
import { createTransaction } from '../../features/transactions/transactionsSlice';
import { fetchDeliverySettingsRequest } from '../../features/deliveryCharges/deliveryChargesSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function CheckoutModal({
  open,
  onClose,
  cartItems,
  appliedCoupon,
  couponDiscount,
  itemTaxes,
  fullBillTaxes,
  categoryTaxTotal,
  fullBillTaxTotal
}) {
  const dispatch = useDispatch();
  const users = useSelector(state => state.users.usersList);
  const { settings: deliverySettings, allSettings } = useSelector(state => state.deliveryCharges);
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [customerForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedSalesperson, setSelectedSalesperson] = useState(currentUser?.id);
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showInventoryLabels, setShowInventoryLabels] = useState(false);
  
  // Add state to store customer data persistently
  const [customerData, setCustomerData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: ''
  });

  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  React.useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
      dispatch(fetchDeliverySettingsRequest({ source: 'pos' }));
      // Reset forms and customer data when modal opens
      setCustomerData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: ''
      });
      setSelectedDeliveryLocation(null);
      setDeliveryCharge(0);
      setCurrentStep(0);
      setOrderNotes('');
      setPaymentMethod('card');
      setSelectedSalesperson(currentUser?.id);
      customerForm.resetFields();
      paymentForm.resetFields();
    }
  }, [open, dispatch, currentUser?.id, customerForm, paymentForm]);

  const subtotal = cartItems.reduce((sum, item) => {
    // Include base price
    let itemTotal = item.product.price * item.quantity;

    // Add addon prices if any
    if (item.product.addons) {
      const addonTotal = item.product.addons.reduce((addonSum, addon) =>
        addonSum + addon.price*addon.quantity, 0);
      itemTotal += addonTotal;
    }

    return sum + itemTotal;
  }, 0);

  // Calculate total cart weight
  const totalWeight = cartItems.reduce((sum, item) => {
    const weight = item.product.weight || 0;
    return sum + (weight * item.quantity);
  }, 0);

  // Filter active delivery settings for POS
  const activeDeliverySettings = (allSettings || []).filter(s => s.is_active && s.is_enabled_pos);

  // Function to calculate delivery charge based on weight
  const calculateDeliveryCharge = (deliverySetting, weight) => {
    if (!deliverySetting) return 0;

    if (deliverySetting.delivery_type === 'free') {
      return 0;
    } else if (deliverySetting.delivery_type === 'inside_colombo') {
      return parseFloat(deliverySetting.flat_rate || 0);
    } else if (deliverySetting.delivery_type === 'out_of_colombo') {
      const baseWeight = parseFloat(deliverySetting.base_weight_kg || 0);
      const baseCharge = parseFloat(deliverySetting.base_charge || 0);
      const perKgCharge = parseFloat(deliverySetting.per_kg_charge || 0);

      if (weight <= baseWeight) {
        return baseCharge;
      } else {
        const extraWeight = weight - baseWeight;
        return baseCharge + (extraWeight * perKgCharge);
      }
    }
    return 0;
  };

  const taxableAmount = subtotal + (categoryTaxTotal || 0) - (couponDiscount || 0);
  const total = taxableAmount + (fullBillTaxTotal || 0) + deliveryCharge;

  // Get salesperson details
  const getSalespersonName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const steps = [
    {
      title: 'Order Summary',
      description: 'Review items and select sales person',
      icon: 'receipt_long'
    },
    {
      title: 'Customer Details',
      description: 'Customer information and notes',
      icon: 'person'
    },
    {
      title: 'Payment',
      description: 'Payment method and confirmation',
      icon: 'payment'
    }
  ];

  const handleNext = async () => {
    setStepError('');
    
    if (currentStep === 0) {
      // Moving from Order Summary to Customer Details
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 1) {
      // Moving from Customer Details to Payment
      try {
        // Capture and store customer data in state
        const formData = customerForm.getFieldsValue();
        
        // Update persistent customer data state
        setCustomerData(formData);
        
        setCurrentStep(currentStep + 1);
      } catch (error) {
        setStepError('Error processing customer information');
        return;
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setStepError('');
    setCurrentStep(currentStep - 1);
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    setStepError('');
    
    try {
      // Use the persistent customer data state instead of form data
      const salesperson = users.find(u => u.id === selectedSalesperson);
      
      const selectedDeliverySetting = activeDeliverySettings.find(s => s.id === selectedDeliveryLocation);

      const transaction = {
        id: `TXN-${Date.now()}`,
        subtotal,
        categoryTaxTotal: categoryTaxTotal || 0,
        fullBillTaxTotal: fullBillTaxTotal || 0,
        totalTax: (categoryTaxTotal || 0) + (fullBillTaxTotal || 0),
        discount: couponDiscount || 0,
        total,
        paymentMethod, // Use the state variable directly
        timestamp: new Date(),
        cashier: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
        salesperson: salesperson ? `${salesperson.firstName} ${salesperson.lastName}` : getSalespersonName(selectedSalesperson),
        salespersonId: selectedSalesperson,
        customerName: customerData.customerName || 'Walk-in Customer',
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail,
        customerAddress: customerData.customerAddress,
        deliveryLocation: selectedDeliverySetting?.location_name || null,
        deliveryType: selectedDeliverySetting?.delivery_type || null,
        deliveryCharge: deliveryCharge,
        totalWeight: totalWeight,
        appliedCoupon: appliedCoupon?.code,
        notes: orderNotes,
        status: 'completed',
        appliedTaxes: {
          itemTaxes: itemTaxes || [],
          fullBillTaxes: fullBillTaxes || []
        },
        // Include color selection in transaction items
        items: cartItems.map(item => ({
          ...item,
          selectedColorId: item.selectedColorId,
          selectedSizeData: item.selectedSizeData // Include size data for raw material deduction
        }))
      };


      dispatch(createTransaction(transaction));
      dispatch(clearCart());
      
      message.success('Order completed successfully!');
      
      // Set completed transaction and show options
      setCompletedTransaction(transaction); // todo
      
      // Close checkout modal
      onClose();
      
      // Reset form states
      setCurrentStep(0);
      setOrderNotes('');
      setPaymentMethod('card');
      setSelectedSalesperson(currentUser?.id);
      customerForm.resetFields();
      paymentForm.resetFields();
      
    } catch (error) {
      setStepError('Failed to complete order. Please try again.');
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

  const renderOrderSummary = () => (
    <div className="space-y-4">
      <Title level={4}>Order Summary</Title>
      
      {/* Salesperson Selection */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <Title level={5} className="mb-3">Sales Person</Title>
        <Select
          value={selectedSalesperson}
          onChange={setSelectedSalesperson}
          className="w-full"
          placeholder="Select sales person"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {users.filter(user => user.isActive).map(user => (
            <Option key={user.id} value={user.id}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <Text strong>{user.firstName} {user.lastName}</Text>
                  <Text type="secondary" className="ml-2 text-xs">({user.role})</Text>
                </div>
              </div>
            </Option>
          ))}
        </Select>
        <Text type="secondary" className="text-sm mt-2 block">
          This person will be credited as the sales person for this order
        </Text>
      </div>
      
      <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
        <List
          dataSource={cartItems}
          renderItem={(item, index) => {
            const itemCategoryTaxes = (itemTaxes || []).filter(tax => tax.productId === item.product.id);
            const itemTaxAmount = itemCategoryTaxes.reduce((sum, tax) => sum + tax.amount, 0);
            
            // Calculate addon price if any
            const addonPrice = item.product.addons ? 
              item.product.addons.reduce((sum, addon) => sum + addon.price, 0) : 0;
            
            // Calculate total price including addons
            const itemTotalPrice = (item.product.price + addonPrice) * item.quantity;
            
            return (
              <List.Item className="px-0 py-2">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
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
                    <Text strong className="text-blue-600">
                      LKR {itemTotalPrice.toFixed(2)}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Text type="secondary">
                      LKR {item.product.price.toFixed(2)} × {item.quantity}
                      {addonPrice > 0 && ` + LKR ${addonPrice.toFixed(2)} addons`}
                      {itemTaxAmount > 0 && ` + LKR ${itemTaxAmount.toFixed(2)} tax`}
                      {item.product.weight && ` | ${(item.product.weight * item.quantity).toFixed(2)} kg`}
                    </Text>
                    <Text type="secondary">SKU: {item.product.barcode}</Text>
                  </div>
                  
                  {/* Show addons if any */}
                  {item.product.addons && item.product.addons.length > 0 && (
                    <div className="mt-1 pl-4 border-l-2 border-blue-200">
                      {item.product.addons.map((addon, idx) => (
                        <Text key={idx} type="secondary" className="text-xs block">
                          {addon.name} × {addon.quantity}: +LKR {addon.price.toFixed(2)}
                        </Text>
                      ))}
                    </div>
                  )}
                  
                  {/* Show category taxes for this item */}
                  {itemCategoryTaxes.length > 0 && (
                    <div className="mt-1">
                      {itemCategoryTaxes.map(tax => (
                        <Text key={tax.taxId} type="secondary" className="text-xs block">
                          {tax.taxName} ({tax.rate}%): +LKR {tax.amount.toFixed(2)}
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
          <Text>LKR {(subtotal || 0).toFixed(2)}</Text>
        </div>
        
        {categoryTaxTotal > 0 && (
          <div className="flex justify-between">
            <Text>Category Taxes</Text>
            <Text>LKR {(categoryTaxTotal || 0).toFixed(2)}</Text>
          </div>
        )}
        
        {appliedCoupon && (
          <div className="flex justify-between">
            <Text className="text-green-600">Coupon ({appliedCoupon.code})</Text>
            <Text className="text-green-600">-LKR {(couponDiscount || 0).toFixed(2)}</Text>
          </div>
        )}
        
        {fullBillTaxes && fullBillTaxes.map(tax => (
          <div key={tax.id} className="flex justify-between">
            <Text>{tax.name} ({tax.rate}%)</Text>
            <Text>LKR {((taxableAmount * (tax.rate || 0)) / 100).toFixed(2)}</Text>
          </div>
        ))}

        {deliveryCharge > 0 && (
          <div className="flex justify-between">
            <Text className="text-blue-600">
              <Icon name="local_shipping" className="mr-1" />
              Delivery ({selectedDeliveryLocation})
            </Text>
            <Text className="text-blue-600">LKR {deliveryCharge.toFixed(2)}</Text>
          </div>
        )}

        <Divider className="my-2" />
        <div className="flex justify-between">
          <Title level={5} className="m-0">Total</Title>
          <Title level={4} className="m-0 text-blue-600">
            LKR {(total || 0).toFixed(2)}
          </Title>
        </div>
      </div>
    </div>
  );

  const renderCustomerDetails = () => {
    const phoneNumberRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    return (
      <div className="space-y-4">
        <Title level={4}>Customer Information</Title>
        
        <Form form={customerForm} layout="vertical" preserve={true}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Customer Name">
                <Input 
                  prefix={<Icon name="person" className="text-gray-400" />}
                  placeholder="Enter customer name (optional)"
                  onChange={(e) => {
                    // Update persistent state in real-time
                    setCustomerData(prev => ({ ...prev, customerName: e.target.value }));;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Phone Number"
              rules={[
                {
                  pattern: phoneNumberRegex,
                  message: 'Please enter a valid phone number',
                },
              ]}>
                <Input 
                  prefix={<Icon name="phone" className="text-gray-400" />}
                  placeholder="Enter phone number (optional)"
                  onChange={(e) => {
                    // Update persistent state in real-time
                    setCustomerData(prev => ({ ...prev, customerPhone: e.target.value }));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="customerEmail" label="Email Address"
          rules={[
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}>
            <Input 
              prefix={<Icon name="email" className="text-gray-400" />}
              placeholder="Enter email address (optional)"
              type="email"
              onChange={(e) => {
                // Update persistent state in real-time
                setCustomerData(prev => ({ ...prev, customerEmail: e.target.value }));
              }}
            />
          </Form.Item>
          
          <Form.Item name="customerAddress" label="Delivery Address">
            <TextArea
              placeholder="Enter delivery address (optional)"
              rows={3}
              onChange={(e) => {
                // Update persistent state in real-time
                setCustomerData(prev => ({ ...prev, customerAddress: e.target.value }));
              }}
            />
          </Form.Item>

          {activeDeliverySettings.length > 0 && (
            <>
              <Form.Item label="Delivery Options">
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="scale" className="text-gray-600" />
                    <Text type="secondary">Total Order Weight: </Text>
                    <Text strong>{totalWeight.toFixed(2)} kg</Text>
                  </div>
                </div>
                <Radio.Group
                  value={selectedDeliveryLocation}
                  onChange={(e) => {
                    const settingId = e.target.value;
                    setSelectedDeliveryLocation(settingId);
                    const setting = activeDeliverySettings.find(s => s.id === settingId);
                    const charge = calculateDeliveryCharge(setting, totalWeight);
                    setDeliveryCharge(charge);
                  }}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Radio value={null} className="w-full">
                      <div className="flex justify-between items-center w-full pr-4">
                        <div>
                          <Text strong>No Delivery</Text>
                          <br />
                          <Text type="secondary" className="text-sm">Customer pickup</Text>
                        </div>
                        <Text strong>Rs. 0.00</Text>
                      </div>
                    </Radio>
                    {activeDeliverySettings.map(setting => {
                      const charge = calculateDeliveryCharge(setting, totalWeight);
                      let description = '';

                      if (setting.delivery_type === 'free') {
                        description = 'Free delivery on all orders';
                      } else if (setting.delivery_type === 'inside_colombo') {
                        description = `Flat rate for Colombo area`;
                      } else if (setting.delivery_type === 'out_of_colombo') {
                        const baseWeight = parseFloat(setting.base_weight_kg || 0);
                        const baseCharge = parseFloat(setting.base_charge || 0);
                        const perKgCharge = parseFloat(setting.per_kg_charge || 0);
                        description = `Rs. ${baseCharge.toFixed(2)} for first ${baseWeight} kg, then Rs. ${perKgCharge.toFixed(2)} per kg`;
                      }

                      return (
                        <Radio key={setting.id} value={setting.id} className="w-full">
                          <div className="flex justify-between items-center w-full pr-4">
                            <div>
                              <Text strong>{setting.location_name}</Text>
                              <br />
                              <Text type="secondary" className="text-sm">{description}</Text>
                            </div>
                            <Text strong className="text-blue-600">Rs. {charge.toFixed(2)}</Text>
                          </div>
                        </Radio>
                      );
                    })}
                  </Space>
                </Radio.Group>
              </Form.Item>

              {deliveryCharge > 0 && selectedDeliveryLocation && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="local_shipping" className="text-blue-600" />
                      <Text strong>Delivery Charge Breakdown</Text>
                    </div>
                  </div>
                  {(() => {
                    const setting = activeDeliverySettings.find(s => s.id === selectedDeliveryLocation);
                    if (setting?.delivery_type === 'out_of_colombo') {
                      const baseWeight = parseFloat(setting.base_weight_kg || 0);
                      const baseCharge = parseFloat(setting.base_charge || 0);
                      const perKgCharge = parseFloat(setting.per_kg_charge || 0);
                      const extraWeight = Math.max(0, totalWeight - baseWeight);

                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <Text type="secondary">Base charge (up to {baseWeight} kg):</Text>
                            <Text>Rs. {baseCharge.toFixed(2)}</Text>
                          </div>
                          {extraWeight > 0 && (
                            <div className="flex justify-between">
                              <Text type="secondary">Extra weight ({extraWeight.toFixed(2)} kg × Rs. {perKgCharge.toFixed(2)}):</Text>
                              <Text>Rs. {(extraWeight * perKgCharge).toFixed(2)}</Text>
                            </div>
                          )}
                          <Divider className="my-2" />
                          <div className="flex justify-between">
                            <Text strong>Total Delivery Charge:</Text>
                            <Text strong className="text-blue-600">Rs. {deliveryCharge.toFixed(2)}</Text>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex justify-between">
                        <Text>Flat Rate:</Text>
                        <Text strong className="text-blue-600">Rs. {deliveryCharge.toFixed(2)}</Text>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </Form>

        <Divider />

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
  };

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

      <div className="bg-gray-50 p-4 rounded-lg">
        <Title level={5} className="mb-3">Final Order Summary</Title>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Sales Person:</Text>
            <Text strong>{getSalespersonName(selectedSalesperson)}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Items ({cartItems.length})</Text>
            <Text>LKR {subtotal.toFixed(2)}</Text>
          </div>
          
          {categoryTaxTotal > 0 && (
            <div className="flex justify-between">
              <Text>Category Taxes</Text>
              <Text>LKR {categoryTaxTotal.toFixed(2)}</Text>
            </div>
          )}
          
          {appliedCoupon && (
            <div className="flex justify-between">
              <Text className="text-green-600">Discount</Text>
              <Text className="text-green-600">-LKR {couponDiscount.toFixed(2)}</Text>
            </div>
          )}
          
          {fullBillTaxes && fullBillTaxes.map(tax => (
            <div key={tax.id} className="flex justify-between">
              <Text>{tax.name}</Text>
              <Text>LKR {((taxableAmount * tax.rate) / 100).toFixed(2)}</Text>
            </div>
          ))}
          
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Title level={4} className="m-0">Total</Title>
            <Title level={4} className="m-0 text-blue-600">
              LKR {total.toFixed(2)}
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
      >
        <div className="space-y-6">
          <EnhancedStepper
            current={currentStep}
            steps={steps}
            status={stepError ? 'error' : 'process'}
            errorMessage={stepError}
          />
          
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
                <Col span={6}>
                  <div className="text-center">
                    <Text strong className="text-lg block">{completedTransaction.items.length}</Text>
                    <Text type="secondary" className="text-sm">Items</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <Text strong className="text-lg block">
                      {completedTransaction.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Text>
                    <Text type="secondary" className="text-sm">Total Quantity</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <Text strong className="text-lg block">
                      {completedTransaction.salesperson}
                    </Text>
                    <Text type="secondary" className="text-sm">Sales Person</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <Text strong className="text-lg block text-blue-600">
                      LKR {completedTransaction.total.toFixed(2)}
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
          // setCompletedTransaction(null);
        }}
        transaction={completedTransaction}
        type="detailed"
      />

      {/* Inventory Labels Modal */}
      <InventoryLabelModal
        open={showInventoryLabels}
        onClose={() => {
          setShowInventoryLabels(false);
          // setCompletedTransaction(null);
        }}
        transaction={completedTransaction}
      />
    </>
  );
}