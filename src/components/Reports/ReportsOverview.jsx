import React, { useState } from 'react';
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
  Button
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { PageHeader } from '../common/PageHeader';
import { StockAlert } from '../common/StockAlert';
import { ExportModal } from '../common/ExportModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export function ReportsOverview() {
  const { state } = usePOS();
  const { stockAlerts } = useNotifications();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDataType, setExportDataType] = useState('comprehensive');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Filter transactions based on date
  const getFilteredTransactions = () => {
    let filtered = [...state.transactions];
    
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
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;
  const totalProducts = state.products.length;
  const totalRawMaterials = state.rawMaterials.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Calculate raw material value
  const rawMaterialValue = state.rawMaterials.reduce((sum, material) => 
    sum + (material.stockQuantity * material.unitPrice), 0
  );

  // Get stock alerts
  const lowStockMaterials = state.rawMaterials.filter(m => m.stockQuantity <= m.minimumStock);
  const outOfStockMaterials = state.rawMaterials.filter(m => m.stockQuantity === 0);
  const lowStockProducts = state.allProducts.filter(p => p.stock <= 10 && p.stock > 0);
  const outOfStockProducts = state.allProducts.filter(p => p.stock === 0);

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
      prefix: '$',
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
      prefix: '$',
      icon: 'trending_up',
      color: '#13c2c2',
      change: '+15.3%'
    },
    {
      title: 'Material Inventory',
      value: rawMaterialValue,
      precision: 2,
      prefix: '$',
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

  return (
    <>
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
          <PageHeader
            title="Furniture Store Analytics"
            icon="analytics"
            subtitle="Comprehensive business insights and reports"
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
                
                <Dropdown
                  menu={{ items: exportMenuItems }}
                  trigger={['click']}
                >
                  <ActionButton.Primary icon="download">
                    Export Reports
                  </ActionButton.Primary>
                </Dropdown>
              </Space>
            }
          />

          <Row gutter={[16, 16]}>
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
                    valueStyle={{ color: stat.color, fontSize: '20px' }}
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
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                        }
                        title={
                          <div className="flex items-center justify-between">
                            <Text strong>{item.product.name}</Text>
                            <Text strong className="text-blue-600">
                              ${item.revenue.toFixed(2)}
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
                dataSource={state.rawMaterials.slice(0, 5)}
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

        {/* Quick Export Actions */}
        <Card 
          title={
            <Space>
              <Icon name="download" className="text-blue-600" />
              <Title level={5} className="m-0">Quick Export Actions</Title>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                size="small" 
                className="text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setExportDataType('comprehensive');
                  setShowExportModal(true);
                }}
              >
                <Icon name="analytics" className="text-2xl text-blue-600 mb-2" />
                <Text strong className="block">All Data</Text>
                <Text type="secondary" className="text-xs">Comprehensive report</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                size="small" 
                className="text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setExportDataType('transactions');
                  setShowExportModal(true);
                }}
              >
                <Icon name="receipt_long" className="text-2xl text-green-600 mb-2" />
                <Text strong className="block">Sales Data</Text>
                <Text type="secondary" className="text-xs">Transaction history</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                size="small" 
                className="text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setExportDataType('products');
                  setShowExportModal(true);
                }}
              >
                <Icon name="inventory_2" className="text-2xl text-purple-600 mb-2" />
                <Text strong className="block">Inventory</Text>
                <Text type="secondary" className="text-xs">Product catalog</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                size="small" 
                className="text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setExportDataType('raw-materials');
                  setShowExportModal(true);
                }}
              >
                <Icon name="category" className="text-2xl text-orange-600 mb-2" />
                <Text strong className="block">Materials</Text>
                <Text type="secondary" className="text-xs">Raw materials stock</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType={exportDataType}
        data={{
          products: state.allProducts,
          rawMaterials: state.rawMaterials,
          transactions: filteredTransactions,
          coupons: state.coupons,
          users: [], // Would come from auth context
          auditTrail: [], // Would come from auth context
          categories: state.categories
        }}
      />
    </>
  );
}