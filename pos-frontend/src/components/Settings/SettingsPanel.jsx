import React, { useState } from 'react';
import {
  Card,
  Menu,
  Row,
  Col,
  Form,
  Select,
  Typography,
  Space,
  message
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { BrandingSettings } from './BrandingSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { DeliveryChargesSettings } from './DeliveryChargesSettings';

import { EcommerceHeroSettings } from './EcommerceHeroSettings';

const { Title, Text } = Typography;
const { Option } = Select;

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('general');
  const [form] = Form.useForm();

  // Initialize active section from hash and handle hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['general', 'branding', 'ecommerce-hero', 'invoice', 'delivery'];
      if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
      } else if (!hash) {
        setActiveSection('general');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeSection changes manually
  const handleSectionChange = (key) => {
    setActiveSection(key);
    window.location.hash = key;
  };

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('generalSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        form.setFieldsValue(parsed);
      } catch {
        console.warn('Failed to parse saved settings');
      }
    }
  }, [form]);

  const sections = [
    { key: 'general', label: 'General', icon: <Icon name="settings" /> },
    { key: 'branding', label: 'Branding', icon: <Icon name="branding_watermark" /> },
    { key: 'ecommerce-hero', label: 'Hero Section', icon: <Icon name="view_carousel" /> },
    { key: 'invoice', label: 'Invoice Settings', icon: <Icon name="receipt" /> },
    { key: 'delivery', label: 'Delivery Charges', icon: <Icon name="local_shipping" /> }
  ];

  const handleSave = (values) => {
    try {
      localStorage.setItem('generalSettings', JSON.stringify(values));
      message.success('Settings saved successfully!');
    } catch {
      message.error('Failed to save settings');
    }
  };

  const renderGeneralSettings = () => (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <Title level={4}>General Settings</Title>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="timezone" label="Time Zone" initialValue="UTC+5:30">
            <Select style={{ width: '100%' }}>
              <Option value="UTC+5:30">UTC+5:30 (Sri Lanka)</Option>
              <Option value="UTC-5">UTC-5 (Eastern)</Option>
              <Option value="UTC-6">UTC-6 (Central)</Option>
              <Option value="UTC-7">UTC-7 (Mountain)</Option>
              <Option value="UTC-8">UTC-8 (Pacific)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div className="bg-blue-50 p-4 rounded-lg mt-4 mb-4">
        <Text className="text-sm">
          <Icon name="info" className="mr-2 text-blue-600" />
          <strong>Note:</strong> Business information (name, address, contact details) is configured in the <strong>Invoice Settings</strong> section. Branding (logo, colors, fonts) is configured in the <strong>Branding</strong> section.
        </Text>
      </div>

      <ActionButton.Primary htmlType="submit">Save Changes</ActionButton.Primary>
    </Form>
  );

  const renderBrandingSettings = () => (
    <BrandingSettings />
  );

  const renderEcommerceHeroSettings = () => (
    <EcommerceHeroSettings />
  );

  const renderInvoiceSettings = () => (
    <InvoiceSettings />
  );

  const renderDeliverySettings = () => (
    <DeliveryChargesSettings />
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'branding':
        return renderBrandingSettings();
      case 'ecommerce-hero':
        return renderEcommerceHeroSettings();
      case 'invoice':
        return renderInvoiceSettings();
      case 'delivery':
        return renderDeliverySettings();
      default:
        return renderGeneralSettings();
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
      className="shadow-sm overflow-hidden"
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={6}>
          <Menu
            mode="inline"
            selectedKeys={[activeSection]}
            onClick={({ key }) => handleSectionChange(key)}
            items={sections.map(section => ({
              key: section.key,
              icon: section.icon,
              label: section.label
            }))}
            className="border-none rounded-lg overflow-hidden lg:overflow-visible"
            style={{
              background: 'transparent',
              padding: 0
            }}
          />
        </Col>
        <Col xs={24} lg={18}>
          <div className="lg:pl-6 pt-4 lg:pt-0">
            {renderContent()}
          </div>
        </Col>
      </Row>
    </Card>
  );
}