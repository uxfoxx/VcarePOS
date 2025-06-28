import React from 'react';
import { Card, Statistic, Space } from 'antd';
import { Icon } from './Icon';

export function StatsCard({
  title,
  value,
  icon,
  color = '#0E72BD',
  prefix,
  suffix,
  precision,
  trend,
  trendValue,
  className = '',
  ...props
}) {
  return (
    <Card className={`text-center ${className}`} {...props}>
      <Space direction="vertical" size="small" className="w-full">
        {icon && (
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg text-white mx-auto"
            style={{ backgroundColor: color }}
          >
            <Icon name={icon} size="text-xl" />
          </div>
        )}
        
        <Statistic
          title={title}
          value={value}
          precision={precision}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ color, fontSize: '24px', fontWeight: 'bold' }}
        />
        
        {trend && trendValue && (
          <div className="flex items-center justify-center space-x-1">
            <Icon 
              name={trend === 'up' ? 'trending_up' : 'trending_down'} 
              className={trend === 'up' ? 'text-green-500' : 'text-red-500'}
              size="text-sm"
            />
            <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </Space>
    </Card>
  );
}