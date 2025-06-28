import React, { useState } from 'react';
import { 
  Table, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Typography,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  ColorPicker,
  Card
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { FormModal } from '../common/FormModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function CategoryManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const categories = state.categories || [];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      const categoryData = {
        id: editingCategory?.id || `CAT-${Date.now()}`,
        name: values.name,
        description: values.description,
        color: values.color || 'blue',
        icon: values.icon || 'category',
        isActive: values.isActive !== false,
        createdAt: editingCategory?.createdAt || new Date()
      };

      if (editingCategory) {
        dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData });
        message.success('Category updated successfully');
      } else {
        dispatch({ type: 'ADD_CATEGORY', payload: categoryData });
        message.success('Category added successfully');
      }

      setShowModal(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setShowModal(true);
  };

  const handleDelete = (categoryId) => {
    // Check if category is being used by any products
    const productsUsingCategory = state.products.filter(product => 
      product.category === categories.find(cat => cat.id === categoryId)?.name
    );

    if (productsUsingCategory.length > 0) {
      message.error(`Cannot delete category. ${productsUsingCategory.length} product(s) are using this category.`);
      return;
    }

    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    message.success('Category deleted successfully');
  };

  const getProductCount = (categoryName) => {
    return state.products.filter(product => product.category === categoryName).length;
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: record.color }}
          >
            <Icon name={record.icon || 'category'} />
          </div>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.description}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Products',
      key: 'productCount',
      render: (record) => {
        const count = getProductCount(record.name);
        return (
          <Tag color={count > 0 ? 'green' : 'default'}>
            {count} product{count !== 1 ? 's' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <ActionButton.Text 
            icon="edit"
            onClick={() => handleEdit(record)}
            className="text-[#0E72BD]"
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            description={getProductCount(record.name) > 0 ? 
              `This category has ${getProductCount(record.name)} product(s). Please reassign them first.` : 
              'This action cannot be undone.'
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={getProductCount(record.name) > 0}
          >
            <ActionButton.Text 
              icon="delete"
              danger
              disabled={getProductCount(record.name) > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Title level={5} className="m-0">Product Categories</Title>
            <Text type="secondary">Organize your products into categories</Text>
          </div>
          <Space>
            <SearchInput
              placeholder="Search categories..."
              value={searchTerm}
              onSearch={setSearchTerm}
              className="w-64"
            />
            <ActionButton.Primary 
              icon="add"
              onClick={() => setShowModal(true)}
            >
              Add Category
            </ActionButton.Primary>
          </Space>
        </div>

        {/* Category Stats */}
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0E72BD]">{categories.length}</div>
                <div className="text-sm text-gray-500">Total Categories</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(cat => cat.isActive).length}
                </div>
                <div className="text-sm text-gray-500">Active Categories</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {state.products.length}
                </div>
                <div className="text-sm text-gray-500">Total Products</div>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </div>

      <FormModal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={600}
        submitText={editingCategory ? 'Update Category' : 'Add Category'}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Category Name"
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input placeholder="e.g., Tables, Chairs" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="icon"
              label="Icon"
              initialValue="category"
            >
              <Input 
                placeholder="Material icon name"
                addonBefore={<Icon name={form.getFieldValue('icon') || 'category'} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="color"
          label="Category Color"
          initialValue="#0E72BD"
        >
          <ColorPicker 
            showText 
            format="hex"
            presets={[
              {
                label: 'Recommended',
                colors: [
                  '#0E72BD',
                  '#52c41a',
                  '#fa8c16',
                  '#f5222d',
                  '#722ed1',
                  '#13c2c2',
                  '#eb2f96',
                  '#1890ff'
                ]
              }
            ]}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Enter category description"
          />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
          <div className="flex items-center space-x-2">
            <input type="checkbox" />
            <Text>Active</Text>
          </div>
        </Form.Item>
      </FormModal>
    </>
  );
}