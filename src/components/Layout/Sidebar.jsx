import React from 'react';
import { Layout, Menu, Typography, Badge } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../common/Icon';

const { Sider } = Layout;
const { Text, Title } = Typography;

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  const { hasPermission } = useAuth();
  const { branding } = useTheme();

  const allMenuItems = [
    {
      key: 'pos',
      icon: <Icon name="restaurant" />,
      label: 'Point of Sale',
      module: 'pos'
    },
    {
      key: 'products',
      icon: <Icon name="inventory_2" />,
      label: 'Products',
      module: 'products'
    },
    {
      key: 'raw-materials',
      icon: <Icon name="category" />,
      label: 'Raw Materials',
      module: 'raw-materials',
      badge: { count: 3, color: 'red' },
    },
    {
      key: 'transactions',
      icon: <Icon name="receipt_long" />,
      label: 'Orders',
      module: 'transactions'
    },
    {
      key: 'reports',
      icon: <Icon name="analytics" />,
      label: 'Reports',
      module: 'reports'
    },
    {
      key: 'coupons',
      icon: <Icon name="local_offer" />,
      label: 'Coupons',
      module: 'coupons'
    },
    {
      key: 'tax',
      icon: <Icon name="receipt" />,
      label: 'Tax Management',
      module: 'tax'
    },
    {
      key: 'user-management',
      icon: <Icon name="people" />,
      label: 'User Management',
      module: 'user-management'
    },
    {
      key: 'audit-trail',
      icon: <Icon name="history" />,
      label: 'Audit Trail',
      module: 'audit-trail'
    },
    {
      key: 'settings',
      icon: <Icon name="settings" />,
      label: 'Settings',
      module: 'settings'
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => 
    hasPermission(item.module, 'view')
  );

  const enhancedMenuItems = menuItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: collapsed ? null : (
      <div className="flex items-center justify-between w-full">
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <Badge 
            count={item.badge.count} 
            size="small" 
            style={{ backgroundColor: item.badge.color }}
          />
        )}
      </div>
    ),
    title: collapsed ? item.label : undefined,
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-gray-200 transition-all duration-200`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` 
            }}
          >
            <img 
              src={branding.logo} 
              alt={`${branding.companyName} Logo`}
              className="w-8 h-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <Title level={4} className="m-0 text-gray-900">
                {branding.companyName.split(' ')[0]} POS
              </Title>
              <Text type="secondary" className="text-xs">
                {branding.tagline}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        {!collapsed && (
          <div className="mb-4">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wider">
              Main Navigation
            </Text>
          </div>
        )}
        
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => onTabChange(key)}
          items={enhancedMenuItems}
          className="border-none bg-transparent"
          inlineCollapsed={collapsed}
          style={{
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
}