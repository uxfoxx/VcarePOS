import React from 'react';
import { Tag } from 'antd';
import { Icon } from './Icon';

export function StatusTag({ 
  status, 
  icon, 
  children, 
  showIcon = true,
  ...props 
}) {
  const getStatusColor = (status) => {
    const statusColors = {
      active: 'green',
      inactive: 'red',
      pending: 'orange',
      success: 'green',
      warning: 'orange',
      error: 'red',
      info: 'blue',
      low: 'red',
      medium: 'orange',
      high: 'green',
      'in-stock': 'green',
      'low-stock': 'orange',
      'out-of-stock': 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      active: 'check_circle',
      inactive: 'cancel',
      pending: 'schedule',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      info: 'info',
      low: 'trending_down',
      medium: 'trending_flat',
      high: 'trending_up'
    };
    return statusIcons[status];
  };

  const iconName = icon || (showIcon ? getStatusIcon(status) : null);
  const color = getStatusColor(status);

  return (
    <Tag 
      color={color} 
      icon={iconName && <Icon name={iconName} size="text-xs" />}
      {...props}
    >
      {children || status}
    </Tag>
  );
}