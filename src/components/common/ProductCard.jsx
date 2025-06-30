import React from 'react';
import { Card, Typography, Image, Badge, Tag } from 'antd';
import { ActionButton } from './ActionButton';
import { StatusTag } from './StatusTag';
import { Icon } from './Icon';

const { Text } = Typography;

export function ProductCard({
  product,
  onAddToCart,
  onClick,
  showDetails = true,
  showPriceRange = false,
  showAddonsIndicator = false,
  className = '',
  ...props
}) {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const renderPrice = () => {
    if (showPriceRange && product.hasSizes && product.sizes && product.sizes.length > 1) {
      const prices = product.sizes.map(s => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    
    return `$${(product.price || 0).toFixed(2)}`;
  };

  const getButtonText = () => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.hasSizes) return 'Select Options';
    if (showAddonsIndicator) return 'Add Options';
    return 'Add to Cart';
  };

  return (
    <Card
      hoverable
      className={`h-full cursor-pointer ${className}`}
      cover={
        <div className="relative h-48 overflow-hidden">
          <Image
            alt={product.name}
            src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
            className="w-full h-full object-cover"
            preview={false}
          />
          <div className="absolute top-2 right-2">
            <Badge 
              count={renderPrice()}
              style={{ backgroundColor: '#0E72BD' }}
            />
          </div>
          <div className="absolute top-2 left-2">
            <StatusTag status="info">
              {product.category}
            </StatusTag>
          </div>
          {product.hasSizes && (
            <div className="absolute bottom-2 right-2">
              <Tag color="purple" size="small">
                {product.sizes?.length || 0} Sizes
              </Tag>
            </div>
          )}
          {showAddonsIndicator && (
            <div className="absolute bottom-2 left-2">
              <Tag color="orange" size="small">
                <Icon name="add_circle" size="text-xs" className="mr-1" />
                Add-ons
              </Tag>
            </div>
          )}
          {product.isCustom && (
            <div className="absolute top-2 left-2">
              <Tag color="gold" size="small">
                <Icon name="build" size="text-xs" className="mr-1" />
                Custom
              </Tag>
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2">
              <StatusTag status="low-stock">
                Low Stock
              </StatusTag>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute bottom-2 left-2">
              <StatusTag status="out-of-stock">
                Out of Stock
              </StatusTag>
            </div>
          )}
        </div>
      }
      onClick={() => onClick?.(product)}
      bodyStyle={{ padding: '16px' }}
      {...props}
    >
      <div className="space-y-3">
        <div>
          <Text strong className="text-base line-clamp-2 leading-tight block mb-1">
            {product.name}
          </Text>
          <Text type="secondary" className="text-sm block mb-1">
            SKU: {product.barcode || 'N/A'}
          </Text>
          {product.hasSizes && (
            <Text type="secondary" className="text-xs block mb-1">
              Multiple sizes available
            </Text>
          )}
          {product.isCustom && (
            <Text type="secondary" className="text-xs block mb-1">
              Custom made product
            </Text>
          )}
          <div className="flex items-center justify-between">
            <Text strong className="text-lg text-[#0E72BD]">
              {renderPrice()}
            </Text>
            <Text type="secondary" className="text-sm">
              Stock: {product.stock}
            </Text>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-1">
            {product.dimensions && (
              <Text type="secondary" className="text-xs block">
                <Icon name="straighten" size="text-xs" className="mr-1" />
                {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} {product.dimensions.unit}
              </Text>
            )}
            {product.material && (
              <Text type="secondary" className="text-xs block">
                <Icon name="texture" size="text-xs" className="mr-1" />
                {product.material}
              </Text>
            )}
            {product.color && (
              <Text type="secondary" className="text-xs block">
                <Icon name="palette" size="text-xs" className="mr-1" />
                {product.color}
              </Text>
            )}
            {product.isCustom && product.customMaterials && (
              <Text type="secondary" className="text-xs block">
                <Icon name="build" size="text-xs" className="mr-1" />
                {product.customMaterials.length} materials
              </Text>
            )}
          </div>
        )}
        
        <ActionButton.Primary
          icon={product.hasSizes || showAddonsIndicator ? "tune" : "add_shopping_cart"}
          size="large"
          block
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="bg-[#0E72BD] hover:bg-blue-700 font-semibold"
        >
          {getButtonText()}
        </ActionButton.Primary>
      </div>
    </Card>
  );
}