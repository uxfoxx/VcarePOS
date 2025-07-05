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
  Switch,
  Empty,
  Tag,
  Collapse,
  Upload,
  Alert
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

export function VariantManagementPanel({
  variants = [],
  rawMaterials = [],
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
  onAddVariantSize,
  onRemoveVariantSize,
  onAddVariantMaterial,
  onRemoveVariantMaterial
}) {
  const [variantForm] = Form.useForm();
  const [sizeForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [activeTab, setActiveTab] = useState('variants');
  const [variantHasSizes, setVariantHasSizes] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAddVariant = (values) => {
    const newVariant = {
      name: values.name,
      description: values.description || '',
      price: values.price || 0,
      stock: values.stock || 0,
      sku: values.sku || '',
      color: values.color || '',
      material: values.material || '',
      image: imagePreview || '',
      hasSizes: variantHasSizes,
      isActive: true
    };
    
    onAddVariant(newVariant);
    variantForm.resetFields();
    setImagePreview(null);
    setVariantHasSizes(false);
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
    if (!activeVariantId) {
      message.error('Please select a variant first');
      return;
    }
    
    const sizeData = {
      name: values.name,
      price: values.price,
      stock: values.stock,
      dimensions: values.dimensions || {},
      weight: values.weight || 0
    };
    
    onAddVariantSize(activeVariantId, sizeData);
    sizeForm.resetFields();
  };

  const handleAddMaterial = (values) => {
    if (!activeVariantId) {
      message.error('Please select a variant first');
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
    
    onAddVariantMaterial(activeVariantId, materialData);
    materialForm.resetFields();
  };

  const getActiveVariant = () => {
    return variants.find(v => v.id === activeVariantId);
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
          onConfirm={() => onRemoveVariantMaterial(activeVariantId, record.rawMaterialId)}
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `LKR ${price.toFixed(2)}`
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
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this size?"
          onConfirm={() => onRemoveVariantSize(activeVariantId, record.id)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const activeVariant = getActiveVariant();

  return (
    <div className="space-y-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <Icon name="style" className="mr-2" />
              Variants
            </span>
          } 
          key="variants"
        >
          <div className="space-y-6">
            <Card title="Add New Variant" size="small">
              <Form
                form={variantForm}
                layout="vertical"
                onFinish={handleAddVariant}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Variant Name"
                      rules={[{ required: true, message: 'Please enter variant name' }]}
                    >
                      <Input placeholder="e.g., Blue, Oak Wood, etc." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="sku" label="SKU/Barcode">
                      <Input placeholder="Enter SKU or leave blank for auto-generation" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="price" label="Price (LKR)">
                      <InputNumber
                        min={0}
                        step={100}
                        placeholder="0.00"
                        className="w-full"
                        formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="stock" label="Stock">
                      <InputNumber
                        min={0}
                        placeholder="0"
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="color" label="Color">
                      <Input placeholder="e.g., Blue, Red, etc." />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="material" label="Material">
                      <Input placeholder="e.g., Oak Wood, Metal, etc." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center space-x-2 mt-8">
                      <Switch
                        checked={variantHasSizes}
                        onChange={setVariantHasSizes}
                      />
                      <Text>This variant has different sizes</Text>
                    </div>
                  </Col>
                </Row>

                <Form.Item name="description" label="Description">
                  <TextArea
                    rows={2}
                    placeholder="Enter variant description"
                  />
                </Form.Item>

                <Form.Item label="Variant Image">
                  <Upload
                    accept="image/*"
                    beforeUpload={handleImageUpload}
                    showUploadList={false}
                    maxCount={1}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover mx-auto rounded"
                          />
                          <div>
                            <Button icon={<Icon name="upload" />} size="small">
                              Change Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Icon name="cloud_upload" className="text-3xl text-gray-400" />
                          <div>
                            <Text>Click to upload variant image</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              Optional: Specific image for this variant
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<Icon name="add" />}>
                    Add Variant
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <div>
              <Title level={5} className="mb-4">Product Variants ({variants.length})</Title>
              
              {variants.length === 0 ? (
                <Empty
                  description="No variants added yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={variants}
                  renderItem={variant => (
                    <List.Item
                      key={variant.id}
                      className={`border rounded-lg p-4 mb-3 ${activeVariantId === variant.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<Icon name="edit" />}
                          onClick={() => {
                            setActiveVariantId(variant.id);
                            setActiveTab('details');
                          }}
                        >
                          Edit
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="Delete this variant?"
                          onConfirm={() => onRemoveVariant(variant.id)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Icon name="delete" />}
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          variant.image ? (
                            <img 
                              src={variant.image} 
                              alt={variant.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Icon name="style" className="text-gray-500" />
                            </div>
                          )
                        }
                        title={
                          <div className="flex items-center space-x-2">
                            <Text strong>{variant.name}</Text>
                            {variant.hasSizes && (
                              <Tag color="purple">
                                {variant.sizes?.length || 0} Sizes
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <Text type="secondary">{variant.description}</Text>
                            <div className="mt-1">
                              <Tag color="blue">LKR {variant.price?.toFixed(2) || '0.00'}</Tag>
                              <Tag color={variant.stock > 10 ? 'green' : variant.stock > 0 ? 'orange' : 'red'}>
                                Stock: {variant.stock || 0}
                              </Tag>
                              {variant.color && (
                                <Tag color="default">{variant.color}</Tag>
                              )}
                              {variant.material && (
                                <Tag color="default">{variant.material}</Tag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <Icon name="info" className="mr-2" />
              Variant Details
            </span>
          } 
          key="details"
          disabled={!activeVariant}
        >
          {activeVariant ? (
            <div className="space-y-6">
              <Card title={`Variant: ${activeVariant.name}`} size="small" extra={
                <Button 
                  type="primary" 
                  onClick={() => setActiveTab('variants')}
                  icon={<Icon name="arrow_back" />}
                >
                  Back to Variants
                </Button>
              }>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    {activeVariant.image ? (
                      <img 
                        src={activeVariant.image} 
                        alt={activeVariant.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="style" className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text type="secondary">Price:</Text>
                        <br />
                        <Text strong>LKR {activeVariant.price?.toFixed(2) || '0.00'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Stock:</Text>
                        <br />
                        <Text strong>{activeVariant.stock || 0} units</Text>
                      </div>
                      <div>
                        <Text type="secondary">SKU:</Text>
                        <br />
                        <Text code>{activeVariant.sku || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Has Sizes:</Text>
                        <br />
                        <Tag color={activeVariant.hasSizes ? 'green' : 'default'}>
                          {activeVariant.hasSizes ? 'Yes' : 'No'}
                        </Tag>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Text type="secondary">Description:</Text>
                      <br />
                      <Text>{activeVariant.description || 'No description'}</Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Tabs defaultActiveKey="1">
                <TabPane 
                  tab={
                    <span>
                      <Icon name="aspect_ratio" className="mr-2" />
                      Sizes
                    </span>
                  } 
                  key="1"
                >
                  {activeVariant.hasSizes ? (
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
                                name="price"
                                label="Price (LKR)"
                                rules={[{ required: true, message: 'Please enter price' }]}
                              >
                                <InputNumber
                                  min={0.01}
                                  step={100}
                                  placeholder="0.00"
                                  className="w-full"
                                  formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name="stock"
                                label="Stock"
                                rules={[{ required: true, message: 'Please enter stock' }]}
                              >
                                <InputNumber
                                  min={0}
                                  placeholder="0"
                                  className="w-full"
                                  step={1}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="weight" label="Weight (kg)">
                                <InputNumber
                                  min={0}
                                  step={0.1}
                                  placeholder="0.0"
                                  className="w-full"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
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
                            </Col>
                          </Row>

                          <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<Icon name="add" />}>
                              Add Size
                            </Button>
                          </Form.Item>
                        </Form>
                      </Card>

                      <div>
                        <Title level={5}>Sizes for {activeVariant.name}</Title>
                        {activeVariant.sizes && activeVariant.sizes.length > 0 ? (
                          <Table
                            columns={sizeColumns}
                            dataSource={activeVariant.sizes}
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
                  ) : (
                    <Alert
                      message="Sizes Not Enabled"
                      description={`Sizes are not enabled for the "${activeVariant.name}" variant. If you want to add sizes, please edit the variant and enable the size option.`}
                      type="info"
                      showIcon
                    />
                  )}
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <Icon name="category" className="mr-2" />
                      Raw Materials
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
                      <Title level={5}>Raw Materials for {activeVariant.name}</Title>
                      {activeVariant.rawMaterials && activeVariant.rawMaterials.length > 0 ? (
                        <Table
                          columns={materialColumns}
                          dataSource={activeVariant.rawMaterials}
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
                </TabPane>
              </Tabs>
            </div>
          ) : (
            <Empty
              description="Please select a variant to view details"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}