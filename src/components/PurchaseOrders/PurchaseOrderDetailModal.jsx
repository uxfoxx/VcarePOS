import React, { useState } from 'react';
import { 
  Modal, 
  Typography, 
  Descriptions, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Divider, 
  Timeline,
  Steps,
  Dropdown,
  Menu,
  message
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { PurchaseOrderPDF } from './PurchaseOrderPDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export function PurchaseOrderDetailModal({ 
  open, 
  onClose, 
  order, 
  onStatusChange,
  onEdit
}) {
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  if (!order) return null;

  const handleStatusChange = (newStatus) => {
    onStatusChange(order.id, newStatus);
  };

  const handleDownloadPdf = async () => {
    setLoading(true);
    setShowPdf(true);
    
    // Wait for PDF to render
    setTimeout(async () => {
      try {
        const element = document.getElementById('purchase-order-pdf');
        if (!element) {
          console.error('PDF element not found');
          setLoading(false);
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
        const filename = `purchase-order-${order.id}.pdf`;
        pdf.save(filename);
        message.success('Purchase order PDF downloaded successfully');
      } catch (error) {
        console.error('Error generating PDF:', error);
        message.error('Failed to generate PDF');
      } finally {
        setLoading(false);
        setShowPdf(false);
      }
    }, 500);
  };

  const getStatusStep = (status) => {
    const statusMap = {
      'draft': 0,
      'pending': 1,
      'approved': 2,
      'ordered': 3,
      'received': 4,
      'completed': 5,
      'cancelled': -1
    };
    return statusMap[status] || 0;
  };

  const statusItems = [
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'ordered', label: 'Ordered' },
    { key: 'received', label: 'Received' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const itemColumns = [
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            SKU: {record.sku} | {record.category}
          </Text>
        </div>
      )
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 120,
      render: (record) => (
        <Text>
          {record.quantity} {record.unit || 'units'}
        </Text>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price) => <Text>LKR {price.toFixed(2)}</Text>
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => <Text strong>LKR {total.toFixed(2)}</Text>
    }
  ];

  const statusMenuItems = statusItems
    .filter(item => {
      // Filter out statuses based on current status
      const currentStep = getStatusStep(order.status);
      const itemStep = getStatusStep(item.key);
      
      // If cancelled, only show draft option
      if (order.status === 'cancelled') {
        return item.key === 'draft';
      }
      
      // If completed, don't show any options
      if (order.status === 'completed') {
        return false;
      }
      
      // Allow moving one step forward or to cancelled
      return itemStep === currentStep + 1 || item.key === 'cancelled';
    })
    .map(item => ({
      key: item.key,
      label: item.label,
      onClick: () => handleStatusChange(item.key)
    }));

  return (
    <>
      <Modal
        title={
          <Space>
            <Icon name="shopping_cart" className="text-blue-600" />
            <span>Purchase Order Details - {order.id}</span>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          order.status === 'draft' && (
            <Button 
              key="edit" 
              onClick={onEdit}
              icon={<Icon name="edit" />}
            >
              Edit
            </Button>
          ),
          <Dropdown
            key="status"
            menu={{ items: statusMenuItems }}
            disabled={order.status === 'completed' || statusMenuItems.length === 0}
          >
            <Button 
              type="primary" 
              className="bg-blue-600"
              icon={<Icon name="update" />}
            >
              Update Status
            </Button>
          </Dropdown>,
          <Button 
            key="download" 
            type="primary"
            onClick={handleDownloadPdf}
            loading={loading}
            icon={<Icon name="download" />}
            className="bg-blue-600"
          >
            Download PDF
          </Button>
        ]}
      >
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <Text type="secondary">Status</Text>
                <br />
                <Tag color={
                  order.status === 'completed' ? 'green' :
                  order.status === 'cancelled' ? 'red' :
                  order.status === 'approved' ? 'purple' :
                  order.status === 'ordered' ? 'orange' :
                  order.status === 'received' ? 'green' :
                  order.status === 'pending' ? 'blue' : 'default'
                } className="text-base px-3 py-1 mt-1 capitalize">
                  {order.status}
                </Tag>
              </div>
              <div className="text-right">
                <Text type="secondary">Created By</Text>
                <br />
                <Text strong>{order.createdBy}</Text>
              </div>
            </div>
            
            {order.status !== 'cancelled' && (
              <Steps
                current={getStatusStep(order.status)}
                size="small"
                status={order.status === 'cancelled' ? 'error' : 'process'}
                items={[
                  { title: 'Draft' },
                  { title: 'Pending' },
                  { title: 'Approved' },
                  { title: 'Ordered' },
                  { title: 'Received' },
                  { title: 'Completed' }
                ]}
              />
            )}
          </div>

          {/* Vendor Information */}
          <Descriptions title="Vendor Information" bordered size="small" column={2}>
            <Descriptions.Item label="Vendor Name" span={2}>
              {order.vendorName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.vendorEmail || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {order.vendorPhone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {order.vendorAddress || 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          {/* Order Information */}
          <Descriptions title="Order Information" bordered size="small" column={2}>
            <Descriptions.Item label="Order Date">
              {new Date(order.orderDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Delivery">
              {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Terms">
              {order.paymentTerms || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Method">
              {order.shippingMethod || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Ship To Address" span={2}>
              {order.shippingAddress}
            </Descriptions.Item>
            {order.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {order.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Order Items */}
          <div>
            <Title level={5} className="mb-4">Order Items</Title>
            <Table
              columns={itemColumns}
              dataSource={order.items}
              rowKey={(record) => `${record.type}-${record.itemId}`}
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong className="text-blue-600">
                      LKR {order.total.toFixed(2)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>

          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div>
              <Title level={5} className="mb-4">Order Timeline</Title>
              <Timeline
                items={order.timeline.map(event => ({
                  color: 
                    event.status === 'completed' ? 'green' :
                    event.status === 'cancelled' ? 'red' :
                    event.status === 'approved' ? 'purple' :
                    event.status === 'ordered' ? 'orange' :
                    event.status === 'received' ? 'green' :
                    event.status === 'pending' ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Text strong>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        {new Date(event.timestamp).toLocaleString()} - {event.user}
                      </Text>
                      {event.notes && (
                        <div className="mt-1 text-sm">{event.notes}</div>
                      )}
                    </div>
                  )
                }))}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Hidden PDF for download */}
      {showPdf && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <PurchaseOrderPDF order={order} id="purchase-order-pdf" />
        </div>
      )}
    </>
  );
}