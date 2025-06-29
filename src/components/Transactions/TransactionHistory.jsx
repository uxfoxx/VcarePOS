import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Tag, 
  Statistic,
  Row,
  Col,
  Descriptions,
  Modal,
  List,
  Button,
  message,
  Dropdown
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { StatusTag } from '../common/StatusTag';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { InvoiceModal } from '../Invoices/InvoiceModal';
import { InventoryLabelModal } from '../Invoices/InventoryLabelModal';

const { Title, Text } = Typography;
const { Option } = Select;

export function TransactionHistory() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInventoryLabelsModal, setShowInventoryLabelsModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState('detailed');

  const filteredTransactions = state.transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPeriod === 'today') {
      const today = new Date();
      const transactionDate = new Date(transaction.timestamp);
      return matchesSearch && transactionDate.toDateString() === today.toDateString();
    }
    
    return matchesSearch;
  });

  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleShowInvoice = (transaction, type = 'detailed') => {
    setSelectedTransaction(transaction);
    setInvoiceType(type);
    setShowInvoiceModal(true);
  };

  const handleShowInventoryLabels = (transaction) => {
    setSelectedTransaction(transaction);
    setShowInventoryLabelsModal(true);
  };

  const handleUpdateStatus = (transactionId, newStatus) => {
    dispatch({
      type: 'UPDATE_TRANSACTION_STATUS',
      payload: { transactionId, status: newStatus }
    });
    message.success(`Order status updated to ${newStatus}`);
    
    // Update the selected transaction if it's currently being viewed
    if (selectedTransaction && selectedTransaction.id === transactionId) {
      setSelectedTransaction({
        ...selectedTransaction,
        status: newStatus
      });
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return 'payments';
      case 'card':
        return 'credit_card';
      case 'digital':
        return 'smartphone';
      default:
        return 'payment';
    }
  };

  const getActionMenuItems = (record) => [
    {
      key: 'view',
      icon: <Icon name="visibility" />,
      label: 'View Details',
      onClick: () => handleViewDetails(record)
    },
    {
      key: 'invoice',
      icon: <Icon name="receipt_long" />,
      label: 'View Invoice',
      onClick: () => handleShowInvoice(record, 'detailed')
    },
    {
      key: 'inventory-labels',
      icon: <Icon name="label" />,
      label: 'Print Inventory Labels',
      onClick: () => handleShowInventoryLabels(record)
    }
  ];

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <div>
          <Text>{new Date(timestamp).toLocaleDateString()}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record) => (
        <div>
          <Text>{record.customerName || 'Walk-in Customer'}</Text>
          {record.customerPhone && (
            <>
              <br />
              <Text type="secondary" className="text-xs">{record.customerPhone}</Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <Tag color="blue">{items.length} item(s)</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <Text strong className="text-blue-600 text-lg">
          ${total.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag icon={<Icon name={getPaymentMethodIcon(method)} />} color="green">
          {method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <StatusTag status={status || 'completed'}>
          {(status || 'completed').toUpperCase()}
        </StatusTag>
      ),
    },
    {
      title: 'Cashier',
      dataIndex: 'cashier',
      key: 'cashier',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record)
          }}
          trigger={['click']}
        >
          <ActionButton.Text
            icon="more_vert"
            className="text-blue-600 hover:text-blue-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" className="w-full">
      {/* Statistics */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#0E72BD' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={totalTransactions}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={averageOrderValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <PageHeader
          title="Orders"
          icon="receipt_long"
          extra={
            <Space>
              <SearchInput
                placeholder="Search orders..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-64"
              />
              <Select
                value={filterPeriod}
                onChange={setFilterPeriod}
                className="w-32"
              >
                <Option value="all">All Time</Option>
                <Option value="today">Today</Option>
                <Option value="week">This Week</Option>
                <Option value="month">This Month</Option>
              </Select>
            </Space>
          }
        />
        
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details - ${selectedTransaction?.id}`}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        width={800}
        footer={[
          <ActionButton key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </ActionButton>,
          <ActionButton 
            key="inventory-labels" 
            icon="label"
            onClick={() => handleShowInventoryLabels(selectedTransaction)}
          >
            Print Inventory Labels
          </ActionButton>,
          <ActionButton.Primary 
            key="invoice" 
            icon="receipt_long"
            onClick={() => handleShowInvoice(selectedTransaction, 'detailed')}
          >
            View Invoice
          </ActionButton.Primary>
        ]}
      >
        {selectedTransaction && (
          <Space direction="vertical" size="large" className="w-full">
            {/* Order Info */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order ID">
                <Text code>{selectedTransaction.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date & Time">
                {new Date(selectedTransaction.timestamp).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedTransaction.customerName || 'Walk-in Customer'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedTransaction.customerPhone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedTransaction.customerEmail || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {selectedTransaction.customerAddress || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cashier">
                {selectedTransaction.cashier}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag icon={<Icon name={getPaymentMethodIcon(selectedTransaction.paymentMethod)} />} color="green">
                  {selectedTransaction.paymentMethod.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Applied Coupon">
                {selectedTransaction.appliedCoupon || 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={selectedTransaction.status || 'completed'}>
                  {(selectedTransaction.status || 'completed').toUpperCase()}
                </StatusTag>
              </Descriptions.Item>
            </Descriptions>

            {/* Order Notes */}
            {selectedTransaction.notes && (
              <div>
                <Title level={5}>Order Notes</Title>
                <div className="p-3 bg-gray-50 rounded border">
                  <Text>{selectedTransaction.notes}</Text>
                </div>
              </div>
            )}

            {/* Items Purchased */}
            <div>
              <Title level={5}>Items Purchased</Title>
              <List
                dataSource={selectedTransaction.items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.product.name}
                      description={
                        <Space>
                          <Text type="secondary">SKU: {item.product.barcode}</Text>
                          <Text type="secondary">Qty: {item.quantity}</Text>
                          <Text type="secondary">Price: ${item.product.price.toFixed(2)}</Text>
                          <Text strong>Total: ${(item.product.price * item.quantity).toFixed(2)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>

            {/* Order Status Management */}
            <div>
              <Title level={5}>Order Status</Title>
              <div className="flex items-center space-x-2 mb-4">
                <Text>Current Status:</Text>
                <StatusTag status={selectedTransaction.status || 'completed'}>
                  {(selectedTransaction.status || 'completed').toUpperCase()}
                </StatusTag>
              </div>
              
              <div className="flex space-x-2">
                <ActionButton
                  onClick={() => handleUpdateStatus(selectedTransaction.id, 'pending')}
                  disabled={selectedTransaction.status === 'pending'}
                  size="small"
                >
                  Set Pending
                </ActionButton>
                <ActionButton
                  onClick={() => handleUpdateStatus(selectedTransaction.id, 'processing')}
                  disabled={selectedTransaction.status === 'processing'}
                  size="small"
                >
                  Set Processing
                </ActionButton>
                <ActionButton
                  onClick={() => handleUpdateStatus(selectedTransaction.id, 'completed')}
                  disabled={selectedTransaction.status === 'completed'}
                  size="small"
                >
                  Set Completed
                </ActionButton>
                <ActionButton
                  onClick={() => handleUpdateStatus(selectedTransaction.id, 'cancelled')}
                  disabled={selectedTransaction.status === 'cancelled'}
                  danger
                  size="small"
                >
                  Cancel Order
                </ActionButton>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded">
              <Title level={5} className="mb-3">Financial Summary</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>Subtotal: ${selectedTransaction.subtotal.toFixed(2)}</Text>
                </Col>
                <Col span={12}>
                  <Text>Tax: ${selectedTransaction.totalTax.toFixed(2)}</Text>
                </Col>
                <Col span={12}>
                  <Text>Discount: ${selectedTransaction.discount.toFixed(2)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="text-lg">
                    Total: ${selectedTransaction.total.toFixed(2)}
                  </Text>
                </Col>
              </Row>
            </div>
          </Space>
        )}
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        type={invoiceType}
      />

      {/* Inventory Labels Modal */}
      <InventoryLabelModal
        open={showInventoryLabelsModal}
        onClose={() => {
          setShowInventoryLabelsModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </Space>
  );
}