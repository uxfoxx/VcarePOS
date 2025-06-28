import React from 'react';
import { Table, Card, Empty } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { PageHeader } from './PageHeader';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';

export function EnhancedTable({
  title,
  subtitle,
  icon,
  extra,
  columns,
  dataSource,
  loading = false,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  },
  scroll = { x: 1000 },
  emptyText = 'No data available',
  emptyIcon = 'inbox',
  className = '',
  ...props
}) {
  const { branding, theme: themeSettings } = useTheme();

  const tableStyle = {
    borderRadius: themeSettings.borderRadius + 4,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  };

  const headerStyle = {
    background: `${branding.primaryColor}08`,
    borderBottom: `1px solid ${branding.primaryColor}20`,
  };

  const customEmpty = (
    <Empty
      image={<Icon name={emptyIcon} className="text-6xl text-gray-300" />}
      description={emptyText}
      className="py-12"
    />
  );

  if (loading) {
    return (
      <Card className={className}>
        {(title || icon || extra) && (
          <PageHeader 
            title={title}
            subtitle={subtitle}
            icon={icon}
            extra={extra}
          />
        )}
        <LoadingSpinner tip="Loading data..." />
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(title || icon || extra) && (
        <PageHeader 
          title={title}
          subtitle={subtitle}
          icon={icon}
          extra={extra}
        />
      )}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        scroll={scroll}
        locale={{ emptyText: customEmpty }}
        style={tableStyle}
        className="enhanced-table"
        {...props}
      />
    </Card>
  );
}