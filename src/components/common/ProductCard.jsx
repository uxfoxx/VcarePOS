import React from 'react';
import { Card, Button, Typography, Space, Image, Tag, Tooltip } from 'antd';
import { Icon } from './Icon';
import { ActionButton } from './ActionButton';

const { Text, Title } = Typography;

export function ProductCard({ 
  product, 
  onAddToCart, 
  onClick,
  showDetails = false,
  showPriceRange = true,
  className = '',
  ...props 
}) {
  if (!product) return null;

  const hasStock = product.stock > 0;
  const isPreorderAvailable = product.allowPreorder && !hasStock;
  const isAvailable = hasStock || isPreorderAvailable;

  const getLowestPrice = () => {
    if (product.colors && product.colors.length > 0) {
      // Find the lowest price among all color/size combinations
      let minPrice = product.price;
      product.colors.forEach(color => {
        if (color.sizes && color.sizes.length > 0) {
          color.sizes.forEach(size => {
            if (size.price && size.price < minPrice) {
              minPrice = size.price;
            }
          });
        }
      });
      return minPrice;
    }
    return product.price;
  };

  const getHighestPrice = () => {
    if (product.colors && product.colors.length > 0) {
      // Find the highest price among all color/size combinations
      let maxPrice = product.price;
      product.colors.forEach(color => {
        if (color.sizes && color.sizes.length > 0) {
          color.sizes.forEach(size => {
            if (size.price && size.price > maxPrice) {
              maxPrice = size.price;
            }
          });
        }
      });
      return maxPrice;
    }
    return product.price;
  };

  const lowestPrice = getLowestPrice();
  const highestPrice = getHighestPrice();
  const hasPriceRange = lowestPrice !== highestPrice;

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Card
      hoverable
      className={`product-card transition-all duration-300 hover:shadow-lg ${className}`}
      cover={
        <div className="relative overflow-hidden">
          <Image
            src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
            alt={product.name}
            height={200}
            className="object-cover w-full"
            preview={false}
            style={{ aspectRatio: '4/3', objectFit: 'cover' }}
          />
          
          {/* Stock Status Badge */}
          <div className="absolute top-2 left-2">
            {!hasStock && !isPreorderAvailable ? (
              <Tag color="red" className="text-xs">Out of Stock</Tag>
            ) : isPreorderAvailable ? (
              <Tag color="blue" className="text-xs">Pre-order</Tag>
            ) : product.stock <= 5 ? (
              <Tag color="orange" className="text-xs">Low Stock</Tag>
            ) : (
              <Tag color="green" className="text-xs">In Stock</Tag>
            )}
          </div>

          {/* Color indicators */}
          {product.colors && product.colors.length > 1 && (
            <div className="absolute top-2 right-2">
              <div className="flex space-x-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{
                      backgroundImage: color.image ? `url(${color.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: color.colorCode || '#f0f0f0'
                    }}
                  />
                ))}
                {product.colors.length > 3 && (
                  <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center">
                    +
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
      onClick={handleCardClick}
      {...props}
    >
      <div className="space-y-3">
        {/* Product Category */}
        <Tag color="blue" className="text-xs">
          {product.category}
        </Tag>

        {/* Product Name */}
        <Title level={5} className="mb-2 line-clamp-2">
          {product.name}
        </Title>

        {/* Product Description */}
        {showDetails && product.description && (
          <Text type="secondary" className="text-sm line-clamp-2">
            {product.description}
          </Text>
        )}

        {/* Price Display */}
        <div className="flex items-center justify-between">
          <div>
            {showPriceRange && hasPriceRange ? (
              <div>
                <Text strong className="text-lg text-blue-600">
                  LKR {lowestPrice.toFixed(2)} - {highestPrice.toFixed(2)}
                </Text>
                <br />
                <Text type="secondary" className="text-xs">
                  {product.colors?.length || 0} variations
                </Text>
              </div>
            ) : (
              <Text strong className="text-lg text-blue-600">
                LKR {product.price.toFixed(2)}
              </Text>
            )}
          </div>
          
          {/* Stock Info */}
          <div className="text-right">
            <Text type="secondary" className="text-xs block">
              {product.stock} units
            </Text>
            {product.colors && product.colors.length > 0 && (
              <Text type="secondary" className="text-xs">
                {product.colors.length} color{product.colors.length !== 1 ? 's' : ''}
              </Text>
            )}
          </div>
        </div>

        {/* Product Details */}
        {showDetails && (
          <div className="space-y-1">
            {product.material && (
              <div className="flex justify-between text-xs">
                <Text type="secondary">Material:</Text>
                <Text>{product.material}</Text>
              </div>
            )}
            {product.barcode && (
              <div className="flex justify-between text-xs">
                <Text type="secondary">SKU:</Text>
                <Text code className="text-xs">{product.barcode}</Text>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <ActionButton.Primary
            block
            onClick={handleAddToCartClick}
            disabled={!isAvailable}
            icon={hasStock ? "add_shopping_cart" : isPreorderAvailable ? "schedule" : "block"}
            className={
              hasStock ? "bg-blue-600 hover:bg-blue-700" :
              isPreorderAvailable ? "bg-purple-600 hover:bg-purple-700" :
              "bg-gray-400 cursor-not-allowed"
            }
          >
            {hasStock ? 'Add to Cart' : 
             isPreorderAvailable ? 'Pre-order' : 'Out of Stock'}
          </ActionButton.Primary>
          
          {showDetails && (
            <Tooltip title="View Details">
              <ActionButton.Text
                icon="visibility"
                onClick={handleCardClick}
                className="text-blue-600"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}