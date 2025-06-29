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
  Collapse
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';
import { CategoryManagement } from './CategoryManagement';
import { VariantManagement } from './VariantManagement';
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
  const [viewMode, setViewMode] = useState('all');
  const [loading, setLoading] = useState(false);

  const getFilteredProducts = () => {
    let productsToShow = [];
    
    if (viewMode === 'all') {
      productsToShow = state.allProducts;
    } else if (viewMode === 'base') {
      productsToShow = state.products;
    } else if (viewMode === 'variants') {
      productsToShow = state.allProducts.filter(product => product.isVariant);
    }

    return productsToShow.filter(product =>
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode || '').includes(searchTerm)
    );
  };

  const filteredProducts = getFilteredProducts();

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
    if (product.isVariant) {
      const baseProduct = state.products.find(p => p.id === product.parentProductId);
      if (baseProduct) {
        setEditingProduct(baseProduct);
      } else {
        message.error('Base product not found');
        return;
      }
    } else {
      setEditingProduct(product);
    }
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    const product = state.allProducts.find(p => p.id === productId);
    
    if (product?.isVariant) {
      message.error('Cannot delete individual variants. Edit the base product to manage variants.');
      return;
    }
    
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
      label: record.isVariant ? 'Edit Base Product' : 'Edit Product',
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
      disabled: record.isVariant,
      onClick: () => {
        if (record.isVariant) {
          message.error('Cannot delete individual variants');
          return;
        }
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

  const getVariantDisplayName = (product) => {
    if (!product.isVariant || !product.variantCombination) {
      return null;
    }

    const variantNames = [];
    Object.entries(product.variantCombination).forEach(([typeId, optionId]) => {
      const option = state.variantOptions.find(opt => opt.id === optionId);
      if (option) {
        variantNames.push(option.name);
      }
    });

    return variantNames.join(', ');
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
          />
          <div>
            <Text strong>{record.name}</Text>
            {record.isVariant && record.variantDisplay && (
              <>
                <br />
                <Tag color="purple" size="small">
                  {record.variantDisplay}
                </Tag>
              </>
            )}
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
        if (viewMode === 'base' && record.hasVariants) {
          return (
            <div>
              <Text type="secondary" className="text-sm">Base: ${(record.basePrice || 0).toFixed(2)}</Text>
              <br />
              <Text type="secondary" className="text-xs">
                {record.variants?.length || 0} variants
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
        if (viewMode === 'base' && record.hasVariants) {
          const totalStock = record.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          return (
            <div>
              <Tag color={totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red'}>
                {totalStock} total
              </Tag>
              <br />
              <Text type="secondary" className="text-xs">
                Across {record.variants?.length || 0} variants
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
        if (viewMode === 'base') {
          return record.hasVariants ? (
            <Tag color="purple">Has Variants</Tag>
          ) : (
            <Tag color="default">Single Product</Tag>
          );
        }
        return record.isVariant ? (
          <Tag color="purple">Variant</Tag>
        ) : (
          <Tag color="default">Base Product</Tag>
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
          <Text type="secondary">Manage your furniture products and variants</Text>
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

      {/* View Mode Selector */}
      <Card size="small">
        <div className="flex items-center justify-between">
          <div>
            <Text strong>View Mode:</Text>
            <Text type="secondary" className="ml-2">Choose how to display products</Text>
          </div>
          <Space>
            <ActionButton 
              type={viewMode === 'all' ? 'primary' : 'default'}
              size="small"
              onClick={() => setViewMode('all')}
            >
              All Products ({state.allProducts.length})
            </ActionButton>
            <ActionButton 
              type={viewMode === 'base' ? 'primary' : 'default'}
              size="small"
              onClick={() => setViewMode('base')}
            >
              Base Products ({state.products.length})
            </ActionButton>
            <ActionButton 
              type={viewMode === 'variants' ? 'primary' : 'default'}
              size="small"
              onClick={() => setViewMode('variants')}
            >
              Variants Only ({state.allProducts.filter(p => p.isVariant).length})
            </ActionButton>
          </Space>
        </div>
      </Card>

      {/* Products with Variants Expandable View */}
      {viewMode === 'base' ? (
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
                      {product.hasVariants ? (
                        <Tag color="purple">Has {product.variants?.length || 0} Variants</Tag>
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

                {product.hasVariants && product.variants && product.variants.length > 0 && (
                  <Collapse className="mt-4" size="small">
                    <Panel 
                      header={`View ${product.variants.length} Variants`} 
                      key="variants"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.variants.map(variant => {
                          const variantProduct = state.allProducts.find(p => p.id === variant.id);
                          return (
                            <Card key={variant.id} size="small" className="border cursor-pointer hover:shadow-sm" onClick={(e) => {
                              e.stopPropagation();
                              if (variantProduct) handleRowClick(variantProduct);
                            }}>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Text strong>{variantProduct?.variantDisplay || 'Variant'}</Text>
                                  <Tag color={variant.stock > 0 ? 'green' : 'red'} size="small">
                                    {variant.stock} units
                                  </Tag>
                                </div>
                                <div className="space-y-1">
                                  <Text className="text-sm">
                                    <strong>SKU:</strong> {variant.sku}
                                  </Text>
                                  <Text className="text-sm">
                                    <strong>Price:</strong> ${variant.price.toFixed(2)}
                                  </Text>
                                  {variant.dimensions && variant.dimensions.length && (
                                    <Text className="text-sm">
                                      <strong>Size:</strong> {variant.dimensions.length}×{variant.dimensions.width}×{variant.dimensions.height} {variant.dimensions.unit}
                                    </Text>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </Panel>
                  </Collapse>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <EnhancedTable
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-blue-50'
          })}
          searchFields={['name', 'category', 'barcode']}
          showSearch={false}
          emptyDescription="No products found"
          emptyImage={<Icon name="inventory_2" className="text-6xl text-gray-300" />}
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
      key: 'variants',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="tune" />
          <span>Variants</span>
        </span>
      ),
      children: <VariantManagement />
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
          subtitle="Manage products, variants, and categories"
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