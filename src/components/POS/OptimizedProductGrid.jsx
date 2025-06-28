import React, { useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Empty, Tabs, Spin } from 'antd';
import { useOptimizedPOS } from '../../contexts/OptimizedPOSContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useVirtualization } from '../../hooks/useVirtualization';
import { SearchInput } from '../common/SearchInput';
import { ProductCard } from '../common/ProductCard';
import { PageHeader } from '../common/PageHeader';
import { LazyImage } from '../common/LazyImage';
import { performanceMonitor } from '../../utils/performance';

export function OptimizedProductGrid({ collapsed }) {
  const { state, dispatch, selectors } = useOptimizedPOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // Debounce search to reduce unnecessary filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered products with performance tracking
  const filteredProducts = useMemo(() => {
    return performanceMonitor.measure('filter_products', () => {
      let products = selectors.getProductsByCategory(selectedCategory);
      
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        products = products.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.barcode && product.barcode.toLowerCase().includes(searchLower))
        );
      }
      
      return products;
    });
  }, [selectedCategory, debouncedSearchTerm, selectors]);

  // Virtualization for large product lists
  const { visibleItems, handleScroll } = useVirtualization(
    filteredProducts,
    280, // Approximate card height
    600  // Container height
  );

  // Memoized category tabs
  const categoryTabs = useMemo(() => {
    const activeCategories = state.categories?.filter(cat => cat.isActive) || [];
    const categoryNames = ['All', ...activeCategories.map(cat => cat.name)];
    
    return categoryNames.map(category => ({
      key: category,
      label: category,
      children: null
    }));
  }, [state.categories]);

  // Optimized add to cart handler
  const handleAddToCart = useCallback((product) => {
    if (product.stock > 0) {
      performanceMonitor.measure('add_to_cart', () => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      });
    }
  }, [dispatch]);

  // Optimized product click handler
  const handleProductClick = useCallback((product) => {
    // Could open product details modal
    console.log('Product clicked:', product.name);
  }, []);

  // Grid column calculation based on sidebar state
  const getColSpan = useCallback(() => {
    if (collapsed) {
      return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    } else {
      return { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 };
    }
  }, [collapsed]);

  // Optimized product card component
  const OptimizedProductCard = React.memo(({ product }) => (
    <ProductCard
      product={product}
      onAddToCart={handleAddToCart}
      onClick={handleProductClick}
      showVariationInfo={true}
    />
  ));

  return (
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
          items={categoryTabs}
        />
      </div>

      {/* Virtualized Product Grid */}
      <div 
        className="p-4 overflow-y-auto" 
        style={{ height: 'calc(100% - 140px)' }}
        onScroll={handleScroll}
      >
        {loading && (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 ? (
          <Empty
            image={<span className="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>}
            description={
              debouncedSearchTerm ? 
                `No products found for "${debouncedSearchTerm}"` : 
                selectedCategory === 'All' ? 
                  'No products available' : 
                  `No products found in "${selectedCategory}" category`
            }
          />
        ) : (
          <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${visibleItems.offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              <Row gutter={[16, 16]}>
                {visibleItems.items.map((product) => (
                  <Col key={product.id} {...getColSpan()}>
                    <OptimizedProductCard product={product} />
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}