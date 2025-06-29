import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Space, 
  Button, 
  Dropdown, 
  Checkbox, 
  Input, 
  Select, 
  DatePicker, 
  Tooltip,
  Empty,
  Skeleton
} from 'antd';
import { Icon } from './Icon';
import { ActionButton } from './ActionButton';
import { PageHeader } from './PageHeader';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function EnhancedTable({
  title,
  icon,
  subtitle,
  columns: initialColumns = [],
  dataSource = [],
  loading = false,
  rowKey = 'id',
  onRow,
  extra,
  showSearch = true,
  showFilters = true,
  showColumnConfig = true,
  searchPlaceholder = "Search...",
  searchFields = [],
  filterFields = [],
  defaultPageSize = 10,
  scroll = { x: 1000 },
  emptyDescription = "No data available",
  emptyImage,
  ...tableProps
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(
    initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [fixedColumns, setFixedColumns] = useState(
    initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.fixed || false }), {})
  );
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({});

  // Enhanced columns with visibility and fixed settings
  const columns = useMemo(() => {
    return initialColumns
      .filter(col => visibleColumns[col.key])
      .map(col => ({
        ...col,
        fixed: fixedColumns[col.key] || false,
        sorter: col.sorter !== false ? (col.sorter || true) : false,
        filterable: col.filterable !== false,
        ...(col.filterable !== false && {
          filterDropdown: col.filterDropdown || (({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="p-2">
              <Input
                placeholder={`Search ${col.title}`}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => confirm()}
                className="w-48 mb-2 block"
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => confirm()}
                  icon={<Icon name="search" />}
                  size="small"
                  className="w-20"
                >
                  Search
                </Button>
                <Button onClick={() => clearFilters()} size="small" className="w-20">
                  Reset
                </Button>
              </Space>
            </div>
          )),
          filterIcon: filtered => <Icon name="filter_list" className={filtered ? 'text-blue-600' : ''} />,
          onFilter: col.onFilter || ((value, record) => {
            const dataIndex = col.dataIndex;
            if (Array.isArray(dataIndex)) {
              return dataIndex.reduce((obj, key) => obj?.[key], record)
                ?.toString()
                ?.toLowerCase()
                ?.includes(value.toLowerCase());
            }
            return record[dataIndex]?.toString()?.toLowerCase()?.includes(value.toLowerCase());
          })
        })
      }));
  }, [initialColumns, visibleColumns, fixedColumns]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return dataSource;
    
    return dataSource.filter(record => {
      if (searchFields.length > 0) {
        return searchFields.some(field => {
          const value = Array.isArray(field) 
            ? field.reduce((obj, key) => obj?.[key], record)
            : record[field];
          return value?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase());
        });
      }
      
      // Default: search all string fields
      return Object.values(record).some(value => 
        value?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase())
      );
    });
  }, [dataSource, searchTerm, searchFields]);

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(filters);
    setSorter(sorter);
  };

  const handleColumnVisibilityChange = (columnKey, visible) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: visible }));
  };

  const handleColumnFixedChange = (columnKey, fixed) => {
    setFixedColumns(prev => ({ ...prev, [columnKey]: fixed }));
  };

  const resetColumns = () => {
    setVisibleColumns(initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}));
    setFixedColumns(initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.fixed || false }), {}));
  };

  const columnConfigMenu = {
    items: [
      {
        key: 'visibility',
        label: 'Column Visibility',
        children: initialColumns.map(col => ({
          key: `visibility-${col.key}`,
          label: (
            <Checkbox
              checked={visibleColumns[col.key]}
              onChange={e => handleColumnVisibilityChange(col.key, e.target.checked)}
            >
              {col.title}
            </Checkbox>
          )
        }))
      },
      {
        key: 'fixed',
        label: 'Fixed Columns',
        children: initialColumns.map(col => ({
          key: `fixed-${col.key}`,
          label: (
            <Checkbox
              checked={fixedColumns[col.key]}
              onChange={e => handleColumnFixedChange(col.key, e.target.checked ? 'left' : false)}
            >
              Fix {col.title}
            </Checkbox>
          )
        }))
      },
      {
        type: 'divider'
      },
      {
        key: 'reset',
        label: (
          <Button type="text" onClick={resetColumns} icon={<Icon name="refresh" />}>
            Reset to Default
          </Button>
        )
      }
    ]
  };

  if (loading) {
    return (
      <Card>
        {(title || icon) && (
          <PageHeader title={title} icon={icon} subtitle={subtitle} />
        )}
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card>
      {(title || icon || extra) && (
        <PageHeader 
          title={title}
          icon={icon}
          subtitle={subtitle}
          extra={
            <Space>
              {showSearch && (
                <Search
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onSearch={setSearchTerm}
                  className="w-64"
                  allowClear
                />
              )}
              {showColumnConfig && (
                <Dropdown menu={columnConfigMenu} trigger={['click']} placement="bottomRight">
                  <Tooltip title="Configure Columns">
                    <ActionButton icon="settings" />
                  </Tooltip>
                </Dropdown>
              )}
              {extra}
            </Space>
          }
        />
      )}
      
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={rowKey}
        onRow={onRow}
        onChange={handleTableChange}
        scroll={scroll}
        pagination={{
          pageSize: defaultPageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={emptyImage || Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          )
        }}
        {...tableProps}
      />
    </Card>
  );
}