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
  List
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Transaction } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

export function TransactionHistory() {
  const { state } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <span className="material-icons">payments</span>;
      case 'card':
        return <span className="material-icons">credit_card</span>;
      default:
        return <span className="material-icons">smartphone</span>;
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
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
      render: (record: Transaction) => (
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
      render: (items: any[]) => (
        <Tag color="blue">{items.length} item(s)</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Text strong className="text-[#0E72BD] text-lg">
          ${total.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => (
        <Tag icon={getPaymentMethodIcon(method)} color="green">
          {method.toUpperCase()}
        </Tag>
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
      render: (record: Transaction) => (
        <Space>
          <span 
            className="material-icons cursor-pointer text-[#0E72BD] hover:text-blue-700"
            onClick={() => handleViewDetails(record)}
          >
            visibility
          </span>
        </Space>
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
              title="Total Transactions"
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

      <Card 
        title={
          <Space>
            <span className="material-icons text-[#0E72BD]">receipt_long</span>
            <Title level={4} className="m-0">Transaction History</Title>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search transactions..."
              prefix={<span className="material-icons">search</span>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              allowClear
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
      >
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

      {/* Transaction Detail Modal */}
      <Modal
        title={`Transaction Details - ${selectedTransaction?.id}`}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <Space direction="vertical" size="large" className="w-full">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Transaction ID">
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
              <Descriptions.Item label="Cashier">
                {selectedTransaction.cashier}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag icon={getPaymentMethodIcon(selectedTransaction.paymentMethod)} color="green">
                  {selectedTransaction.paymentMethod.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

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

            <div className="bg-gray-50 p-4 rounded">
              <Row gutter={16}>
                <Col span={12}>
                  <Text>Subtotal: ${selectedTransaction.subtotal.toFixed(2)}</Text>
                </Col>
                <Col span={12}>
                  <Text>Tax: ${selectedTransaction.tax.toFixed(2)}</Text>
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

            {selectedTransaction.customerAddress && (
              <div>
                <Title level={5}>Delivery Address</Title>
                <Text>{selectedTransaction.customerAddress}</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  );
}