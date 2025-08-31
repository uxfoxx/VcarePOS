import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationDisplay } from './components/common/NotificationDisplay';
import { ReduxErrorNotification } from './components/common/ReduxErrorNotification';
import { getCurrentUser } from './features/auth/authSlice';
import { checkStockLevels } from './features/notifications/notificationsSlice';

// Import all page components
import { ProductGrid } from './components/POS/ProductGrid';
import { Cart } from './components/POS/Cart';
import { ProductManagement } from './components/Products/ProductManagement';
import { RawMaterialManagement } from './components/RawMaterials/RawMaterialManagement';
import { TransactionHistory } from './components/Transactions/TransactionHistory';
import { ReportsOverview } from './components/Reports/ReportsOverview';
import { CouponManagement } from './components/Coupons/CouponManagement';
import { TaxManagement } from './components/Tax/TaxManagement';
import { UserManagement } from './components/Users/UserManagement';
import { CustomerManagement } from './components/Customers/CustomerManagement';
import { AuditTrail } from './components/AuditTrail/AuditTrail';
import { PurchaseOrderManagement } from './components/PurchaseOrders/PurchaseOrderManagement';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { LoginPage } from './components/Auth/LoginPage';

const { Content } = Layout;

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem('vcare_token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  // Start stock level monitoring when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Initial stock check
      dispatch(checkStockLevels());
      
      // Set up periodic stock checking (every 5 minutes)
      const stockCheckInterval = setInterval(() => {
        dispatch(checkStockLevels());
      }, 5 * 60 * 1000);
      
      return () => clearInterval(stockCheckInterval);
    }
  }, [isAuthenticated, dispatch]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading VCare POS...</div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
        <NotificationDisplay />
        <ReduxErrorNotification />
      </ErrorBoundary>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return (
          <ProtectedRoute module="pos" action="view">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2">
                <ProductGrid collapsed={collapsed} />
              </div>
              <div className="lg:col-span-1">
                <Cart />
              </div>
            </div>
          </ProtectedRoute>
        );
      case 'products':
        return (
          <ProtectedRoute module="products" action="view">
            <ProductManagement />
          </ProtectedRoute>
        );
      case 'raw-materials':
        return (
          <ProtectedRoute module="raw-materials" action="view">
            <RawMaterialManagement />
          </ProtectedRoute>
        );
      case 'transactions':
        return (
          <ProtectedRoute module="transactions" action="view">
            <TransactionHistory />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute module="reports" action="view">
            <ReportsOverview />
          </ProtectedRoute>
        );
      case 'coupons':
        return (
          <ProtectedRoute module="coupons" action="view">
            <CouponManagement />
          </ProtectedRoute>
        );
      case 'tax':
        return (
          <ProtectedRoute module="tax" action="view">
            <TaxManagement />
          </ProtectedRoute>
        );
      case 'user-management':
        return (
          <ProtectedRoute module="user-management" action="view">
            <UserManagement />
          </ProtectedRoute>
        );
      case 'customers':
        return (
          <ProtectedRoute module="user-management" action="view">
            <CustomerManagement />
          </ProtectedRoute>
        );
      case 'audit-trail':
        return (
          <ProtectedRoute module="audit-trail" action="view">
            <AuditTrail />
          </ProtectedRoute>
        );
      case 'purchase-orders':
        return (
          <ProtectedRoute module="purchase-orders" action="view">
            <PurchaseOrderManagement />
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute module="settings" action="view">
            <SettingsPanel />
          </ProtectedRoute>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500">Page not found</div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Layout className="min-h-screen">
          <Layout.Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={280}
            collapsedWidth={80}
            className="vcare-layout__sider"
            trigger={null}
          >
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />
          </Layout.Sider>
          
          <Layout>
            <Header
              collapsed={collapsed}
              onCollapse={setCollapsed}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            />
            
            <Content className="vcare-layout__content">
              {renderContent()}
            </Content>
            
            <Footer
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                padding: '12px 24px',
              }}
            />
          </Layout>
        </Layout>
        
        <NotificationDisplay />
        <ReduxErrorNotification />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;