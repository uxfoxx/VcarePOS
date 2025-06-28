import React from 'react';
import { 
  Layout, 
  Avatar, 
  Dropdown, 
  Badge, 
  Button, 
  Space, 
  Typography, 
  Input,
  Tooltip,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

export function Header({ collapsed, onCollapse, activeTab }) {
  const { state } = usePOS();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <span className="material-icons">person</span>,
      label: 'Profile Settings',
    },
    {
      key: 'preferences',
      icon: <span className="material-icons">tune</span>,
      label: 'Preferences',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <span className="material-icons">help_outline</span>,
      label: 'Help & Support',
    },
    {
      key: 'logout',
      icon: <span className="material-icons">logout</span>,
      label: 'Sign Out',
      danger: true,
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: (
        <div className="p-2">
          <Text strong className="block">Low Stock Alert</Text>
          <Text type="secondary" className="text-xs">Oak Wood Planks running low</Text>
          <Text type="secondary" className="text-xs block">2 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="p-2">
          <Text strong className="block">New Sale</Text>
          <Text type="secondary" className="text-xs">Executive Office Chair sold</Text>
          <Text type="secondary" className="text-xs block">5 minutes ago</Text>
        </div>
      ),
    },
  ];

  const getPageTitle = () => {
    const titles = {
      'pos': 'Point of Sale',
      'products': 'Product Management',
      'raw-materials': 'Raw Materials',
      'transactions': 'Transaction History',
      'reports': 'Reports & Analytics',
      'settings': 'Settings'
    };
    return titles[activeTab] || 'VCare POS';
  };

  return (
    <AntHeader 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm"
      style={{ height: 64 }}
    >
      <div className="flex items-center space-x-6">
        <Button
          type="text"
          icon={<span className="material-icons text-lg">{collapsed ? 'menu' : 'menu_open'}</span>}
          onClick={() => onCollapse(!collapsed)}
          className="hover:bg-gray-100 transition-colors"
        />
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="/VCARELogo 1.png" 
                alt="VCare Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <Title level={4} className="m-0 text-gray-900">
                VCare POS
              </Title>
              <Text type="secondary" className="text-xs">
                {getPageTitle()}
              </Text>
            </div>
          </div>
        </div>

        <Divider type="vertical" className="h-8" />
        
        <div className="hidden md:block">
          <Input
            placeholder="Search products..."
            prefix={<span className="material-icons text-gray-400">search</span>}
            className="w-80"
            size="large"
          />
        </div>
      </div>
      
      <Space size="middle" className="flex items-center">
        <Tooltip title="WiFi Connected">
          <span className="material-icons text-green-500">wifi</span>
        </Tooltip>

        <Dropdown 
          menu={{ items: notificationItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <Badge count={2} size="small" offset={[-2, 2]}>
            <Button 
              type="text" 
              icon={<span className="material-icons">notifications</span>}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            />
          </Badge>
        </Dropdown>

        <Button
          type="primary"
          className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
        >
          Select Table
        </Button>
        
        <Dropdown 
          menu={{ items: userMenuItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center space-x-3 cursor-pointer">
            <Avatar 
              size={40}
              style={{ 
                background: 'linear-gradient(135deg, #0E72BD, #1890ff)',
              }}
              icon={<span className="material-icons">person</span>}
            />
            <div className="hidden sm:block text-left">
              <Text strong className="text-gray-900 block text-sm">
                {state.currentUser?.name}
              </Text>
              <Text type="secondary" className="text-xs capitalize">
                {state.currentUser?.role}
              </Text>
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}