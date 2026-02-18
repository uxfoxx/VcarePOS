import React from 'react';
import { Empty, Button, Typography } from 'antd';
import { Icon } from './Icon';
import { ActionButton } from './ActionButton';

const { Title, Text } = Typography;

export function EmptyState({
  icon = 'inbox',
  title = 'No Data',
  description = 'No data available at the moment',
  image,
  action,
  actionText = 'Add New',
  onAction,
  className = '',
  size = 'default'
}) {
  const getImageSize = () => {
    switch (size) {
      case 'small': return 60;
      case 'large': return 120;
      default: return 80;
    }
  };

  const customImage = image || (
    <div className="flex flex-col items-center">
      <div 
        className="flex items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4"
        style={{ 
          width: getImageSize(), 
          height: getImageSize() 
        }}
      >
        <Icon name={icon} size={size === 'large' ? 'text-4xl' : size === 'small' ? 'text-xl' : 'text-2xl'} />
      </div>
    </div>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <Empty
        image={customImage}
        description={
          <div className="space-y-2">
            <Title level={size === 'large' ? 3 : size === 'small' ? 5 : 4} type="secondary">
              {title}
            </Title>
            <Text type="secondary" className={size === 'large' ? 'text-lg' : 'text-sm'}>
              {description}
            </Text>
          </div>
        }
      >
        {(action || onAction) && (
          <ActionButton.Primary 
            icon="add" 
            onClick={onAction}
            size={size === 'large' ? 'large' : 'default'}
          >
            {actionText}
          </ActionButton.Primary>
        )}
        {action}
      </Empty>
    </div>
  );
}