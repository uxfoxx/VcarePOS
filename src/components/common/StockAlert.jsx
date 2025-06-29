import React from 'react';
import { Alert, Tag, Space, Typography, Divider } from 'antd';
import { Icon } from './Icon';
import { ActionButton } from './ActionButton';

const { Text } = Typography;

export function StockAlert({ 
  type = 'warning', // 'warning' | 'error' | 'info'
  title,
  materials = [],
  products = [],
  onViewDetails,
  onDismiss,
  className = ''
}) {
  const getAlertType = () => {
    switch (type) {
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'warning';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'warning';
    }
  };

  const totalItems = materials.length + products.length;

  if (totalItems === 0) return null;

  return (
    <Alert
      type={getAlertType()}
      showIcon
      icon={<Icon name={getIcon()} />}
      className={`mb-4 ${className}`}
      message={
        <div className="flex items-center justify-between">
          <Text strong>{title}</Text>
          <Space>
            {onViewDetails && (
              <ActionButton.Text 
                size="small" 
                onClick={onViewDetails}
                className="text-blue-600"
              >
                View Details
              </ActionButton.Text>
            )}
            {onDismiss && (
              <ActionButton.Text 
                size="small" 
                icon="close"
                onClick={onDismiss}
              />
            )}
          </Space>
        </div>
      }
      description={
        <div className="space-y-3">
          {materials.length > 0 && (
            <div>
              <Text strong className="block mb-2">Raw Materials ({materials.length}):</Text>
              <div className="flex flex-wrap gap-1">
                {materials.slice(0, 5).map(material => (
                  <Tag key={material.id} color="red" className="mb-1">
                    {material.name} ({material.stockQuantity} {material.unit} left)
                  </Tag>
                ))}
                {materials.length > 5 && (
                  <Tag className="mb-1">
                    +{materials.length - 5} more
                  </Tag>
                )}
              </div>
            </div>
          )}
          
          {products.length > 0 && (
            <div>
              {materials.length > 0 && <Divider className="my-2" />}
              <Text strong className="block mb-2">Products ({products.length}):</Text>
              <div className="flex flex-wrap gap-1">
                {products.slice(0, 5).map(product => (
                  <Tag key={product.id} color="orange" className="mb-1">
                    {product.name} ({product.stock} units left)
                  </Tag>
                ))}
                {products.length > 5 && (
                  <Tag className="mb-1">
                    +{products.length - 5} more
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}