import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Space, 
  Typography,
  Tag,
  Avatar,
  Row,
  Col,
  DatePicker,
  Tooltip
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { getOrFetch } from '../../utils/cache';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function AuditTrail() {
  const { auditTrail, hasPermission, getAuditTrail } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [auditData, setAuditData] = useState([]);

  // Load cached audit trail data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Use context data directly
      setAuditData(auditTrail);
      setLoading(false);
    };
    
    fetchData();
  }, [auditTrail, getAuditTrail]);

  const filteredAuditTrail = auditData.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    const matchesModule = filterModule === 'all' || entry.module === filterModule;
    
    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const entryDate = dayjs(entry.timestamp);
      matchesDate = entryDate.isAfter(dateRange[0].startOf('day')) && 
                   entryDate.isBefore(dateRange[1].endOf('day'));
    }
    
    return matchesSearch && matchesAction && matchesModule && matchesDate;
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'LOGIN': return 'purple';
      case 'LOGOUT': return 'orange';
      default: return 'default';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return 'add_circle';
      case 'UPDATE': return 'edit';
      case 'DELETE': return 'delete';
      case 'LOGIN': return 'login';
      case 'LOGOUT': return 'logout';
      default: return 'info';
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'products': return 'inventory_2';
      case 'raw-materials': return 'category';
      case 'transactions': return 'receipt_long';
      case 'user-management': return 'people';
      case 'authentication': return 'security';
      case 'settings': return 'settings';
      case 'coupons': return 'local_offer';
      case 'tax': return 'receipt';
      default: return 'info';
    }
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleRowClick = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      fixed: 'left',
      render: (timestamp) => (
        <Text className="text-sm">
          {new Date(timestamp).toLocaleDateString()}
          <br />
          {new Date(timestamp).toLocaleTimeString()}
        </Text>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'User',
      key: 'user',
      width: 150,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Avatar size={32} style={{ backgroundColor: '#0E72BD' }}>
            {record.userName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Text strong className="text-sm">{record.userName}</Text>
        </div>
      ),
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action) => (
        <Tag 
          color={getActionColor(action)} 
          icon={<Icon name={getActionIcon(action)} size="text-xs" />}
        >
          {action}
        </Tag>
      ),
      filters: [
        { text: 'CREATE', value: 'CREATE' },
        { text: 'UPDATE', value: 'UPDATE' },
        { text: 'DELETE', value: 'DELETE' },
        { text: 'LOGIN', value: 'LOGIN' },
        { text: 'LOGOUT', value: 'LOGOUT' },
      ],
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 150,
      render: (module) => (
        <div className="flex items-center space-x-2">
          <Icon name={getModuleIcon(module)} className="text-gray-500" />
          <Text className="capitalize">{module.replace('-', ' ')}</Text>
        </div>
      ),
      filters: [...new Set(auditData.map(entry => entry.module))].map(module => ({
        text: module.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: module
      })),
      onFilter: (value, record) => record.module === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Text className="text-sm">{description}</Text>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip) => (
        <Text code className="text-xs">{ip}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (record) => (
        <Tooltip title="View Details">
          <ActionButton.Text
            icon="visibility"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(record);
            }}
            className="text-blue-600"
          />
        </Tooltip>
      ),
    },
  ];

  const uniqueModules = [...new Set(auditData.map(entry => entry.module))];
  const uniqueActions = [...new Set(auditData.map(entry => entry.action))];

  if (!hasPermission('audit-trail', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view the audit trail."
        />
      </Card>
    );
  }

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <EnhancedTable
        title="Audit Trail"
        icon="history"
        columns={columns}
        dataSource={filteredAuditTrail}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['description', 'userName', 'module']}
        searchPlaceholder="Search activities..."
        extra={
          <Space>
            <Select
              value={filterAction}
              onChange={setFilterAction}
              className="w-32"
              placeholder="Action"
            >
              <Option value="all">All Actions</Option>
              {uniqueActions.map(action => (
                <Option key={action} value={action}>{action}</Option>
              ))}
            </Select>
            <Select
              value={filterModule}
              onChange={setFilterModule}
              className="w-40"
              placeholder="Module"
            >
              <Option value="all">All Modules</Option>
              {uniqueModules.map(module => (
                <Option key={module} value={module}>
                  {module.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Space>
        }
        emptyDescription="No audit trail entries found"
        emptyImage={<Icon name="history" className="text-6xl text-gray-300" />}
      />

      {/* Activity Statistics */}
      <Row gutter={16} className="mb-6 mt-4">
        <Col span={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{auditData.length}</div>
            <div className="text-sm text-gray-500">Total Activities</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {auditData.filter(e => e.action === 'CREATE').length}
            </div>
            <div className="text-sm text-gray-500">Created</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {auditData.filter(e => e.action === 'UPDATE').length}
            </div>
            <div className="text-sm text-gray-500">Updated</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {auditData.filter(e => e.action === 'DELETE').length}
            </div>
            <div className="text-sm text-gray-500">Deleted</div>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEntry(null);
        }}
        title={`Activity Details - ${selectedEntry?.id}`}
        icon="history"
        data={selectedEntry}
        type="auditEntry"
      />
    </>
  );
}