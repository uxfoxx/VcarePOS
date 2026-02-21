import { Card, Typography, Image, Badge, Tag, Button } from 'antd';
import { Icon } from './Icon';

const { Text } = Typography;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const fallbackImage = 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300';

export function ProductCard({
  product,
  onAddToCart,
  showDetails = true,
  className = '',
  ...props
}) {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  // const getStockStatus = (stock) => {
  //   if (stock === 0) return 'out-of-stock';
  //   if (stock <= 5) return 'low-stock';
  //   return 'in-stock';
  // };

  const renderPrice = () => {
    // Price is now fixed for all variations
    return `LKR ${(product.price || 0).toFixed(2) || '0.00'}`;
  };

  return (
    <Card
      hoverable
      className={`h-full cursor-pointer ${className}`}
      cover={
        <div className="relative h-48 overflow-hidden">
          <Image
            alt={product.name}
            src={(() => {
              if (product.media && Array.isArray(product.media) && product.media.length > 0) {
                const imageMedia = product.media.find(
                  (m) =>
                    !m.startsWith('data:video/') &&
                    !m.toLowerCase().endsWith('.mp4') &&
                    !m.toLowerCase().endsWith('.webm') &&
                    !m.toLowerCase().endsWith('.mov')
                );
                if (imageMedia) {
                  return getImageUrl(imageMedia);
                }
              }
              return getImageUrl(product.image) || fallbackImage;
            })()}
            className="w-full h-full object-cover"
            preview={false}
            crossOrigin="anonymous"
            style={{ objectFit: 'cover', aspectRatio: '4/3' }}
          />
          <div className="absolute top-2 right-2">
            <Badge
              count={renderPrice()}
              style={{ backgroundColor: '#0E72BD' }}
            />
          </div>
          <div className="absolute top-2 left-2">
            <Tag color="blue">
              {product.category}
            </Tag>
          </div>
          {product.media && product.media.length > 1 && (
            <div className="absolute bottom-2 left-2">
              <Tag color="purple" size="small">
                +{product.media.length - 1} more
              </Tag>
            </div>
          )}
          {product.hasColors && (
            <div className="absolute bottom-2 right-2">
              <Tag color="purple" size="small">
                {product.colors?.length || 0} Color{(product.colors?.length || 0) !== 1 ? 's' : ''}
              </Tag>
            </div>
          )}
          {product.isCustom && (
            <div className="absolute bottom-2 right-2">
              <Tag color="purple" size="small">
                Custom
              </Tag>
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2">
              <Tag color="orange">
                Low Stock
              </Tag>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute bottom-2 left-2">
              <Tag color="red">
                Out of Stock
              </Tag>
            </div>
          )}
        </div>
      }
      // onClick={() => onClick?.(product)}
      styles={{
        body: { padding: '16px' }
      }}
      {...props}
    >
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div>
          <Text strong className="text-base line-clamp-2 leading-tight block mb-1" style={{ minHeight: '44px' }}>
            {product.name}
          </Text>
          <Text type="secondary" className="text-sm block mb-1 truncate">
            SKU: {product.barcode || 'N/A'}
          </Text>
          {product.hasColors && (
            <Text type="secondary" className="text-xs block mb-1">
              {product.colors?.length || 0} color{product.colors?.length !== 1 ? 's' : ''} available
            </Text>
          )}
          <div className="flex flex-wrap items-center justify-between gap-1 mt-2">
            <Text strong className="text-lg text-[#0E72BD]">
              {renderPrice()}
            </Text>
            <Text type="secondary" className="text-sm px-2 py-0.5 bg-gray-50 rounded text-nowrap">
              Stock: {product.stock}
            </Text>
          </div>
        </div>

        {showDetails && !product.isCustom && (
          <div className="space-y-1">
            {product.weight && (
              <Text type="secondary" className="text-xs block">
                <Icon name="scale" size="text-xs" className="mr-1" />
                {product.weight} kg
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
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button
            type="primary"
            icon={<Icon name="add_shopping_cart" />}
            size="large"
            block
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-[#0E72BD] font-semibold text-xs"
          >
            {product.stock === 0
              ? 'Out of Stock'
              : product.hasColors
                ? 'Select Color & Size'
                : 'Add to Cart'
            }
          </Button>
        </div>
      </div>
    </Card>
  );
}