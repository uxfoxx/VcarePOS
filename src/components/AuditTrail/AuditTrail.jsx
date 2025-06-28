import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Space, 
  Typography,
  Tag,
  Avatar,
  Row,
  Col,
  DatePicker,
  Descriptions,
  Modal,
  Timeline
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function AuditTrail() {
  const { auditTrail, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredAuditTrail = auditTrail.filter(entry => {
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

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => (
        <div>
          <Text className="text-sm">
            {new Date(timestamp).toLocaleDateString()}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Avatar size={32} style={{ backgroundColor: '#0E72BD' }}>
            {record.userName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <Text strong className="text-sm">{record.userName}</Text>
            <br />
            <Text type="secondary" className="text-xs">ID: {record.userId}</Text>
          </div>
        </div>
      ),
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
      width: 100,
      render: (record) => (
        <ActionButton.Text
          icon="visibility"
          onClick={() => handleViewDetails(record)}
          className="text-[#0E72BD]"
        />
      ),
    },
  ];

  const uniqueModules = [...new Set(auditTrail.map(entry => entry.module))];
  const uniqueActions = [...new Set(auditTrail.map(entry => entry.action))];

  if (!hasPermission('audit-trail', 'view')) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon name="lock" className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Access Denied</Title>
          <Text type="secondary">
            You do not have permission to view the audit trail.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <PageHeader
          title="Audit Trail"
          icon="history"
          subtitle="Track all system changes and user activities"
          extra={
            <Space>
              <SearchInput
                placeholder="Search activities..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-64"
              />
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
        />

        {/* Activity Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-[#0E72BD]">{auditTrail.length}</div>
              <div className="text-sm text-gray-500">Total Activities</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {auditTrail.filter(e => e.action === 'CREATE').length}
              </div>
              <div className="text-sm text-gray-500">Created</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {auditTrail.filter(e => e.action === 'UPDATE').length}
              </div>
              <div className="text-sm text-gray-500">Updated</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {auditTrail.filter(e => e.action === 'DELETE').length}
              </div>
              <div className="text-sm text-gray-500">Deleted</div>
            </Card>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredAuditTrail}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} activities`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Activity Details"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        width={600}
        footer={[
          <ActionButton key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </ActionButton>
        ]}
      >
        {selectedEntry && (
          <div className="space-y-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Activity ID">
                <Text code>{selectedEntry.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <div className="flex items-center space-x-2">
                  <Avatar size={24} style={{ backgroundColor: '#0E72BD' }}>
                    {selectedEntry.userName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Text>{selectedEntry.userName}</Text>
                  <Text type="secondary">({selectedEntry.userId})</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Action">
                <Tag 
                  color={getActionColor(selectedEntry.action)} 
                  icon={<Icon name={getActionIcon(selectedEntry.action)} size="text-xs" />}
                >
                  {selectedEntry.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                <div className="flex items-center space-x-2">
                  <Icon name={getModuleIcon(selectedEntry.module)} className="text-gray-500" />
                  <Text className="capitalize">{selectedEntry.module.replace('-', ' ')}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedEntry.description}
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {new Date(selectedEntry.timestamp).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                <Text code>{selectedEntry.ipAddress}</Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
              <div>
                <Title level={5}>Additional Details</Title>
                <Card size="small" className="bg-gray-50">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </pre>
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}