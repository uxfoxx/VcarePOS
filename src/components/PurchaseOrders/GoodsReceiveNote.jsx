import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Table, 
  Form, 
  Input, 
  Checkbox, 
  Button, 
  Space, 
  Divider, 
  Row, 
  Col,
  InputNumber,
  Tag,
  Alert,
  message,
  Card,
  Select
} from 'antd';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { GoodsReceiveNotePDF } from './GoodsReceiveNotePDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchUsers } from '../../features/users/usersSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function GoodsReceiveNote({ 
  open, 
  onClose, 
  order, 
  onComplete,
  onUpdateInventory
}) {
  const { users } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [receivedItems, setReceivedItems] = useState([]);
  const [showPdf, setShowPdf] = useState(false);
  const [grnNumber, setGrnNumber] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (open && order) {
      // Initialize received items from order items
      const items = order.items.map(item => ({
        ...item,
        received: false,
        receivedQuantity: 0,
        notes: ''
      }));
      setReceivedItems(items);
      
      // Generate GRN number
      const timestamp = new Date().getTime().toString().slice(-6);
      setGrnNumber(`GRN-${order.id.replace('PO-', '')}-${timestamp}`);
      
      // Set form values
      form.setFieldsValue({
        receivedBy: undefined,
        checkedBy: undefined,
        notes: '',
        receivedDate: new Date().toISOString().split('T')[0]
      });     
    }
  }, [open, order, form]);

  useEffect(() => {
      dispatch(fetchUsers());
  },[dispatch]);

  const handleItemCheck = (itemId, type, checked) => {
    setReceivedItems(prevItems => 
      prevItems.map(item => {
        if (item.itemId === itemId && item.type === type) {
          return { 
            ...item, 
            received: checked,
            receivedQuantity: checked ? item.quantity : 0
          };
        }
        return item;
      })
    );
  };

  const handleQuantityChange = (itemId, type, quantity) => {
    setReceivedItems(prevItems => 
      prevItems.map(item => {
        if (item.itemId === itemId && item.type === type) {
          return { 
            ...item, 
            receivedQuantity: quantity,
            received: quantity > 0
          };
        }
        return item;
      })
    );
  };

  const handleNotesChange = (itemId, type, notes) => {
    setReceivedItems(prevItems => 
      prevItems.map(item => {
        if (item.itemId === itemId && item.type === type) {
          return { ...item, notes };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form
      const values = await form.validateFields();
      
      // Check if any items are received
      const hasReceivedItems = receivedItems.some(item => item.received);
      
      if (!hasReceivedItems) {
        message.error('Please mark at least one item as received');
        setLoading(false);
        return;
      }
      
      // Prepare GRN data
      const grnData = {
        id: grnNumber,
        purchaseOrderId: order.id,
        vendorName: order.vendorName,
        vendorId: order.vendorId,
        receivedDate: values.receivedDate,
        receivedBy: values.receivedBy,
        checkedBy: values.checkedBy,
        notes: values.notes,
        items: receivedItems.filter(item => item.received),
        timestamp: new Date()
      };
      
      // Update inventory with received items
      const receivedProducts = receivedItems
        .filter(item => item.received && item.type === 'product' && item.receivedQuantity > 0)
        .map(item => ({
          id: item.itemId,
          quantity: item.receivedQuantity
        }));
        
      const receivedMaterials = receivedItems
        .filter(item => item.received && item.type === 'material' && item.receivedQuantity > 0)
        .map(item => ({
          id: item.itemId,
          quantity: item.receivedQuantity
        }));
      
      // Call the onUpdateInventory function to update inventory
      if (onUpdateInventory) {
        onUpdateInventory(receivedProducts, receivedMaterials);
      }
      
      // Call the onComplete function to update the order status
      if (onComplete) {
        onComplete(order.id, grnData);
      }
      
      message.success('Goods received successfully');
      
      // Show PDF for printing
      setShowPdf(true);
      
      // Wait for PDF to render then download
      setTimeout(() => {
        handleDownloadPdf();
      }, 0);
      
    } catch (error) {
      console.error('Error submitting GRN:', error);
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('grn-pdf');
      if (!element) {
        console.error('PDF element not found');
        setShowPdf(false);
        return;
      }

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const filename = `goods-receive-note-${grnNumber}.pdf`;
      pdf.save(filename);
      message.success('Goods Receive Note PDF downloaded successfully');      
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF');
      setShowPdf(false);
    } 
  };

  const columns = [
    {
      title: '',
      key: 'received',
      width: 50,
      render: (record) => (
        <Checkbox
          checked={record.received}
          onChange={(e) => handleItemCheck(record.itemId, record.type, e.target.checked)}
        />
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'product' ? 'blue' : 'green'}>
          {type === 'product' ? 'Product' : 'Material'}
        </Tag>
      )
    },
    {
      title: 'Item',
      key: 'name',
      render: (record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            SKU: {record.sku} | {record.category}
          </Text>
        </div>
      )
    },
    {
      title: 'Ordered',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => (
        <Text>{quantity} {record.unit || 'units'}</Text>
      )
    },
    {
      title: 'Received',
      key: 'receivedQuantity',
      width: 120,
      render: (record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          value={record.receivedQuantity}
          onChange={(value) => handleQuantityChange(record.itemId, record.type, value)}
          disabled={!record.received}
          className="w-full"
        />
      )
    },
    {
      title: 'Notes',
      key: 'notes',
      width: 200,
      render: (record) => (
        <Input
          placeholder="Add notes"
          value={record.notes}
          onChange={(e) => handleNotesChange(record.itemId, record.type, e.target.value)}
          disabled={!record.received}
        />
      )
    }
  ];

  if (!order) return null;

  return (
    <>
      <Modal
        title={
          <Space>
            <Icon name="inventory" className="text-green-600" />
            <span>Goods Receive Note - {order.id}</span>
          </Space>
        }
        open={open && !showPdf}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button 
            key="view" 
            onClick={() => setShowPdf(true)}
            icon={<Icon name="visibility" />}
          >
            Preview GRN
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            className="bg-green-600"
          >
            Confirm & Generate GRN
          </Button>
        ]}
      >
        <div className="space-y-6">
          <Alert
            message="Goods Receiving Process"
            description="Check the items you've received, enter the received quantity, and add any notes. This will update your inventory and generate a Goods Receive Note (GRN)."
            type="info"
            showIcon
            className="mb-6"
          />

          <Card size="small" className="mb-4">
            <div className="flex justify-between">
              <div>
                <Text strong>GRN Number:</Text> {grnNumber}
              </div>
              <div>
                <Text strong>PO Number:</Text> {order.id}
              </div>
              <div>
                <Text strong>Vendor:</Text> {order.vendorName}
              </div>
            </div>
          </Card>

          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="receivedDate"
                  label="Date Received"
                  rules={[{ required: true, message: 'Please enter receive date' }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="receivedBy"
                  label="Received By (Select User)"
                  rules={[{ required: true, message: 'Please enter receiver name' }]}
                >
                  <Select
                    placeholder="Select receiver"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {users.filter(user => user.isActive).map(user => (
                      <Option key={user.id} value={`${user.firstName} ${user.lastName}`}>
                        {user.firstName} {user.lastName} ({user.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="checkedBy"
                  label="Checked By (Select User)"
                  rules={[{ required: true, message: 'Please enter checker name' }]}
                >
                  <Select
                    placeholder="Select checker"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {users.filter(user => user.isActive).map(user => (
                      <Option key={user.id} value={`${user.firstName} ${user.lastName}`}>
                        {user.firstName} {user.lastName} ({user.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Title level={5} className="m-0">Items Received</Title>
                <Space>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setReceivedItems(prevItems => 
                        prevItems.map(item => ({
                          ...item,
                          received: true,
                          receivedQuantity: item.quantity
                        }))
                      );
                    }}
                  >
                    Select All
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setReceivedItems(prevItems => 
                        prevItems.map(item => ({
                          ...item,
                          received: false,
                          receivedQuantity: 0
                        }))
                      );
                    }}
                  >
                    Clear All
                  </Button>
                </Space>
              </div>
              
              <Table
                columns={columns}
                dataSource={receivedItems}
                rowKey={(record) => `${record.type}-${record.itemId}`}
                pagination={false}
                rowClassName={(record) => record.received ? 'bg-green-50' : ''}
              />
            </div>

            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <TextArea
                rows={3}
                placeholder="Enter any additional notes about this delivery"
              />
            </Form.Item>
          </Form>

          <div className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Note:</strong> Completing this form will update your inventory with the received items and change the purchase order status to "completed".
            </Text>
          </div>
        </div>
      </Modal>

      {/* Hidden PDF for download */}
      <Modal
        title={
          <Space>
            <Icon name="inventory" className="text-green-600" />
            <span>Goods Receive Note Preview</span>
          </Space>
        }
        open={showPdf}
        onCancel={() => setShowPdf(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setShowPdf(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary"
            onClick={handleDownloadPdf}
            icon={<Icon name="download" />}
            className="bg-green-600"
          >
            Download PDF
          </Button>
        ]}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <GoodsReceiveNotePDF 
            order={order} 
            grnData={{
              id: grnNumber,
              receivedDate: form.getFieldValue('receivedDate'),
              receivedBy: form.getFieldValue('receivedBy'),
              checkedBy: form.getFieldValue('checkedBy'),
              notes: form.getFieldValue('notes'),
              items: receivedItems.filter(item => item.received)
            }}
            id="grn-pdf" 
          />
        </div>
      </Modal>
    </>
  );
}