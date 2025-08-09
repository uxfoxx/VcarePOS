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
  ColorPicker,
  Alert
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
  const [activeTab, setActiveTab] = useState('colors');
  const [imagePreview, setImagePreview] = useState(null);

  const handleAddColor = (values) => {
    const newColor = {
      name: values.name,
      colorCode: values.colorCode || '#000000',
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
      weight: values.weight || 0
    };
    
    onAddColorSize(activeColorId, sizeData);
    sizeForm.resetFields();
  };

  const handleAddMaterial = (values) => {
    if (!activeColorId) {
      message.error('Please select a color first');
      return;
    }
    
    const material = rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }
    
    const materialData = {
      rawMaterialId: values.materialId,
      quantity: values.quantity
    };
    
    onAddColorMaterial(activeColorId, materialData);
    materialForm.resetFields();
  };

  const getActiveColor = () => {
    return colors.find(c => c.id === activeColorId);
  };

  const materialColumns = [
    {
      title: 'Material',
      key: 'material',
      render: (record) => {
        const material = rawMaterials.find(m => m.id === record.rawMaterialId);
        return material ? material.name : 'Unknown Material';
      }
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => {
        const material = rawMaterials.find(m => m.id === record.rawMaterialId);
        return `${record.quantity} ${material ? material.unit : 'units'}`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this material?"
          onConfirm={() => onRemoveColorMaterial(activeColorId, record.rawMaterialId)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const sizeColumns = [
    {
      title: 'Size',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'Dimensions',
      key: 'dimensions',
      render: (record) => {
        if (record.dimensions && record.dimensions.length) {
          return `${record.dimensions.length}×${record.dimensions.width}×${record.dimensions.height} ${record.dimensions.unit || 'cm'}`;
        }
        return '-';
      }
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this size?"
          onConfirm={() => onRemoveColorSize(activeColorId, record.id)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const activeColor = getActiveColor();

  return (
    <div className="space-y-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane 
          tab={
            <span>
              <Icon name="palette" className="mr-2" />
              Colors ({colors.length})
            </span>
          } 
          key="colors"
        >
          <div className="space-y-6">
            <Card title="Add New Color" size="small">
              <Form
                form={colorForm}
                layout="vertical"
                onFinish={handleAddColor}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Color Name"
                      rules={[{ required: true, message: 'Please enter color name' }]}
                    >
                      <Input placeholder="e.g., Natural Oak, Walnut, White" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="colorCode" label="Color Code (Optional)">
                      <ColorPicker 
                        showText 
                        format="hex"
                        className="w-full"
                       getValueFromEvent={(color) => color.toHexString()}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Color Image (24px circle)">
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
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
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
                              Will be displayed as 24px circle in POS
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<Icon name="add" />}>
                    Add Color
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <div>
              <Title level={5} className="mb-4">Product Colors</Title>
              
              {colors.length === 0 ? (
                <Empty
                  description="No colors added yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={colors}
                  renderItem={color => (
                    <List.Item
                      key={color.id}
                      className={`border rounded-lg p-4 mb-3 cursor-pointer transition-all ${activeColorId === color.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => {
                        setActiveColorId(color.id);
                        setActiveTab('details');
                      }}
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<Icon name="edit" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveColorId(color.id);
                            setActiveTab('details');
                          }}
                        >
                          Edit
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="Delete this color?"
                          description="This will also delete all sizes and raw materials for this color."
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            onRemoveColor(color.id);
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
                      <List.Item.Meta
                        avatar={
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-gray-300"
                              style={{ 
                                backgroundImage: color.image ? `url(${color.image})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: color.colorCode || '#f0f0f0'
                              }}
                            >
                              {!color.image && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="palette" className="text-gray-400 text-sm" />
                                </div>
                              )}
                            </div>
                          </div>
                        }
                        title={
                          <div className="flex items-center space-x-2">
                            <Text strong>{color.name}</Text>
                            <Tag color="purple">
                              {color.sizes?.length || 0} Size{(color.sizes?.length || 0) !== 1 ? 's' : ''}
                            </Tag>
                            <Tag color="orange">
                              {color.rawMaterials?.length || 0} Material{(color.rawMaterials?.length || 0) !== 1 ? 's' : ''}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <Text type="secondary">
                              Total Stock: {color.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0} units
                            </Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              Click to manage sizes and raw materials for this color
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane 
          tab={
            <span>
              <Icon name="info" className="mr-2" />
              Color Details
            </span>
          } 
          key="details"
          disabled={!activeColor}
        >
          {activeColor ? (
            <div className="space-y-6">
              <Card title={`Managing: ${activeColor.name}`} size="small" extra={
                <Button 
                  type="primary" 
                  onClick={() => setActiveTab('colors')}
                  icon={<Icon name="arrow_back" />}
                >
                  Back to Colors
                </Button>
              }>
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ 
                      backgroundImage: activeColor.image ? `url(${activeColor.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: activeColor.colorCode || '#f0f0f0'
                    }}
                  >
                    {!activeColor.image && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="palette" className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text type="secondary">Color Name:</Text>
                        <br />
                        <Text strong>{activeColor.name}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Color Code:</Text>
                        <br />
                        <Text code>{activeColor.colorCode || 'Not set'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Total Sizes:</Text>
                        <br />
                        <Text strong>{activeColor.sizes?.length || 0}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Total Stock:</Text>
                        <br />
                        <Text strong>{activeColor.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0} units</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Tabs defaultActiveKey="1">
                <Tabs.TabPane 
                  tab={
                    <span>
                      <Icon name="straighten" className="mr-2" />
                      Sizes ({activeColor.sizes?.length || 0})
                    </span>
                  } 
                  key="1"
                >
                  <div className="space-y-4">
                    <Card size="small" title="Add Size">
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
                            <Form.Item name="weight" label="Weight (kg)">
                              <InputNumber
                                min={0}
                                step={0.1}
                                placeholder="0.0"
                                className="w-full"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Dimensions">
                          <Input.Group compact>
                            <Form.Item name={['dimensions', 'length']} noStyle>
                              <InputNumber placeholder="L" className="w-1/4" min={0} />
                            </Form.Item>
                            <Form.Item name={['dimensions', 'width']} noStyle>
                              <InputNumber placeholder="W" className="w-1/4" min={0} />
                            </Form.Item>
                            <Form.Item name={['dimensions', 'height']} noStyle>
                              <InputNumber placeholder="H" className="w-1/4" min={0} />
                            </Form.Item>
                            <Form.Item name={['dimensions', 'unit']} noStyle initialValue="cm">
                              <Select className="w-1/4">
                                <Option value="cm">cm</Option>
                                <Option value="inch">inch</Option>
                              </Select>
                            </Form.Item>
                          </Input.Group>
                        </Form.Item>

                        <Form.Item>
                          <Button type="primary" htmlType="submit" icon={<Icon name="add" />}>
                            Add Size
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>

                    <div>
                      <Title level={5}>Sizes for {activeColor.name}</Title>
                      {activeColor.sizes && activeColor.sizes.length > 0 ? (
                        <Table
                          columns={sizeColumns}
                          dataSource={activeColor.sizes}
                          rowKey="id"
                          pagination={false}
                          size="small"
                        />
                      ) : (
                        <Empty
                          description="No sizes added yet"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </div>
                  </div>
                </Tabs.TabPane>
                
                <Tabs.TabPane 
                  tab={
                    <span>
                      <Icon name="category" className="mr-2" />
                      Raw Materials ({activeColor.rawMaterials?.length || 0})
                    </span>
                  } 
                  key="2"
                >
                  <div className="space-y-4">
                    <Card size="small" title="Add Raw Material">
                      <Form
                        form={materialForm}
                        layout="vertical"
                        onFinish={handleAddMaterial}
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="materialId"
                              label="Raw Material"
                              rules={[{ required: true, message: 'Please select a material' }]}
                            >
                              <Select
                                placeholder="Search and select material"
                                showSearch
                                filterOption={(input, option) =>
                                  option.children.toLowerCase().includes(input.toLowerCase())
                                }
                              >
                                {rawMaterials?.map(material => (
                                  <Option key={material.id} value={material.id}>
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
                          <Col span={8}>
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

                    <div>
                      <Title level={5}>Raw Materials for {activeColor.name}</Title>
                      {activeColor.rawMaterials && activeColor.rawMaterials.length > 0 ? (
                        <Table
                          columns={materialColumns}
                          dataSource={activeColor.rawMaterials}
                          rowKey="rawMaterialId"
                          pagination={false}
                          size="small"
                        />
                      ) : (
                        <Empty
                          description="No raw materials added yet"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>
          ) : (
            <Empty
              description="Please select a color to manage its details"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Tabs.TabPane>
      </Tabs>

      {colors.length === 0 && (
        <Alert
          message="No Colors Added"
          description="Please add at least one color for this product. Each color can have its own sizes and raw materials."
          type="info"
          showIcon
        />
      )}
    </div>
  );
}