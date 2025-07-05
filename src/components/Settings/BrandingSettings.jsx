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
        --primary-color: ${values.primaryColor || primaryColor};
        --secondary-color: ${values.secondaryColor || secondaryColor};
        --accent-color: ${values.accentColor || accentColor};
        --font-family: ${values.fontFamily || fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
      
      body {
        font-family: ${values.fontFamily || fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    
    // Apply branding changes
    applyBrandingChanges(values);
    
    // Save to localStorage for persistence
    localStorage.setItem('vcare_branding', JSON.stringify({
      ...values,
      logoPreview
    }));
    
    message.success('Branding settings saved and applied successfully');
    setLoading(false);
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

  // Load saved branding on component mount
  React.useEffect(() => {
    const savedBranding = localStorage.getItem('vcare_branding');
    if (savedBranding) {
      const parsedBranding = JSON.parse(savedBranding);
      form.setFieldsValue(parsedBranding);
      if (parsedBranding.logoPreview) setLogoPreview(parsedBranding.logoPreview);
      applyBrandingChanges(parsedBranding);
    }
  }, []);
  
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
                initialValue={primaryColor}
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={primaryColor}
                    onChange={(color) => setPrimaryColor(color.toHexString())}
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
                initialValue={secondaryColor}
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={secondaryColor}
                    onChange={(color) => setSecondaryColor(color.toHexString())}
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
                initialValue={accentColor}
              >
                <div className="space-y-2">
                  <ColorPicker
                    value={accentColor}
                    onChange={(color) => setAccentColor(color.toHexString())}
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
                initialValue={fontFamily}
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
                >
                  Primary Button
                </Button>
                <Button style={{ borderColor: secondaryColor, color: secondaryColor }}>
                  Secondary Button
                </Button>
                <Button type="text" style={{ color: accentColor }}>
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
          <Button onClick={handleResetDefaults}>
            Reset to Defaults
          </Button>
          <ActionButton.Primary 
            htmlType="submit" 
            loading={loading}
            icon="save"
          >
            Save Branding Settings
          </ActionButton.Primary>
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
    </Card>
  );
}