import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Typography,
  Tag,
  Image,
  Popconfirm,
  message,
  Row,
  Col,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Product, RawMaterialUsage } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function ProductManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [selectedRawMaterials, setSelectedRawMaterials] = useState<RawMaterialUsage[]>([]);

  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const handleSubmit = async (values: any) => {
    try {
      const productData: Product = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: values.name,
        price: values.price,
        category: values.category,
        stock: values.stock,
        barcode: values.barcode,
        description: values.description,
        dimensions: values.dimensions ? {
          length: values.dimensions.length,
          width: values.dimensions.width,
          height: values.dimensions.height,
          unit: values.dimensions.unit
        } : undefined,
        weight: values.weight,
        material: values.material,
        color: values.color,
        rawMaterials: selectedRawMaterials,
        image: values.image
      };

      if (editingProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
        message.success('Product updated successfully');
      } else {
        dispatch({ type: 'ADD_PRODUCT', payload: productData });
        message.success('Product added successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      setSelectedRawMaterials([]);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedRawMaterials(product.rawMaterials || []);
    form.setFieldsValue({
      ...product,
      dimensions: product.dimensions
    });
    setShowModal(true);
  };

  const handleDelete = (productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    message.success('Product deleted successfully');
  };

  const addRawMaterial = () => {
    setSelectedRawMaterials([...selectedRawMaterials, { rawMaterialId: '', quantity: 0 }]);
  };

  const updateRawMaterial = (index: number, field: keyof RawMaterialUsage, value: string | number) => {
    const updated = [...selectedRawMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedRawMaterials(updated);
  };

  const removeRawMaterial = (index: number) => {
    setSelectedRawMaterials(selectedRawMaterials.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={record.name}
            width={50}
            height={50}
            className="object-cover rounded"
            preview={false}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.description}</Text>
            <br />
            <Text type="secondary" className="text-xs">SKU: {record.barcode}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text strong>${price.toFixed(2)}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Specifications',
      key: 'specs',
      render: (record: Product) => (
        <Space direction="vertical" size="small">
          {record.dimensions && (
            <div className="flex items-center space-x-1">
              <span className="material-icons text-gray-400 text-sm">straighten</span>
              <Text className="text-xs">
                {record.dimensions.length}×{record.dimensions.width}×{record.dimensions.height} {record.dimensions.unit}
              </Text>
            </div>
          )}
          {record.material && (
            <Text className="text-xs">
              <span className="material-icons text-xs mr-1">texture</span>
              {record.material}
            </Text>
          )}
          {record.color && (
            <div className="flex items-center space-x-1">
              <span className="material-icons text-gray-400 text-sm">palette</span>
              <Text className="text-xs">{record.color}</Text>
            </div>
          )}
          {record.weight && (
            <Text className="text-xs">
              <span className="material-icons text-xs mr-1">scale</span>
              {record.weight} kg
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Product) => (
        <Space>
          <Button 
            type="text" 
            icon={<span className="material-icons">edit</span>} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<span className="material-icons">delete</span>} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <span className="material-icons text-[#0E72BD]">inventory_2</span>
          <Title level={4} className="m-0">Product Management</Title>
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Search products..."
            prefix={<span className="material-icons">search</span>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            allowClear
          />
          <Button 
            type="primary" 
            icon={<span className="material-icons">add</span>}
            onClick={() => setShowModal(true)}
          >
            Add Product
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingProduct(null);
          setSelectedRawMaterials([]);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>Basic Information</Title>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
              
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Living Room">Living Room</Option>
                  <Option value="Bedroom">Bedroom</Option>
                  <Option value="Dining Room">Dining Room</Option>
                  <Option value="Office Furniture">Office Furniture</Option>
                  <Option value="Storage">Storage</Option>
                  <Option value="Outdoor">Outdoor</Option>
                </Select>
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price ($)"
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label="Stock"
                    rules={[{ required: true, message: 'Please enter stock' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="barcode" label="Barcode/SKU">
                <Input placeholder="Enter barcode or SKU" />
              </Form.Item>

              <Form.Item name="image" label="Image URL">
                <Input placeholder="Enter image URL" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Title level={5}>Physical Properties</Title>
              
              <Form.Item label="Dimensions">
                <Input.Group compact>
                  <Form.Item name={['dimensions', 'length']} noStyle>
                    <InputNumber placeholder="Length" className="w-1/4" />
                  </Form.Item>
                  <Form.Item name={['dimensions', 'width']} noStyle>
                    <InputNumber placeholder="Width" className="w-1/4" />
                  </Form.Item>
                  <Form.Item name={['dimensions', 'height']} noStyle>
                    <InputNumber placeholder="Height" className="w-1/4" />
                  </Form.Item>
                  <Form.Item name={['dimensions', 'unit']} noStyle>
                    <Select placeholder="Unit" className="w-1/4">
                      <Option value="cm">cm</Option>
                      <Option value="inch">inch</Option>
                    </Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Row gutter={8}>
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
                  <Form.Item name="color" label="Color">
                    <Input placeholder="Enter color" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="material" label="Material">
                <Input placeholder="Enter material type" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea
                  rows={3}
                  placeholder="Enter product description"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div>
            <div className="flex items-center justify-between mb-4">
              <Title level={5}>Raw Materials Required</Title>
              <Button
                type="dashed"
                icon={<span className="material-icons">add</span>}
                onClick={addRawMaterial}
              >
                Add Material
              </Button>
            </div>
            
            <Space direction="vertical" className="w-full">
              {selectedRawMaterials.map((usage, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <Select
                    value={usage.rawMaterialId}
                    onChange={(value) => updateRawMaterial(index, 'rawMaterialId', value)}
                    placeholder="Select Raw Material"
                    className="flex-1"
                  >
                    {state.rawMaterials.map(material => (
                      <Option key={material.id} value={material.id}>
                        {material.name} ({material.unit})
                      </Option>
                    ))}
                  </Select>
                  <InputNumber
                    value={usage.quantity}
                    onChange={(value) => updateRawMaterial(index, 'quantity', value || 0)}
                    placeholder="Quantity"
                    min={0}
                    className="w-24"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<span className="material-icons">delete</span>}
                    onClick={() => removeRawMaterial(index)}
                  />
                </div>
              ))}
            </Space>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}