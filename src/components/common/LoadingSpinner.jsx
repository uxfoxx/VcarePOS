import React from 'react';
import { Spin, Typography } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';

const { Text } = Typography;

export function LoadingSpinner({
  size = 'default',
  tip = 'Loading...',
  spinning = true,
  children,
  className = '',
  style = {},
  ...props
}) {
  const { branding, theme: themeSettings } = useTheme();

  const spinnerStyle = {
    color: branding.primaryColor,
    ...style
  };

  const overlayStyle = {
    background: themeSettings.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.7)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    borderRadius: themeSettings.borderRadius,
  };

  if (children) {
    return (
      <Spin
        spinning={spinning}
        tip={<Text style={{ color: branding.primaryColor }}>{tip}</Text>}
        size={size}
        className={className}
        style={overlayStyle}
        {...props}
      >
        {children}
      </Spin>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Spin
        size={size}
        style={spinnerStyle}
        {...props}
      />
      {tip && (
        <Text 
          type="secondary" 
          className="mt-3"
          style={{ color: branding.primaryColor }}
        >
          {tip}
        </Text>
      )}
    </div>
  );
}