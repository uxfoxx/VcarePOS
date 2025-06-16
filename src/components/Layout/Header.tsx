import React from 'react';
import { 
  Layout, 
  Avatar, 
  Dropdown, 
  Badge, 
  Button, 
  Space, 
  Typography, 
  Breadcrumb,
  Tooltip,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

interface HeaderProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Header({ collapsed, onCollapse }: HeaderProps) {
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
      type: 'divider' as const,
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
    {
      key: '3',
      label: (
        <div className="p-2">
          <Text strong className="block">Daily Report</Text>
          <Text type="secondary" className="text-xs">Sales report is ready</Text>
          <Text type="secondary" className="text-xs block">1 hour ago</Text>
        </div>
      ),
    },
  ];

  return (
    <AntHeader className="flex items-center justify-between px-6 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center space-x-6">
        <Tooltip title={collapsed ? "Expand Menu" : "Collapse Menu"}>
          <Button
            type="text"
            icon={<span className="material-icons text-lg">{collapsed ? 'menu_open' : 'menu'}</span>}
            onClick={() => onCollapse?.(!collapsed)}
            className="lg:hidden hover:bg-blue-50 transition-colors"
          />
        </Tooltip>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="/VCARELogo 1.png" 
                alt="VCare Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <Title level={4} className="m-0 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                VCare POS
              </Title>
              <Text type="secondary" className="text-xs font-medium">
                Furniture Store Management System
              </Text>
            </div>
          </div>
        </div>

        <Divider type="vertical" className="hidden lg:block h-8" />
        
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { title: 'Dashboard' },
              { title: 'Point of Sale' },
            ]}
            className="text-sm"
          />
        </div>
      </div>
      
      <Space size="middle" className="flex items-center">
        <Tooltip title="Search Products">
          <Button 
            type="text" 
            icon={<span className="material-icons">search</span>}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          />
        </Tooltip>

        <Dropdown 
          menu={{ items: notificationItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <Badge count={3} size="small" offset={[-2, 2]}>
            <Button 
              type="text" 
              icon={<span className="material-icons">notifications</span>}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            />
          </Badge>
        </Dropdown>

        <Tooltip title="Quick Settings">
          <Button 
            type="text" 
            icon={<span className="material-icons">settings</span>}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          />
        </Tooltip>
        
        <Divider type="vertical" className="h-8" />
        
        <Dropdown 
          menu={{ items: userMenuItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl cursor-pointer hover:from-blue-50 hover:to-blue-100 transition-all duration-300 border border-gray-200/50">
            <Avatar 
              size={32}
              style={{ 
                background: 'linear-gradient(135deg, #0E72BD, #1890ff)',
                boxShadow: '0 4px 12px rgba(14, 114, 189, 0.3)'
              }}
              icon={<span className="material-icons">person</span>}
            />
            <div className="hidden sm:block text-left">
              <Text strong className="text-gray-900 block text-sm font-semibold">
                {state.currentUser?.name}
              </Text>
              <Text type="secondary" className="text-xs capitalize font-medium">
                {state.currentUser?.role} • Online
              </Text>
            </div>
            <span className="material-icons text-gray-400 text-sm">expand_more</span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}