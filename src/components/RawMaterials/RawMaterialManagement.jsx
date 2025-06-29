import React, { useState } from 'react';
import { 
  Card, 
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
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RawMaterialManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const materialData = {
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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setShowModal(true);
  };

  const handleDelete = (materialId) => {
    dispatch({ type: 'DELETE_RAW_MATERIAL', payload: materialId });
    message.success('Raw material deleted successfully');
  };

  const handleRowClick = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const columns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: categories.filter(cat => cat !== 'All').map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 150,
      render: (record) => (
        <div>
          <Text strong>{record.stockQuantity} {record.unit}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Min: {record.minimumStock} {record.unit}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price) => <Text strong>${price.toFixed(2)}</Text>,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      sorter: (a, b) => (a.supplier || '').localeCompare(b.supplier || ''),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => {
        const isLowStock = record.stockQuantity <= record.minimumStock;
        const isMediumStock = record.stockQuantity <= record.minimumStock * 2;
        
        return (
          <Tag color={isLowStock ? 'red' : isMediumStock ? 'orange' : 'green'}>
            {isLowStock ? 'Low Stock' : isMediumStock ? 'Medium Stock' : 'In Stock'}
          </Tag>
        );
      },
      filters: [
        { text: 'In Stock', value: 'in-stock' },
        { text: 'Medium Stock', value: 'medium-stock' },
        { text: 'Low Stock', value: 'low-stock' },
      ],
      onFilter: (value, record) => {
        const isLowStock = record.stockQuantity <= record.minimumStock;
        const isMediumStock = record.stockQuantity <= record.minimumStock * 2;
        
        if (value === 'low-stock') return isLowStock;
        if (value === 'medium-stock') return isMediumStock && !isLowStock;
        if (value === 'in-stock') return !isMediumStock;
        return true;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <ActionButton.Text 
            icon="edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            className="text-blue-600"
          />
          <Popconfirm
            title="Are you sure you want to delete this raw material?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton.Text 
              icon="delete"
              danger
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

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
          icon={<Icon name="warning" />}
          showIcon
        />
      )}

      <EnhancedTable
        title="Raw Materials Management"
        icon="category"
        subtitle="Manage raw materials inventory and suppliers"
        columns={columns}
        dataSource={filteredMaterials}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['name', 'category', 'supplier']}
        searchPlaceholder="Search raw materials..."
        extra={
          <Space>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-40"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <ActionButton.Primary 
              icon="add"
              onClick={() => setShowModal(true)}
            >
              Add Raw Material
            </ActionButton.Primary>
          </Space>
        }
        emptyDescription="No raw materials found"
        emptyImage={<Icon name="category" className="text-6xl text-gray-300" />}
      />

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
            <ActionButton onClick={() => setShowModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              {editingMaterial ? 'Update' : 'Add'} Material
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Raw Material Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMaterial(null);
        }}
        title={`Raw Material Details - ${selectedMaterial?.name}`}
        icon="category"
        data={selectedMaterial}
        type="rawMaterial"
        actions={[
          <ActionButton 
            key="edit" 
            icon="edit"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedMaterial);
            }}
          >
            Edit Material
          </ActionButton>
        ]}
      />
    </Space>
  );
}