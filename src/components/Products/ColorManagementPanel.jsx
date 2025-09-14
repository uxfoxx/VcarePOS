import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Typography, 
  Space, 
  Divider, 
  List, 
  Popconfirm, 
  message, 
  Button, 
  Tabs, 
  Table, 
  Row, 
  Col, 
  Upload,
  Empty,
  Tag,
  Collapse,
  Alert,
  Badge,
  Tooltip
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

export function ColorManagementPanel({
  colors = [],
  rawMaterials = [],
  onAddColor,
  onUpdateColor,
  onRemoveColor,
  onAddColorSize,
  onRemoveColorSize,
  onAddColorMaterial,
  onRemoveColorMaterial
}) {
  const [colorForm] = Form.useForm();
  const [sizeForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [activeColorId, setActiveColorId] = useState(null);
  const [activeSizeId, setActiveSizeId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');

  const handleAddColor = (values) => {
    const newColor = {
      name: values.name,
      colorCode: '#000000',
      image: imagePreview || ''
    };
    
    onAddColor(newColor);
    colorForm.resetFields();
    setImagePreview(null);
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleAddSize = (values) => {
    if (!activeColorId) {
      message.error('Please select a color first');
      return;
    }
    
    const sizeData = {
      name: values.name,
      stock: values.stock || 0,
      dimensions: values.dimensions || {},
      weight: values.weight || 0,
      rawMaterials: [] // Initialize empty raw materials array
    };
    
    onAddColorSize(activeColorId, sizeData);
    sizeForm.resetFields();
  };

  const handleAddMaterialToSize = (colorId, sizeId, values) => {
    const material = rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    // Check if material already exists for this size
    const color = colors.find(c => c.id === colorId);
    const size = color?.sizes?.find(s => s.id === sizeId);
    const existingMaterial = size?.rawMaterials?.find(m => m.rawMaterialId === values.materialId);
    
    if (existingMaterial) {
      message.error('Material already added to this size');
      return;
    }
    
    const materialData = {
      rawMaterialId: values.materialId,
      quantity: values.quantity,
      name: material.name,
      unit: material.unit,
      unitPrice: material.unitPrice
    };
    
    // Update the specific size's raw materials
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: color.sizes.map(size => {
            if (size.id === sizeId) {
              return {
                ...size,
                rawMaterials: [...(size.rawMaterials || []), materialData]
              };
            }
            return size;
          })
        };
      }
      return color;
    });
    
    // Call the parent update function
    onUpdateColor(colorId, { sizes: updatedColors.find(c => c.id === colorId).sizes });
    materialForm.resetFields();
    message.success('Material added to size');
  };

  const handleRemoveMaterialFromSize = (colorId, sizeId, materialId) => {
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: color.sizes.map(size => {
            if (size.id === sizeId) {
              return {
                ...size,
                rawMaterials: (size.rawMaterials || []).filter(m => m.rawMaterialId !== materialId)
              };
            }
            return size;
          })
        };
      }
      return color;
    });
    
    // Call the parent update function
    onUpdateColor(colorId, { sizes: updatedColors.find(c => c.id === colorId).sizes });
    message.success('Material removed from size');
  };

  const getActiveColor = () => {
    return colors.find(c => c.id === activeColorId);
  };

  const getActiveSize = () => {
    const color = getActiveColor();
    return color?.sizes?.find(s => s.id === activeSizeId);
  };

  const filteredRawMaterials = rawMaterials.filter(material => 
    material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const renderColorsList = () => (
    <div className="space-y-4">
      <Card size="small" title="Add New Color">
        <Form
          form={colorForm}
          layout="vertical"
          onFinish={handleAddColor}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Color Name"
                rules={[{ required: true, message: 'Please enter color name' }]}
              >
                <Input placeholder="e.g., Natural Oak, Walnut, White" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add Color
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Color Image (Optional)">
            <Upload
              accept="image/*"
              beforeUpload={handleImageUpload}
              showUploadList={false}
              maxCount={1}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ 
                          backgroundImage: `url(${imagePreview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    </div>
                    <div>
                      <Button icon={<Icon name="upload" />} size="small">
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="cloud_upload" className="text-2xl text-gray-400" />
                    <div>
                      <Text>Click to upload color image</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        Will be displayed as small circle in POS
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Card>

      <div>
        <Title level={5} className="mb-4">Product Colors ({colors.length})</Title>
        
        {colors.length === 0 ? (
          <Empty
            description="No colors added yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colors.map(color => (
              <Card
                key={color.id}
                size="small"
                className={`cursor-pointer transition-all hover:shadow-md ${activeColorId === color.id ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={() => setActiveColorId(color.id)}
                actions={[
                  <Tooltip title="Manage Sizes" key="manage">
                    <Button 
                      type="text" 
                      icon={<Icon name="straighten" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveColorId(color.id);
                      }}
                    >
                      Manage
                    </Button>
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Delete this color?"
                    description="This will also delete all sizes and raw materials for this color."
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      onRemoveColor(color.id);
                      if (activeColorId === color.id) {
                        setActiveColorId(null);
                        setActiveSizeId(null);
                      }
                    }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<Icon name="delete" />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ 
                      backgroundImage: color.image ? `url(${color.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: color.colorCode || '#f0f0f0'
                    }}
                  >
                    {!color.image && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="palette" className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Text strong className="block">{color.name}</Text>
                    <div className="flex space-x-2 mt-1">
                      <Badge 
                        count={color.sizes?.length || 0} 
                        showZero 
                        style={{ backgroundColor: '#722ed1' }}
                      />
                      <Text type="secondary" className="text-xs">sizes</Text>
                      <Badge 
                        count={color.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0} 
                        showZero 
                        style={{ backgroundColor: '#fa8c16' }}
                      />
                      <Text type="secondary" className="text-xs">materials</Text>
                    </div>
                    <Text type="secondary" className="text-xs block mt-1">
                      Total Stock: {color.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0} units
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderColorDetails = () => {
    const activeColor = getActiveColor();
    
    if (!activeColor) {
      return (
        <div className="text-center py-12">
          <Icon name="palette" className="text-4xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">No Color Selected</Title>
          <Text type="secondary">Please select a color from the Colors tab to manage its sizes and materials.</Text>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Color Header */}
        <Card size="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full border-2 border-gray-300"
                style={{ 
                  backgroundImage: activeColor.image ? `url(${activeColor.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: activeColor.colorCode || '#f0f0f0'
                }}
              >
                {!activeColor.image && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="palette" className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Title level={4} className="mb-1">{activeColor.name}</Title>
                <Text type="secondary">
                  {activeColor.sizes?.length || 0} size{(activeColor.sizes?.length || 0) !== 1 ? 's' : ''} • 
                  {activeColor.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0} material{(activeColor.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                </Text>
              </div>
            </div>
            <ActionButton 
              onClick={() => setActiveColorId(null)}
              icon="arrow_back"
            >
              Back to Colors
            </ActionButton>
          </div>
        </Card>

        {/* Add Size Form */}
        <Card size="small" title="Add New Size">
          <Form
            form={sizeForm}
            layout="vertical"
            onFinish={handleAddSize}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="name"
                  label="Size Name"
                  rules={[{ required: true, message: 'Please enter size name' }]}
                >
                  <Input placeholder="e.g., Small, Medium, Large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="stock"
                  label="Stock Quantity"
                  rules={[{ required: true, message: 'Please enter stock quantity' }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    className="w-full"
                    step={1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label=" ">
                  <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                    Add Size
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Sizes List with Raw Materials */}
        <div>
          <Title level={5} className="mb-4">
            Sizes for {activeColor.name} ({activeColor.sizes?.length || 0})
          </Title>
          
          {!activeColor.sizes || activeColor.sizes.length === 0 ? (
            <Empty
              description="No sizes added yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Collapse 
              accordion
              className="bg-white"
              expandIcon={({ isActive }) => <Icon name={isActive ? 'expand_less' : 'expand_more'} />}
            >
              {activeColor.sizes.map(size => (
                <Panel
                  key={size.id}
                  header={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <Text strong className="text-base">{size.name}</Text>
                          <div className="flex space-x-4 mt-1">
                            <Text type="secondary" className="text-sm">
                              Stock: {size.stock || 0} units
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          count={size.rawMaterials?.length || 0} 
                          showZero 
                          style={{ backgroundColor: '#fa8c16' }}
                        />
                        <Text type="secondary" className="text-xs">materials</Text>
                        <Popconfirm
                          title="Delete this size?"
                          description="This will also delete all raw materials for this size."
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            onRemoveColorSize(activeColorId, size.id);
                            if (activeSizeId === size.id) {
                              setActiveSizeId(null);
                            }
                          }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Icon name="delete" />}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  }
                  extra={null}
                >
                  <div className="space-y-4">
                    {/* Size Details */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Title level={5} className="mb-3">Size Specifications</Title>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Text type="secondary">Stock:</Text>
                          <br />
                          <Text strong>{size.stock || 0} units</Text>
                        </Col>
                        <Col span={18}>
                          <Text type="secondary">Size Details:</Text>
                          <br />
                          <Text strong>{size.name} - {size.stock || 0} units in stock</Text>
                        </Col>
                      </Row>
                    </div>

                    {/* Raw Materials for this Size */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Title level={5} className="mb-0">
                          Raw Materials for {size.name} ({size.rawMaterials?.length || 0})
                        </Title>
                      </div>

                      {/* Add Material Form */}
                      <Card size="small" className="mb-4">
                        <Form
                          layout="vertical"
                          onFinish={(values) => handleAddMaterialToSize(activeColorId, size.id, values)}
                        >
                          <Row gutter={16}>
                            <Col span={14}>
                              <Form.Item
                                name="materialId"
                                label="Raw Material"
                                rules={[{ required: true, message: 'Please select a material' }]}
                              >
                                <Select
                                  placeholder="Search and select material"
                                  showSearch
                                  optionFilterProp="label"
                                  filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                  }
                                >
                                  {rawMaterials?.map(material => (
                                    <Option 
                                      key={material.id} 
                                      value={material.id} 
                                      label={`${material.name} ${material.category}`}
                                    >
                                      <div>
                                        <Text strong>{material.name}</Text>
                                        <br />
                                        <Text type="secondary" className="text-xs">
                                          {material.category} • LKR {material.unitPrice}/{material.unit} • Stock: {material.stockQuantity}
                                        </Text>
                                      </div>
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                name="quantity"
                                label="Quantity Required"
                                rules={[{ required: true, message: 'Please enter quantity' }]}
                              >
                                <InputNumber
                                  min={0.01}
                                  step={0.01}
                                  placeholder="0.00"
                                  className="w-full"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item label=" ">
                                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                                  Add
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </Card>

                      {/* Materials List */}
                      {size.rawMaterials && size.rawMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {size.rawMaterials.map((material, index) => (
                            <div key={`${material.rawMaterialId}-${index}`} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Icon name="category" className="text-orange-600 text-sm" />
                                  </div>
                                  <div>
                                    <Text strong>{material.name || 'Unknown Material'}</Text>
                                    <br />
                                    <Text type="secondary" className="text-sm">
                                      {material.quantity} {material.unit || 'units'} • 
                                      LKR {((material.unitPrice || 0) * material.quantity).toFixed(2)} total cost
                                    </Text>
                                  </div>
                                </div>
                                <Popconfirm
                                  title="Remove this material?"
                                  onConfirm={() => handleRemoveMaterialFromSize(activeColorId, size.id, material.rawMaterialId)}
                                >
                                  <Button type="text" danger icon={<Icon name="delete" />} size="small" />
                                </Popconfirm>
                              </div>
                            </div>
                          ))}
                          
                          {/* Material Cost Summary */}
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center">
                              <Text strong>Total Material Cost for {size.name}:</Text>
                              <Text strong className="text-green-600 text-lg">
                                LKR {(size.rawMaterials.reduce((sum, material) => 
                                  sum + ((material.unitPrice || 0) * material.quantity), 0
                                )).toFixed(2)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Icon name="category" className="text-3xl text-gray-300 mb-2" />
                          <Text type="secondary">No raw materials added for {size.name}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            Add raw materials required to manufacture this size
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs 
        activeKey={activeColorId ? 'details' : 'colors'} 
        onChange={(key) => {
          if (key === 'colors') {
            setActiveColorId(null);
            setActiveSizeId(null);
          }
        }}
        items={[
          {
            key: 'colors',
            label: (
              <span className="flex items-center space-x-2">
                <Icon name="palette" />
                <span>Colors ({colors.length})</span>
              </span>
            ),
            children: renderColorsList()
          },
          {
            key: 'details',
            label: (
              <span className="flex items-center space-x-2">
                <Icon name="straighten" />
                <span>Sizes & Materials</span>
                {activeColorId && (
                  <Badge 
                    count={getActiveColor()?.sizes?.length || 0} 
                    size="small" 
                    style={{ backgroundColor: '#722ed1' }}
                  />
                )}
              </span>
            ),
            children: renderColorDetails(),
            disabled: !activeColorId
          }
        ]}
      />

      {colors.length === 0 && (
        <Alert
          message="No Colors Added"
          description="Please add at least one color for this product. Each color can have multiple sizes, and each size can have its own raw materials."
          type="info"
          showIcon
        />
      )}
    </div>
  );
}