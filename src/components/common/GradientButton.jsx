import React from 'react';
import { Button } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from './Icon';

export function GradientButton({
  children,
  icon,
  iconPosition = 'left',
  gradient = 'primary',
  size = 'middle',
  className = '',
  ...props
}) {
  const { branding, theme: themeSettings } = useTheme();

  const gradients = {
    primary: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
    success: `linear-gradient(135deg, ${branding.accentColor}, #73d13d)`,
    warning: 'linear-gradient(135deg, #fa8c16, #ffc53d)',
    danger: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
    info: 'linear-gradient(135deg, #1890ff, #40a9ff)',
  };

  const buttonStyle = {
    background: gradients[gradient],
    border: 'none',
    borderRadius: themeSettings.borderRadius,
    boxShadow: `0 4px 12px ${branding.primaryColor}30`,
    color: 'white',
    fontWeight: 500,
    transition: themeSettings.animations ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    height: size === 'large' ? 48 : size === 'small' ? 32 : 40,
  };

  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${branding.primaryColor}40`,
  };

  const iconElement = icon && <Icon name={icon} />;

  return (
    <Button
      className={`gradient-button ${className}`}
      style={buttonStyle}
      size={size}
      onMouseEnter={(e) => {
        if (themeSettings.animations) {
          Object.assign(e.currentTarget.style, { ...buttonStyle, ...hoverStyle });
        }
      }}
      onMouseLeave={(e) => {
        if (themeSettings.animations) {
          Object.assign(e.currentTarget.style, buttonStyle);
        }
      }}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </Button>
  );
}

// Predefined variants
GradientButton.Primary = (props) => <GradientButton gradient="primary" {...props} />;
GradientButton.Success = (props) => <GradientButton gradient="success" {...props} />;
GradientButton.Warning = (props) => <GradientButton gradient="warning" {...props} />;
GradientButton.Danger = (props) => <GradientButton gradient="danger" {...props} />;
GradientButton.Info = (props) => <GradientButton gradient="info" {...props} />;