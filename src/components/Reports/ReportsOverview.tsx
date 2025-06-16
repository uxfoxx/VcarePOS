import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Progress, Space, Tag } from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Title, Text } = Typography;

export function ReportsOverview() {
  const { state } = usePOS();

  const totalRevenue = state.transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = state.transactions.length;
  const totalProducts = state.products.length;
  const totalRawMaterials = state.rawMaterials.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Calculate raw material value
  const rawMaterialValue = state.rawMaterials.reduce((sum, material) => 
    sum + (material.stockQuantity * material.unitPrice), 0
  );

  // Get low stock materials
  const lowStockMaterials = state.rawMaterials.filter(m => m.stockQuantity <= m.minimumStock);

  // Calculate top selling products (mock data for demo)
  const topProducts = state.products.slice(0, 5).map((product, index) => ({
    ...product,
    soldQuantity: Math.floor(Math.random() * 50) + 10,
    revenue: (Math.floor(Math.random() * 50) + 10) * product.price
  })).sort((a, b) => b.soldQuantity - a.soldQuantity);

  const stats = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      precision: 2,
      prefix: '$',
      icon: <span className="material-icons">attach_money</span>,
      color: '#52c41a',
      change: '+12.5%'
    },
    {
      title: 'Total Sales',
      value: totalTransactions,
      icon: <span className="material-icons">shopping_cart</span>,
      color: '#0E72BD',
      change: '+8.2%'
    },
    {
      title: 'Furniture Items',
      value: totalProducts,
      icon: <span className="material-icons">inventory_2</span>,
      color: '#722ed1',
      change: '+3.1%'
    },
    {
      title: 'Raw Materials',
      value: totalRawMaterials,
      icon: <span className="material-icons">category</span>,
      color: '#fa8c16',
      change: '+5.7%'
    },
    {
      title: 'Average Order',
      value: averageOrderValue,
      precision: 2,
      prefix: '$',
      icon: <span className="material-icons">trending_up</span>,
      color: '#13c2c2',
      change: '+15.3%'
    },
    {
      title: 'Material Inventory',
      value: rawMaterialValue,
      precision: 2,
      prefix: '$',
      icon: <span className="material-icons">warehouse</span>,
      color: '#eb2f96',
      change: '+2.8%'
    }
  ];

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card 
        title={
          <Space>
            <span className="material-icons text-[#0E72BD]">analytics</span>
            <Title level={4} className="m-0">Furniture Store Analytics</Title>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} lg={8} xl={4}>
              <Card className="text-center">
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
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
                <span className="material-icons text-[#0E72BD]">inventory_2</span>
                <Title level={5} className="m-0">Top Selling Furniture</Title>
              </Space>
            }
          >
            <List
              dataSource={topProducts}
              renderItem={(product, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="flex items-center justify-center w-8 h-8 bg-[#0E72BD] text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong>{product.name}</Text>
                        <Text strong className="text-[#0E72BD]">
                          ${product.revenue.toFixed(2)}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">{product.category}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {product.soldQuantity} units sold
                        </Text>
                        <Progress 
                          percent={(product.soldQuantity / 50) * 100} 
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
          </Card>
        </Col>

        {/* Raw Material Status */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <span className="material-icons text-[#0E72BD]">category</span>
                <Title level={5} className="m-0">Raw Material Status</Title>
              </Space>
            }
          >
            <List
              dataSource={state.rawMaterials.slice(0, 5)}
              renderItem={(material) => {
                const stockPercentage = (material.stockQuantity / (material.minimumStock * 3)) * 100;
                const isLowStock = material.stockQuantity <= material.minimumStock;
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded">
                          <span className="material-icons">category</span>
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
                              percent={Math.min(stockPercentage, 100)} 
                              size="small" 
                              status={isLowStock ? 'exception' : 'normal'}
                              showInfo={false}
                              className="flex-1 mr-2"
                            />
                            <Tag color={isLowStock ? 'red' : 'green'} className="text-xs">
                              {isLowStock ? 'Low Stock' : 'In Stock'}
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

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Card 
          title={
            <Space>
              <span className="material-icons text-red-500">warning</span>
              <Title level={5} className="m-0 text-red-600">Low Stock Materials Alert</Title>
            </Space>
          }
          className="border-red-200"
        >
          <Row gutter={[16, 16]}>
            {lowStockMaterials.map((material) => (
              <Col key={material.id} xs={24} sm={12} lg={8}>
                <Card size="small" className="bg-red-50 border-red-200">
                  <Title level={5} className="text-red-900 m-0">{material.name}</Title>
                  <Text className="text-red-700">
                    Only {material.stockQuantity} {material.unit} left
                  </Text>
                  <br />
                  <Text className="text-red-600 text-xs">
                    Minimum required: {material.minimumStock} {material.unit}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Recent Activity */}
      <Card 
        title={
          <Space>
            <span className="material-icons text-[#0E72BD]">shopping_cart</span>
            <Title level={5} className="m-0">Recent Sales Activity</Title>
          </Space>
        }
      >
        <List
          dataSource={state.transactions.slice(0, 5)}
          renderItem={(transaction) => (
            <List.Item className="border-l-4 border-[#0E72BD] bg-blue-50 rounded px-4">
              <List.Item.Meta
                title={
                  <div className="flex items-center justify-between">
                    <Text strong>Sale #{transaction.id}</Text>
                    <Text strong className="text-[#0E72BD] text-lg">
                      ${transaction.total.toFixed(2)}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">
                      {transaction.customerName || 'Walk-in Customer'} • {' '}
                      {new Date(transaction.timestamp).toLocaleString()}
                    </Text>
                    <br />
                    <Space>
                      <Text type="secondary" className="text-xs">
                        {transaction.items.length} item(s)
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {transaction.cashier}
                      </Text>
                      <Tag color="green" className="text-xs">
                        {transaction.paymentMethod.toUpperCase()}
                      </Tag>
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}