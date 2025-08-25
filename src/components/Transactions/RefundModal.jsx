import { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Space, 
  List, 
  InputNumber,
  Radio,
  Alert,
  message,
  Row,
  Col,
  Tag
} from 'antd';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RefundModal({ 
  open, 
  onClose, 
  transaction, 
  onRefund 
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [refundType, setRefundType] = useState('full');
  const [selectedItems, setSelectedItems] = useState([]);
  const [refundAmounts, setRefundAmounts] = useState({});

  if (!transaction) return null;
  
  const handleSubmit = (values) => {
    try {
      setLoading(true);
      
      let refundAmount = 0;
      let refundItems = [];

      if (refundType === 'full') {
        refundAmount = transaction.total;
        refundItems = transaction.items.map(item => ({
          ...item,
          refundQuantity: item.quantity,
          refundAmount: item.product.price * item.quantity
        }));
      } else if (refundType === 'partial') {
        refundAmount = values.partialAmount;
        refundItems = [];
      } else if (refundType === 'items') {
        refundItems = selectedItems.map(itemId => {
          const item = transaction.items.find(i => i.product.id === itemId);
          const refundQty = refundAmounts[itemId] || item.quantity;
          return {
            ...item,
            refundQuantity: refundQty,
            refundAmount: item.product.price * refundQty
          };
        });
        refundAmount = refundItems.reduce((sum, item) => sum + item.refundAmount, 0);
      }

      const refundData = {
        id: `REFUND-${Date.now()}`,
        transactionId: transaction.id,
        refundType,
        refundAmount,
        refundItems,
        reason: values.reason,
        notes: values.notes,
        refundMethod: values.refundMethod,
        processedBy: 'Current User', // Would come from auth context
        timestamp: new Date(),
        status: 'processed'
      };

      // Dispatch the action and let Redux saga handle the async operation
      onRefund(refundData);
      
      // Close modal and reset form
      onClose();
      form.resetFields();
      setRefundType('full');
      setSelectedItems([]);
      setRefundAmounts({});
    } catch {
      // Error handling is managed by Redux saga
      message.error('Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
      const newAmounts = { ...refundAmounts };
      delete newAmounts[itemId];
      setRefundAmounts(newAmounts);
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    setRefundAmounts({
      ...refundAmounts,
      [itemId]: quantity
    });
  };

  const calculateItemRefundTotal = () => {
    return selectedItems.reduce((sum, itemId) => {
      const item = transaction.items.find(i => i.product.id === itemId);
      const quantity = refundAmounts[itemId] || item.quantity;
      return sum + (item.product.price * quantity);
    }, 0);
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="undo" className="text-orange-600" />
          <span>Process Refund - {transaction.id}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Transaction Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <Title level={5} className="mb-3">Transaction Summary</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Text type="secondary">Date:</Text>
              <br />
              <Text strong>{new Date(transaction.timestamp).toLocaleDateString()}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary">Customer:</Text>
              <br />
              <Text strong>{transaction.customerName || 'Walk-in Customer'}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary">Payment Method:</Text>
              <br />
              <Tag color="blue">{transaction.paymentMethod.toUpperCase()}</Tag>
            </Col>
            <Col span={6}>
              <Text type="secondary">Total Amount:</Text>
              <br />
              <Text strong className="text-blue-600 text-lg">
                LKR{transaction.total.toFixed(2)}
              </Text>
            </Col>
          </Row>
        </div>

        {/* Refund Type Selection */}
        <Form.Item
          name="refundType"
          label="Refund Type"
          rules={[{ required: true, message: 'Please select refund type' }]}
          initialValue="full"
        >
          <Radio.Group 
            value={refundType} 
            onChange={(e) => setRefundType(e.target.value)}
          >
            <Space direction="vertical" className="w-full">
              <Radio value="full">
                <div>
                  <Text strong>Full Refund</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Refund the entire transaction amount (LKR{transaction.total.toFixed(2)})
                  </Text>
                </div>
              </Radio>
              <Radio value="partial">
                <div>
                  <Text strong>Partial Amount Refund</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Refund a specific amount less than the total
                  </Text>
                </div>
              </Radio>
              <Radio value="items">
                <div>
                  <Text strong>Specific Items Refund</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Refund specific items from the transaction
                  </Text>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* Partial Amount Input */}
        {refundType === 'partial' && (
          <Form.Item
            name="partialAmount"
            label="Refund Amount"
            rules={[
              { required: true, message: 'Please enter refund amount' },
              { 
                type: 'number', 
                min: 0.01, 
                max: transaction.total, 
                message: `Amount must be between LKR0.01 and LKR${transaction.total.toFixed(2)}` 
              }
            ]}
          >
            <InputNumber
              min={0.01}
              max={transaction.total}
              step={0.01}
              placeholder="0.00"
              className="w-full"
              prefix="LKR"
            />
          </Form.Item>
        )}

        {/* Item Selection */}
        {refundType === 'items' && (
          <div className="mb-6">
            <Title level={5} className="mb-3">Select Items to Refund</Title>
            <List
              dataSource={transaction.items}
              renderItem={(item) => {
                const isSelected = selectedItems.includes(item.product.id);
                const maxQuantity = item.quantity;
                const refundQuantity = refundAmounts[item.product.id] || maxQuantity;
                
                return (
                  <List.Item className="border rounded-lg p-3 mb-2">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleItemSelection(item.product.id, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <div>
                            <Text strong>{item.product.name}</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              SKU: {item.product.barcode} | Original Qty: {item.quantity}
                            </Text>
                          </div>
                        </div>
                        <div className="text-right">
                          <Text strong className="text-blue-600">
                            LKR{item.product.price.toFixed(2)} each
                          </Text>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <Text className="text-sm">Refund Quantity:</Text>
                            <InputNumber
                              min={1}
                              max={maxQuantity}
                              value={refundQuantity}
                              onChange={(value) => handleQuantityChange(item.product.id, value)}
                              size="small"
                              className="w-20"
                            />
                          </div>
                          <Text strong className="text-green-600">
                            Refund: LKR{(item.product.price * refundQuantity).toFixed(2)}
                          </Text>
                        </div>
                      )}
                    </div>
                  </List.Item>
                );
              }}
            />
            
            {selectedItems.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg mt-3">
                <div className="flex justify-between items-center">
                  <Text strong>Total Items Refund:</Text>
                  <Text strong className="text-green-600 text-lg">
                    LKR{calculateItemRefundTotal().toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Refund Reason */}
        <Form.Item
          name="reason"
          label="Refund Reason"
          rules={[{ required: true, message: 'Please select a reason' }]}
        >
          <Select placeholder="Select refund reason">
            <Option value="defective">Defective Product</Option>
            <Option value="wrong-item">Wrong Item Delivered</Option>
            <Option value="customer-request">Customer Request</Option>
            <Option value="damaged-shipping">Damaged During Shipping</Option>
            <Option value="not-as-described">Not as Described</Option>
            <Option value="duplicate-order">Duplicate Order</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        {/* Refund Method */}
        <Form.Item
          name="refundMethod"
          label="Refund Method"
          rules={[{ required: true, message: 'Please select refund method' }]}
          initialValue={transaction.paymentMethod}
        >
          <Select>
            <Option value="original">Original Payment Method</Option>
            <Option value="cash">Cash</Option>
            <Option value="card">Card</Option>
            <Option value="digital">Digital</Option>
            <Option value="store-credit">Store Credit</Option>
            <Option value="bank-transfer">Bank Transfer</Option>
          </Select>
        </Form.Item>

        {/* Additional Notes */}
        <Form.Item name="notes" label="Additional Notes">
          <TextArea
            rows={3}
            placeholder="Enter any additional notes about this refund..."
          />
        </Form.Item>

        {/* Warning Alert */}
        <Alert
          message="Refund Processing"
          description="This action will process the refund and update inventory levels. This action cannot be undone."
          type="warning"
          showIcon
          className="mb-4"
        />

        {/* Footer */}
        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            htmlType="submit" 
            loading={loading}
            icon="undo"
            danger
          >
            Process Refund
          </ActionButton.Primary>
        </div>
      </Form>
    </Modal>
  );
}