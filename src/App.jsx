import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ConfigProvider, Layout, theme, Spin } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext'; 
import { POSProvider, usePOS } from './contexts/POSContext'; 
import { NotificationProvider, useNotifications } from './contexts/NotificationContext'; 
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import ReduxErrorNotification from './components/common/ReduxErrorNotification';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from './features/auth/authSlice';

// Lazy load heavy components
const ProductGrid = lazy(() => import('./components/POS/ProductGrid').then(module => ({ default: module.ProductGrid })));
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
const PurchaseOrderManagement = lazy(() => import('./components/PurchaseOrders/PurchaseOrderManagement').then(module => ({ default: module.PurchaseOrderManagement })));

// Loading component
const ComponentLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '300px' 
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

const { Sider, Content } = Layout;

/**
 * Component that periodically checks token validity
 */
function TokenValidator() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Function to validate token
    const validateToken = () => {
      const token = localStorage.getItem('vcare_token');
      if (token && isAuthenticated) {
        // Check if token is expired
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expiry = tokenData.exp * 1000; // Convert to milliseconds
          
          // If token is expired or will expire in 5 minutes, refresh user data
          if (Date.now() > expiry - 5 * 60 * 1000) {
            dispatch(getCurrentUser());
          }
        } catch (error) {
          console.error('Error validating token:', error);
        }
      }
    };

    // Check token validity immediately
    validateToken();
    
    // Then check periodically (every 5 minutes)
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);
  
  // This component doesn't render anything
  return null;
}

function AppContent() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('pos'); 
  const [collapsed, setCollapsed] = useState(true);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    const contentMap = {
      'pos': (
        <ProtectedRoute module="pos" action="view">
          <div className="flex h-full gap-6">
            <div className="flex-1" data-tour="product-grid">
              <Suspense fallback={<ComponentLoader />}>
                <ProductGrid collapsed={collapsed} />
              </Suspense>
            </div>
            <div className="w-96" data-tour="cart">
              <Suspense fallback={<ComponentLoader />}>
                <Cart />
              </Suspense>
            </div>
          </div>
        </ProtectedRoute>
      ),
      'products': (
        <ProtectedRoute module="products" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <ProductManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'raw-materials': (
        <ProtectedRoute module="raw-materials" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <RawMaterialManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'transactions': (
        <ProtectedRoute module="transactions" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <TransactionHistory />
          </Suspense>
        </ProtectedRoute>
      ),
      'reports': (
        <ProtectedRoute module="reports" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <ReportsOverview />
          </Suspense>
        </ProtectedRoute>
      ),
      'coupons': (
        <ProtectedRoute module="coupons" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <CouponManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'tax': (
        <ProtectedRoute module="tax" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <TaxManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'purchase-orders': (
        <ProtectedRoute module="purchase-orders" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <PurchaseOrderManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'user-management': (
        <ProtectedRoute module="user-management" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <UserManagement />
          </Suspense>
        </ProtectedRoute>
      ),
      'audit-trail': (
        <ProtectedRoute module="audit-trail" action="view">
          <Suspense fallback={<ComponentLoader />}>
            <AuditTrail />
          </Suspense>
        </ProtectedRoute>
      ),
      'settings': (
        <ProtectedRoute module="settings" action="view">
          <Suspense fallback={<ComponentLoader />}>
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

  return (
    <>
      <TokenValidator />
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
            onTabChange={setActiveTab}
          />
          <Content style={contentStyle}>
            {renderContent()}
          </Content>
          {/* <Footer style={footerStyle} /> */}
        </Layout>
      </Layout>
    </>
  );
}

function App() {
  const AppWithNotifications = () => {
    const { rawMaterials, products } = usePOS();
    const { checkStockLevels } = useNotifications();
    const dispatch = useDispatch();
    
    // Check for existing token on app load and try to restore session
    useEffect(() => {
      const token = localStorage.getItem('vcare_token');
      if (token) {
        dispatch(getCurrentUser());
      }
    }, [dispatch]);
    
    // Check stock levels periodically
    useEffect(() => {
      // Initial check
      checkStockLevels(rawMaterials, products);
      
      // Set up interval for periodic checks (every 5 minutes)
      const interval = setInterval(() => {
        checkStockLevels(rawMaterials, products);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }, [rawMaterials, products, checkStockLevels]);
    
    // Wrap AppContent with ErrorBoundary to catch any rendering errors
    return (
      <ErrorBoundary showErrorDetails={import.meta.env.DEV}>
        <AppContent />
      </ErrorBoundary>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: localStorage.getItem('vcare_branding') && 
          JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
          theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
            '#0E72BD',
          colorPrimaryText: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).primaryTextColor || '#ffffff' : 
            '#ffffff',
          borderRadius: 8,
          colorBgContainer: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '#141414' : '#ffffff',
          colorBgLayout: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '#000000' : '#f8fafc',
          fontFamily: localStorage.getItem('vcare_branding') ? 
            `"${JSON.parse(localStorage.getItem('vcare_branding')).fontFamily || 'Inter'}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` : 
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          colorText: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '#ffffff' : '#1f2937',
          colorTextSecondary: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '#a3a3a3' : '#6b7280',
          boxShadow: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
          boxShadowSecondary: localStorage.getItem('vcare_branding') && 
            JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
            '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          colorSuccess: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).secondaryColor || '#52c41a' : 
            '#52c41a',
          colorSuccessText: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).secondaryTextColor || '#ffffff' : 
            '#ffffff',
          colorWarning: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).accentColor || '#fa8c16' : 
            '#fa8c16',
          colorWarningText: localStorage.getItem('vcare_branding') ? 
            JSON.parse(localStorage.getItem('vcare_branding')).accentTextColor || '#ffffff' : 
            '#ffffff',
        },
        components: {
          Layout: {
            headerBg: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '#141414' : '#ffffff',
            siderBg: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '#141414' : '#ffffff',
            bodyBg: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '#000000' : '#f8fafc',
            headerHeight: 64,
            footerBg: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '#141414' : '#ffffff',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            colorBgContainer: localStorage.getItem('vcare_branding') && 
              JSON.parse(localStorage.getItem('vcare_branding')).darkModeSupport ? 
              '#141414' : '#ffffff',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 500,
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
             colorPrimaryActive: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}CC` : 
               '#0E72BDCC',
             colorPrimaryTextHover: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryTextColor || '#ffffff' : 
               '#ffffff',
             colorPrimaryTextActive: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryTextColor || '#ffffff' : 
               '#ffffff',
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: localStorage.getItem('vcare_branding') ? 
              `rgba(${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(1, 3) || '0E', 16)}, 
              ${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(3, 5) || '72', 16)}, 
              ${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(5, 7) || 'BD', 16)}, 0.04)` : 
              'rgba(14, 114, 189, 0.04)',
          },
          Modal: {
            borderRadiusLG: 16,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 4,
            itemMarginBlock: 2,
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
             colorItemBgSelected: localStorage.getItem('vcare_branding') ? 
               `rgba(${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(1, 3) || '0E', 16)}, 
               ${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(3, 5) || '72', 16)}, 
               ${parseInt(JSON.parse(localStorage.getItem('vcare_branding')).primaryColor?.slice(5, 7) || 'BD', 16)}, 0.1)` : 
               'rgba(14, 114, 189, 0.1)',
          },
           Checkbox: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryBorder: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
           Radio: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
           },
           Switch: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
           },
           Slider: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryBorder: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
           Tabs: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryActive: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}CC` : 
               '#0E72BDCC',
           },
           Tag: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryBg: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}19` : 
               '#0E72BD19',
             colorPrimaryBorderHover: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
           Progress: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryBg: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}19` : 
               '#0E72BD19',
           },
           Pagination: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
             colorPrimaryBorder: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
           DatePicker: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
             colorPrimaryBorder: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
           TimePicker: {
             colorPrimary: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
             colorPrimaryHover: localStorage.getItem('vcare_branding') && 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor ? 
               `${JSON.parse(localStorage.getItem('vcare_branding')).primaryColor}E6` : 
               '#0E72BDE6',
             colorPrimaryBorder: localStorage.getItem('vcare_branding') ? 
               JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
               '#0E72BD',
           },
          Tooltip: {
            colorBgDefault: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
              '#0E72BD',
            colorTextLightSolid: '#ffffff',
          },
          Notification: {
            colorBgSuccess: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).secondaryColor || '#52c41a' : 
              '#52c41a',
            colorBgInfo: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
              '#0E72BD',
            colorBgWarning: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).accentColor || '#fa8c16' : 
              '#fa8c16',
          },
          Message: {
            colorBgSuccess: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).secondaryColor || '#52c41a' : 
              '#52c41a',
            colorBgInfo: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).primaryColor || '#0E72BD' : 
              '#0E72BD',
            colorBgWarning: localStorage.getItem('vcare_branding') ? 
              JSON.parse(localStorage.getItem('vcare_branding')).accentColor || '#fa8c16' : 
              '#fa8c16',
          },
        },
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <POSProvider>
            <ReduxErrorNotification />
            <AppWithNotifications />
          </POSProvider>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;