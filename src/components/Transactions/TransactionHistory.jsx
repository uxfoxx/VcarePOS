import React, { useState } from 'react';
import { 
  Space, 
  Typography, 
  Tag, 
  Statistic,
  Row,
  Col,
  Card,
  Select,
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
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

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
  const [loading, setLoading] = useState(false);

  const filteredTransactions = state.transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.salesperson?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleRowClick = (transaction) => {
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

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseInventoryLabelsModal = () => {
    setShowInventoryLabelsModal(false);
    setSelectedTransaction(null);
  };

  const handleUpdateStatus = (transactionId, newStatus) => {
    dispatch({
      type: 'UPDATE_TRANSACTION_STATUS',
      payload: { transactionId, status: newStatus }
    });
    message.success(`Order status updated to ${newStatus}`);
    
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
      fixed: 'left',
      width: 150,
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
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
      width: 200,
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
      title: 'Sales Person',
      dataIndex: 'salesperson',
      key: 'salesperson',
      width: 150,
      render: (salesperson, record) => (
        <div>
          <Text>{salesperson || record.cashier}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {salesperson ? 'Sales' : 'Cashier'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      sorter: (a, b) => a.items.length - b.items.length,
      render: (items) => (
        <Tag color="blue">{items.length} item(s)</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      sorter: (a, b) => a.total - b.total,
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
      width: 120,
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
      width: 120,
      render: (status) => (
        <StatusTag status={status || 'completed'}>
          {(status || 'completed').toUpperCase()}
        </StatusTag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
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
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

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

      <EnhancedTable
        title="Orders"
        icon="receipt_long"
        columns={columns}
        dataSource={filteredTransactions}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['id', 'customerName', 'cashier', 'salesperson']}
        searchPlaceholder="Search orders..."
        extra={
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
        }
        emptyDescription="No orders found"
        emptyImage={<Icon name="receipt_long" className="text-6xl text-gray-300" />}
      />

      {/* Transaction Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={handleCloseDetailModal}
        title={`Order Details - ${selectedTransaction?.id}`}
        icon="receipt_long"
        data={selectedTransaction}
        type="transaction"
        actions={[
          <ActionButton 
            key="inventory-labels" 
            icon="label"
            onClick={() => {
              setShowDetailModal(false);
              handleShowInventoryLabels(selectedTransaction);
            }}
          >
            Print Inventory Labels
          </ActionButton>,
          <ActionButton.Primary 
            key="invoice" 
            icon="receipt_long"
            onClick={() => {
              setShowDetailModal(false);
              handleShowInvoice(selectedTransaction, 'detailed');
            }}
          >
            View Invoice
          </ActionButton.Primary>
        ]}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={handleCloseInvoiceModal}
        transaction={selectedTransaction}
        type={invoiceType}
      />

      {/* Inventory Labels Modal */}
      <InventoryLabelModal
        open={showInventoryLabelsModal}
        onClose={handleCloseInventoryLabelsModal}
        transaction={selectedTransaction}
      />
    </Space>
  );
}