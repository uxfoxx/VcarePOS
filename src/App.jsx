import React, { useState } from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import { POSProvider } from './contexts/POSContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProductGrid } from './components/POS/ProductGrid';
import { Cart } from './components/POS/Cart';
import { ProductManagement } from './components/Products/ProductManagement';
import { RawMaterialManagement } from './components/RawMaterials/RawMaterialManagement';
import { TransactionHistory } from './components/Transactions/TransactionHistory';
import { ReportsOverview } from './components/Reports/ReportsOverview';
import { SettingsPanel } from './components/Settings/SettingsPanel';

const { Content } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    const contentMap = {
      'pos': (
        <div className="flex h-full gap-4">
          <div className="flex-1">
            <ProductGrid />
          </div>
          <div className="w-96">
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
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0E72BD',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8fafc',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          boxShadowSecondary: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#ffffff',
            bodyBg: '#f8fafc',
            headerHeight: 64,
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 500,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
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
            itemMarginInline: 4,
            itemMarginBlock: 2,
          },
        },
      }}
    >
      <POSProvider>
        <Layout className="min-h-screen">
          {/* Fixed Header */}
          <Header 
            collapsed={collapsed} 
            onCollapse={setCollapsed}
            activeTab={activeTab}
          />
          
          <Layout hasSider className="relative">
            {/* Fixed Sidebar */}
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />
            
            {/* Main Content Area */}
            <Layout 
              className="transition-all duration-300 ease-in-out"
              style={{ 
                marginLeft: collapsed ? 80 : 280,
                minHeight: 'calc(100vh - 64px)'
              }}
            >
              <Content className="p-6 overflow-auto">
                <div className="h-full">
                  {renderContent()}
                </div>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </POSProvider>
    </ConfigProvider>
  );
}

export default App;