import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Table, 
  Input, 
  Space, 
  Form, 
  Typography,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Card,
  Switch
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { FormModal } from '../common/FormModal';
import { fetchCategories, addCategories, updateCategories, deleteCategories } from '../../features/categories/categoriesSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function CategoryManagement() {
  const { state, dispatch } = usePOS();
  const dispatch2 = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const {categoriesList, error} = useSelector(state => state.categories);

  useEffect(() => { dispatch2(fetchCategories()); }, [dispatch2]);

  const categories = categoriesList || [];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      // Check for duplicate category names
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === values.name.toLowerCase() && 
        cat.id !== editingCategory?.id
      );

      if (existingCategory) {
        message.error('Category name already exists');
        return;
      }

      const categoryData = {
        id: editingCategory?.id || `CAT-${Date.now()}`,
        name: values.name,
        description: values.description,
        isActive: values.isActive !== false,
        createdAt: editingCategory?.createdAt || new Date()
      };

      if (editingCategory) {
        dispatch2(updateCategories({categoryData}));
        // dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData });
        message.success('Category updated successfully');
      } else {
        dispatch2(addCategories({categoryData}));
        // dispatch({ type: 'ADD_CATEGORY', payload: categoryData });
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
    console.log("category modal",category)
    setEditingCategory(category);
    form.setFieldsValue(category);
    setShowModal(true);
  };

  const handleDelete = (categoryId) => {
    // Check if category is being used by any products
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const productsUsingCategory = state.products.filter(product => 
      product.category === categoryToDelete?.name
    );

    if (productsUsingCategory.length > 0) {
      message.error(`Cannot delete category. ${productsUsingCategory.length} product(s) are using this category.`);
      return;
    }

    dispatch2(deleteCategories({categoryId}));
    // dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    message.success('Category deleted successfully');
  };

  const handleToggleStatus = (category) => {
    const updatedCategory = { ...category, isActive: !category.isActive };
    dispatch2(updateCategories({categoryData:updatedCategory}));
    // dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
    message.success(`Category ${updatedCategory.isActive ? 'activated' : 'deactivated'}`);
  };

  const getProductCount = (categoryName) => {
    return state.products.filter(product => product.category === categoryName).length;
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong className="text-base">{record.name}</Text>
          <br />
          <Text type="secondary" className="text-sm">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Products',
      key: 'productCount',
      render: (record) => {
        const count = getProductCount(record.name);
        return (
          <Tag color={count > 0 ? 'blue' : 'default'}>
            {count} product{count !== 1 ? 's' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record)}
          size="small"
        />
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
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { min: 2, message: 'Category name must be at least 2 characters' },
            { max: 50, message: 'Category name must be less than 50 characters' }
          ]}
        >
          <Input placeholder="e.g., Tables, Chairs, Storage" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Description"
          rules={[
            { max: 200, message: 'Description must be less than 200 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter category description (optional)"
          />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </FormModal>
    </>
  );
}