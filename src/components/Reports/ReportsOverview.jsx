import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  DatePicker, 
  Select,
  Statistic,
  Progress,
  Table,
  Tag,
  Tabs
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { StatsCard } from '../common/StatsCard';
import { ExportModal } from '../common/ExportModal';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { fetchTransactions } from '../../features/transactions/transactionsSlice';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchRawMaterials } from '../../features/rawMaterials/rawMaterialsSlice';
import { fetchCoupons } from '../../features/coupons/couponsSlice';
import { fetchUsers } from '../../features/users/usersSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function ReportsOverview() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const transactions = useSelector(state => state.transactions.transactionsList);
  const products = useSelector(state => state.products.productsList);
  const rawMaterials = useSelector(state => state.rawMaterials.rawMaterialsList);
  const coupons = useSelector(state => state.coupons.couponsList);
  const users = useSelector(state => state.users.usersList);
  const loading = useSelector(state => state.transactions.loading);
  
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [reportType, setReportType] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDataType, setExportDataType] = useState('comprehensive');

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchProducts());
    dispatch(fetchRawMaterials());
    dispatch(fetchCoupons());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    if (!dateRange || dateRange.length !== 2) return true;
    const transactionDate = dayjs(transaction.timestamp);
    return transactionDate.isAfter(dateRange[0].startOf('day')) && 
           transactionDate.isBefore(dateRange[1].endOf('day'));
  });

  // Calculate metrics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalOrders = filteredTransactions.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalTax = filteredTransactions.reduce((sum, t) => sum + t.totalTax, 0);
  const totalDiscount = filteredTransactions.reduce((sum, t) => sum + t.discount, 0);

  // Product performance
  const productSales = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const productId = item.product.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.product.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Stock alerts
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock <= 0);
  const lowStockMaterials = rawMaterials.filter(m => m.stockQuantity <= m.minimumStock);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={16}>
        <Col span={6}>
          <StatsCard
            title="Total Revenue"
            value={totalRevenue}
            icon="attach_money"
            color="#52c41a"
            prefix="LKR "
            precision={2}
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            icon="receipt_long"
            color="#1890ff"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Average Order"
            value={averageOrderValue}
            icon="trending_up"
            color="#722ed1"
            prefix="LKR "
            precision={2}
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Total Products"
            value={products.length}
            icon="inventory_2"
            color="#fa8c16"
          />
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={16}>
        <Col span={6}>
          <StatsCard
            title="Tax Collected"
            value={totalTax}
            icon="receipt"
            color="#13c2c2"
            prefix="LKR "
            precision={2}
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Discounts Given"
            value={totalDiscount}
            icon="local_offer"
            color="#eb2f96"
            prefix="LKR "
            precision={2}
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Active Coupons"
            value={coupons.filter(c => c.isActive).length}
            icon="confirmation_number"
            color="#f5222d"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="System Users"
            value={users.filter(u => u.isActive).length}
            icon="people"
            color="#2f54eb"
          />
        </Col>
      </Row>

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0 || lowStockMaterials.length > 0) && (
        <Card title="Stock Alerts" className="border-l-4 border-l-orange-500">
          <Row gutter={16}>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
                <div className="text-sm text-gray-500">Out of Stock Products</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
                <div className="text-sm text-gray-500">Low Stock Products</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{lowStockMaterials.length}</div>
                <div className="text-sm text-gray-500">Low Stock Materials</div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Top Products */}
      <Card title="Top Selling Products">
        <Table
          dataSource={topProducts}
          rowKey={(record) => record.product.id}
          pagination={{ pageSize: 5 }}
          size="small"
          columns={[
            {
              title: 'Product',
              key: 'product',
              render: (record) => (
                <div className="flex items-center space-x-3">
                  <img
                    src={record.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=50'}
                    alt={record.product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <Text strong>{record.product.name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{record.product.category}</Text>
                  </div>
                </div>
              )
            },
            {
              title: 'Quantity Sold',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 120,
              render: (quantity) => <Text strong>{quantity}</Text>
            },
            {
              title: 'Revenue',
              dataIndex: 'revenue',
              key: 'revenue',
              width: 150,
              render: (revenue) => (
                <Text strong className="text-green-600">
                  LKR {revenue.toFixed(2)}
                </Text>
              )
            }
          ]}
        />
      </Card>
    </div>
  );

  const renderSalesTab = () => (
    <div className="space-y-6">
      <Card title="Sales Performance">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Daily Average"
              value={totalRevenue / Math.max(1, dateRange ? dateRange[1].diff(dateRange[0], 'days') : 30)}
              precision={2}
              prefix="LKR "
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Orders per Day"
              value={totalOrders / Math.max(1, dateRange ? dateRange[1].diff(dateRange[0], 'days') : 30)}
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Tax Rate"
              value={(totalTax / Math.max(totalRevenue, 1)) * 100}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <StatsCard
            title="Total Products"
            value={products.length}
            icon="inventory_2"
            color="#1890ff"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Low Stock"
            value={lowStockProducts.length}
            icon="warning"
            color="#fa8c16"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Out of Stock"
            value={outOfStockProducts.length}
            icon="error"
            color="#f5222d"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Raw Materials"
            value={rawMaterials.length}
            icon="category"
            color="#52c41a"
          />
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="dashboard" />
          <span>Overview</span>
        </span>
      ),
      children: renderOverviewTab()
    },
    {
      key: 'sales',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="trending_up" />
          <span>Sales</span>
        </span>
      ),
      children: renderSalesTab()
    },
    {
      key: 'inventory',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="inventory_2" />
          <span>Inventory</span>
        </span>
      ),
      children: renderInventoryTab()
    }
  ];

  if (!hasPermission('reports', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view reports."
        />
      </Card>
    );
  }

  if (loading) {
    return <LoadingSkeleton type="stats" />;
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={4} className="mb-2">Reports & Analytics</Title>
            <Text type="secondary">
              Business insights and performance metrics
            </Text>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
            <ActionButton 
              icon="download"
              onClick={() => setShowExportModal(true)}
            >
              Export Report
            </ActionButton>
          </Space>
        </div>

        <Tabs
          activeKey={reportType}
          onChange={setReportType}
          items={tabItems}
        />
      </Card>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType={exportDataType}
        data={{
          transactions,
          products,
          rawMaterials,
          coupons,
          users
        }}
      />
    </>
  );
}