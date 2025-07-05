import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Upload, 
  ColorPicker, 
  message,
  Select,
  Switch,
  Tabs,
  Modal
} from 'antd';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function BrandingSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('/VCARELogo 1.png');
  const [primaryColor, setPrimaryColor] = useState('#0E72BD');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
  const [accentColor, setAccentColor] = useState('#fa8c16');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [crop, setCrop] = useState();
  const [imgRef, setImgRef] = useState(null);
  
  // Apply branding changes to the document
  const applyBrandingChanges = (values) => {
    // Create a style element if it doesn't exist
    let styleEl = document.getElementById('branding-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'branding-styles';
      document.head.appendChild(styleEl);
    }
    
    // Update CSS variables
    styleEl.innerHTML = `
      :root {
        --primary-color: ${values.primaryColor || primaryColor} !important;
        --secondary-color: ${values.secondaryColor || secondaryColor} !important;
        --accent-color: ${values.accentColor || accentColor} !important;
        --primary-color-rgb: ${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`} !important;
        --font-family: ${values.fontFamily || fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      
      .ant-btn-primary {
        background-color: ${values.primaryColor || primaryColor} !important;
        border-color: ${values.primaryColor || primaryColor} !important;
      }
      
      .text-blue-600, .text-\[#0E72BD\] {
        color: ${values.primaryColor || primaryColor} !important;
      }
      
      .bg-blue-600, .bg-\[#0E72BD\] {
        background-color: ${values.primaryColor || primaryColor} !important;
      }
      
      .border-blue-600, .border-\[#0E72BD\] {
        border-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-switch-checked {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-checkbox-checked .ant-checkbox-inner {
        background-color: ${values.primaryColor || primaryColor} !important;
        border-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-pagination-item-active {
        border-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-pagination-item-active a {
        color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-slider-track {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-slider-handle::after {
        box-shadow: 0 0 0 2px ${values.primaryColor || primaryColor} !important;
      }

      .ant-btn-link {
        color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-menu-light .ant-menu-submenu-selected >.ant-menu-submenu-title {
        color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-radio-checked .ant-radio-inner {
        border-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-radio-inner::after {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-tabs-ink-bar {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.1) !important;
      }

      .ant-select-focused .ant-select-selector {
        border-color: ${values.primaryColor || primaryColor} !important;
        box-shadow: 0 0 0 2px rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.2) !important;
      }

      .ant-input:focus, 
      .ant-input-focused {
        border-color: ${values.primaryColor || primaryColor} !important;
        box-shadow: 0 0 0 2px rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.2) !important;
      }

      .ant-input-affix-wrapper:focus,
      .ant-input-affix-wrapper-focused {
        border-color: ${values.primaryColor || primaryColor} !important;
        box-shadow: 0 0 0 2px rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.2) !important;
      }

      .ant-picker-focused {
        border-color: ${values.primaryColor || primaryColor} !important;
        box-shadow: 0 0 0 2px rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.2) !important;
      }

      .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-tag-blue {
        color: ${values.primaryColor || primaryColor} !important;
        background: rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.1) !important;
        border-color: rgba(${values.primaryColor ? 
          `${parseInt(values.primaryColor.slice(1, 3), 16)}, ${parseInt(values.primaryColor.slice(3, 5), 16)}, ${parseInt(values.primaryColor.slice(5, 7), 16)}` : 
          `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`}, 0.3) !important;
      }

      .ant-progress-bg {
        background-color: ${values.primaryColor || primaryColor} !important;
      }

      /* Button hover states */
      .ant-btn:hover {
        border-color: ${values.primaryColor || primaryColor} !important;
        color: ${values.primaryColor || primaryColor} !important;
      }

      .ant-btn-default:hover {
        border-color: ${values.primaryColor || primaryColor} !important;
        color: ${values.primaryColor || primaryColor} !important;
      }

      /* Button focus states */
      .ant-btn:focus {
        border-color: ${values.primaryColor || primaryColor} !important;
        color: ${values.primaryColor || primaryColor} !important;
      }
      
      body {
        font-family: ${values.fontFamily || fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
    `;
    
    // Update logo if changed
    const logoElements = document.querySelectorAll('img[src="/VCARELogo 1.png"]');
    logoElements.forEach(el => {
      el.src = logoPreview;
    });
  };
  
  const handleSave = (values) => {
    setLoading(true);
    
    // Prepare branding data
    const brandingData = {
      ...values,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      logoPreview
    };
    
    // Apply branding changes
    applyBrandingChanges(brandingData);
    
    // Save to localStorage for persistence
    localStorage.setItem('vcare_branding', JSON.stringify(brandingData));
    
    message.success('Branding settings saved and applied successfully');
    setLoading(false);
    
    // Force reload to apply all changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropSrc(e.target.result);
      setLogoFile(file);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic upload
  };
  
  const onImageLoad = (e) => {
    setImgRef(e.currentTarget);
    
    const { width, height } = e.currentTarget;
    const cropPercentage = 0.8;
    
    const cropWidth = width * cropPercentage;
    const cropHeight = height * cropPercentage;
    
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;
    
    const crop = {
      unit: 'px',
      x,
      y,
      width: cropWidth,
      height: cropHeight,
    };
    
    setCrop(crop);
  };
  
  const handleCompleteCrop = () => {
    if (!crop || !imgRef) {
      message.error('Please select a crop area');
      return;
    }
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      imgRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/png');
    setLogoPreview(base64Image);
    setShowCropModal(false);
  };
  
  const handleResetDefaults = () => {
    setPrimaryColor('#0E72BD');
    setSecondaryColor('#52c41a');
    setAccentColor('#fa8c16');
    setFontFamily('Inter');
    setLogoPreview('/VCARELogo 1.png');
    
    form.setFieldsValue({
      businessName: 'VCare Furniture Store',
      tagline: 'Premium Furniture Solutions',
      primaryColor: '#0E72BD',
      secondaryColor: '#52c41a',
      accentColor: '#fa8c16',
      fontFamily: 'Inter',
      emailAddress: 'info@vcarefurniture.com',
      phoneNumber: '(555) 123-4567',
      address: '123 Main Street, City, State 12345',
      website: 'www.vcarefurniture.com',
      receiptFooter: 'Thank you for your business!',
      invoiceNotes: 'Payment is due within 30 days.'
    });
    
    message.info('Branding settings reset to defaults');
  };

  // Reset to default black/gray/white theme
  const handleResetToDefaultTheme = () => {
    // Default black/gray/white theme values
    const defaultTheme = {
      primaryColor: '#333333', // Dark gray
      secondaryColor: '#666666', // Medium gray
      accentColor: '#999999', // Light gray
      fontFamily: 'Inter',
      businessName: 'VCare Furniture Store',
      tagline: 'Premium Furniture Solutions',
      emailAddress: 'info@vcarefurniture.com',
      phoneNumber: '(555) 123-4567',
      address: '123 Main Street, City, State 12345',
      website: 'www.vcarefurniture.com',
      receiptFooter: 'Thank you for your business!',
      invoiceNotes: 'Payment is due within 30 days.',
      logoPreview: '/VCARELogo 1.png'
    };
    
    // Update state
    setPrimaryColor(defaultTheme.primaryColor);
    setSecondaryColor(defaultTheme.secondaryColor);
    setAccentColor(defaultTheme.accentColor);
    setFontFamily(defaultTheme.fontFamily);
    setLogoPreview(defaultTheme.logoPreview);
    
    // Update form values
    form.setFieldsValue(defaultTheme);
    
    // Apply changes
    applyBrandingChanges(defaultTheme);
    document.documentElement.style.setProperty('--primary-color-rgb', '51, 51, 51');
    
    // Save to localStorage
    localStorage.setItem('vcare_branding', JSON.stringify(defaultTheme));
    
    message.success('Reset to default black/gray/white theme');
    
    // Close confirmation modal
    setShowResetConfirm(false);
    
    // Force reload to apply all changes
    setTimeout(() => {
      window.location.reload(); 
    }, 1000);
  };

  // Load saved branding on component mount
  React.useEffect(() => {
    const savedBranding = localStorage.getItem('vcare_branding');
    
    if (savedBranding) {
      const parsedBranding = JSON.parse(savedBranding);
      form.setFieldsValue(parsedBranding);
      
      // Set state values
      if (parsedBranding.logoPreview) {
        setLogoPreview(parsedBranding.logoPreview);
      }
      
      if (parsedBranding.primaryColor) {
        setPrimaryColor(parsedBranding.primaryColor);
      }

      // Set RGB values for the primary color
      document.documentElement.style.setProperty('--primary-color-rgb', `${parseInt(parsedBranding.primaryColor?.slice(1, 3) || '0E', 16)}, ${parseInt(parsedBranding.primaryColor?.slice(3, 5) || '72', 16)}, ${parseInt(parsedBranding.primaryColor?.slice(5, 7) || 'BD', 16)}`);
      
      if (parsedBranding.secondaryColor) {
        setSecondaryColor(parsedBranding.secondaryColor);
      }
      
      if (parsedBranding.accentColor) {
        setAccentColor(parsedBranding.accentColor);
      }
      
      if (parsedBranding.fontFamily) {
        setFontFamily(parsedBranding.fontFamily);
      }
    }
    // Set default RGB values if no saved branding
    else document.documentElement.style.setProperty('--primary-color-rgb', '14, 114, 189');
  }, [form]);
  
  const tabItems = [
    {
      key: 'general',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="business" />
          <span>General Branding</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="businessName"
                label="Business Name"
                initialValue="VCare Furniture Store"
                rules={[{ required: true, message: 'Please enter business name' }]}
              >
                <Input placeholder="Enter business name" />
              </Form.Item>
              
              <Form.Item
                name="tagline"
                label="Tagline"
                initialValue="Premium Furniture Solutions"
              >
                <Input placeholder="Enter business tagline" />
              </Form.Item>
              
              <Form.Item
                label="Logo"
                name="logo"
                valuePropName="fileList"
              >
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50">
                    <img 
                      src={logoPreview} 
                      alt="Business Logo" 
                      className="max-h-24 object-contain"
                    />
                  </div>
                  <Upload
                    accept="image/*"
                    beforeUpload={handleLogoUpload}
                    showUploadList={false}
                    maxCount={1}
                  >
                    <Button icon={<Icon name="upload" />}>
                      Change Logo
                    </Button>
                  </Upload>
                  <Text type="secondary" className="text-xs block">
                    Recommended size: 200x200px. PNG or SVG with transparent background.
                  </Text>
                </div>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="emailAddress"
                label="Email Address"
                initialValue="info@vcarefurniture.com"
              >
                <Input placeholder="Enter business email" />
              </Form.Item>
              
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                initialValue="(555) 123-4567"
              >
                <Input placeholder="Enter business phone" />
              </Form.Item>
              
              <Form.Item
                name="address"
                label="Business Address"
                initialValue="123 Main Street, City, State 12345"
              >
                <TextArea 
                  rows={3}
                  placeholder="Enter business address"
                />
              </Form.Item>
              
              <Form.Item
                name="website"
                label="Website"
                initialValue="www.vcarefurniture.com"
              >
                <Input placeholder="Enter website URL" />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Note:</strong> These details will appear on all invoices, receipts, and other customer-facing documents.
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'appearance',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="palette" />
          <span>Colors & Appearance</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="Primary Color"
                name="primaryColor"
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={primaryColor}
                    onChange={(color) => {setPrimaryColor(color.toHexString()); document.documentElement.style.setProperty('--primary-color-rgb', `${parseInt(color.toHexString().slice(1, 3), 16)}, ${parseInt(color.toHexString().slice(3, 5), 16)}, ${parseInt(color.toHexString().slice(5, 7), 16)}`)}}
                    showText
                  />
                  <div>
                    <Text type="secondary" className="text-xs block">
                      Used for primary buttons, links, and accents
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Secondary Color"
                name="secondaryColor"
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={secondaryColor}
                    onChange={(color) => {setSecondaryColor(color.toHexString())}}
                    showText
                  />
                  <div>
                    <Text type="secondary" className="text-xs block">
                      Used for success states and secondary elements
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Accent Color"
                name="accentColor"
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={accentColor}
                    onChange={(color) => {setAccentColor(color.toHexString())}}
                    showText
                  />
                  <div>
                    <Text type="secondary" className="text-xs block">
                      Used for highlights and tertiary elements
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Font Family"
                name="fontFamily"
              >
                <Select onChange={(value) => setFontFamily(value)}>
                  <Option value="Inter">Inter (Default)</Option>
                  <Option value="Roboto">Roboto</Option>
                  <Option value="Open Sans">Open Sans</Option>
                  <Option value="Poppins">Poppins</Option>
                  <Option value="Lato">Lato</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Dark Mode Support"
                name="darkModeSupport"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <div className="p-6 border rounded-lg">
            <Title level={5} className="mb-4">Preview</Title>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Icon name="store" />
                </div>
                <div>
                  <div style={{ fontFamily: fontFamily || 'Inter' }}>
                    <Text strong className="text-lg" style={{ color: primaryColor }}>
                      {form.getFieldValue('businessName') || 'VCare Furniture Store'}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {form.getFieldValue('tagline') || 'Premium Furniture Solutions'}
                    </Text>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="primary" 
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                  className="hover:opacity-90"
                >
                  Primary Button
                </Button>
                <Button style={{ borderColor: secondaryColor, color: secondaryColor }} className="hover:border-primary hover:text-primary">
                  Secondary Button
                </Button>
                <Button type="text" style={{ color: accentColor }} className="hover:text-primary">
                  Text Button
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'documents',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="description" />
          <span>Document Templates</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Form.Item
            name="receiptFooter"
            label="Receipt Footer Text"
            initialValue="Thank you for your business!"
          >
            <TextArea 
              rows={2}
              placeholder="Enter text to appear at the bottom of receipts"
            />
          </Form.Item>
          
          <Form.Item
            name="invoiceNotes"
            label="Default Invoice Notes"
            initialValue="Payment is due within 30 days."
          >
            <TextArea 
              rows={3}
              placeholder="Enter default notes for invoices"
            />
          </Form.Item>
          
          <Form.Item
            name="termsAndConditions"
            label="Terms and Conditions"
            initialValue="All sales are final. Returns accepted within 30 days with receipt."
          >
            <TextArea 
              rows={4}
              placeholder="Enter terms and conditions for invoices and receipts"
            />
          </Form.Item>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="showTaxId"
                label="Show Tax ID on Documents"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="taxId"
                label="Business Tax ID"
                initialValue="TAX-123456789"
              >
                <Input placeholder="Enter business tax ID" />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Note:</strong> These settings affect how your business information appears on receipts, invoices, and other documents generated by the system.
            </Text>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <Card
      title={
        <Space>
          <Icon name="branding_watermark" className="text-[#0E72BD]" />
          <Title level={4} className="m-0">System Branding</Title>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          businessName: 'VCare Furniture Store',
          tagline: 'Premium Furniture Solutions',
          primaryColor: '#0E72BD',
          secondaryColor: '#52c41a',
          accentColor: '#fa8c16',
          fontFamily: 'Inter',
          emailAddress: 'info@vcarefurniture.com',
          phoneNumber: '(555) 123-4567',
          address: '123 Main Street, City, State 12345',
          website: 'www.vcarefurniture.com',
          receiptFooter: 'Thank you for your business!',
          invoiceNotes: 'Payment is due within 30 days.'
        }}
      >
        <Tabs items={tabItems} />
        
        <Divider />
        
        <div className="flex justify-end space-x-3">
          <Button onClick={() => setShowResetConfirm(true)}>
            Reset to Defaults
          </Button>
          <Button 
            type="primary"
            htmlType="submit" 
            loading={loading}
            icon={<Icon name="save" />}
            className="bg-primary"
          >
            Save Branding Settings
          </Button>
        </div>
      </Form>
      
      {/* Image Crop Modal */}
      <Modal
        title="Crop Logo"
        open={showCropModal}
        onCancel={() => setShowCropModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCropModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="crop" 
            type="primary" 
            onClick={handleCompleteCrop}
            className="bg-blue-600"
          >
            Apply Crop
          </Button>
        ]}
        width={800}
      >
        <div className="text-center">
          <Text type="secondary" className="mb-4 block">
            Drag to adjust the crop area for your logo
          </Text>
          
          <div className="max-h-[60vh] overflow-auto">
            {cropSrc && (
              <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1}>
                <img src={cropSrc} onLoad={onImageLoad} alt="Crop preview" />
              </ReactCrop>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Reset Confirmation Modal */}
      <Modal
        title="Reset Branding Settings"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </Button>,
          <Button 
            key="reset-original" 
            onClick={handleResetDefaults}
          >
            Reset to Original Blue Theme
          </Button>,
          <Button 
            key="reset-default" 
            type="primary"
            onClick={handleResetToDefaultTheme}
            className="bg-gray-800"
          >
            Reset to Black/Gray Theme
          </Button>
        ]}
      >
        <div className="space-y-4">
          <Text>Choose a default theme to reset to:</Text>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500" onClick={handleResetDefaults}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#0E72BD]"></div>
                <Text strong>Original Blue Theme (Default)</Text>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-[#0E72BD]"></div>
                <div className="h-2 w-3/4 rounded-full bg-[#52c41a]"></div>
                <div className="h-2 w-1/2 rounded-full bg-[#fa8c16]"></div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 cursor-pointer hover:border-gray-500" onClick={handleResetToDefaultTheme}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#333333]"></div>
                <Text strong>Black/Gray/White Theme</Text>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-[#333333]"></div>
                <div className="h-2 w-3/4 rounded-full bg-[#666666]"></div>
                <div className="h-2 w-1/2 rounded-full bg-[#999999]"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg mt-4">
            <Text className="text-sm">
              <Icon name="warning" className="mr-2 text-yellow-600" />
              <strong>Warning:</strong> This will reset all branding settings including colors, logo, and business information. This action cannot be undone.
            </Text>
          </div>
        </div>
      </Modal>
    </Card>
  );
}