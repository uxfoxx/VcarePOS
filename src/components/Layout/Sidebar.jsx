import React from 'react';
import { Layout, Menu, Typography, Badge } from 'antd';
import { Icon } from '../common/Icon';

const { Sider } = Layout;
const { Text, Title } = Typography;

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  const menuItems = [
    {
      key: 'pos',
      icon: <Icon name="restaurant" />,
      label: 'Point of Sale',
    },
    {
      key: 'products',
      icon: <Icon name="inventory_2" />,
      label: 'Products',
    },
    {
      key: 'raw-materials',
      icon: <Icon name="category" />,
      label: 'Raw Materials',
      badge: { count: 3, color: 'red' },
    },
    {
      key: 'transactions',
      icon: <Icon name="receipt_long" />,
      label: 'Orders',
    },
    {
      key: 'reports',
      icon: <Icon name="analytics" />,
      label: 'Reports',
    },
    {
      key: 'coupons',
      icon: <Icon name="local_offer" />,
      label: 'Coupons',
    },
    {
      key: 'settings',
      icon: <Icon name="settings" />,
      label: 'Settings',
    },
  ];

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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/VCARELogo 1.png" 
              alt="VCare Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <Title level={4} className="m-0 text-gray-900">
                VCare POS
              </Title>
              <Text type="secondary" className="text-xs">
                Furniture Store Management
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