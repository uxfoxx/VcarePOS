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
import { GoodsReceiveNote } from './GoodsReceiveNote';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export function PurchaseOrderDetailModal({ 
  open, 
  onClose, 
  order,
  onStatusChange,
  onEdit,
  onUpdateInventory
}) {
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showGRN, setShowGRN] = useState(false);
  const [lastGRNData, setLastGRNData] = useState(null);

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

  const handleReceiveGoods = () => {
    setShowGRN(true);
  };

  const handleCompleteGRN = (orderId, grnData) => {
    // Check if all items were received in full
    const allItemsReceived = grnData.items.every(item => 
      item.receivedQuantity >= item.quantity
    );
    
    // Update order status based on whether all items were received
    const newStatus = allItemsReceived ? 'completed' : 'received';
    onStatusChange(orderId, newStatus);

    // Save GRN data for later download
    setLastGRNData(grnData);
    
    setShowGRN(false);
    
    // Show success message
    message.success(`Goods received successfully. Order status updated to ${newStatus}.`);
  };

  const handleDownloadGRN = async () => {
    if (!lastGRNData) {
      message.error('No GRN data available. Please complete the order first.');
      return;
    }

    setLoading(true);
    
    try {
      // Create a temporary div for the GRN PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.id = 'temp-grn-pdf';
      document.body.appendChild(tempDiv);
      
      // Render the GRN PDF in the temporary div
      const ReactDOM = await import('react-dom/client');
      const root = ReactDOM.createRoot(tempDiv);
      root.render(
        <GoodsReceiveNotePDF 
          order={order} 
          grnData={lastGRNData}
          id="temp-grn-pdf-content" 
        />
      );
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the rendered element
      const element = document.getElementById('temp-grn-pdf-content');
      if (!element) {
        throw new Error('GRN PDF element not found');
      }
      
      // Create PDF using html2canvas and jsPDF
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
      const filename = `goods-receive-note-${lastGRNData.id}.pdf`;
      pdf.save(filename);
      message.success('Goods Receive Note PDF downloaded successfully');
      
      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating GRN PDF:', error);
      message.error('Failed to generate GRN PDF');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const statusMap = {
      'pending': 0,
      'received': 1,
      'completed': 1
    };
    return statusMap[status] || 0;
  };

  const statusItems = [
    { key: 'pending', label: 'Pending Approval' },
    { key: 'completed', label: 'Completed' }
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

      // If completed, don't show any options
      if (order.status === 'completed') {
        return false;
      }
      
      // Allow moving to completed
      return item.key === 'completed';
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
          (order.status === 'completed' || order.status === 'received') && (
            <Button 
              key="download-grn" 
              onClick={handleDownloadGRN}
              icon={<Icon name="download" />}
              loading={loading && !showPdf}
            >
              Download GRN
            </Button>
          ),
          (order.status === 'pending' || order.status === 'received') && (
            <Button 
              key="receive" 
              onClick={handleReceiveGoods}
              icon={<Icon name="inventory" />}
              type="primary"
              className="bg-green-600"
            >
              {order.status === 'received' ? 'Update Received Items' : 'Complete Order'}
            </Button>
          ),
          order.status === 'pending' && (
            <Button 
              key="edit" 
              onClick={onEdit}
              icon={<Icon name="edit" />}
            >
              Edit
            </Button>
          ),
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
            
            <Steps
              current={getStatusStep(order.status)}
              size="small"
              items={order.status === 'received' ? [
                { title: 'Pending', description: 'Order created' },
                { title: 'Received', description: 'Partially received' },
                { title: 'Completed', description: 'Fully received' }
              ] : [
                { title: 'Pending', description: 'Order created' },
                { title: 'Completed', description: 'Order fulfilled' }
              ]}
            />
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
      
      {/* Goods Receive Note Modal */}
      <GoodsReceiveNote
        open={showGRN}
        onClose={() => setShowGRN(false)}
        order={order}
        onComplete={handleCompleteGRN}
        onUpdateInventory={onUpdateInventory}
      />

      {/* Hidden PDF for download */}
      {showPdf && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <PurchaseOrderPDF order={order} id="purchase-order-pdf" />
        </div>
      )}
    </>
  );
}