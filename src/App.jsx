import  { useState, useEffect } from 'react';
import { 
  Layout, 
  Avatar, 
  Dropdown, 
  Badge, 
  Space, 
  Typography, 
  Tooltip,
  List,
  Empty,
  Tag
} from 'antd';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { useAuth } from '../../contexts/AuthContext';
import { useReduxNotifications as useNotifications } from '../../hooks/useReduxNotifications';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

export function Header({ collapsed, onCollapse, activeTab, style, onTabChange }) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const { notifications, stockAlerts, markAsRead, clearAllNotifications, markAllAsRead, clearStockAlerts } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readStockAlerts, setReadStockAlerts] = useState(new Set());

  // Clean up read stock alerts when stock alerts change (e.g., when alerts are resolved)
  useEffect(() => {
    const currentAlertIds = new Set(stockAlerts.map(alert => alert.id));
    setReadStockAlerts(prev => new Set([...prev].filter(id => currentAlertIds.has(id))));
  }, [stockAlerts]);

  // Handler for logout
  const handleLogout = () => {
    dispatch(logoutAction());
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <Icon name="person" />,
      label: 'Profile Settings',
    },
    {
      key: 'preferences',
      icon: <Icon name="tune" />,
      label: 'Preferences',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <Icon name="help_outline" />,
      label: 'Help & Support',
    },
    {
      key: 'logout',
      icon: <Icon name="logout" />,
      label: 'Sign Out',
      danger: true,
      onClick: handleLogout
    },
  ];

  // Combine notifications and stock alerts
  const allNotifications = [
    ...stockAlerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
      icon: alert.type === 'critical' ? 'error' : 'warning',
      type: alert.type === 'critical' ? 'error' : 'warning',
      read: readStockAlerts.has(alert.id),
      navigateTo: alert.navigateTo,
      isStockAlert: true
    })),
    ...notifications.map(notif => ({
      ...notif,
      isStockAlert: false
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (notification.isStockAlert) {
      setReadStockAlerts(prev => new Set([...prev, notification.id]));
    } else {
      markAsRead(notification.id);
    }
    
    // Navigate to relevant page if specified
    if (notification.navigateTo && onTabChange) {
      onTabChange(notification.navigateTo);
    }
    
    setShowNotifications(false);
  };

  const handleClearAll = () => {
    // Clear regular notifications
    clearAllNotifications();
    // Clear stock alerts
    clearStockAlerts();
    // Clear local read state for stock alerts
    setReadStockAlerts(new Set());
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    // Mark all regular notifications as read
    markAllAsRead();
    // Mark all stock alerts as read locally
    const allStockAlertIds = stockAlerts.map(alert => alert.id);
    setReadStockAlerts(prev => new Set([...prev, ...allStockAlertIds]));
  };


  const notificationContent = (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="p-3 border-b flex justify-between items-center">
        <Title level={5} className="m-0">Notifications</Title>
        <Space size="small">
          {allNotifications.length > 0 && unreadCount > 0 && (
            <ActionButton.Text 
              size="small" 
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </ActionButton.Text>
          )}
          <ActionButton.Text 
            size="small" 
            onClick={handleClearAll}
            disabled={allNotifications.length === 0}
          >
            Clear All
          </ActionButton.Text>
        </Space>
      </div>
      
      {allNotifications.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No notifications" 
          className="py-8"
        />
      ) : (
        <List
          dataSource={allNotifications}
          renderItem={item => (
            <List.Item 
              className={`cursor-pointer hover:bg-gray-50 transition-colors ${item.read ? 'opacity-70' : ''}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className="flex items-start p-2 w-full">
                <div className={`flex-shrink-0 mr-3 mt-1 text-${item.type === 'error' ? 'red' : item.type === 'warning' ? 'orange' : 'blue'}-500`}>
                  <Icon name={item.icon || 'notifications'} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <Text strong className={item.read ? 'text-gray-500' : 'text-gray-900'}>
                      {item.title}
                    </Text>
                    {!item.read && <Badge status="processing" color="blue" />}
                  </div>
                  <Text type="secondary" className="text-xs block">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                  <Text className={`text-sm block mt-1 ${item.read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {item.message}
                  </Text>
                  {item.navigateTo && (
                    <Tag color="blue" size="small" className="mt-1">
                      Click to view
                    </Tag>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const getPageTitle = () => {
    const titles = {
      'pos': 'Point of Sale',
      'products': 'Product Management',
      'raw-materials': 'Raw Materials',
      'transactions': 'Orders',
      'reports': 'Reports & Analytics',
      'coupons': 'Coupon Management',
      'tax': 'Tax Management',
      'user-management': 'User Management',
      'audit-trail': 'Audit Trail',
      'settings': 'Settings'
    };
    return titles[activeTab] || 'VCare POS';
  };

  return (
    <>
      <AntHeader 
        style={style}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-6">
          {/* Expand/Collapse Button */}
          <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <ActionButton.Text
              icon={collapsed ? 'menu_open' : 'menu'}
              onClick={() => onCollapse(!collapsed)}
              className="hover:bg-blue-50 transition-colors"
              size="large"
            />
          </Tooltip>

          <div className="flex items-center space-x-4">
            <Title level={4} className="m-0 text-gray-900">
              {getPageTitle()}
              {activeTab === 'settings' && <span className="text-sm text-gray-500 ml-2">v1.0.0</span>}
            </Title>
          </div>
        </div>
        
        <Space size="middle" className="flex items-center">
          <Tooltip title="WiFi Connected">
            <Icon name="wifi" className="text-green-500" />
          </Tooltip>
          
          {/* Help Tour Button */}
          <Tooltip title="Take a Tour">
            <ActionButton.Text 
              icon="help_outline"
              onClick={() => setTourOpen(true)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              data-tour="help"
            />
          </Tooltip>

          <Dropdown 
            open={showNotifications}
            onOpenChange={setShowNotifications}
            dropdownRender={() => notificationContent}
            placement="bottomRight"
            trigger={['click']}
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <ActionButton.Text 
                icon="notifications"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                data-tour="notifications"
              />
            </Badge>
          </Dropdown>
          
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="flex items-center space-x-3 cursor-pointer" data-tour="user-menu">
              <Avatar 
                size={40}
                style={{ 
                  background: 'linear-gradient(135deg, #0E72BD, #1890ff)',
                }}
              >
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </Avatar>
              <div className="hidden sm:block text-left">
                <Text strong className="text-gray-900 block text-sm">
                  {currentUser?.firstName} {currentUser?.lastName}
                </Text>
                <Text type="secondary" className="text-xs capitalize">
                  {currentUser?.role}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </AntHeader>

      {/* Tour Component */}
      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={getTourSteps()}
        indicatorsRender={(current, total) => (
          <span className="text-blue-600">
            {current + 1} / {total}
          </span>
        )}
      />
    </>
  );
}