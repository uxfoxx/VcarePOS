import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Table, 
  InputNumber, 
  Select, 
  Upload, 
  Popconfirm,
  message,
  Row,
  Col,
  Card,
  Tabs,
  ColorPicker
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Option } = Select;

export function ColorEditor({
  color,
  onUpdate,
  onAddSize,
  onRemoveSize,
  onAddMaterial,
  onRemoveMaterial,
  rawMaterials = []
}) {
  const [sizeForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(color?.image || null);

  const handleColorUpdate = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setImagePreview(imageUrl);
      onUpdate({ image: imageUrl });
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleAddSize = (values) => {
    const sizeData = {
      name: values.name,
      price: values.price,
      stock: values.stock,
      weight: values.weight || 0,
      dimensions: values.dimensions || {}
    };
    
    onAddSize(sizeData);
    sizeForm.resetFields();
    message.success('Size added successfully');
  };

  const handleAddMaterial = (values) => {
    const material = rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    const materialData = {
      rawMaterialId: values.materialId,
      quantity: values.quantity,
      name: material.name,
      unit: material.unit,
      unitPrice: material.unitPrice || 0
    };
    
    onAddMaterial(materialData);
    materialForm.resetFields();
    message.success('Material added successfully');
  };

  const sizeColumns = [
    {
      title: 'Size Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `LKR ${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this size?"
          onConfirm={() => onRemoveSize(record.id)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const materialColumns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => `${record.quantity || 0} ${record.unit || 'unit'}`,
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `LKR ${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Total Cost',
      key: 'totalCost',
      render: (record) => `LKR ${((record.quantity || 0) * (record.unitPrice || 0)).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this material?"
          onConfirm={() => onRemoveMaterial(record.rawMaterialId)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="palette" />
          <span>Color Details</span>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Color Name:</Text>
                <Input
                  value={color?.name || ''}
                  onChange={(e) => handleColorUpdate('name', e.target.value)}
                  placeholder="e.g., Red, Blue, Walnut"
                  className="mt-1"
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Color Code:</Text>
                <div className="mt-1">
                  <ColorPicker
                    value={color?.colorCode || '#000000'}
                    onChange={(colorObj) => handleColorUpdate('colorCode', colorObj.toHexString())}
                    showText
                    className="w-full"
                  />
                </div>
              </div>
            </Col>
          </Row>

          <div>
            <Text strong>Color-Specific Image:</Text>
            <Upload
              accept="image/*"
              beforeUpload={handleImageUpload}
              showUploadList={false}
              maxCount={1}
              className="mt-1"
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
                      <Text>Click to upload color-specific image</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        Optional: Image showing this product in this color
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Upload>
          </div>
        </div>
      )
    },
    {
      key: 'sizes',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="straighten" />
          <span>Sizes ({color?.sizes?.length || 0})</span>
        </span>
      ),
      children: (
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

          {color?.sizes?.length > 0 ? (
            <Table
              columns={sizeColumns}
              dataSource={color.sizes}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon name="straighten" className="text-4xl text-gray-300 mb-2" />
              <Text type="secondary">No sizes added for this color</Text>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'materials',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="category" />
          <span>Raw Materials ({color?.rawMaterials?.length || 0})</span>
        </span>
      ),
      children: (
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

          {color?.rawMaterials?.length > 0 ? (
            <Table
              columns={[
                {
                  title: 'Material',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Quantity',
                  key: 'quantity',
                  render: (record) => `${record.quantity || 0} ${record.unit || 'unit'}`,
                },
                {
                  title: 'Unit Cost',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price) => `LKR ${(price || 0).toFixed(2)}`,
                },
                {
                  title: 'Total Cost',
                  key: 'totalCost',
                  render: (record) => `LKR ${((record.quantity || 0) * (record.unitPrice || 0)).toFixed(2)}`,
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (record) => (
                    <Popconfirm
                      title="Remove this material?"
                      onConfirm={() => onRemoveMaterial(record.rawMaterialId)}
                    >
                      <Button type="text" danger icon={<Icon name="delete" />} size="small" />
                    </Popconfirm>
                  ),
                },
              ]}
              dataSource={color.rawMaterials}
              rowKey="rawMaterialId"
              pagination={false}
              size="small"
            />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon name="category" className="text-4xl text-gray-300 mb-2" />
              <Text type="secondary">No raw materials added for this color</Text>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Basic Color Info */}
      <Row gutter={16}>
        <Col span={8}>
          <div>
            <Text strong>Color Name:</Text>
            <Input
              value={color?.name || ''}
              onChange={(e) => handleColorUpdate('name', e.target.value)}
              placeholder="e.g., Red, Blue, Walnut"
              className="mt-1"
            />
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text strong>Color Code:</Text>
            <div className="mt-1">
              <ColorPicker
                value={color?.colorCode || '#000000'}
                onChange={(colorObj) => handleColorUpdate('colorCode', colorObj.toHexString())}
                showText
                className="w-full"
              />
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text strong>Color Image:</Text>
            <Upload
              accept="image/*"
              beforeUpload={handleImageUpload}
              showUploadList={false}
              maxCount={1}
              className="mt-1"
            >
              <Button icon={<Icon name="upload" />} className="w-full">
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
            </Upload>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Color preview" 
                  className="w-16 h-16 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Sizes and Materials Tabs */}
      <Tabs items={tabItems} />
    </div>
  );
}