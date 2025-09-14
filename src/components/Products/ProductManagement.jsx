import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Input,
  Tooltip,
  Checkbox
} from 'antd';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { CategoryManagement } from './CategoryManagement';
import { ProductModal } from './ProductModal';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { fetchProducts, deleteProducts, updateProduct, addProduct } from '../../features/products/productsSlice';
import { fetchRawMaterials} from '../../features/rawMaterials/rawMaterialsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';

const { Title, Text } = Typography;
const { Search } = Input;

export function ProductManagement() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const {productsList, error} = useSelector(state => state.products);

  useEffect(() => { dispatch(fetchProducts());
    dispatch(fetchRawMaterials());
    dispatch(fetchCategories());
   }, [dispatch]);

  const filteredProducts = productsList.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode || '').includes(searchTerm)
  );

  // Calculate stock alerts
  const outOfStockProducts = productsList.filter(p => p.stock === 0);
  const lowStockProducts = productsList.filter(p => p.stock > 0 && p.stock <= 10);
  const almostOutOfStockProducts = productsList.filter(p => p.stock > 10 && p.stock <= 20);

  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
      if (editingProduct) {
        dispatch(updateProduct(productData));
        message.success('Product updated successfully');
      } else {
        dispatch(addProduct(productData));
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
    dispatch(deleteProducts({productId}));
    // dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    // message.success('Product deleted successfully');
  };

  const handleBulkDelete = (productIds) => {
    productIds.forEach(id => {
      dispatch(deleteProducts({productId: id}));
    });
    message.success(`${productIds.length} products deleted successfully`);
    setSelectedRowKeys([]);
  };

  const handlePrintProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductSheet(true);
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

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
            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />
          <div>
            <Text strong>{record.name}</Text>
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
      filters: [...new Set(productsList.map(p => p.category))].map(cat => ({
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
        const stock = record.stock;
          
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
        if (record.isCustom) {
          return <Tag color="gold">Custom</Tag>;
        }
        return record.colors && record.colors.length > 0 ? (
          <Tag color="purple">Has Colors</Tag>
        ) : (
          <Tag color="default">Single</Tag>
        );
      },
      filters: [
        { text: 'Has Colors', value: 'colors' },
        { text: 'Single Product', value: 'single' },
        { text: 'Custom Product', value: 'custom' },
      ],
      onFilter: (value, record) => {
        if (value === 'colors') return record.colors && record.colors.length > 0;
        if (value === 'single') return (!record.colors || record.colors.length === 0) && !record.isCustom;
        if (value === 'custom') return record.isCustom;
        return true;
      },
    },
    // {
    //   title: 'Dimensions',
    //   key: 'dimensions',
    //   width: 150,
    //   render: (record) => {
    //     // Show dimensions from first available size
    //     if (record.colors && record.colors.length > 0) {
    //       const firstSize = record.colors[0]?.sizes?.[0];
    //       if (firstSize && firstSize.dimensions && firstSize.dimensions.length) {
    //         return (
    //           <Text className="text-sm">
    //             {firstSize.dimensions.length}×{firstSize.dimensions.width}×{firstSize.dimensions.height} {firstSize.dimensions.unit}
    //           </Text>
    //         );
    //       }
    //     }
    //     return <Text type="secondary">-</Text>;
    //   },
    // },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (record) => (
        <Space>
          <Tooltip title="Edit">
            <ActionButton.Text
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Print Details">
            <ActionButton.Text
              icon="print"
              onClick={(e) => {
                e.stopPropagation();
                handlePrintProductDetails(record);
              }}
              className="text-gray-600"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this product?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <ActionButton.Text
                icon="delete"
                danger
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderProductsTab = () => (
    <div className="space-y-4">
      <EnhancedTable
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['name', 'category', 'barcode']}
        searchPlaceholder="Search products..."
        showSearch={true}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        onDelete={handleBulkDelete}
        extra={
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowModal(true)}
          >
            Add Product
          </ActionButton.Primary>
        }
        emptyDescription="No products found"
        emptyImage={<Icon name="inventory_2" className="text-6xl text-gray-300" />}
      />
    </div>
  );

  const renderStockAlertsTab = () => {
    const stockAlertColumns = [
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
              style={{ aspectRatio: '1/1', objectFit: 'cover' }}
            />
            <div>
              <Text strong>{record.name}</Text>
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
        title: 'Current Stock',
        dataIndex: 'stock',
        key: 'stock',
        width: 120,
        sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
        render: (stock, record) => {
          let color = 'green';
          let status = 'In Stock';
          
          if (stock === 0) {
            color = 'red';
            status = 'Out of Stock';
          } else if (stock <= 10) {
            color = 'orange';
            status = 'Low Stock';
          } else if (stock <= 20) {
            color = 'yellow';
            status = 'Almost Low';
          }
          
          return (
            <div>
              <Text strong className={`text-${color === 'red' ? 'red' : color === 'orange' ? 'orange' : color === 'yellow' ? 'yellow' : 'green'}-600`}>
                {stock} units
              </Text>
              <br />
              <Tag color={color} size="small">
                {status}
              </Tag>
            </div>
          );
        },
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        sorter: (a, b) => (a.price || 0) - (b.price || 0),
        render: (price, record) => {
          return <Text strong>LKR {(price || 0).toFixed(2)}</Text>;
        },
      },
      {
        title: 'Total Value',
        key: 'totalValue',
        width: 120,
        render: (record) => (
          <Text strong className="text-blue-600">
            LKR {((record.price || 0) * (record.stock || 0)).toFixed(2)}
          </Text>
        ),
        sorter: (a, b) => ((a.price || 0) * (a.stock || 0)) - ((b.price || 0) * (b.stock || 0)),
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 100,
        render: (record) => (
          <Space>
            <Tooltip title="Edit">
              <ActionButton.Text
                icon="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(record);
                }}
                className="text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Print Details">
              <ActionButton.Text
                icon="print"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrintProductDetails(record);
                }}
                className="text-gray-600"
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    const stockAlertData = [
      ...outOfStockProducts.map(p => ({ ...p, alertType: 'out-of-stock' })),
      ...lowStockProducts.map(p => ({ ...p, alertType: 'low-stock' })),
      ...almostOutOfStockProducts.map(p => ({ ...p, alertType: 'almost-low' }))
    ];

    return (
      <div className="space-y-4">
        {/* Stock Alert Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card size="small" className="text-center border-red-200 bg-red-50">
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
              <div className="text-sm text-red-500">Out of Stock</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center border-orange-200 bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
              <div className="text-sm text-orange-500">Low Stock (≤10)</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center border-yellow-200 bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{almostOutOfStockProducts.length}</div>
              <div className="text-sm text-yellow-500">Almost Low (≤20)</div>
            </Card>
          </Col>
        </Row>

        {stockAlertData.length === 0 ? (
          <Card>
            <EmptyState
              icon="check_circle"
              title="All Products Well Stocked"
              description="No stock alerts at this time. All products have adequate inventory levels."
            />
          </Card>
        ) : (
          <EnhancedTable
            title="Product Stock Alerts"
            icon="warning"
            subtitle={`${stockAlertData.length} products need attention`}
            columns={stockAlertColumns}
            dataSource={stockAlertData}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: `cursor-pointer hover:bg-blue-50 ${
                record.alertType === 'out-of-stock' ? 'bg-red-50' : 
                record.alertType === 'low-stock' ? 'bg-orange-50' : 
                'bg-yellow-50'
              }`
            })}
            searchFields={['name', 'category', 'barcode']}
            searchPlaceholder="Search products with stock issues..."
            showSearch={true}
            extra={
              <ActionButton.Primary 
                icon="add"
                onClick={() => setShowModal(true)}
              >
                Add Product
              </ActionButton.Primary>
            }
            emptyDescription="No stock alerts"
            emptyImage={<Icon name="check_circle" className="text-6xl text-green-300" />}
          />
        )}
      </div>
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
      key: 'stock-alerts',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="warning" />
          <span>Stock Alerts</span>
          {(outOfStockProducts.length + lowStockProducts.length) > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
              {outOfStockProducts.length + lowStockProducts.length}
            </span>
          )}
        </span>
      ),
      children: renderStockAlertsTab()
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

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <Card>
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

      {/* Product Details Sheet Modal */}
      <ProductDetailsSheet
        open={showProductSheet && !showDetailModal}
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