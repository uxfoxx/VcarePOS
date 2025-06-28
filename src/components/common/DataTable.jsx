import React from 'react';
import { Table, Card } from 'antd';
import { PageHeader } from './PageHeader';

export function DataTable({ 
  title,
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
  ...props 
}) {
  return (
    <Card>
      {(title || icon || extra) && (
        <PageHeader 
          title={title}
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
        {...props}
      />
    </Card>
  );
}