import React from 'react';
import { 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Typography, 
  Row,
  Col,
  message
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { EnhancedCard } from '../common/EnhancedCard';
import { GradientButton } from '../common/GradientButton';
import { Icon } from '../common/Icon';

const { Option } = Select;

export function GeneralSettings() {
  const { logAction } = useAuth();
  const [form] = Form.useForm();

  const handleSave = (values) => {
    logAction('UPDATE', 'settings', 'Updated general settings', values);
    message.success('General settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <EnhancedCard
        title="Business Information"
        icon="business"
        subtitle="Configure your business details and preferences"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            businessName: 'VCare Furniture Store',
            currency: 'USD',
            taxRate: 8,
            timezone: 'UTC-5',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="businessName"
                label="Business Name"
                rules={[{ required: true, message: 'Please enter business name' }]}
              >
                <Input 
                  prefix={<Icon name="business" className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Default Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="GBP">GBP (£)</Option>
                  <Option value="CAD">CAD (C$)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="taxRate"
                label="Default Tax Rate (%)"
                rules={[{ required: true, message: 'Please enter tax rate' }]}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  step={0.01} 
                  className="w-full"
                  prefix={<Icon name="percent" />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="timezone"
                label="Time Zone"
                rules={[{ required: true, message: 'Please select timezone' }]}
              >
                <Select>
                  <Option value="UTC-8">UTC-8 (Pacific)</Option>
                  <Option value="UTC-7">UTC-7 (Mountain)</Option>
                  <Option value="UTC-6">UTC-6 (Central)</Option>
                  <Option value="UTC-5">UTC-5 (Eastern)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="language"
                label="Language"
              >
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateFormat"
                label="Date Format"
              >
                <Select>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timeFormat"
                label="Time Format"
              >
                <Select>
                  <Option value="12h">12 Hour (AM/PM)</Option>
                  <Option value="24h">24 Hour</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <GradientButton.Primary htmlType="submit" icon="save">
              Save General Settings
            </GradientButton.Primary>
          </Form.Item>
        </Form>
      </EnhancedCard>

      <EnhancedCard
        title="System Preferences"
        icon="tune"
        subtitle="Configure system behavior and defaults"
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="autoSave"
                label="Auto Save"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="notifications"
                label="System Notifications"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="soundEffects"
                label="Sound Effects"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </EnhancedCard>
    </div>
  );
}