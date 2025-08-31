import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Space, 
  Typography,
  Tag,
  Image,
  Popconfirm,
  message,
  Row,
  Col,
  DatePicker,
  Select,
  Tooltip
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ExportModal } from '../common/ExportModal';
import { InvoiceModal } from '../Invoices/InvoiceModal';
import { InventoryLabelModal } from '../Invoices/InventoryLabelModal';
import { RefundModal } from './RefundModal';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTransactions,
  processRefund
} from '../../features/transactions/transactionsSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function TransactionHistory() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const transactions = useSelector(state => state.transactions.transactionsList);
  const loading = useSelector(state => state.transactions.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesPayment = filterPaymentMethod === 'all' || transaction.paymentMethod === filterPaymentMethod;
    
    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const transactionDate = dayjs(transaction.timestamp);
      matchesDate = transactionDate.isAfter(dateRange[0].startOf('day')) && 
                   transactionDate.isBefore(dateRange[1].endOf('day'));
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRefund = (refundData) => {
    dispatch(processRefund({ id: selectedTransaction.id, refundData }));
    setShowRefundModal(false);
  };

  const handleShowInvoice = (transaction) => {
    setSelectedTransaction(transaction);
    setShowInvoiceModal(true);
  };

  const handleShowLabels = (transaction) => {
    setSelectedTransaction(transaction);
    setShowLabelsModal(true);
  };

  const handleShowRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'refunded': return 'red';
      case 'partially-refunded': return 'purple';
      case 'confirmed': return 'blue';
      case 'pending_payment': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return 'payments';
      case 'card': return 'credit_card';
      case 'digital': return 'smartphone';
      case 'cod': return 'local_shipping';
      case 'bank_transfer': return 'account_balance';
      default: return 'payment';
    }
  };

  const columns = [
    {
      title: 'Transaction',
      key: 'transaction',
      fixed: 'left',
      width: 200,
      render: (record) => (
        <div>
          <Text strong className="block">{record.id}</Text>
          <Text type="secondary" className="text-xs">
            {new Date(record.timestamp).toLocaleDateString()}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {new Date(record.timestamp).toLocaleTimeString()}
          </Text>
          {record.source === 'ecommerce' && (
            <Tag color="purple" size="small" className="mt-1">
              E-commerce
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (record) => (
        <div>
          <Text strong className="block">
            {record.customerName || 'Walk-in Customer'}
          </Text>
          {record.customerPhone && (
            <Text type="secondary" className="text-xs block">
              {record.customerPhone}
            </Text>
          )}
          {record.customerEmail && (
            <Text type="secondary" className="text-xs block">
              {record.customerEmail}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      width: 100,
      render: (record) => (
        <div className="text-center">
          <Text strong className="block">{record.items.length}</Text>
          <Text type="secondary" className="text-xs">
            {record.items.reduce((sum, item) => sum + item.quantity, 0)} units
          </Text>
        </div>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 120,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Icon name={getPaymentMethodIcon(record.paymentMethod)} className="text-blue-600" />
          <Text className="capitalize text-sm">
            {record.paymentMethod.replace('_', ' ')}
          </Text>
        </div>
      ),
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'Card', value: 'card' },
        { text: 'Digital', value: 'digital' },
        { text: 'COD', value: 'cod' },
        { text: 'Bank Transfer', value: 'bank_transfer' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => (
        <Text strong className="text-blue-600 text-lg">
          LKR {total.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Pending Payment', value: 'pending_payment' },
        { text: 'Refunded', value: 'refunded' },
        { text: 'Partially Refunded', value: 'partially-refunded' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Staff',
      key: 'staff',
      width: 150,
      render: (record) => (
        <div>
          <Text className="block text-sm">
            <Icon name="person" className="mr-1" size="text-xs" />
            {record.cashier}
          </Text>
          {record.salesperson && record.salesperson !== record.cashier && (
            <Text type="secondary" className="text-xs block">
              Sales: {record.salesperson}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <ActionButton.Text 
              icon="visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title="Print Invoice">
            <ActionButton.Text 
              icon="receipt_long"
              onClick={(e) => {
                e.stopPropagation();
                handleShowInvoice(record);
              }}
              className="text-green-600"
            />
          </Tooltip>
          
          <Tooltip title="Print Labels">
            <ActionButton.Text 
              icon="label"
              onClick={(e) => {
                e.stopPropagation();
                handleShowLabels(record);
              }}
              className="text-purple-600"
            />
          </Tooltip>
          
          {record.status === 'completed' && hasPermission('transactions', 'edit') && (
            <Tooltip title="Process Refund">
              <ActionButton.Text 
                icon="undo"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowRefund(record);
                }}
                className="text-orange-600"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (!hasPermission('transactions', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view transactions."
        />
      </Card>
    );
  }

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <Card>
        {/* Transaction Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                LKR {transactions.reduce((sum, t) => sum + t.total, 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {transactions.filter(t => t.source === 'ecommerce').length}
              </div>
              <div className="text-sm text-gray-500">E-commerce Orders</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {transactions.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </Card>
          </Col>
        </Row>
        
        <EnhancedTable
          title="Transaction History"
          icon="receipt_long"
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-blue-50'
          })}
          searchFields={['id', 'customerName', 'cashier']}
          searchPlaceholder="Search transactions..."
          extra={
            <Space>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                className="w-32"
              >
                <Option value="all">All Status</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="refunded">Refunded</Option>
              </Select>
              <Select
                value={filterPaymentMethod}
                onChange={setFilterPaymentMethod}
                className="w-32"
              >
                <Option value="all">All Methods</Option>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="digital">Digital</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Start Date', 'End Date']}
              />
              <ActionButton 
                icon="download"
                onClick={() => setShowExportModal(true)}
              >
                Export
              </ActionButton>
            </Space>
          }
          emptyDescription="No transactions found"
          emptyImage={<Icon name="receipt_long" className="text-6xl text-gray-300" />}
        />
      </Card>

      {/* Transaction Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        title={`Transaction Details - ${selectedTransaction?.id}`}
        icon="receipt_long"
        data={selectedTransaction}
        type="transaction"
        actions={[
          <ActionButton 
            key="invoice" 
            icon="receipt_long"
            onClick={() => {
              setShowDetailModal(false);
              handleShowInvoice(selectedTransaction);
            }}
          >
            Print Invoice
          </ActionButton>,
          <ActionButton 
            key="labels" 
            icon="label"
            onClick={() => {
              setShowDetailModal(false);
              handleShowLabels(selectedTransaction);
            }}
          >
            Print Labels
          </ActionButton>,
          selectedTransaction?.status === 'completed' && hasPermission('transactions', 'edit') && (
            <ActionButton 
              key="refund" 
              icon="undo"
              onClick={() => {
                setShowDetailModal(false);
                handleShowRefund(selectedTransaction);
              }}
            >
              Process Refund
            </ActionButton>
          )
        ].filter(Boolean)}
      />

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType="transactions"
        data={{ transactions }}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        type="detailed"
      />

      {/* Inventory Labels Modal */}
      <InventoryLabelModal
        open={showLabelsModal}
        onClose={() => {
          setShowLabelsModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />

      {/* Refund Modal */}
      <RefundModal
        open={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onRefund={handleRefund}
      />
    </>
  );
}