import React from 'react';
import { Layout, Menu, Typography, Badge, Button } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  const menuItems = [
    {
      key: 'pos',
      icon: <span className="material-icons">restaurant</span>,
      label: 'POS',
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
      label: 'Orders',
    },
    {
      key: 'reports',
      icon: <span className="material-icons">analytics</span>,
      label: 'Reports',
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
    label: (
      <div className="flex items-center justify-between w-full">
        <span className="font-medium">{item.label}</span>
        {item.badge && !collapsed && (
          <Badge 
            count={item.badge.count} 
            size="small" 
            style={{ backgroundColor: item.badge.color }}
          />
        )}
      </div>
    ),
  }));

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      width={280}
      className="fixed left-0 bg-white border-r border-gray-200 shadow-sm z-40"
      style={{
        top: 64,
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
      }}
      trigger={null}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Navigation Menu */}
        <div className="flex-1">
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => onTabChange(key)}
            items={enhancedMenuItems}
            className="border-none bg-transparent"
            style={{
              fontSize: '14px',
            }}
          />
        </div>

        {/* Bottom Section */}
        {!collapsed && (
          <div className="mt-auto space-y-4">
            {/* Store Status */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="material-icons text-white text-sm">store</span>
                </div>
                <div>
                  <Text strong className="text-sm text-green-800">Store Open</Text>
                  <br />
                  <Text type="secondary" className="text-xs text-green-600">9:00 AM - 10:00 PM</Text>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <Text type="secondary" className="text-green-700">Today's Sales:</Text>
                  <Text strong className="text-green-800">$2,450</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary" className="text-green-700">Orders:</Text>
                  <Text strong className="text-green-800">24</Text>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button 
                type="primary" 
                block 
                icon={<span className="material-icons">add</span>}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Customer
              </Button>
              <Button 
                block 
                icon={<span className="material-icons">inventory_2</span>}
                className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
              >
                Quick Add Item
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed state bottom icons */}
        {collapsed && (
          <div className="mt-auto space-y-2 flex flex-col items-center">
            <Button 
              type="primary" 
              shape="circle"
              icon={<span className="material-icons">add</span>}
              className="bg-blue-500 hover:bg-blue-600"
            />
            <Button 
              shape="circle"
              icon={<span className="material-icons">inventory_2</span>}
              className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
            />
          </div>
        )}
      </div>
    </Sider>
  );
}