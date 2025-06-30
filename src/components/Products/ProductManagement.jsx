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
  Collapse,
  Table
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
const { Panel } = Collapse;

export function ProductManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const sizeTableColumns = [
    {
      title: 'Size',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>${price.toFixed(2)}</Text>
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock} units
        </Tag>
      )
    },
    {
      title: 'Dimensions',
      key: 'dimensions',
      render: (size) => {
        if (size.dimensions && size.dimensions.length) {
          return (
            <Text className="text-xs">
              {size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit}
            </Text>
          );
        }
        return <Text type="secondary">-</Text>;
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
                  ? `$${minPrice.toFixed(2)}`
                  : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
                }
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {record.sizes.length} sizes
              </Text>
            </div>
          );
        }
        return <Text strong>${(price || 0).toFixed(2)}</Text>;
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

      {/* Products with Sizes Expandable View */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" rows={5} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="No Products Found"
            description="No products match your search criteria"
            actionText="Add Product"
            onAction={() => setShowModal(true)}
          />
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} size="small" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRowClick(product)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=60'}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="object-cover rounded"
                    preview={false}
                  />
                  <div>
                    <Text strong className="text-lg">{product.name}</Text>
                    <br />
                    <Tag color="blue">{product.category}</Tag>
                    {product.hasSizes ? (
                      <Tag color="purple">Has {product.sizes?.length || 0} Sizes</Tag>
                    ) : (
                      <Tag color="default">Single Product</Tag>
                    )}
                    <br />
                    <Text type="secondary" className="text-sm">{product.description}</Text>
                  </div>
                </div>
                <div className="text-right">
                  <Dropdown
                    menu={{
                      items: getActionMenuItems(product)
                    }}
                    trigger={['click']}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton.Text
                      icon="more_vert"
                      className="text-blue-600 hover:text-blue-700"
                    />
                  </Dropdown>
                </div>
              </div>

              {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                <Collapse className="mt-4" size="small">
                  <Panel 
                    header={`View ${product.sizes.length} Sizes`} 
                    key="sizes"
                  >
                    <Table
                      columns={sizeTableColumns}
                      dataSource={product.sizes}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Panel>
                </Collapse>
              )}
            </Card>
          ))
        )}
      </div>
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