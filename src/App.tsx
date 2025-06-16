import React, { useState } from 'react';
import { ConfigProvider, Layout, theme, FloatButton } from 'antd';
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

    return contentMap[activeTab as keyof typeof contentMap] || (
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
            headerBg: 'rgba(255, 255, 255, 0.95)',
            siderBg: 'rgba(255, 255, 255, 0.95)',
            bodyBg: 'transparent',
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
        <Layout className="vcare-layout">
          <div className="vcare-layout__header">
            <Header collapsed={collapsed} onCollapse={setCollapsed} />
          </div>
          
          <Layout hasSider>
            <div className="vcare-layout__sider">
              <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                collapsed={collapsed}
                onCollapse={setCollapsed}
              />
            </div>
            
            <Layout className="transition-all duration-300 ease-in-out">
              <Content className="vcare-layout__content">
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
      </POSProvider>
    </ConfigProvider>
  );
}

export default App;