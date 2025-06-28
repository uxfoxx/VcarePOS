import React from 'react';
import { Button } from 'antd';
import { Icon } from './Icon';

export function ActionButton({ 
  icon, 
  children, 
  iconPosition = 'left',
  ...props 
}) {
  const iconElement = icon && <Icon name={icon} />;
  
  return (
    <Button
      icon={iconPosition === 'left' ? iconElement : undefined}
      {...props}
    >
      {iconPosition === 'left' && children}
      {iconPosition === 'right' && (
        <>
          {children}
          {iconElement}
        </>
      )}
      {iconPosition === 'only' && !children && iconElement}
    </Button>
  );
}

// Predefined button variants
ActionButton.Primary = (props) => <ActionButton type="primary" {...props} />;
ActionButton.Secondary = (props) => <ActionButton {...props} />;
ActionButton.Text = (props) => <ActionButton type="text" {...props} />;
ActionButton.Link = (props) => <ActionButton type="link" {...props} />;
ActionButton.Danger = (props) => <ActionButton danger {...props} />;