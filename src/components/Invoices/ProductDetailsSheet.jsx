import React from 'react';
import { Modal, Typography, Divider, Row, Col, Space, Image } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;

export function ProductDetailsSheet({ open, onClose, product }) {
  if (!product) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('product-sheet-content');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDownload = () => {
    // Note: In a real application, you would use html2pdf library
    // For now, we'll just trigger print
    handlePrint();
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="description" className="text-[#0E72BD]" />
          <span>Product Details Sheet</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <ActionButton key="close" onClick={onClose}>
          Close
        </ActionButton>,
        <ActionButton key="download" icon="download" onClick={handleDownload}>
          Download PDF
        </ActionButton>,
        <ActionButton.Primary key="print" icon="print" onClick={handlePrint}>
          Print
        </ActionButton.Primary>
      ]}
      className="invoice-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div id="product-sheet-content" className="p-8 bg-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <img 
                src="/VCARELogo 1.png" 
                alt="VCare Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <Title level={2} className="m-0 text-[#0E72BD]">VCare Furniture Store</Title>
                <Text type="secondary">Premium Furniture Solutions</Text>
              </div>
            </div>
            <Divider />
            <Title level={3} className="text-gray-800">PRODUCT SPECIFICATION SHEET</Title>
          </div>

          {/* Product Image and Basic Info */}
          <Row gutter={32} className="mb-8">
            <Col span={10}>
              <div className="text-center">
                <Image
                  src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  width="100%"
                  height={250}
                  className="object-cover rounded-lg border"
                  preview={false}
                />
              </div>
            </Col>
            <Col span={14}>
              <div className="space-y-4">
                <div>
                  <Title level={3} className="m-0 text-[#0E72BD]">
                    {product.name}
                  </Title>
                  <Text type="secondary" className="text-lg">
                    {product.description}
                  </Text>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text strong className="block text-gray-600">Product Code:</Text>
                    <Text code className="text-lg">{product.barcode || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong className="block text-gray-600">Category:</Text>
                    <Text className="text-lg">{product.category}</Text>
                  </div>
                  <div>
                    <Text strong className="block text-gray-600">Price:</Text>
                    <Text className="text-xl font-bold text-[#0E72BD]">
                      ${product.price.toFixed(2)}
                    </Text>
                  </div>
                  <div>
                    <Text strong className="block text-gray-600">Stock Available:</Text>
                    <Text className="text-lg">{product.stock} units</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Detailed Specifications */}
          <div className="mb-8">
            <Title level={4} className="mb-4 text-[#0E72BD]">
              <Icon name="info" className="mr-2" />
              Detailed Specifications
            </Title>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Physical Specifications */}
              <div className="border rounded-lg p-4">
                <Title level={5} className="mb-3 text-gray-700">
                  <Icon name="straighten" className="mr-2" />
                  Physical Specifications
                </Title>
                <div className="space-y-3">
                  {product.dimensions && (
                    <div className="flex justify-between border-b pb-2">
                      <Text strong>Dimensions:</Text>
                      <Text>
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                      </Text>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between border-b pb-2">
                      <Text strong>Weight:</Text>
                      <Text>{product.weight} kg</Text>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between border-b pb-2">
                      <Text strong>Material:</Text>
                      <Text>{product.material}</Text>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between">
                      <Text strong>Color:</Text>
                      <Text>{product.color}</Text>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Features */}
              <div className="border rounded-lg p-4">
                <Title level={5} className="mb-3 text-gray-700">
                  <Icon name="star" className="mr-2" />
                  Product Features
                </Title>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="check_circle" className="text-green-500" size="text-sm" />
                    <Text>Premium Quality Construction</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="check_circle" className="text-green-500" size="text-sm" />
                    <Text>Durable and Long-lasting</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="check_circle" className="text-green-500" size="text-sm" />
                    <Text>Easy Assembly Instructions</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="check_circle" className="text-green-500" size="text-sm" />
                    <Text>1 Year Warranty Included</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="check_circle" className="text-green-500" size="text-sm" />
                    <Text>Professional Delivery Available</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Care Instructions */}
          <div className="mb-8">
            <Title level={4} className="mb-4 text-[#0E72BD]">
              <Icon name="cleaning_services" className="mr-2" />
              Care & Maintenance Instructions
            </Title>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text strong className="block mb-2">Daily Care:</Text>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Dust regularly with a soft, dry cloth</li>
                    <li>Avoid direct sunlight exposure</li>
                    <li>Keep away from heat sources</li>
                    <li>Use coasters for drinks and placemats for dining</li>
                  </ul>
                </div>
                <div>
                  <Text strong className="block mb-2">Deep Cleaning:</Text>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use mild soap solution for cleaning</li>
                    <li>Wipe dry immediately after cleaning</li>
                    <li>Apply furniture polish monthly</li>
                    <li>Check and tighten screws periodically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Assembly Information */}
          <div className="mb-8">
            <Title level={4} className="mb-4 text-[#0E72BD]">
              <Icon name="build" className="mr-2" />
              Assembly Information
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text strong className="block mb-2">Assembly Required:</Text>
                  <Text>Yes - Detailed instructions included</Text>
                  
                  <Text strong className="block mb-2 mt-3">Estimated Time:</Text>
                  <Text>30-60 minutes</Text>
                  
                  <Text strong className="block mb-2 mt-3">Tools Required:</Text>
                  <Text>Phillips screwdriver, Allen wrench (included)</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text strong className="block mb-2">Professional Assembly:</Text>
                  <Text>Available for additional $50</Text>
                  
                  <Text strong className="block mb-2 mt-3">Delivery Options:</Text>
                  <Text>Standard delivery, White glove service</Text>
                  
                  <Text strong className="block mb-2 mt-3">Return Policy:</Text>
                  <Text>30-day return policy applies</Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* QR Code and Additional Info */}
          <div className="border-t pt-6">
            <Row gutter={32}>
              <Col span={16}>
                <div>
                  <Text strong className="block mb-2">Additional Information:</Text>
                  <Text type="secondary">
                    For more details, assembly videos, and customer reviews, 
                    scan the QR code or visit our website at www.vcarefurniture.com
                  </Text>
                  
                  <div className="mt-4 space-y-1">
                    <Text type="secondary" className="block">
                      <Icon name="phone" className="mr-2" />
                      Customer Service: (555) 123-4567
                    </Text>
                    <Text type="secondary" className="block">
                      <Icon name="email" className="mr-2" />
                      Email: support@vcarefurniture.com
                    </Text>
                    <Text type="secondary" className="block">
                      <Icon name="schedule" className="mr-2" />
                      Hours: Mon-Sat 9AM-7PM, Sun 11AM-5PM
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 mx-auto flex items-center justify-center border rounded">
                    <Text type="secondary">QR CODE</Text>
                  </div>
                  <Text type="secondary" className="text-xs mt-2 block">
                    Scan for product details
                  </Text>
                  
                  <div className="mt-4 text-center">
                    <Text type="secondary" className="text-xs">
                      Generated on: {new Date().toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <Text type="secondary" className="text-sm">
              VCare Furniture Store - Your trusted partner for premium furniture solutions
            </Text>
            <br />
            <Text type="secondary" className="text-sm">
              123 Main Street, City, State 12345 | www.vcarefurniture.com
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}