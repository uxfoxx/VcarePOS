import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Slider, 
  ColorPicker, 
  Upload, 
  Button, 
  Typography, 
  Space,
  Row,
  Col,
  Divider,
  message,
  Image,
  Alert
} from 'antd';
import Color from 'antd/es/color-picker/color';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { GradientButton } from '../common/GradientButton';
import { EnhancedCard } from '../common/EnhancedCard';

const { Title, Text } = Typography;
const { Option } = Select;

export function ThemeSettings() {
  const { 
    branding, 
    theme, 
    layout, 
    updateBranding, 
    updateTheme, 
    updateLayout, 
    resetToDefault 
  } = useTheme();
  const { logAction } = useAuth();
  const [form] = Form.useForm();
  const [logoPreview, setLogoPreview] = useState(branding.logo);

  const handleBrandingSubmit = (values) => {
    updateBranding(values);
    logAction('UPDATE', 'settings', 'Updated branding settings', values);
    message.success('Branding settings updated successfully');
  };

  const handleThemeSubmit = (values) => {
    updateTheme(values);
    logAction('UPDATE', 'settings', 'Updated theme settings', values);
    message.success('Theme settings updated successfully');
  };

  const handleLayoutSubmit = (values) => {
    updateLayout(values);
    logAction('UPDATE', 'settings', 'Updated layout settings', values);
    message.success('Layout settings updated successfully');
  };

  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoUrl = e.target.result;
      setLogoPreview(logoUrl);
      updateBranding({ ...branding, logo: logoUrl });
      logAction('UPDATE', 'settings', 'Updated company logo');
      message.success('Logo updated successfully');
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  const handleReset = () => {
    resetToDefault();
    setLogoPreview('/VCARELogo 1.png');
    form.resetFields();
    logAction('UPDATE', 'settings', 'Reset theme to default settings');
    message.success('Theme reset to default settings');
  };

  return (
    <div className="space-y-6">
      <Alert
        message="Theme Customization"
        description="Customize your system's appearance, branding, and layout. Changes are applied immediately and saved automatically."
        type="info"
        showIcon
        icon={<Icon name="palette" />}
      />

      {/* Branding Settings */}
      <EnhancedCard
        title="Branding & Identity"
        icon="business"
        subtitle="Customize your company branding and visual identity"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBrandingSubmit}
          initialValues={branding}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input 
                  placeholder="Enter company name"
                  prefix={<Icon name="business" className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tagline"
                label="Tagline"
              >
                <Input 
                  placeholder="Enter company tagline"
                  prefix={<Icon name="campaign" className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="primaryColor"
                label="Primary Color"
              >
                <ColorPicker
                  value={new Color(branding.primaryColor)}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    updateBranding({ ...branding, primaryColor: hexColor });
                  }}
                  showText
                  size="large"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="secondaryColor"
                label="Secondary Color"
              >
                <ColorPicker
                  value={new Color(branding.secondaryColor)}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    updateBranding({ ...branding, secondaryColor: hexColor });
                  }}
                  showText
                  size="large"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="accentColor"
                label="Accent Color"
              >
                <ColorPicker
                  value={new Color(branding.accentColor)}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    updateBranding({ ...branding, accentColor: hexColor });
                  }}
                  showText
                  size="large"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Company Logo">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Company Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                    preview={false}
                  />
                ) : (
                  <Icon name="image" className="text-3xl text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Upload
                  accept="image/*"
                  beforeUpload={handleLogoUpload}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<Icon name="upload" />}>
                    Upload Logo
                  </Button>
                </Upload>
                <Text type="secondary" className="text-sm block mt-2">
                  Recommended: PNG or SVG format, max 2MB
                </Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <GradientButton.Primary htmlType="submit" icon="save">
              Save Branding
            </GradientButton.Primary>
          </Form.Item>
        </Form>
      </EnhancedCard>

      {/* Theme Settings */}
      <EnhancedCard
        title="Theme & Appearance"
        icon="palette"
        subtitle="Customize the visual appearance and behavior"
      >
        <Form
          layout="vertical"
          onFinish={handleThemeSubmit}
          initialValues={theme}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="mode"
                label="Theme Mode"
              >
                <Select
                  value={theme.mode}
                  onChange={(value) => updateTheme({ ...theme, mode: value })}
                  size="large"
                >
                  <Option value="light">
                    <Space>
                      <Icon name="light_mode" />
                      Light Mode
                    </Space>
                  </Option>
                  <Option value="dark">
                    <Space>
                      <Icon name="dark_mode" />
                      Dark Mode
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fontFamily"
                label="Font Family"
              >
                <Select
                  value={theme.fontFamily}
                  onChange={(value) => updateTheme({ ...theme, fontFamily: value })}
                  size="large"
                >
                  <Option value='"Inter", sans-serif'>Inter</Option>
                  <Option value='"Roboto", sans-serif'>Roboto</Option>
                  <Option value='"Open Sans", sans-serif'>Open Sans</Option>
                  <Option value='"Poppins", sans-serif'>Poppins</Option>
                  <Option value='system-ui, sans-serif'>System Default</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fontSize"
                label={`Font Size: ${theme.fontSize}px`}
              >
                <Slider
                  min={12}
                  max={18}
                  value={theme.fontSize}
                  onChange={(value) => updateTheme({ ...theme, fontSize: value })}
                  marks={{
                    12: '12px',
                    14: '14px',
                    16: '16px',
                    18: '18px'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="borderRadius"
                label={`Border Radius: ${theme.borderRadius}px`}
              >
                <Slider
                  min={0}
                  max={16}
                  value={theme.borderRadius}
                  onChange={(value) => updateTheme({ ...theme, borderRadius: value })}
                  marks={{
                    0: '0px',
                    4: '4px',
                    8: '8px',
                    12: '12px',
                    16: '16px'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="compactMode"
                label="Compact Mode"
              >
                <Switch
                  checked={theme.compactMode}
                  onChange={(checked) => updateTheme({ ...theme, compactMode: checked })}
                  checkedChildren="Compact"
                  unCheckedChildren="Comfortable"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="animations"
                label="Animations"
              >
                <Switch
                  checked={theme.animations}
                  onChange={(checked) => updateTheme({ ...theme, animations: checked })}
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <GradientButton.Primary htmlType="submit" icon="save">
              Save Theme
            </GradientButton.Primary>
          </Form.Item>
        </Form>
      </EnhancedCard>

      {/* Layout Settings */}
      <EnhancedCard
        title="Layout & Navigation"
        icon="dashboard"
        subtitle="Customize the layout and navigation behavior"
      >
        <Form
          layout="vertical"
          onFinish={handleLayoutSubmit}
          initialValues={layout}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="sidebarCollapsed"
                label="Sidebar"
              >
                <Switch
                  checked={layout.sidebarCollapsed}
                  onChange={(checked) => updateLayout({ ...layout, sidebarCollapsed: checked })}
                  checkedChildren="Collapsed"
                  unCheckedChildren="Expanded"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="headerFixed"
                label="Fixed Header"
              >
                <Switch
                  checked={layout.headerFixed}
                  onChange={(checked) => updateLayout({ ...layout, headerFixed: checked })}
                  checkedChildren="Fixed"
                  unCheckedChildren="Scrollable"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="footerVisible"
                label="Footer"
              >
                <Switch
                  checked={layout.footerVisible}
                  onChange={(checked) => updateLayout({ ...layout, footerVisible: checked })}
                  checkedChildren="Visible"
                  unCheckedChildren="Hidden"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="contentPadding"
                label={`Content Padding: ${layout.contentPadding}px`}
              >
                <Slider
                  min={16}
                  max={48}
                  value={layout.contentPadding}
                  onChange={(value) => updateLayout({ ...layout, contentPadding: value })}
                  marks={{
                    16: '16px',
                    24: '24px',
                    32: '32px',
                    48: '48px'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <GradientButton.Primary htmlType="submit" icon="save">
              Save Layout
            </GradientButton.Primary>
          </Form.Item>
        </Form>
      </EnhancedCard>

      {/* Preview & Reset */}
      <EnhancedCard
        title="Preview & Reset"
        icon="preview"
        subtitle="Preview your changes or reset to default settings"
      >
        <div className="space-y-4">
          <Alert
            message="Live Preview"
            description="All changes are applied immediately. You can see the effects throughout the system in real-time."
            type="success"
            showIcon
          />

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>Reset to Default</Text>
              <br />
              <Text type="secondary" className="text-sm">
                This will restore all theme settings to their original values
              </Text>
            </div>
            <Button 
              danger 
              icon={<Icon name="refresh" />}
              onClick={handleReset}
            >
              Reset Theme
            </Button>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
}