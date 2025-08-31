import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Space, 
  Typography,
  Tag,
  Popconfirm,
  message,
  Switch,
  Tooltip
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories,
  addCategories,
  updateCategories,
  deleteCategories
} from '../../features/categories/categoriesSlice';
import { fetchProducts } from '../../features/products/productsSlice';

const { Title, Text } = Typography;

export function CategoryManagement() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const categories = useSelector(state => state.categories.categoriesList);
  const products = useSelector(state => state.products.productsList);
  const loading = useSelector(state => state.categories.loading);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = (values) => {
    const categoryData = {
      id: editingCategory?.id || `CAT-${Date.now()}`,
      name: values.name,
      description: values.description,
      isActive: values.isActive !== false,
      createdAt: editingCategory?.createdAt || new Date()
    };

    if (editingCategory) {
      dispatch(updateCategories({ categoryData }));
      message.success('Category updated successfully');
    } else {
      dispatch(addCategories({ categoryData }));
      message.success('Category added successfully');
    }

    setShowModal(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleEdit = (category) => {
    if (!hasPermission('products', 'edit')) {
      message.error('You do not have permission to edit categories');
      return;
    }
    setEditingCategory(category);
    form.setFieldsValue(category);
    setShowModal(true);
  };

  const handleDelete = (categoryId) => {
    if (!hasPermission('products', 'delete')) {
      message.error('You do not have permission to delete categories');
      return;
    }
    
    // Check if category is being used by products
    const productsUsingCategory = products.filter(p => p.category === categories.find(c => c.id === categoryId)?.name);
    if (productsUsingCategory.length > 0) {
      message.error(`Cannot delete category. It is being used by ${productsUsingCategory.length} product(s).`);
      return;
    }
    
    dispatch(deleteCategories({ categoryId }));
    message.success('Category deleted successfully');
  };

  const handleToggleStatus = (category) => {
    if (!hasPermission('products', 'edit')) {
      message.error('You do not have permission to modify categories');
      return;
    }
    const updatedCategory = { ...category, isActive: !category.isActive };
    dispatch(updateCategories({ categoryData: updatedCategory }));
    message.success(`Category ${updatedCategory.isActive ? 'activated' : 'deactivated'}`);
  };

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {getProductCount(text)} product{getProductCount(text) !== 1 ? 's' : ''}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || 'No description',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
            size="small"
            disabled={!hasPermission('products', 'edit')}
            onClick={(checked, e) => e.stopPropagation()}
          />
          <Text className="text-sm">
            {record.isActive ? 'Active' : 'Inactive'}
          </Text>
        </div>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <Tooltip title={hasPermission('products', 'edit') ? 'Edit Category' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              disabled={!hasPermission('products', 'edit')}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('products', 'delete') ? 'Delete Category' : 'No permission'}>
            <Popconfirm
              title="Delete this category?"
              description="This action cannot be undone."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!hasPermission('products', 'delete')}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                disabled={!hasPermission('products', 'delete')}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <EnhancedTable
        title="Product Categories"
        icon="category"
        columns={columns}
        dataSource={categories}
        rowKey="id"
        searchFields={['name', 'description']}
        searchPlaceholder="Search categories..."
        extra={
          hasPermission('products', 'edit') && (
            <ActionButton.Primary 
              icon="add"
              onClick={() => {
                setEditingCategory(null);
                form.resetFields();
                setShowModal(true);
              }}
            >
              Add Category
            </ActionButton.Primary>
          )
        }
        emptyDescription="No categories found"
        emptyImage={<Icon name="category" className="text-6xl text-gray-300" />}
      />

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
        submitText={editingCategory ? 'Update Category' : 'Add Category'}
        loading={loading}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Please enter category name' }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Enter category description"
          />
        </Form.Item>

        <Form.Item name="isActive" label="Active Status" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </FormModal>
    </>
  );
}