import React, { useState } from 'react';
import { 
  Card, 
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
  Modal,
  Table,
  Button,
  Input
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { CategoryManagement } from './CategoryManagement';
import { ProductModal } from './ProductModal';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;
const { Search } = Input;

export function ProductManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const filteredProducts = state.products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode || '').includes(searchTerm)
  );

  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
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
      label: 'Product Details Sheet',
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
      fixed: 'left',
      width: 300,
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
      width: 120,
      render: (category) => (
        <Tag color="blue">
          {category}
        </Tag>
      ),
      filters: [...new Set(state.products.map(p => p.category))].map(cat => ({
        text: cat,
        value: cat
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price, record) => {
        if (record.hasSizes && record.sizes?.length > 0) {
          const minPrice = Math.min(...record.sizes.map(s => s.price));
          const maxPrice = Math.max(...record.sizes.map(s => s.price));
          return (
            <div>
              <Text strong>
                {minPrice === maxPrice 
                  ? `LKR ${minPrice.toFixed(2)}`
                  : `LKR ${minPrice.toFixed(2)} - LKR ${maxPrice.toFixed(2)}`
                }
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {record.sizes.length} sizes
              </Text>
            </div>
          );
        }
        return <Text strong>LKR {(price || 0).toFixed(2)}</Text>;
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock, record) => {
        if (record.hasSizes && record.sizes?.length > 0) {
          const totalStock = record.sizes.reduce((sum, size) => sum + size.stock, 0);
          return (
            <div>
              <Tag color={totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red'}>
                {totalStock} total
              </Tag>
              <br />
              <Text type="secondary" className="text-xs">
                Across {record.sizes.length} sizes
              </Text>
            </div>
          );
        }
        return (
          <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
            {stock} units
          </Tag>
        );
      },
      filters: [
        { text: 'In Stock (>10)', value: 'in-stock' },
        { text: 'Low Stock (1-10)', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
      ],
      onFilter: (value, record) => {
        const stock = record.hasSizes 
          ? record.sizes.reduce((sum, size) => sum + size.stock, 0)
          : record.stock;
          
        if (value === 'in-stock') return stock > 10;
        if (value === 'low-stock') return stock > 0 && stock <= 10;
        if (value === 'out-of-stock') return stock === 0;
        return true;
      },
    },
    {
      title: 'Type',
      key: 'type',
      width: 120,
      render: (record) => {
        return record.hasSizes ? (
          <Tag color="purple">Has Sizes</Tag>
        ) : (
          <Tag color="default">Single Product</Tag>
        );
      },
      filters: [
        { text: 'Has Sizes', value: true },
        { text: 'Single Product', value: false },
      ],
      onFilter: (value, record) => record.hasSizes === value,
    },
    {
      title: 'Materials',
      key: 'materials',
      width: 120,
      render: (record) => (
        <div>
          {record.rawMaterials && record.rawMaterials.length > 0 ? (
            <Tag color="green">
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
      width: 200,
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
      fixed: 'right',
      width: 80,
      render: (record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record)
          }}
          trigger={['click']}
        >
          <ActionButton.Text
            icon="more_vert"
            className="text-blue-600 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
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
          <Text type="secondary">Manage your furniture products and sizes</Text>
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

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
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
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-blue-50'
          })}
          locale={{
            emptyText: (
              <EmptyState
                icon="inventory_2"
                title="No Products Found"
                description="No products match your search criteria"
                actionText="Add Product"
                onAction={() => setShowModal(true)}
              />
            )
          }}
        />
      )}
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
          subtitle="Manage products, sizes, and categories"
        />
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
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

      {/* Product Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        title={`Product Details - ${selectedProduct?.name}`}
        icon="inventory_2"
        data={selectedProduct}
        type="product"
        actions={[
          <ActionButton 
            key="edit" 
            icon="edit"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedProduct);
            }}
          >
            Edit Product
          </ActionButton>,
          <ActionButton 
            key="print" 
            icon="print"
            onClick={() => {
              setShowDetailModal(false);
              handlePrintProductDetails(selectedProduct);
            }}
          >
            Print Details
          </ActionButton>
        ]}
      />
    </>
  );
}