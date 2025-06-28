import React from 'react';
import { 
  Layout, 
  Avatar, 
  Dropdown, 
  Badge, 
  Space, 
  Typography, 
  Tooltip,
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

export function Header({ collapsed, onCollapse, activeTab, style }) {
  const { state } = usePOS();

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
      'transactions': 'Orders',
      'reports': 'Reports & Analytics',
      'coupons': 'Coupon Management',
      'tax': 'Tax Management',
      'settings': 'Settings'
    };
    return titles[activeTab] || 'VCare POS';
  };

  return (
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
          </Title>
        </div>
      </div>
      
      <Space size="middle" className="flex items-center">
        <Tooltip title="WiFi Connected">
          <Icon name="wifi" className="text-green-500" />
        </Tooltip>

        <Dropdown 
          menu={{ items: notificationItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <Badge count={2} size="small" offset={[-2, 2]}>
            <ActionButton.Text 
              icon="notifications"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            />
          </Badge>
        </Dropdown>
        
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
              icon={<Icon name="person" />}
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