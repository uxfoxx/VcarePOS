import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Space, 
  Typography,
  Tag,
  Image,
  Popconfirm,
  message,
  Row,
  Col,
  Dropdown,
  Tabs,
  Modal
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { CategoryManagement } from './CategoryManagement';
import { ProductModal } from './ProductModal';

const { Title, Text } = Typography;

export function ProductManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);

  const filteredProducts = state.products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode || '').includes(searchTerm)
  );

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
        message.success('Product updated successfully');
      } else {
        dispatch({ type: 'ADD_PRODUCT', payload: productData });
        message.success('Product added successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      message.error('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    message.success('Product deleted successfully');
  };

  const handlePrintProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductSheet(true);
  };

  const getActionMenuItems = (record) => [
    {
      key: 'edit',
      icon: <Icon name="edit" />,
      label: 'Edit Product',
      onClick: () => handleEdit(record)
    },
    {
      key: 'print',
      icon: <Icon name="print" />,
      label: 'Print Details Sheet',
      onClick: () => handlePrintProductDetails(record)
    },
    {
      key: 'delete',
      icon: <Icon name="delete" />,
      label: 'Delete Product',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Are you sure you want to delete this product?',
          content: 'This action cannot be undone.',
          onOk: () => handleDelete(record.id),
          okText: 'Yes, Delete',
          cancelText: 'Cancel',
          okType: 'danger'
        });
      }
    }
  ];

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
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
      render: (category) => {
        const categoryData = state.categories?.find(cat => cat.name === category);
        return (
          <Tag color="blue">
            {category}
          </Tag>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>${price.toFixed(2)}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Materials',
      key: 'materials',
      render: (record) => (
        <div>
          {record.rawMaterials && record.rawMaterials.length > 0 ? (
            <Tag color="purple">
              {record.rawMaterials.length} material{record.rawMaterials.length !== 1 ? 's' : ''}
            </Tag>
          ) : (
            <Text type="secondary" className="text-xs">No materials</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Specifications',
      key: 'specs',
      render: (record) => (
        <Space direction="vertical" size="small">
          {record.dimensions && (
            <div className="flex items-center space-x-1">
              <Icon name="straighten" className="text-gray-400" size="text-sm" />
              <Text className="text-xs">
                {record.dimensions.length}×{record.dimensions.width}×{record.dimensions.height} {record.dimensions.unit}
              </Text>
            </div>
          )}
          {record.material && (
            <Text className="text-xs">
              <Icon name="texture" size="text-xs" className="mr-1" />
              {record.material}
            </Text>
          )}
          {record.color && (
            <div className="flex items-center space-x-1">
              <Icon name="palette" className="text-gray-400" size="text-sm" />
              <Text className="text-xs">{record.color}</Text>
            </div>
          )}
          {record.weight && (
            <Text className="text-xs">
              <Icon name="scale" size="text-xs" className="mr-1" />
              {record.weight} kg
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record)
          }}
          trigger={['click']}
        >
          <ActionButton.Text
            icon="more_vert"
            className="text-[#0E72BD] hover:text-blue-700"
          />
        </Dropdown>
      ),
    },
  ];

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title level={5} className="m-0">Product Inventory</Title>
          <Text type="secondary">Manage your furniture products</Text>
        </div>
        <Space>
          <SearchInput
            placeholder="Search products..."
            value={searchTerm}
            onSearch={setSearchTerm}
            className="w-64"
          />
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowModal(true)}
          >
            Add Product
          </ActionButton.Primary>
        </Space>
      </div>
      
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
    </div>
  );

  const tabItems = [
    {
      key: 'products',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="inventory_2" />
          <span>Products</span>
        </span>
      ),
      children: renderProductsTab()
    },
    {
      key: 'categories',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="category" />
          <span>Categories</span>
        </span>
      ),
      children: <CategoryManagement />
    }
  ];

  return (
    <>
      <Card>
        <PageHeader
          title="Product Management"
          icon="inventory_2"
          subtitle="Manage products and categories"
        />
        
        <Tabs
          items={tabItems}
          defaultActiveKey="products"
          className="mt-4"
        />
      </Card>

      <ProductModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />

      {/* Product Details Sheet Modal */}
      <ProductDetailsSheet
        open={showProductSheet}
        onClose={() => {
          setShowProductSheet(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
}