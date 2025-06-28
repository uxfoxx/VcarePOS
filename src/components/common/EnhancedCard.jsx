import React from 'react';
import { Card, Typography, Space } from 'antd';
import { Icon } from './Icon';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

export function EnhancedCard({
  title,
  subtitle,
  icon,
  extra,
  children,
  hoverable = true,
  loading = false,
  className = '',
  headerStyle = {},
  bodyStyle = {},
  size = 'default',
  bordered = true,
  ...props
}) {
  const { theme: themeSettings, branding } = useTheme();

  const cardStyle = {
    borderRadius: themeSettings.borderRadius + 4,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: bordered ? `1px solid ${themeSettings.mode === 'dark' ? '#303030' : '#e5e7eb'}` : 'none',
    background: themeSettings.mode === 'dark' ? '#1f1f1f' : '#ffffff',
    transition: themeSettings.animations ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    ...props.style
  };

  const hoverStyle = hoverable ? {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  } : {};

  const renderTitle = () => {
    if (!title && !icon) return null;

    return (
      <div className="flex items-center justify-between">
        <Space size="middle">
          {icon && (
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Icon name={icon} size="text-lg" />
            </div>
          )}
          <div>
            {title && (
              <Title level={size === 'small' ? 5 : 4} className="m-0">
                {title}
              </Title>
            )}
            {subtitle && (
              <Text type="secondary" className="text-sm">
                {subtitle}
              </Text>
            )}
          </div>
        </Space>
        {extra && <div>{extra}</div>}
      </div>
    );
  };

  return (
    <Card
      title={renderTitle()}
      loading={loading}
      hoverable={hoverable}
      size={size}
      bordered={bordered}
      className={`enhanced-card ${className}`}
      style={cardStyle}
      styles={{
        header: {
          borderBottom: `1px solid ${themeSettings.mode === 'dark' ? '#303030' : '#e5e7eb'}`,
          background: `${branding.primaryColor}04`,
          ...headerStyle
        },
        body: {
          padding: themeSettings.compactMode ? 16 : 24,
          ...bodyStyle
        }
      }}
      onMouseEnter={(e) => {
        if (hoverable && themeSettings.animations) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable && themeSettings.animations) {
          Object.assign(e.currentTarget.style, cardStyle);
        }
      }}
      {...props}
    >
      {children}
    </Card>
  );
}