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
  Alert,
  Popconfirm,
  message,
  Row,
  Col
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { RawMaterial } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RawMaterialManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [form] = Form.useForm();

  const categories = ['All', ...new Set(state.rawMaterials.map(m => m.category))];
  
  const filteredMaterials = state.rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockMaterials = state.rawMaterials.filter(m => m.stockQuantity <= m.minimumStock);

  const handleSubmit = async (values: any) => {
    try {
      const materialData: RawMaterial = {
        id: editingMaterial?.id || `RM-${Date.now()}`,
        name: values.name,
        category: values.category,
        unit: values.unit,
        stockQuantity: values.stockQuantity,
        unitPrice: values.unitPrice,
        supplier: values.supplier,
        minimumStock: values.minimumStock,
        description: values.description,
      };

      if (editingMaterial) {
        dispatch({ type: 'UPDATE_RAW_MATERIAL', payload: materialData });
        message.success('Raw material updated successfully');
      } else {
        dispatch({ type: 'ADD_RAW_MATERIAL', payload: materialData });
        message.success('Raw material added successfully');
      }

      setShowModal(false);
      setEditingMaterial(null);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setShowModal(true);
  };

  const handleDelete = (materialId: string) => {
    dispatch({ type: 'DELETE_RAW_MATERIAL', payload: materialId });
    message.success('Raw material deleted successfully');
  };

  const columns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RawMaterial) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
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
      title: 'Stock',
      key: 'stock',
      render: (record: RawMaterial) => (
        <div>
          <Text strong>{record.stockQuantity} {record.unit}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Min: {record.minimumStock} {record.unit}
          </Text>
        </div>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => <Text strong>${price.toFixed(2)}</Text>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: RawMaterial) => {
        const isLowStock = record.stockQuantity <= record.minimumStock;
        const isMediumStock = record.stockQuantity <= record.minimumStock * 2;
        
        return (
          <Tag color={isLowStock ? 'red' : isMediumStock ? 'orange' : 'green'}>
            {isLowStock ? 'Low Stock' : isMediumStock ? 'Medium Stock' : 'In Stock'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: RawMaterial) => (
        <Space>
          <Button 
            type="text" 
            icon={<span className="material-icons">edit</span>} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this raw material?"
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
    <Space direction="vertical" size="large" className="w-full">
      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={
            <div>
              <Text>{lowStockMaterials.length} material(s) are running low on stock:</Text>
              <div className="mt-2 flex flex-wrap gap-1">
                {lowStockMaterials.map(material => (
                  <Tag key={material.id} color="red" className="mb-1">
                    {material.name} ({material.stockQuantity} {material.unit} left)
                  </Tag>
                ))}
              </div>
            </div>
          }
          type="warning"
          icon={<span className="material-icons">warning</span>}
          showIcon
        />
      )}

      <Card 
        title={
          <Space>
            <span className="material-icons text-[#0E72BD]">category</span>
            <Title level={4} className="m-0">Raw Materials Management</Title>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search raw materials..."
              prefix={<span className="material-icons">search</span>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-40"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Button 
              type="primary" 
              icon={<span className="material-icons">add</span>}
              onClick={() => setShowModal(true)}
            >
              Add Raw Material
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredMaterials}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      <Modal
        title={editingMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingMaterial(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
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
              <Form.Item
                name="name"
                label="Material Name"
                rules={[{ required: true, message: 'Please enter material name' }]}
              >
                <Input placeholder="Enter material name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Wood">Wood</Option>
                  <Option value="Hardware">Hardware</Option>
                  <Option value="Upholstery">Upholstery</Option>
                  <Option value="Finishing">Finishing</Option>
                  <Option value="Metal">Metal</Option>
                  <Option value="Fabric">Fabric</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="sq ft">Square Feet</Option>
                  <Option value="pieces">Pieces</Option>
                  <Option value="kg">Kilograms</Option>
                  <Option value="liters">Liters</Option>
                  <Option value="meters">Meters</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="Unit Price ($)"
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stockQuantity"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minimumStock"
                label="Minimum Stock"
                rules={[{ required: true, message: 'Please enter minimum stock' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="supplier" label="Supplier">
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter description"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingMaterial ? 'Update' : 'Add'} Material
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
}