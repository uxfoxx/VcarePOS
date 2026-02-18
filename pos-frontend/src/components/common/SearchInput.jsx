import React from 'react';
import { Input } from 'antd';
import { Icon } from './Icon';

export function SearchInput({ 
  placeholder = "Search...", 
  className = "w-64",
  onSearch,
  ...props 
}) {
  return (
    <Input
      placeholder={placeholder}
      prefix={<Icon name="search" className="text-gray-400" />}
      className={className}
      allowClear
      onChange={(e) => onSearch?.(e.target.value)}
      {...props}
    />
  );
}