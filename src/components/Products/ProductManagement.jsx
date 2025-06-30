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
  Table,
  Button,
  Input,
  Menu,
  Segmented
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { CategoryManagement } from './CategoryManagement';
import { ProductModal } from './ProductModal';
import { DetailModal } from '../common/DetailModal';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;
const { Panel } = Collapse;
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
      render: (price) => <Text strong>LKR {price.toFixed(2)}</Text>
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

  const renderProductCard = (product) => {
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock <= 5 && product.stock > 0;
    
    // Calculate price display
    let priceDisplay = '';
    if (product.hasSizes && product.sizes?.length > 0) {
      const minPrice = Math.min(...product.sizes.map(s => s.price));
      const maxPrice = Math.max(...product.sizes.map(s => s.price));
      priceDisplay = minPrice === maxPrice 
        ? `LKR ${minPrice.toFixed(2)}`
        : `LKR ${minPrice.toFixed(2)} - LKR ${maxPrice.toFixed(2)}`;
    } else {
      priceDisplay = `LKR ${product.price.toFixed(2)}`;
    }
    
    // Calculate stock display
    let stockDisplay = '';
    let stockColor = '';
    if (product.hasSizes && product.sizes?.length > 0) {
      const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
      stockDisplay = `${totalStock} units`;
      stockColor = totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red';
    } else {
      stockDisplay = `${product.stock} units`;
      stockColor = product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red';
    }
    
    return (
      <Card 
        hoverable 
        className="h-full"
        cover={
          <div className="relative h-48">
            <Image
              src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
              alt={product.name}
              className="w-full h-full object-cover"
              preview={false}
            />
            <div className="absolute top-2 left-2">
              <Tag color="blue">{product.category}</Tag>
            </div>
            {isOutOfStock && (
              <div className="absolute top-2 right-2">
                <Tag color="red">SALE</Tag>
              </div>
            )}
          </div>
        }
        actions={[
          <Button type="text" icon={<Icon name="visibility" />} onClick={() => handleRowClick(product)} />,
          <Button type="text" icon={<Icon name="edit" />} onClick={() => handleEdit(product)} />,
          <Dropdown
            menu={{ items: getActionMenuItems(product) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<Icon name="more_vert" />} onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        ]}
        onClick={() => handleRowClick(product)}
      >
        <div className="space-y-2">
          <Text strong className="text-base line-clamp-2 leading-tight block">
            {product.name}
          </Text>
          <Text type="secondary" className="text-xs block">
            SKU: {product.barcode || 'N/A'}
          </Text>
          <div className="flex justify-between items-center">
            <Text strong className="text-lg text-blue-600">
              {priceDisplay}
            </Text>
            <Tag color={stockColor}>
              {stockDisplay}
            </Tag>
          </div>
          {product.hasSizes && (
            <Tag color="purple" className="mt-1">
              {product.sizes?.length || 0} Sizes
            </Tag>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSkeleton type="product-grid" />;
  }

  return (
    <>
      <Card>
        <div className="mb-6">
          <Title level={3} className="m-0">Product Management</Title>
          <Text type="secondary">Manage products, sizes, and categories.</Text>
        </div>
        
        <div className="mb-4">
          <Segmented
            options={[
              {
                label: (
                  <div className="px-4 py-1">
                    <Icon name="inventory_2" className="mr-2" />
                    <span>Products</span>
                  </div>
                ),
                value: 'products'
              },
              {
                label: (
                  <div className="px-4 py-1">
                    <Icon name="category" className="mr-2" />
                    <span>Categories</span>
                  </div>
                ),
                value: 'categories'
              }
            ]}
            value={activeTab}
            onChange={setActiveTab}
            block
            size="large"
          />
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Title level={4} className="m-0">Product Inventory</Title>
              <Space>
                <Search
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={setSearchTerm}
                  style={{ width: 300 }}
                  size="large"
                />
                <Button 
                  type="primary" 
                  icon={<Icon name="add" />} 
                  size="large"
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600"
                >
                  Add Product
                </Button>
              </Space>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon="inventory_2"
                title="No Products Found"
                description="No products match your search criteria"
                actionText="Add Product"
                onAction={() => setShowModal(true)}
              />
            ) : (
              <Row gutter={[16, 16]}>
                {filteredProducts.map(product => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    {renderProductCard(product)}
                  </Col>
                ))}
              </Row>
            )}
          </div>
        ) : (
          <CategoryManagement />
        )}
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
          <Button 
            key="edit" 
            icon={<Icon name="edit" />}
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedProduct);
            }}
          >
            Edit Product
          </Button>,
          <Button 
            key="print" 
            icon={<Icon name="print" />}
            onClick={() => {
              setShowDetailModal(false);
              handlePrintProductDetails(selectedProduct);
            }}
          >
            Print Details
          </Button>
        ]}
      />
    </>
  );
}