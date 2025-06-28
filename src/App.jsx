import React, { useState, Suspense, lazy } from 'react';
import { ConfigProvider, Layout, theme, Spin } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OptimizedPOSProvider } from './contexts/OptimizedPOSContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { performanceMonitor } from './utils/performance';

// Lazy load components for better performance
const OptimizedProductGrid = lazy(() => import('./components/POS/OptimizedProductGrid').then(module => ({ default: module.OptimizedProductGrid })));
const Cart = lazy(() => import('./components/POS/Cart').then(module => ({ default: module.Cart })));
const ProductManagement = lazy(() => import('./components/Products/ProductManagement').then(module => ({ default: module.ProductManagement })));
const RawMaterialManagement = lazy(() => import('./components/RawMaterials/RawMaterialManagement').then(module => ({ default: module.RawMaterialManagement })));
const TransactionHistory = lazy(() => import('./components/Transactions/TransactionHistory').then(module => ({ default: module.TransactionHistory })));
const ReportsOverview = lazy(() => import('./components/Reports/ReportsOverview').then(module => ({ default: module.ReportsOverview })));
const SettingsPanel = lazy(() => import('./components/Settings/SettingsPanel').then(module => ({ default: module.SettingsPanel })));
const CouponManagement = lazy(() => import('./components/Coupons/CouponManagement').then(module => ({ default: module.CouponManagement })));
const TaxManagement = lazy(() => import('./components/Tax/TaxManagement').then(module => ({ default: module.TaxManagement })));
const UserManagement = lazy(() => import('./components/Users/UserManagement').then(module => ({ default: module.UserManagement })));
const AuditTrail = lazy(() => import('./components/AuditTrail/AuditTrail').then(module => ({ default: module.AuditTrail })));

const { Sider, Content } = Layout;

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Spin size="large" />
  </div>
);

function AppContent() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    const contentMap = {
      'pos': (
        <ProtectedRoute module="pos" action="view">
          <div className="flex h-full gap-6">
            <div className="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                <OptimizedProductGrid collapsed={collapsed} />
              </Suspense>
            </div>
            <div className="w-96">
              <Suspense fallback={<LoadingSpinner />}>
                <Cart />
              </Suspense>
            </div>
          </div>
        </ProtectedRoute>
      ),
      'products': (
        <ProtectedRoute module="products" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'raw-materials': (
        <ProtectedRoute module="raw-materials" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <RawMaterialManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'transactions': (
        <ProtectedRoute module="transactions" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <TransactionHistory />
          </Suspense>
        </ProtectedRoute>
      ),
      'reports': (
        <ProtectedRoute module="reports" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsOverview />
          </Suspense>
        </ProtectedRoute>
      ),
      'coupons': (
        <ProtectedRoute module="coupons" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <CouponManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'tax': (
        <ProtectedRoute module="tax" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <TaxManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'user-management': (
        <ProtectedRoute module="user-management" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'audit-trail': (
        <ProtectedRoute module="audit-trail" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <AuditTrail />
          </Suspense>
        </ProtectedRoute>
      ),
      'settings': (
        <ProtectedRoute module="settings" action="view">
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPanel />
          </Suspense>
        </ProtectedRoute>
      ),
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

  // Track component renders for performance monitoring
  React.useEffect(() => {
    performanceMonitor.trackRender('AppContent');
  });

  return (
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
          <Suspense fallback={<LoadingSpinner />}>
            {renderContent()}
          </Suspense>
        </Content>
        <Footer style={footerStyle} />
      </Layout>
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
      <AuthProvider>
        <OptimizedPOSProvider>
          <AppContent />
        </OptimizedPOSProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;