import React, { useState } from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import { POSProvider } from './contexts/POSContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { ProductGrid } from './components/POS/ProductGrid';
import { Cart } from './components/POS/Cart';
import { ProductManagement } from './components/Products/ProductManagement';
import { RawMaterialManagement } from './components/RawMaterials/RawMaterialManagement';
import { TransactionHistory } from './components/Transactions/TransactionHistory';
import { ReportsOverview } from './components/Reports/ReportsOverview';
import { SettingsPanel } from './components/Settings/SettingsPanel';

const { Sider, Content } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    const contentMap = {
      'pos': (
        <div className="flex h-full gap-6">
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

  // Calculate dynamic widths based on collapsed state
  const siderWidth = collapsed ? 80 : 280;
  const contentWidth = `calc(100% - ${siderWidth}px)`;

  // Layout styles
  const layoutStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  };

  const siderStyle = {
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    transition: 'all 0.2s',
  };

  const headerStyle = {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    padding: '0 24px',
    position: 'fixed',
    width: contentWidth,
    right: 0,
    top: 0,
    zIndex: 50,
    transition: 'all 0.2s',
  };

  const contentStyle = {
    padding: '24px',
    marginTop: '64px',
    marginBottom: '64px',
    marginLeft: `${siderWidth}px`,
    minHeight: 'calc(100vh - 128px)',
    overflow: 'auto',
    transition: 'all 0.2s',
  };

  const footerStyle = {
    background: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
    position: 'fixed',
    width: contentWidth,
    right: 0,
    bottom: 0,
    zIndex: 50,
    transition: 'all 0.2s',
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
            footerBg: '#ffffff',
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
        <Layout style={layoutStyle}>
          <Sider 
            width={siderWidth} 
            style={siderStyle}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
          >
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />
          </Sider>
          <Layout>
            <Header 
              style={headerStyle}
              collapsed={collapsed} 
              onCollapse={setCollapsed}
              activeTab={activeTab}
            />
            <Content style={contentStyle}>
              {renderContent()}
            </Content>
            <Footer style={footerStyle} />
          </Layout>
        </Layout>
      </POSProvider>
    </ConfigProvider>
  );
}

export default App;