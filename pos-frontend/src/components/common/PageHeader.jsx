import React from 'react';
import { Typography, Space } from 'antd';
import { Icon } from './Icon';

const { Title } = Typography;

export function PageHeader({ 
  title, 
  icon, 
  extra, 
  subtitle,
  className = '',
  level = 4,
  ...props 
}) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`} {...props}>
      <div className="flex items-center">
        <Space size="middle">
          {icon && <Icon name={icon} className="text-[#0E72BD]" size="text-xl" />}
          <div>
            <Title level={level} className="m-0">
              {title}
            </Title>
            {subtitle && (
              <Typography.Text type="secondary" className="text-sm">
                {subtitle}
              </Typography.Text>
            )}
          </div>
        </Space>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}