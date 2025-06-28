import React, { useState } from 'react';
import { 
  Card, 
  Menu, 
  Row, 
  Col, 
  Typography, 
  Space
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { ThemeSettings } from './ThemeSettings';
import { GeneralSettings } from './GeneralSettings';
import { SystemSettings } from './SystemSettings';
import { ProtectedRoute } from '../Layout/ProtectedRoute';

const { Title } = Typography;

export function SettingsPanel() {
  const { hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState('theme');

  const sections = [
    { 
      key: 'theme', 
      label: 'Theme & Branding', 
      icon: <Icon name="palette" />,
      permission: 'settings'
    },
    { 
      key: 'general', 
      label: 'General', 
      icon: <Icon name="settings" />,
      permission: 'settings'
    },
    { 
      key: 'system', 
      label: 'System', 
      icon: <Icon name="computer" />,
      permission: 'settings'
    },
    { 
      key: 'notifications', 
      label: 'Notifications', 
      icon: <Icon name="notifications" />,
      permission: 'settings'
    },
    { 
      key: 'security', 
      label: 'Security', 
      icon: <Icon name="security" />,
      permission: 'settings'
    },
    { 
      key: 'integrations', 
      label: 'Integrations', 
      icon: <Icon name="extension" />,
      permission: 'settings'
    }
  ];

  const availableSections = sections.filter(section => 
    hasPermission(section.permission, 'view')
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'theme':
        return <ThemeSettings />;
      case 'general':
        return <GeneralSettings />;
      case 'system':
        return <SystemSettings />;
      default:
        return (
          <div className="text-center py-12">
            <Icon name="construction" className="text-6xl text-gray-300 mb-4" />
            <Title level={4} type="secondary">
              {sections.find(s => s.key === activeSection)?.label} settings coming soon
            </Title>
            <Typography.Text type="secondary">This section is under development</Typography.Text>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute module="settings" action="view">
      <Card>
        <PageHeader
          title="Settings"
          icon="settings"
          subtitle="Configure system preferences and customization"
        />
        
        <Row gutter={24} className="mt-6">
          <Col xs={24} lg={6}>
            <Card size="small" className="mb-4">
              <Menu
                mode="inline"
                selectedKeys={[activeSection]}
                onClick={({ key }) => setActiveSection(key)}
                items={availableSections.map(section => ({
                  key: section.key,
                  icon: section.icon,
                  label: section.label
                }))}
                className="border-none"
              />
            </Card>
          </Col>
          <Col xs={24} lg={18}>
            {renderContent()}
          </Col>
        </Row>
      </Card>
    </ProtectedRoute>
  );
}