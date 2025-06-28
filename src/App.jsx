import React, { useState } from 'react';
import { ConfigProvider, Layout, theme, FloatButton, Menu, Avatar, Dropdown, Badge, Button, Space, Typography, Breadcrumb, Tooltip, Divider } from 'antd';
import { POSProvider, usePOS } from './contexts/POSContext';
import { ProductGrid } from './components/POS/ProductGrid';
import { Cart } from './components/POS/Cart';
import { ProductManagement } from './components/Products/ProductManagement';
import { RawMaterialManagement } from './components/RawMaterials/RawMaterialManagement';
import { TransactionHistory } from './components/Transactions/TransactionHistory';
import { ReportsOverview } from './components/Reports/ReportsOverview';
import { SettingsPanel } from './components/Settings/SettingsPanel';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

function AppContent() {
  const { state } = usePOS();
  const [activeTab, setActiveTab] = useState('pos');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'pos',
      icon: <span className="material-icons">point_of_sale</span>,
      label: 'Point of Sale',
    },
    {
      key: 'products',
      icon: <span className="material-icons">inventory_2</span>,
      label: 'Products',
    },
    {
      key: 'raw-materials',
      icon: <span className="material-icons">category</span>,
      label: 'Raw Materials',
      badge: { count: 3, color: 'red' },
    },
    {
      key: 'transactions',
      icon: <span className="material-icons">receipt_long</span>,
      label: 'Transactions',
    },
    {
      key: 'reports',
      icon: <span className="material-icons">analytics</span>,
      label: 'Reports & Analytics',
    },
    {
      key: 'settings',
      icon: <span className="material-icons">settings</span>,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <span className="material-icons">person</span>,
      label: 'Profile Settings',
    },
    {
      key: 'preferences',
      icon: <span className="material-icons">tune</span>,
      label: 'Preferences',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <span className="material-icons">help_outline</span>,
      label: 'Help & Support',
    },
    {
      key: 'logout',
      icon: <span className="material-icons">logout</span>,
      label: 'Sign Out',
      danger: true,
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: (
        <div className="p-2">
          <Text strong className="block">Low Stock Alert</Text>
          <Text type="secondary" className="text-xs">Oak Wood Planks running low</Text>
          <Text type="secondary" className="text-xs block">2 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="p-2">
          <Text strong className="block">New Sale</Text>
          <Text type="secondary" className="text-xs">Executive Office Chair sold</Text>
          <Text type="secondary" className="text-xs block">5 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className="p-2">
          <Text strong className="block">Daily Report</Text>
          <Text type="secondary" className="text-xs">Sales report is ready</Text>
          <Text type="secondary" className="text-xs block">1 hour ago</Text>
        </div>
      ),
    },
  ];

  const renderContent = () => {
    const contentMap = {
      'pos': (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          <div className="xl:col-span-2">
            <ProductGrid />
          </div>
          <div className="xl:col-span-1">
            <Cart />
          </div>
        </div>
      ),
      'products': <ProductManagement />,
      'raw-materials': <RawMaterialManagement />,
      'transactions': <TransactionHistory />,
      'reports': <ReportsOverview />,
      'settings': <SettingsPanel />,
    };

    return contentMap[activeTab] || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <span className="material-icons text-6xl text-gray-300 mb-4">error_outline</span>
          <h3 className="text-xl font-semibold text-gray-600">Page not found</h3>
        </div>
      </div>
    );
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="flex items-center justify-between px-6 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-6">
          <Tooltip title={collapsed ? "Expand Menu" : "Collapse Menu"}>
            <Button
              type="text"
              icon={<span className="material-icons text-lg">{collapsed ? 'menu_open' : 'menu'}</span>}
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden hover:bg-blue-50 transition-colors"
            />
          </Tooltip>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src="/VCARELogo 1.png" 
                  alt="VCare Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <Title level={4} className="m-0 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  VCare POS
                </Title>
                <Text type="secondary" className="text-xs font-medium">
                  Furniture Store Management System
                </Text>
              </div>
            </div>
          </div>

          <Divider type="vertical" className="hidden lg:block h-8" />
          
          <div className="hidden lg:block">
            <Breadcrumb
              items={[
                { title: 'Dashboard' },
                { title: 'Point of Sale' },
              ]}
              className="text-sm"
            />
          </div>
        </div>
        
        <Space size="middle" className="flex items-center">
          <Tooltip title="Search Products">
            <Button 
              type="text" 
              icon={<span className="material-icons">search</span>}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            />
          </Tooltip>

          <Dropdown 
            menu={{ items: notificationItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <Badge count={3} size="small" offset={[-2, 2]}>
              <Button 
                type="text" 
                icon={<span className="material-icons">notifications</span>}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              />
            </Badge>
          </Dropdown>

          <Tooltip title="Quick Settings">
            <Button 
              type="text" 
              icon={<span className="material-icons">settings</span>}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            />
          </Tooltip>
          
          <Divider type="vertical" className="h-8" />
          
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl cursor-pointer hover:from-blue-50 hover:to-blue-100 transition-all duration-300 border border-gray-200/50">
              <Avatar 
                size={32}
                style={{ 
                  background: 'linear-gradient(135deg, #0E72BD, #1890ff)',
                  boxShadow: '0 4px 12px rgba(14, 114, 189, 0.3)'
                }}
                icon={<span className="material-icons">person</span>}
              />
              <div className="hidden sm:block text-left">
                <Text strong className="text-gray-900 block text-sm font-semibold">
                  {state.currentUser?.name}
                </Text>
                <Text type="secondary" className="text-xs capitalize font-medium">
                  {state.currentUser?.role} • Online
                </Text>
              </div>
              <span className="material-icons text-gray-400 text-sm">expand_more</span>
            </div>
          </Dropdown>
        </Space>
      </Header>

      <Layout hasSider>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={80}
          width={280}
          className="bg-white shadow-sm border-r"
          trigger={null}
        >
          <div className="p-4">
            {!collapsed && (
              <>
                <div className="mb-6">
                  <Text type="secondary" className="text-xs font-semibold uppercase tracking-wider">
                    Main Navigation
                  </Text>
                </div>
              </>
            )}
            
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key)}
              items={menuItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && !collapsed && (
                      <Badge 
                        count={item.badge.count} 
                        size="small" 
                        style={{ backgroundColor: item.badge.color }}
                      />
                    )}
                  </div>
                ),
              }))}
              className="border-none bg-transparent"
              style={{
                fontSize: '14px',
              }}
            />

            {!collapsed && (
              <>
                <Divider className="my-6" />
                
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="material-icons text-white text-sm">store</span>
                    </div>
                    <div>
                      <Text strong className="text-sm">Store Status</Text>
                      <br />
                      <Text type="secondary" className="text-xs">Currently Open</Text>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <Text type="secondary">Today's Sales:</Text>
                      <Text strong className="text-green-600">$2,450</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Transactions:</Text>
                      <Text strong>24</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Low Stock Items:</Text>
                      <Badge count={3} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="material-icons text-amber-600 text-sm">lightbulb</span>
                    <Text strong className="text-sm text-amber-800">Quick Tip</Text>
                  </div>
                  <Text className="text-xs text-amber-700">
                    Use Ctrl+S to quickly save product changes, or Ctrl+N to add new items.
                  </Text>
                </div>
              </>
            )}
          </div>
        </Sider>

        {/* Main Content */}
        <Layout className="transition-all duration-300 ease-in-out">
          <Content className="p-6 bg-gray-50 min-h-screen">
            <div className="fade-in-up">
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Floating Action Buttons */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<span className="material-icons">add</span>}
      >
        <FloatButton
          icon={<span className="material-icons">inventory_2</span>}
          tooltip="Add Product"
          onClick={() => setActiveTab('products')}
        />
        <FloatButton
          icon={<span className="material-icons">category</span>}
          tooltip="Add Raw Material"
          onClick={() => setActiveTab('raw-materials')}
        />
        <FloatButton
          icon={<span className="material-icons">shopping_cart</span>}
          tooltip="Point of Sale"
          onClick={() => setActiveTab('pos')}
        />
      </FloatButton.Group>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0E72BD',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f7fa',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          colorText: '#262626',
          colorTextSecondary: '#8c8c8c',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          boxShadowSecondary: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#ffffff',
            bodyBg: '#f5f7fa',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
            fontWeight: 500,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: 'rgba(14, 114, 189, 0.04)',
          },
          Modal: {
            borderRadiusLG: 16,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
          },
        },
      }}
    >
      <POSProvider>
        <AppContent />
      </POSProvider>
    </ConfigProvider>
  );
}

export default App;