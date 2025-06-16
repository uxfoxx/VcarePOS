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
  message
} from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('general');
  const [form] = Form.useForm();

  const sections = [
    { key: 'general', label: 'General', icon: <span className="material-icons">settings</span> },
    { key: 'store', label: 'Store Info', icon: <span className="material-icons">store</span> },
    { key: 'users', label: 'User Management', icon: <span className="material-icons">people</span> },
    { key: 'payment', label: 'Payment Methods', icon: <span className="material-icons">payment</span> },
    { key: 'notifications', label: 'Notifications', icon: <span className="material-icons">notifications</span> },
    { key: 'security', label: 'Security', icon: <span className="material-icons">security</span> },
    { key: 'hardware', label: 'Hardware', icon: <span className="material-icons">print</span> }
  ];

  const handleSave = () => {
    message.success('Settings saved successfully!');
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
          <Form.Item name="currency" label="Currency" initialValue="USD">
            <Select>
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
          <Form.Item name="timezone" label="Time Zone" initialValue="UTC-5">
            <Select>
              <Option value="UTC-5">UTC-5 (Eastern)</Option>
              <Option value="UTC-6">UTC-6 (Central)</Option>
              <Option value="UTC-7">UTC-7 (Mountain)</Option>
              <Option value="UTC-8">UTC-8 (Pacific)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit">Save Changes</Button>
    </Form>
  );

  const renderStoreSettings = () => (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <Title level={4}>Store Information</Title>
      <Form.Item name="storeAddress" label="Store Address" initialValue="123 Main Street, City, State 12345">
        <TextArea rows={3} />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="phone" label="Phone Number" initialValue="+1-555-0123">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="email" label="Email" initialValue="store@vcare.com">
            <Input type="email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://www.vcare.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="businessHours" label="Business Hours" initialValue="9:00 AM - 6:00 PM">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit">Save Changes</Button>
    </Form>
  );

  const renderPaymentSettings = () => (
    <div>
      <Title level={4}>Payment Methods</Title>
      <Space direction="vertical" size="large" className="w-full">
        {[
          { name: 'Cash Payments', key: 'cash', enabled: true },
          { name: 'Credit/Debit Cards', key: 'cards', enabled: true },
          { name: 'Digital Wallets', key: 'digital', enabled: true },
          { name: 'Gift Cards', key: 'gift', enabled: false },
          { name: 'Store Credit', key: 'credit', enabled: false }
        ].map((method) => (
          <Card key={method.key} size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text strong>{method.name}</Text>
                <br />
                <Text type="secondary" className="text-xs">
                  {method.enabled ? 'Currently enabled' : 'Currently disabled'}
                </Text>
              </div>
              <Switch defaultChecked={method.enabled} />
            </div>
          </Card>
        ))}
      </Space>
      <Divider />
      <Button type="primary" onClick={handleSave}>Save Payment Settings</Button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <Title level={4}>Notification Settings</Title>
      <Space direction="vertical" size="large" className="w-full">
        {[
          { name: 'Low Stock Alerts', description: 'Get notified when inventory is running low' },
          { name: 'Daily Sales Reports', description: 'Receive daily sales summary via email' },
          { name: 'New Transaction Alerts', description: 'Real-time notifications for new sales' },
          { name: 'System Updates', description: 'Notifications about system updates and maintenance' }
        ].map((notification, index) => (
          <Card key={index} size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text strong>{notification.name}</Text>
                <br />
                <Text type="secondary" className="text-xs">
                  {notification.description}
                </Text>
              </div>
              <Switch defaultChecked={index < 2} />
            </div>
          </Card>
        ))}
      </Space>
      <Divider />
      <Button type="primary" onClick={handleSave}>Save Notification Settings</Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'store':
        return renderStoreSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">settings</span>
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
          <span className="material-icons text-[#0E72BD]">settings</span>
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