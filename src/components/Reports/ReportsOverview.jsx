import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  List, 
  Progress, 
  Space, 
  Tag, 
  Dropdown,
  DatePicker,
  Select,
  Tabs,
  Table,
  Button,
  Tooltip,
  Image
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRawMaterials } from '../../features/rawMaterials/rawMaterialsSlice';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchTransactions } from '../../features/transactions/transactionsSlice';
import { fetchCoupons } from '../../features/coupons/couponsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { useReduxNotifications as useNotifications } from '../../hooks/useReduxNotifications';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { StockAlert } from '../common/StockAlert';
import { ExportModal } from '../common/ExportModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { SearchInput } from '../common/SearchInput';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export function ReportsOverview() {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { rawMaterialsList, loading: rawMaterialsLoading } = useSelector(state => state.rawMaterials);
  const { productsList, loading: productsLoading } = useSelector(state => state.products);
  const { transactionsList, loading: transactionsLoading } = useSelector(state => state.transactions);
  const { couponsList, loading: couponsLoading } = useSelector(state => state.coupons);
  const { categoriesList, loading: categoriesLoading } = useSelector(state => state.categories);
  
  const { stockAlerts } = useNotifications();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDataType, setExportDataType] = useState('comprehensive');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Load data from Redux stores
  useEffect(() => {
    // Fetch all required data from Redux stores
    dispatch(fetchRawMaterials());
    dispatch(fetchProducts());
    dispatch(fetchTransactions());
    dispatch(fetchCoupons());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Check if data is still loading
  const isLoading = rawMaterialsLoading || productsLoading || transactionsLoading || couponsLoading || categoriesLoading;

  // Filter transactions based on date
  const getFilteredTransactions = () => {
    let filtered = [...(transactionsList || [])];
    
    if (dateFilter === 'today') {
      const today = dayjs().startOf('day');
      filtered = filtered.filter(t => dayjs(t.timestamp).isAfter(today));
    } else if (dateFilter === 'week') {
      const weekStart = dayjs().startOf('week');
      filtered = filtered.filter(t => dayjs(t.timestamp).isAfter(weekStart));
    } else if (dateFilter === 'month') {
      const monthStart = dayjs().startOf('month');
      filtered = filtered.filter(t => dayjs(t.timestamp).isAfter(monthStart));
    } else if (dateFilter === 'custom' && dateRange) {
      filtered = filtered.filter(t => {
        const transactionDate = dayjs(t.timestamp);
        return transactionDate.isAfter(dateRange[0].startOf('day')) && 
               transactionDate.isBefore(dateRange[1].endOf('day'));
      });
    }
    
    // Apply search filter if provided
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.salesperson?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;
  const totalProducts = (productsList || []).length;
  const totalRawMaterials = (rawMaterialsList || []).length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Calculate raw material value
  const rawMaterialValue = (rawMaterialsList || []).reduce((sum, material) => 
    sum + (material.stockQuantity * material.unitPrice), 0
  );

  // Get stock alerts
  const lowStockMaterials = (rawMaterialsList || []).filter(m => m.stockQuantity <= m.minimumStock);
  const outOfStockMaterials = (rawMaterialsList || []).filter(m => m.stockQuantity === 0);
  const lowStockProducts = (productsList || []).filter(p => p.stock <= 10 && p.stock > 0);
  const outOfStockProducts = (productsList || []).filter(p => p.stock === 0);

  // Calculate top selling products
  const productSales = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const productId = item.product.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          soldQuantity: 0,
          revenue: 0
        };
      }
      productSales[productId].soldQuantity += item.quantity;
      productSales[productId].revenue += item.product.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      precision: 2,
      prefix: 'LKR ',
      icon: 'attach_money',
      color: '#52c41a',
      change: '+12.5%'
    },
    {
      title: 'Total Sales',
      value: totalTransactions,
      icon: 'shopping_cart',
      color: '#0E72BD',
      change: '+8.2%'
    },
    {
      title: 'Furniture Items',
      value: totalProducts,
      icon: 'inventory_2',
      color: '#722ed1',
      change: '+3.1%'
    },
    {
      title: 'Raw Materials',
      value: totalRawMaterials,
      icon: 'category',
      color: '#fa8c16',
      change: '+5.7%'
    },
    {
      title: 'Average Order',
      value: averageOrderValue,
      precision: 2,
      prefix: 'LKR ',
      icon: 'trending_up',
      color: '#13c2c2',
      change: '+15.3%'
    },
    {
      title: 'Material Inventory',
      value: rawMaterialValue,
      precision: 2,
      prefix: 'LKR ',
      icon: 'warehouse',
      color: '#eb2f96',
      change: '+2.8%'
    }
  ];

  const exportMenuItems = [
    {
      key: 'comprehensive',
      icon: <Icon name="analytics" />,
      label: 'Comprehensive Report',
      onClick: () => {
        setExportDataType('comprehensive');
        setShowExportModal(true);
      }
    },
    {
      key: 'products',
      icon: <Icon name="inventory_2" />,
      label: 'Products Report',
      onClick: () => {
        setExportDataType('products');
        setShowExportModal(true);
      }
    },
    {
      key: 'transactions',
      icon: <Icon name="receipt_long" />,
      label: 'Transactions Report',
      onClick: () => {
        setExportDataType('transactions');
        setShowExportModal(true);
      }
    },
    {
      key: 'transaction-items',
      icon: <Icon name="list_alt" />,
      label: 'Transaction Items Report',
      onClick: () => {
        setExportDataType('transaction-items');
        setShowExportModal(true);
      }
    },
    {
      key: 'raw-materials',
      icon: <Icon name="category" />,
      label: 'Raw Materials Report',
      onClick: () => {
        setExportDataType('raw-materials');
        setShowExportModal(true);
      }
    },
    {
      key: 'coupons',
      icon: <Icon name="local_offer" />,
      label: 'Coupons Report',
      onClick: () => {
        setExportDataType('coupons');
        setShowExportModal(true);
      }
    }
  ];

  // Product Report Table Columns
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={record.name}
            width={40}
            height={40}
            className="object-cover rounded"
            preview={false}
            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" className="text-xs">SKU: {record.barcode}</Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: [...new Set(productsList.map(p => p.category))].map(cat => ({
        text: cat,
        value: cat
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>LKR {price.toFixed(2)}</Text>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
      filters: [
        { text: 'In Stock (>10)', value: 'in-stock' },
        { text: 'Low Stock (1-10)', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
      ],
      onFilter: (value, record) => {
        if (value === 'in-stock') return record.stock > 10;
        if (value === 'low-stock') return record.stock > 0 && record.stock <= 10;
        if (value === 'out-of-stock') return record.stock === 0;
        return true;
      },
    },
    {
      title: 'Total Value',
      key: 'value',
      render: (record) => <Text>LKR {(record.price * record.stock).toFixed(2)}</Text>,
      sorter: (a, b) => (a.price * a.stock) - (b.price * b.stock),
    }
  ];

  // Order Report Table Columns
  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id}</Text>,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Text>{new Date(timestamp).toLocaleDateString()}</Text>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record) => (
        <Text>{record.customerName || 'Walk-in Customer'}</Text>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => <Tag color="blue">{items.length} items</Tag>,
      sorter: (a, b) => a.items.length - b.items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong className="text-blue-600">LKR {total.toFixed(2)}</Text>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'refunded' ? 'red' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Refunded', value: 'refunded' },
        { text: 'Partially Refunded', value: 'partially-refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    }
  ];

  // Raw Material Report Table Columns
  const materialColumns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: [...new Set(rawMaterialsList.map(m => m.category))].map(cat => ({
        text: cat,
        value: cat
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (record) => (
        <div>
          <Text strong>{record.stockQuantity} {record.unit}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Min: {record.minimumStock} {record.unit}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => {
        const isOutOfStock = record.stockQuantity === 0;
        const isLowStock = record.stockQuantity <= record.minimumStock;
        
        return (
          <Tag color={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}>
            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
          </Tag>
        );
      },
      filters: [
        { text: 'In Stock', value: 'in-stock' },
        { text: 'Low Stock', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
      ],
      onFilter: (value, record) => {
        const isOutOfStock = record.stockQuantity === 0;
        const isLowStock = record.stockQuantity <= record.minimumStock;
        
        if (value === 'out-of-stock') return isOutOfStock;
        if (value === 'low-stock') return isLowStock && !isOutOfStock;
        if (value === 'in-stock') return !isLowStock && !isOutOfStock;
        return true;
      },
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => <Text>LKR {price.toFixed(2)}</Text>,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Total Value',
      key: 'value',
      render: (record) => <Text>LKR {(record.stockQuantity * record.unitPrice).toFixed(2)}</Text>,
      sorter: (a, b) => (a.stockQuantity * a.unitPrice) - (b.stockQuantity * b.unitPrice),
    }
  ];

  // Dashboard Tab
  const renderDashboardTab = () => (
    <Space direction="vertical" size="large" className="w-full">
      {/* Stock Alerts */}
      {outOfStockMaterials.length > 0 && (
        <StockAlert
          type="error"
          title="Critical Stock Alert"
          materials={outOfStockMaterials}
          products={outOfStockProducts}
        />
      )}
      
      {lowStockMaterials.length > 0 && (
        <StockAlert
          type="warning"
          title="Low Stock Warning"
          materials={lowStockMaterials}
          products={lowStockProducts}
        />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon name="analytics" className="text-[#0E72BD] mr-2" size="text-xl" />
            <div>
              <Text strong className="text-lg">Furniture Store Analytics</Text>
              <Text type="secondary" className="text-sm block">
                Comprehensive business insights and reports
              </Text>
            </div>
          </div>
          
          <Space>
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              className="w-32"
            >
              <Option value="all">All Time</Option>
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
            
            {dateFilter === 'custom' && (
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Start Date', 'End Date']}
              />
            )}
            
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={['click']}
            >
              <ActionButton.Primary icon="download">
                Export Reports
              </ActionButton.Primary>
            </Dropdown>
          </Space>
        </div>

        <Row gutter={[16, 16]} data-tour="stats-cards">
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} lg={8} xl={4}>
              <Card className="text-center">
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon name={stat.icon} />
                  </div>
                  <Tag color="green" className="text-xs">{stat.change}</Tag>
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  precision={stat.precision}
                  prefix={stat.prefix}
                  valueStyle={{ color: stat.color, fontSize: '20px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Top Selling Products */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Icon name="inventory_2" className="text-blue-600" />
                <Title level={5} className="m-0">Top Selling Furniture</Title>
              </Space>
            }
            extra={
              <ActionButton.Text 
                icon="download"
                onClick={() => {
                  setExportDataType('products');
                  setShowExportModal(true);
                }}
              >
                Export
              </ActionButton.Text>
            }
          >
            {topProducts.length > 0 ? (
              <List
                dataSource={topProducts}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <Image
                            src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="object-cover rounded"
                            preview={false}
                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                          />
                        </div>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong>{item.product.name}</Text>
                          <Text strong className="text-blue-600">
                            LKR {item.revenue.toFixed(2)}
                          </Text>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">{item.product.category}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {item.soldQuantity} units sold
                          </Text>
                          <Progress 
                            percent={Math.min((item.soldQuantity / (topProducts[0]?.soldQuantity || 1)) * 100, 100)} 
                            size="small" 
                            showInfo={false}
                            className="mt-1"
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8">
                <Icon name="inventory_2" className="text-4xl text-gray-300 mb-2" />
                <Text type="secondary">No sales data for selected period</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Raw Material Status */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Icon name="category" className="text-blue-600" />
                <Title level={5} className="m-0">Raw Material Status</Title>
              </Space>
            }
            extra={
              <ActionButton.Text 
                icon="download"
                onClick={() => {
                  setExportDataType('raw-materials');
                  setShowExportModal(true);
                }}
              >
                Export
              </ActionButton.Text>
            }
          >
            <List
              dataSource={rawMaterialsList.slice(0, 5)}
              renderItem={(material) => {
                const stockPercentage = Math.min((material.stockQuantity / (material.minimumStock * 3)) * 100, 100);
                const isLowStock = material.stockQuantity <= material.minimumStock;
                const isOutOfStock = material.stockQuantity === 0;
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded">
                          <Icon name="category" />
                        </div>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong>{material.name}</Text>
                          <Text strong>
                            {material.stockQuantity} {material.unit}
                          </Text>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">{material.category}</Text>
                          <br />
                          <div className="flex items-center justify-between mt-1">
                            <Progress 
                              percent={stockPercentage} 
                              size="small" 
                              status={isOutOfStock ? 'exception' : isLowStock ? 'active' : 'normal'}
                              showInfo={false}
                              className="flex-1 mr-2"
                            />
                            <Tag color={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'} className="text-xs">
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );

  // Product Reports Tab
  const renderProductReportsTab = () => (
    <Card>
      <EnhancedTable
        title="Product Reports"
        icon="inventory_2"
        columns={productColumns}
        dataSource={productsList.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        searchFields={['name', 'category', 'barcode']}
        searchPlaceholder="Search products..."
        showSearch={true}
        extra={
          <Button 
            type="primary" 
            icon={<Icon name="download" />}
            onClick={() => {
              setExportDataType('products');
              setShowExportModal(true);
            }}
          >
            Export
          </Button>
        }
        emptyDescription="No products found"
        emptyImage={<Icon name="inventory_2" className="text-6xl text-gray-300" />}
      />
    </Card>
  );

  // Order Reports Tab
  const renderOrderReportsTab = () => (
    <Card>
      <EnhancedTable
        title="Order Reports"
        icon="receipt_long"
        columns={orderColumns}
        dataSource={filteredTransactions}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        searchFields={['id', 'customerName', 'cashier', 'salesperson']}
        searchPlaceholder="Search orders..."
        showSearch={true}
        extra={
          <Space>
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              className="w-32"
            >
              <Option value="all">All Time</Option>
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
            
            {dateFilter === 'custom' && (
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Start Date', 'End Date']}
              />
            )}
            
            <Button 
              type="primary" 
              icon={<Icon name="download" />}
              onClick={() => {
                setExportDataType('transactions');
                setShowExportModal(true);
              }}
            >
              Export
            </Button>
          </Space>
        }
        emptyDescription="No orders found"
        emptyImage={<Icon name="receipt_long" className="text-6xl text-gray-300" />}
      />
    </Card>
  );

  // Raw Material Reports Tab
  const renderMaterialReportsTab = () => (
    <Card>
      <EnhancedTable
        title="Raw Material Reports"
        icon="category"
        columns={materialColumns}
        dataSource={rawMaterialsList.filter(m => 
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        searchFields={['name', 'category', 'supplier']}
        searchPlaceholder="Search materials..."
        showSearch={true}
        extra={
          <Button 
            type="primary" 
            icon={<Icon name="download" />}
            onClick={() => {
              setExportDataType('raw-materials');
              setShowExportModal(true);
            }}
          >
            Export
          </Button>
        }
        emptyDescription="No materials found"
        emptyImage={<Icon name="category" className="text-6xl text-gray-300" />}
      />
    </Card>
  );

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="dashboard" />
          <span>Dashboard</span>
        </span>
      ),
      children: renderDashboardTab()
    },
    {
      key: 'products',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="inventory_2" />
          <span>Product Reports</span>
        </span>
      ),
      children: renderProductReportsTab()
    },
    {
      key: 'orders',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="receipt_long" />
          <span>Order Reports</span>
        </span>
      ),
      children: renderOrderReportsTab()
    },
    {
      key: 'materials',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="category" />
          <span>Material Reports</span>
        </span>
      ),
      children: renderMaterialReportsTab()
    }
  ];

  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="reports-tabs"
        size="large"
      />

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType={exportDataType}
        data={{
          products: productsList,
          rawMaterials: rawMaterialsList,
          transactions: filteredTransactions,
          coupons: couponsList,
          users: [], // Would come from auth context
          auditTrail: [], // Would come from auth context
          categories: categoriesList
        }}
      />
    </>
  );
}