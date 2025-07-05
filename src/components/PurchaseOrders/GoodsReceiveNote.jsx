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
  Card
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { GoodsReceiveNotePDF } from './GoodsReceiveNotePDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function GoodsReceiveNote({ 
  open, 
  onClose, 
  order, 
  onComplete,
  onUpdateInventory
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [receivedItems, setReceivedItems] = useState([]);
  const [showPdf, setShowPdf] = useState(false);
  const [grnNumber, setGrnNumber] = useState('');

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
        receivedBy: '',
        checkedBy: '',
        notes: '',
        receivedDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [open, order, form]);

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
      }, 500);
      
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
      
      // Close the modal after download
      setTimeout(() => {
        setShowPdf(false);
        onClose();
      }, 500);
      
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
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            className="bg-green-600"
          >
            Complete & Generate GRN
          </Button>
        ]}
      >
        <div className="space-y-6">
          <Alert
            message="Goods Receiving Process"
            description="Check the items you've received, enter the received quantity, and add any notes about condition or discrepancies. This will update your inventory and generate a Goods Receive Note (GRN)."
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
                  label="Received By"
                  rules={[{ required: true, message: 'Please enter receiver name' }]}
                >
                  <Input placeholder="Enter name of receiver" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="checkedBy"
                  label="Checked By"
                  rules={[{ required: true, message: 'Please enter checker name' }]}
                >
                  <Input placeholder="Enter name of checker" />
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
              <strong>Note:</strong> Completing this form will update your inventory with the received items and change the purchase order status to "received" or "completed" based on whether all items were received.
            </Text>
          </div>
        </div>
      </Modal>

      {/* Hidden PDF for download */}
      {showPdf && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
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
      )}
    </>
  );
}