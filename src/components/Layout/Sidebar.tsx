import React from 'react';
import { Layout, Menu, Typography, Divider, Badge } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  {
    key: 'pos',
    icon: <span className="material-icons">point_of_sale</span>,
    label: 'Point of Sale',
    badge: null,
  },
  {
    key: 'products',
    icon: <span className="material-icons">inventory_2</span>,
    label: 'Products',
    badge: null,
  },
  {
    key: 'raw-materials',
    icon: <span className="material-icons">category</span>,
    label: 'Raw Materials',
    badge: { count: 3, color: 'red' }, // Low stock items
  },
  {
    key: 'transactions',
    icon: <span className="material-icons">receipt_long</span>,
    label: 'Transactions',
    badge: null,
  },
  {
    key: 'reports',
    icon: <span className="material-icons">analytics</span>,
    label: 'Reports & Analytics',
    badge: null,
  },
  {
    key: 'settings',
    icon: <span className="material-icons">settings</span>,
    label: 'Settings',
    badge: null,
  },
];

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }: SidebarProps) {
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
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      width={280}
      className="bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-sm"
      trigger={null}
      style={{
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
      }}
    >
      <div className="p-4">
        {!collapsed && (
          <>
            <div className="mb-6">
              <Text type="secondary" className="text-xs font-semibold uppercase tracking-wider">
                Main Navigation
              </Text>
            </div>
          </>
        )}
        
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

        {!collapsed && (
          <>
            <Divider className="my-6" />
            
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="material-icons text-white text-sm">store</span>
                </div>
                <div>
                  <Text strong className="text-sm">Store Status</Text>
                  <br />
                  <Text type="secondary" className="text-xs">Currently Open</Text>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <Text type="secondary">Today's Sales:</Text>
                  <Text strong className="text-green-600">$2,450</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Transactions:</Text>
                  <Text strong>24</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Low Stock Items:</Text>
                  <Badge count={3} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-icons text-amber-600 text-sm">lightbulb</span>
                <Text strong className="text-sm text-amber-800">Quick Tip</Text>
              </div>
              <Text className="text-xs text-amber-700">
                Use Ctrl+S to quickly save product changes, or Ctrl+N to add new items.
              </Text>
            </div>
          </>
        )}
      </div>
    </Sider>
  );
}