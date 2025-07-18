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
  Skeleton,
  Modal,
  Form,
  Switch,
  Divider,
  Typography,
  message,
  Row,
  Col,
  Popconfirm
} from 'antd';
import { Icon } from './Icon';
import { ActionButton } from './ActionButton';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

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
  defaultSortField = null,
  defaultSortOrder = 'descend', // Latest first by default
  rowSelection = null,
  onDelete = null,
  ...tableProps
}) {
  // Filter out invalid column objects to prevent errors
  const safeInitialColumns = useMemo(() => {
    return initialColumns.filter(col => 
      col && 
      typeof col === 'object' && 
      col.key && 
      col.title
    );
  }, [initialColumns]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    safeInitialColumns.map(col => col.key)
  );
  const [fixedColumns, setFixedColumns] = useState(() => {
    const initial = {};
    safeInitialColumns.forEach(col => {
      if (col.key === 'actions') {
        initial[col.key] = 'right'; // Actions column fixed right by default
      } else {
        initial[col.key] = col.fixed || false;
      }
    });
    return initial;
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState(() => {
    // Set default sort if specified
    if (defaultSortField) {
      return {
        field: defaultSortField,
        order: defaultSortOrder
      };
    }
    return {};
  });
  const [configForm] = Form.useForm();
  const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
  const [tempFixedColumns, setTempFixedColumns] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Enhanced columns with visibility, fixed settings, and working filters/sorters
  const enhancedColumns = useMemo(() => {
    return safeInitialColumns
      .filter(col => visibleColumns.includes(col.key))
      .map(col => ({
        ...col,
        fixed: fixedColumns[col.key] || false,
        sorter: col.sorter !== false ? (
          col.sorter || ((a, b) => {
            const aVal = col.dataIndex ? a[col.dataIndex] : '';
            const bVal = col.dataIndex ? b[col.dataIndex] : '';
            
            // Handle different data types
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return aVal - bVal;
            }
            if (aVal instanceof Date && bVal instanceof Date) {
              return aVal.getTime() - bVal.getTime();
            }
            // String comparison
            return String(aVal).localeCompare(String(bVal));
          })
        ) : false,
        // Set default sort order for the default sort field
        defaultSortOrder: col.key === defaultSortField ? defaultSortOrder : undefined,
        filterable: col.filterable !== false,
        ...(col.filterable !== false && !col.filterDropdown && {
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="p-3 w-64">
              <Input
                placeholder={`Search ${col.title}`}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => confirm()}
                className="mb-2 block"
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => confirm()}
                  icon={<Icon name="search" />}
                  size="small"
                >
                  Search
                </Button>
                <Button onClick={() => clearFilters()} size="small">
                  Reset
                </Button>
              </Space>
            </div>
          ),
          filterIcon: filtered => (
            <Icon 
              name="filter_list" 
              className={filtered ? 'text-blue-600' : 'text-gray-400'} 
            />
          ),
          onFilter: col.onFilter || ((value, record) => {
            const dataIndex = col.dataIndex;
            if (!dataIndex) return true;
            
            let fieldValue;
            if (Array.isArray(dataIndex)) {
              fieldValue = dataIndex.reduce((obj, key) => obj?.[key], record);
            } else {
              fieldValue = record[dataIndex];
            }
            
            return fieldValue?.toString()?.toLowerCase()?.includes(value.toLowerCase());
          })
        })
      }));
  }, [safeInitialColumns, visibleColumns, fixedColumns, defaultSortField, defaultSortOrder]);

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

  const handleRowSelectionChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleDeleteSelected = () => {
    if (onDelete && selectedRowKeys.length > 0) {
      Modal.confirm({
        title: `Delete ${selectedRowKeys.length} selected item(s)?`,
        content: 'This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          onDelete(selectedRowKeys);
          setSelectedRowKeys([]);
        }
      });
    }
  };

  const handleColumnVisibilityChange = (columnKeys) => {
    setTempVisibleColumns(columnKeys);
    configForm.setFieldsValue({ visibleColumns: columnKeys });
  };

  const handleColumnFixedChange = (columnKey, fixed) => {
    const newFixedColumns = { ...tempFixedColumns, [columnKey]: fixed };
    setTempFixedColumns(newFixedColumns);
    configForm.setFieldsValue({ fixedColumns: newFixedColumns });
  };

  const resetColumns = () => {
    const defaultVisible = safeInitialColumns.map(col => col.key);
    const defaultFixed = {};
    safeInitialColumns.forEach(col => {
      if (col.key === 'actions') {
        defaultFixed[col.key] = 'right';
      } else {
        defaultFixed[col.key] = col.fixed || false;
      }
    });
    
    setTempVisibleColumns(defaultVisible);
    setTempFixedColumns(defaultFixed);
    configForm.setFieldsValue({
      visibleColumns: defaultVisible,
      fixedColumns: defaultFixed
    });
  };

  const handleConfigSubmit = () => {
    try {
      const values = configForm.getFieldsValue();
      
      // Validate that at least one column is visible
      if (!values.visibleColumns || values.visibleColumns.length === 0) {
        message.error('At least one column must be visible');
        return;
      }

      // Apply the changes
      setVisibleColumns(values.visibleColumns);
      setFixedColumns(values.fixedColumns || {});
      setShowConfigModal(false);
      message.success('Table configuration updated successfully');
    } catch (error) {
      message.error('Failed to update table configuration');
    }
  };

  const openConfigModal = () => {
    // Initialize temp state with current values
    setTempVisibleColumns([...visibleColumns]);
    setTempFixedColumns({ ...fixedColumns });
    
    configForm.setFieldsValue({
      visibleColumns: [...visibleColumns],
      fixedColumns: { ...fixedColumns }
    });
    setShowConfigModal(true);
  };

  const handleConfigCancel = () => {
    // Reset temp state
    setTempVisibleColumns([]);
    setTempFixedColumns({});
    configForm.resetFields();
    setShowConfigModal(false);
  };

  const enhancedRowSelection = rowSelection ? {
    ...rowSelection,
    selectedRowKeys,
    onChange: handleRowSelectionChange,
  } : null;

  if (loading) {
    return (
      <Card>
        {(title || icon) && (
          <div className="flex items-center mb-4">
            {icon && <Icon name={icon} className="text-[#0E72BD] mr-2" size="text-xl" />}
            <Text strong className="text-lg">{title}</Text>
          </div>
        )}
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-x-auto">
        {(title || icon || extra || showSearch || showColumnConfig) && (
          <div className="flex items-center justify-between mb-4">
            {(title || icon) && (
              <div className="flex items-center">
                {icon && <Icon name={icon} className="text-[#0E72BD] mr-2" size="text-xl" />}
                <div>
                  {title && <Text strong className="text-lg">{title}</Text>}
                  {subtitle && (
                    <Text type="secondary" className="text-sm block">
                      {subtitle}
                    </Text>
                  )}
                </div>
              </div>
            )}
            
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
              
              {selectedRowKeys.length > 0 && onDelete && (
                <Popconfirm
                  title={`Delete ${selectedRowKeys.length} selected item(s)?`}
                  onConfirm={handleDeleteSelected}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <ActionButton 
                    danger
                    icon="delete"
                    disabled
                  >
                    Delete Selected ({selectedRowKeys.length})
                  </ActionButton>
                </Popconfirm>
              )}
              
              {showColumnConfig && (
                <Tooltip title="Configure Columns">
                  <ActionButton 
                    icon="settings" 
                    onClick={openConfigModal}
                  />
                </Tooltip>
              )}
              
              {extra}
            </Space>
          </div>
        )}
        
        <Table
          columns={enhancedColumns}
          dataSource={filteredData}
          rowKey={rowKey}
          onRow={onRow}
          onChange={handleTableChange}
          scroll={scroll}
          rowSelection={enhancedRowSelection}
          pagination={{
            pageSize: defaultPageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
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

      {/* Column Configuration Modal */}
      <Modal
        title={
          <Space>
            <Icon name="settings" className="text-blue-600" />
            <span>Configure Table Columns</span>
          </Space>
        }
        open={showConfigModal}
        onCancel={handleConfigCancel}
        width={600}
        footer={[
          <ActionButton key="reset" onClick={resetColumns}>
            Reset to Default
          </ActionButton>,
          <ActionButton key="cancel" onClick={handleConfigCancel}>
            Cancel
          </ActionButton>,
          <ActionButton.Primary 
            key="apply" 
            onClick={handleConfigSubmit}
          >
            Apply Changes
          </ActionButton.Primary>
        ]}
        destroyOnClose
      >
        <Form
          form={configForm}
          layout="vertical"
          preserve={false}
        >
          <div className="space-y-6">
            {/* Column Visibility */}
            <div>
              <Text strong className="text-base">Column Visibility</Text>
              <Text type="secondary" className="block mb-3">
                Select which columns to display in the table
              </Text>
              <Form.Item name="visibleColumns">
                <Checkbox.Group 
                  className="w-full"
                  value={tempVisibleColumns}
                  onChange={handleColumnVisibilityChange}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {safeInitialColumns.map(col => (
                      <Checkbox 
                        key={col.key} 
                        value={col.key}
                      >
                        {col.title}
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </div>

            <Divider />

            {/* Fixed Columns */}
            <div>
              <Text strong className="text-base">Fixed Columns</Text>
              <Text type="secondary" className="block mb-3">
                Pin columns to the left or right side of the table
              </Text>
              <div className="space-y-3">
                {safeInitialColumns.map(col => (
                  <div key={col.key} className="flex items-center justify-between p-2 border rounded">
                    <Text>{col.title}</Text>
                    <Select
                      value={tempFixedColumns[col.key] || 'none'}
                      onChange={value => handleColumnFixedChange(col.key, value === 'none' ? false : value)}
                      className="w-32"
                      size="small"
                    >
                      <Option value="none">Not Fixed</Option>
                      <Option value="left">Fix Left</Option>
                      <Option value="right">Fix Right</Option>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Table Info */}
            <div className="bg-blue-50 p-3 rounded">
              <Text className="text-sm">
                <Icon name="info" className="mr-2 text-blue-600" />
                <strong>Tips:</strong> Fixed columns will remain visible when scrolling horizontally. 
                The Actions column is fixed to the right by default for better usability.
              </Text>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}