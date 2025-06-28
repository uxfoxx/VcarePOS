import React from 'react';
import { Layout, Menu, Typography, Badge, Button, Divider, Tooltip } from 'antd';

const { Sider } = Layout;
const { Text, Title } = Typography;

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  const menuItems = [
    {
      key: 'pos',
      icon: <span className="material-icons">restaurant</span>,
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
      label: 'Reports',
    },
    {
      key: 'coupons',
      icon: <span className="material-icons">local_offer</span>,
      label: 'Coupons',
    },
    {
      key: 'settings',
      icon: <span className="material-icons">settings</span>,
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

      {/* Collapse Toggle Button */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-b border-gray-200`}>
        <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"} placement="right">
          <Button
            type="text"
            icon={
              <span className="material-icons">
                {collapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            }
            onClick={() => onCollapse(!collapsed)}
            className="w-full flex items-center justify-center hover:bg-blue-50"
          />
        </Tooltip>
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