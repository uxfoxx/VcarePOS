import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Space, 
  Typography, 
  Tag, 
  Statistic,
  Row,
  Col,
  Select,
  Tooltip
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { InvoiceModal } from '../Invoices/InvoiceModal';
import { InventoryLabelModal } from '../Invoices/InventoryLabelModal';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { RefundModal } from './RefundModal';
import { 
  fetchTransactions,
  processRefund
} from '../../features/transactions/transactionsSlice';

const { Text } = Typography;
const { Option } = Select;

export function TransactionHistory() {
  const dispatch = useDispatch();
  const { logAction } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInventoryLabelsModal, setShowInventoryLabelsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState('detailed');

  // Get transactions data from Redux store
  const { transactionsList, loading } = useSelector(state => state.transactions);

  useEffect(() => {
    // Fetch transactions when component mounts
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Sort transactions by timestamp (latest first) by default
  const sortedTransactions = [...transactionsList].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filteredTransactions = sortedTransactions.filter(transaction => {
    // Note: Search functionality is handled by EnhancedTable component
    if (filterPeriod === 'today') {
      const today = new Date();
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate.toDateString() === today.toDateString();
    } else if (filterPeriod === 'week') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= weekStart;
    } else if (filterPeriod === 'month') {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= monthStart;
    }
    
    return true; // Show all transactions for 'all' period
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

  const handleShowRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    // setSelectedTransaction(null);
  };

  const handleCloseInventoryLabelsModal = () => {
    setShowInventoryLabelsModal(false);
    // setSelectedTransaction(null);
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    // setSelectedTransaction(null);
  };

  const handleProcessRefund = (refundData) => {
    // Dispatch the processRefund Redux action with correct parameter structure
    // Let Redux saga handle all business logic, API calls, and notifications
    dispatch(processRefund({
      id: selectedTransaction.id, // Fix: use 'id' instead of 'transactionId'
      refundData
    }));

    // Log the refund action (kept in component as it's audit-specific, not business logic)
    if (logAction) {
      logAction(
        'CREATE',
        'transactions',
        `Processed ${refundData.refundType} refund for transaction ${selectedTransaction.id}`,
        {
          transactionId: selectedTransaction.id,
          refundId: refundData.id,
          refundAmount: refundData.refundAmount,
          refundType: refundData.refundType
        }
      );
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

  const getStatusColor = (status, refunds) => {
    if (refunds && refunds.length > 0) {
      const totalRefunded = refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
      const transaction = filteredTransactions.find(t => t.refunds === refunds);
      if (transaction && totalRefunded >= transaction.total) {
        return 'red'; // Fully refunded
      } else if (totalRefunded > 0) {
        return 'orange'; // Partially refunded
      }
    }
    
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'refunded': return 'red';
      case 'partially-refunded': return 'orange';
      default: return 'blue';
    }
  };

  const getStatusText = (status, refunds) => {
    if (refunds && refunds.length > 0) {
      const totalRefunded = refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
      const transaction = filteredTransactions.find(t => t.refunds === refunds);
      if (transaction && totalRefunded >= transaction.total) {
        return 'REFUNDED';
      } else if (totalRefunded > 0) {
        return 'PARTIAL REFUND';
      }
    }
    
    return (status || 'completed').toUpperCase();
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 150,
      render: (id) => <Text code>{id}</Text>,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp), // Latest first by default
      defaultSortOrder: 'ascend',
      render: (timestamp) => (
        <Text>{new Date(timestamp).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 150,
      render: (record) => (
        <div>
          <Text>{record.customerName || 'Walk-in Customer'}</Text>
          {record.items.some(item => item.selectedVariant) && (
            <Tag color="blue" className="ml-1">Has Variants</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      render: (items) => <Tag color="blue">{items.length}</Tag>,
      sorter: (a, b) => a.items.length - b.items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      sorter: (a, b) => a.total - b.total,
      render: (total) => (
        <Text strong className="text-blue-600">
          LKR {total.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => (
        <Tag icon={<Icon name={getPaymentMethodIcon(method)} />} color="green">
          {method.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Card', value: 'card' },
        { text: 'Cash', value: 'cash' },
        { text: 'Digital', value: 'digital' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => (
        <Tag color={getStatusColor(record.status, record.refunds)}>
          {getStatusText(record.status, record.refunds)}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Refunded', value: 'refunded' },
        { text: 'Partially Refunded', value: 'partially-refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <ActionButton.Text
              icon="visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Print Invoice">
            <ActionButton.Text
              icon="receipt_long"
              onClick={(e) => {
                e.stopPropagation();
                handleShowInvoice(record, 'detailed');
              }}
              className="text-gray-600"
            />
          </Tooltip>
          {record.status !== 'refunded' && (
            <Tooltip title="Process Refund">
              <ActionButton.Text
                icon="undo"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowRefund(record);
                }}
                className="text-red-600"
              />
            </Tooltip>
          )}
        </Space>
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
              prefix="LKR "
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
              prefix="LKR "
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
          selectedTransaction?.status !== 'refunded' && (
            <ActionButton 
              key="refund" 
              icon="undo"
              danger
              onClick={() => {
                setShowDetailModal(false);
                handleShowRefund(selectedTransaction);
              }}
            >
              Process Refund
            </ActionButton>
          ),
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
        ].filter(Boolean)}
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

      {/* Refund Modal */}
      <RefundModal
        open={showRefundModal}
        onClose={handleCloseRefundModal}
        transaction={selectedTransaction}
        onRefund={handleProcessRefund}
      />
    </Space>
  );
}