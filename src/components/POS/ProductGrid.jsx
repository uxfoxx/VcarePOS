import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Empty,
  Modal,
  Descriptions,
  Tabs,
  Image,
  Tag,
  Select,
  Space,
  Button,
  Typography,
  Table,
  InputNumber
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { SearchInput } from '../common/SearchInput';
import { ProductCard } from '../common/ProductCard';
import { PageHeader } from '../common/PageHeader';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

const { Option } = Select;
const { Text } = Typography;

export function ProductGrid({ collapsed }) {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(false);

  // Get categories from state, including only active ones
  const activeCategories = state.categories?.filter(cat => cat.isActive) || [];
  const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];
  
  // Filter products - show only base products (not individual variants)
  const filteredProducts = state.products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const handleAddToCart = (product) => {
    if (product.hasVariants) {
      // Show variant selection modal
      setSelectedProduct(product);
      setSelectedVariants({});
      setShowDetailModal(true);
    } else {
      // Add single product directly
      if (product.stock > 0) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    setShowDetailModal(true);
  };

  const handleVariantChange = (variantTypeId, optionId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantTypeId]: optionId
    }));
  };

  const getSelectedVariantProduct = () => {
    if (!selectedProduct || !selectedProduct.hasVariants) {
      return selectedProduct;
    }

    // Check if all required variant types are selected
    const requiredTypes = selectedProduct.variantTypes || [];
    const hasAllSelections = requiredTypes.every(typeId => selectedVariants[typeId]);
    
    if (!hasAllSelections) {
      return null;
    }

    // Find matching variant
    const matchingVariant = selectedProduct.variants?.find(variant => {
      return requiredTypes.every(typeId => 
        variant.combination[typeId] === selectedVariants[typeId]
      );
    });

    if (!matchingVariant) {
      return null;
    }

    // Return the variant as a product-like object
    return state.allProducts.find(p => p.id === matchingVariant.id);
  };

  const handleAddSelectedVariantToCart = () => {
    const variantProduct = getSelectedVariantProduct();
    if (variantProduct && variantProduct.stock > 0) {
      dispatch({ type: 'ADD_TO_CART', payload: variantProduct });
      setShowDetailModal(false);
      setSelectedProduct(null);
      setSelectedVariants({});
    }
  };

  const getVariantTypeOptions = (variantTypeId) => {
    return state.variantOptions
      .filter(option => option.variantTypeId === variantTypeId && option.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getVariantTypeName = (variantTypeId) => {
    const variantType = state.variantTypes.find(type => type.id === variantTypeId);
    return variantType?.name || 'Unknown';
  };

  const getOptionName = (optionId) => {
    const option = state.variantOptions.find(opt => opt.id === optionId);
    return option?.name || 'Unknown';
  };

  // Determine grid columns based on sidebar state
  const getColSpan = () => {
    if (collapsed) {
      // When collapsed, show 4 products per row
      return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    } else {
      // When expanded, show 2 products per row
      return { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 };
    }
  };

  const tabItems = categoryNames.map(category => ({
    key: category,
    label: category,
    children: null
  }));

  if (loading) {
    return (
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4">
          <LoadingSkeleton type="product-grid" />
        </div>
      </Card>
    );
  }

  const selectedVariantProduct = getSelectedVariantProduct();

  // Prepare variant table data
  const variantTableColumns = [
    {
      title: 'Variant',
      key: 'variant',
      render: (variant) => {
        const variantNames = [];
        Object.entries(variant.combination).forEach(([typeId, optionId]) => {
          const option = state.variantOptions.find(opt => opt.id === optionId);
          if (option) {
            variantNames.push(option.name);
          }
        });
        return (
          <div>
            <Text strong>{variantNames.join(', ')}</Text>
            <br />
            <Text code className="text-xs">{variant.sku}</Text>
          </div>
        );
      }
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
      title: 'Action',
      key: 'action',
      render: (variant) => {
        const variantProduct = state.allProducts.find(p => p.id === variant.id);
        return (
          <ActionButton.Primary
            size="small"
            onClick={() => {
              if (variantProduct && variantProduct.stock > 0) {
                dispatch({ type: 'ADD_TO_CART', payload: variantProduct });
                setShowDetailModal(false);
                setSelectedProduct(null);
              }
            }}
            disabled={variant.stock === 0}
          >
            Add to Cart
          </ActionButton.Primary>
        );
      }
    }
  ];

  const modalTabItems = [
    {
      key: 'details',
      label: 'Product Details',
      children: selectedProduct && (
        <div className="space-y-6">
          {/* Product Image and Basic Info */}
          <div className="flex gap-4">
            <Image
              src={selectedProduct.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
              alt={selectedProduct.name}
              width={200}
              height={150}
              className="object-cover rounded"
              preview={false}
            />
            <div className="flex-1">
              <PageHeader
                title={selectedProduct.name}
                subtitle={selectedProduct.description}
                level={4}
              />
              <div className="mt-2 space-y-2">
                {selectedProduct.hasVariants ? (
                  <>
                    <span className="text-xl font-bold text-blue-600">
                      From ${selectedProduct.variants?.length > 0 
                        ? Math.min(...selectedProduct.variants.map(v => v.price)).toFixed(2)
                        : selectedProduct.basePrice?.toFixed(2) || '0.00'
                      }
                    </span>
                    <div>
                      <Text type="secondary">Multiple options available</Text>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-bold text-blue-600">
                      ${selectedProduct.price?.toFixed(2) || '0.00'}
                    </span>
                    <div>
                      <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                        {selectedProduct.stock} in stock
                      </Tag>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Details for non-variant products */}
          {!selectedProduct.hasVariants && (
            <Descriptions bordered size="small">
              <Descriptions.Item label="SKU">
                {selectedProduct.barcode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedProduct.category}
              </Descriptions.Item>
              <Descriptions.Item label="Stock">
                {selectedProduct.stock} available
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {selectedProduct.color}
              </Descriptions.Item>
              {selectedProduct.dimensions && (
                <Descriptions.Item label="Dimensions">
                  {selectedProduct.dimensions.length}×{selectedProduct.dimensions.width}×{selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Weight">
                {selectedProduct.weight} kg
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
      )
    }
  ];

  // Add variants tab if product has variants
  if (selectedProduct?.hasVariants && selectedProduct.variants?.length > 0) {
    modalTabItems.push({
      key: 'variants',
      label: `Variants (${selectedProduct.variants.length})`,
      children: (
        <div className="space-y-4">
          <div>
            <Text strong className="text-lg">Available Variants</Text>
            <br />
            <Text type="secondary">
              Choose from the available variants below to add to your cart
            </Text>
          </div>
          
          <Table
            columns={variantTableColumns}
            dataSource={selectedProduct.variants}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      )
    });
  }

  return (
    <>
      <Card 
        className="h-full"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      >
        <div className="p-4 border-b border-gray-200">
          <PageHeader
            title="Products"
            icon="inventory_2"
            extra={
              <SearchInput
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-80"
              />
            }
          />
        </div>

        {/* Category Tabs */}
        <div className="px-4 pt-4 border-b border-gray-200">
          <Tabs 
            activeKey={selectedCategory} 
            onChange={setSelectedCategory}
            type="card"
            size="small"
            items={tabItems}
          />
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="inventory_2"
              title="No Products Found"
              description={
                searchTerm ? 
                  `No products found for "${searchTerm}"` : 
                  selectedCategory === 'All' ? 
                    'No products available' : 
                    `No products found in "${selectedCategory}" category`
              }
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => {
                // For display purposes, show the base product info
                const displayProduct = {
                  ...product,
                  // Show stock as total of all variants or base stock
                  stock: product.hasVariants 
                    ? product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0
                    : product.stock || 0,
                  // Show base price or price range
                  price: product.hasVariants && product.variants?.length > 0
                    ? Math.min(...product.variants.map(v => v.price))
                    : product.price || product.basePrice || 0
                };

                return (
                  <Col key={product.id} {...getColSpan()}>
                    <ProductCard
                      product={displayProduct}
                      onAddToCart={handleAddToCart}
                      onClick={handleProductClick}
                      showVariationInfo={product.hasVariants}
                      showPriceRange={product.hasVariants && product.variants?.length > 1}
                    />
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Card>

      {/* Product Detail Modal */}
      <Modal
        title={selectedProduct?.name}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
          setSelectedVariants({});
        }}
        width={800}
        footer={[
          <ActionButton 
            key="close" 
            onClick={() => {
              setShowDetailModal(false);
              setSelectedProduct(null);
              setSelectedVariants({});
            }}
          >
            Close
          </ActionButton>,
          !selectedProduct?.hasVariants && (
            <ActionButton.Primary
              key="add-to-cart"
              icon="add_shopping_cart"
              onClick={() => {
                handleAddToCart(selectedProduct);
                setShowDetailModal(false);
              }}
              disabled={selectedProduct?.stock === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add to Cart
            </ActionButton.Primary>
          )
        ].filter(Boolean)}
        destroyOnClose
      >
        {selectedProduct && (
          <Tabs
            items={modalTabItems}
            defaultActiveKey="details"
          />
        )}
      </Modal>
    </>
  );
}