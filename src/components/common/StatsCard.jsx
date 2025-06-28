import React from 'react';
import { Card, Statistic, Space, Progress } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from './Icon';
import { AnimatedCounter } from './AnimatedCounter';

export function StatsCard({
  title,
  value,
  icon,
  color,
  prefix,
  suffix,
  precision,
  trend,
  trendValue,
  progress,
  className = '',
  size = 'default',
  ...props
}) {
  const { branding, theme: themeSettings } = useTheme();
  
  const cardColor = color || branding.primaryColor;
  const isSmall = size === 'small';

  const cardStyle = {
    borderRadius: themeSettings.borderRadius + 4,
    border: `1px solid ${cardColor}20`,
    background: `linear-gradient(135deg, ${cardColor}08, ${cardColor}04)`,
    transition: themeSettings.animations ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
  };

  const hoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${cardColor}30`,
  };

  return (
    <Card 
      className={`stats-card ${className}`}
      style={cardStyle}
      bodyStyle={{ 
        padding: isSmall ? 16 : 24,
        textAlign: 'center'
      }}
      onMouseEnter={(e) => {
        if (themeSettings.animations) {
          Object.assign(e.currentTarget.style, { ...cardStyle, ...hoverStyle });
        }
      }}
      onMouseLeave={(e) => {
        if (themeSettings.animations) {
          Object.assign(e.currentTarget.style, cardStyle);
        }
      }}
      {...props}
    >
      <Space direction="vertical" size="small" className="w-full">
        {icon && (
          <div 
            className={`flex items-center justify-center ${isSmall ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg text-white mx-auto`}
            style={{ backgroundColor: cardColor }}
          >
            <Icon name={icon} size={isSmall ? 'text-lg' : 'text-xl'} />
          </div>
        )}
        
        <Statistic
          title={title}
          value={value}
          precision={precision}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            color: cardColor, 
            fontSize: isSmall ? '20px' : '24px', 
            fontWeight: 'bold' 
          }}
          formatter={(value) => (
            <AnimatedCounter 
              value={value} 
              precision={precision}
              prefix={prefix}
              suffix={suffix}
            />
          )}
        />
        
        {progress !== undefined && (
          <Progress
            percent={progress}
            size="small"
            strokeColor={cardColor}
            showInfo={false}
            className="w-full"
          />
        )}
        
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