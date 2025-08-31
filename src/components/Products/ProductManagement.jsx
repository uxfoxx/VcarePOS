import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Tabs
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { ProductModal } from './ProductModal';
import { CategoryManagement } from './CategoryManagement';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ExportModal } from '../common/ExportModal';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, 
  deleteProducts, 
  updateProduct, 
  addProduct 
} from '../../features/products/productsSlice';
import { fetchRawMaterials } from '../../features/rawMaterials/rawMaterialsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';

const { Title, Text } = Typography;

export function ProductManagement() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const products = useSelector(state => state.products.productsList);
  const rawMaterials = useSelector(state => state.rawMaterials.rawMaterialsList);
  const categories = useSelector(state => state.categories.categoriesList);
  const loading = useSelector(state => state.products.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchRawMaterials());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (productData) => {
    if (editingProduct) {
      dispatch(updateProduct(productData));
      message.success('Product updated successfully');
    } else {
      dispatch(addProduct(productData));
      message.success('Product added successfully');
    }
    return Promise.resolve(productData);
  };

  const handleEdit = (product) => {
    if (!hasPermission('products', 'edit')) {
      message.error('You do not have permission to edit products');
      return;
    }
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (!hasPermission('products', 'delete')) {
      message.error('You do not have permission to delete products');
      return;
    }
    dispatch(deleteProducts({ productId }));
    message.success('Product deleted successfully');
  };

  const handleBulkDelete = (productIds) => {
    if (!hasPermission('products', 'delete')) {
      message.error('You do not have permission to delete products');
      return;
    }
    productIds.forEach(id => {
      dispatch(deleteProducts({ productId: id }));
    });
    message.success(`${productIds.length} products deleted successfully`);
    setSelectedRowKeys([]);
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleShowProductSheet = (product) => {
    setSelectedProduct(product);
    setShowProductSheet(true);
  };

  const getStockStatus = (product) => {
    if (product.stock <= 0) {
      return product.allowPreorder ? 'pre-order' : 'out-of-stock';
    } else if (product.stock <= 5) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'in-stock': return 'green';
      case 'low-stock': return 'orange';
      case 'out-of-stock': return 'red';
      case 'pre-order': return 'blue';
      default: return 'default';
    }
  };

  const getStockText = (product) => {
    const status = getStockStatus(product);
    switch (status) {
      case 'in-stock': return `${product.stock} in stock`;
      case 'low-stock': return `${product.stock} left`;
      case 'out-of-stock': return 'Out of stock';
      case 'pre-order': return 'Pre-order available';
      default: return `${product.stock} units`;
    }
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      fixed: 'left',
      width: 300,
      render: (record) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={record.name}
            width={50}
            height={50}
            className="object-cover rounded"
            preview={false}
            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />
          <div className="flex-1">
            <Text strong className="block">{record.name}</Text>
            <Text type="secondary" className="text-xs block">
              SKU: {record.barcode || 'N/A'}
            </Text>
            <Tag color="blue" size="small" className="mt-1">
              {record.category}
            </Tag>
            {record.colors && record.colors.length > 0 && (
              <Tag color="purple" size="small" className="mt-1">
                {record.colors.length} color{record.colors.length !== 1 ? 's' : ''}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
        <Text strong className="text-blue-600">
          LKR {price.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 120,
      render: (record) => {
        const status = getStockStatus(record);
        return (
          <div>
            <Tag color={getStockColor(status)}>
              {getStockText(record)}
            </Tag>
            {record.allowPreorder && record.stock <= 0 && (
              <Tag color="blue" size="small" className="mt-1">
                Pre-order enabled
              </Tag>
            )}
          </div>
        );
      },
      filters: [
        { text: 'In Stock', value: 'in-stock' },
        { text: 'Low Stock', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
        { text: 'Pre-order', value: 'pre-order' },
      ],
      onFilter: (value, record) => getStockStatus(record) === value,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: [...new Set(products.map(p => p.category))].map(category => ({
        text: category,
        value: category
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Material',
      dataIndex: 'material',
      key: 'material',
      width: 120,
      render: (material) => material || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <ActionButton.Text 
              icon="visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title="Product Sheet">
            <ActionButton.Text 
              icon="description"
              onClick={(e) => {
                e.stopPropagation();
                handleShowProductSheet(record);
              }}
              className="text-green-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('products', 'edit') ? 'Edit Product' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              disabled={!hasPermission('products', 'edit')}
              className="text-orange-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('products', 'delete') ? 'Delete Product' : 'No permission'}>
            <Popconfirm
              title="Delete this product?"
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

  const renderProductsTab = () => {
    if (loading) {
      return <LoadingSkeleton type="table" />;
    }

    return (
      <EnhancedTable
        title="Product Inventory"
        icon="inventory_2"
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        rowSelection={hasPermission('products', 'delete') ? {
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        } : null}
        onDelete={handleBulkDelete}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['name', 'category', 'barcode']}
        searchPlaceholder="Search products..."
        extra={
          <Space>
            <ActionButton 
              icon="download"
              onClick={() => setShowExportModal(true)}
            >
              Export
            </ActionButton>
            {hasPermission('products', 'edit') && (
              <ActionButton.Primary 
                icon="add"
                onClick={() => {
                  setEditingProduct(null);
                  setShowModal(true);
                }}
              >
                Add Product
              </ActionButton.Primary>
            )}
          </Space>
        }
        emptyDescription="No products found"
        emptyImage={<Icon name="inventory_2" className="text-6xl text-gray-300" />}
      />
    );
  };

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

  if (!hasPermission('products', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view product management."
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        {/* Product Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-500">Total Products</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > 5).length}
              </div>
              <div className="text-sm text-gray-500">In Stock</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.stock <= 5 && p.stock > 0).length}
              </div>
              <div className="text-sm text-gray-500">Low Stock</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock <= 0).length}
              </div>
              <div className="text-sm text-gray-500">Out of Stock</div>
            </Card>
          </Col>
        </Row>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
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
            key="sheet" 
            icon="description"
            onClick={() => {
              setShowDetailModal(false);
              handleShowProductSheet(selectedProduct);
            }}
          >
            Product Sheet
          </ActionButton>,
          hasPermission('products', 'edit') && (
            <ActionButton 
              key="edit" 
              icon="edit"
              onClick={() => {
                setShowDetailModal(false);
                handleEdit(selectedProduct);
              }}
            >
              Edit Product
            </ActionButton>
          )
        ].filter(Boolean)}
      />

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType="products"
        data={{
          products,
          categories
        }}
      />

      {/* Product Details Sheet */}
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