import React, { useState } from 'react';
import { 
  Card, 
  Menu, 
  Row, 
  Col, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Button, 
  Typography, 
  Space,
  Divider,
  message,
  Slider
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { CacheStats } from '../common/CacheStats';
import { flushCache } from '../../utils/cache';
import { BrandingSettings } from './BrandingSettings';
import { clearCache } from '../../utils/httpCache';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('general');
  const [form] = Form.useForm();
  const [cacheForm] = Form.useForm();

  const sections = [
    { key: 'general', label: 'General', icon: <Icon name="settings" /> },
    { key: 'branding', label: 'Branding', icon: <Icon name="branding_watermark" /> },
    { key: 'store', label: 'Store Info', icon: <Icon name="store" /> },
    { key: 'users', label: 'User Management', icon: <Icon name="people" /> },
    { key: 'payment', label: 'Payment Methods', icon: <Icon name="payment" /> },
    { key: 'notifications', label: 'Notifications', icon: <Icon name="notifications" /> },
    { key: 'cache', label: 'Cache Settings', icon: <Icon name="memory" /> },
    { key: 'security', label: 'Security', icon: <Icon name="security" /> },
    { key: 'hardware', label: 'Hardware', icon: <Icon name="print" /> }
  ];

  const handleSave = () => {
    message.success('Settings saved successfully!');
  };

  const handleSaveCacheSettings = (values) => {
    message.success('Cache settings saved successfully!');
    
    // Apply cache settings
    if (values.clearAllCaches) {
      flushCache();
      clearCache();
      message.info('All caches have been cleared');
    }
  };

  const renderGeneralSettings = () => (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <Title level={4}>General Settings</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="businessName" label="Business Name" initialValue="VCare Furniture Store">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="currency" label="Currency" initialValue="LKR">
            <Select>
              <Option value="LKR">LKR (Rs)</Option>
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="taxRate" label="Tax Rate (%)" initialValue={8}>
            <InputNumber min={0} max={100} step={0.01} className="w-full" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="timezone" label="Time Zone" initialValue="UTC+5:30">
            <Select>
              <Option value="UTC+5:30">UTC+5:30 (Sri Lanka)</Option>
              <Option value="UTC-5">UTC-5 (Eastern)</Option>
              <Option value="UTC-6">UTC-6 (Central)</Option>
              <Option value="UTC-7">UTC-7 (Mountain)</Option>
              <Option value="UTC-8">UTC-8 (Pacific)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <ActionButton.Primary htmlType="submit">Save Changes</ActionButton.Primary>
    </Form>
  );

  const renderBrandingSettings = () => (
    <BrandingSettings />
  );

  const renderCacheSettings = () => (
    <div className="space-y-6">
      <Title level={4}>Cache Settings</Title>
      
      <CacheStats />
      
      <Divider />
      
      <Form 
        form={cacheForm} 
        layout="vertical" 
        onFinish={handleSaveCacheSettings}
        initialValues={{
          memoryTTL: 300,
          httpMaxAge: 300,
          enableCache: true,
          clearAllCaches: false
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="memoryTTL" 
              label="Memory Cache TTL (seconds)"
              tooltip="Time to live for in-memory cached items"
            >
              <Slider
                min={60}
                max={3600}
                step={60}
                marks={{
                  60: '1m',
                  300: '5m',
                  900: '15m',
                  1800: '30m',
                  3600: '1h'
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="httpMaxAge" 
              label="HTTP Cache Max Age (seconds)"
              tooltip="Max age for HTTP cache-control headers"
            >
              <Slider
                min={60}
                max={3600}
                step={60}
                marks={{
                  60: '1m',
                  300: '5m',
                  900: '15m',
                  1800: '30m',
                  3600: '1h'
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="enableCache" 
              valuePropName="checked"
              label="Enable Caching"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="clearAllCaches" 
              valuePropName="checked"
              label="Clear All Caches on Save"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <Text className="text-sm">
            <Icon name="info" className="mr-2 text-blue-600" />
            <strong>Cache Settings:</strong> Optimizing cache settings can significantly improve application performance.
            Memory cache stores data in RAM for quick access, while HTTP cache uses browser storage for static assets.
          </Text>
        </div>
        
        <ActionButton.Primary htmlType="submit">Save Cache Settings</ActionButton.Primary>
      </Form>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'branding':
        return renderBrandingSettings();
      case 'cache':
        return renderCacheSettings();
      default:
        return (
          <div className="text-center py-12">
            <Icon name="settings" className="text-6xl text-gray-300 mb-4" />
            <Title level={4} type="secondary">
              {sections.find(s => s.key === activeSection)?.label} settings coming soon
            </Title>
            <Text type="secondary">This section is under development</Text>
          </div>
        );
    }
  };

  return (
    <Card 
      title={
        <Space>
          <Icon name="settings" className="text-[#0E72BD]" />
          <Title level={4} className="m-0">Settings</Title>
        </Space>
      }
    >
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <Menu
            mode="inline"
            selectedKeys={[activeSection]}
            onClick={({ key }) => setActiveSection(key)}
            items={sections.map(section => ({
              key: section.key,
              icon: section.icon,
              label: section.label
            }))}
            className="border-none"
          />
        </Col>
        <Col xs={24} lg={18}>
          <div className="pl-6">
            {renderContent()}
          </div>
        </Col>
      </Row>
    </Card>
  );
}