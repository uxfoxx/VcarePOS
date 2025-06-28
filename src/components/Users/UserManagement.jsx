import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Typography,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Row,
  Col,
  Switch,
  Tooltip,
  Badge
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { UserModal } from './UserModal';

const { Title, Text } = Typography;

export function UserManagement() {
  const { users, currentUser, hasPermission, updateUser, deleteUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    if (!hasPermission('user-management', 'edit')) {
      message.error('You do not have permission to edit users');
      return;
    }
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (!hasPermission('user-management', 'delete')) {
      message.error('You do not have permission to delete users');
      return;
    }
    
    if (userId === currentUser?.id) {
      message.error('You cannot delete your own account');
      return;
    }
    
    deleteUser(userId);
    message.success('User deleted successfully');
  };

  const handleToggleStatus = (user) => {
    if (!hasPermission('user-management', 'edit')) {
      message.error('You do not have permission to modify users');
      return;
    }
    
    if (user.id === currentUser?.id) {
      message.error('You cannot deactivate your own account');
      return;
    }
    
    const updatedUser = { ...user, isActive: !user.isActive };
    updateUser(updatedUser);
    message.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'}`);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'manager': return 'blue';
      case 'cashier': return 'green';
      default: return 'default';
    }
  };

  const getPermissionCount = (permissions) => {
    let count = 0;
    Object.values(permissions).forEach(modulePerms => {
      if (modulePerms.view) count++;
      if (modulePerms.edit) count++;
      if (modulePerms.delete) count++;
    });
    return count;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40}
            style={{ 
              background: record.isActive ? '#0E72BD' : '#d9d9d9',
              color: 'white'
            }}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <Text strong>{record.firstName} {record.lastName}</Text>
              {record.id === currentUser?.id && (
                <Tag color="blue" size="small">You</Tag>
              )}
            </div>
            <Text type="secondary" className="text-sm">@{record.username}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} className="capitalize">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (record) => {
        const permCount = getPermissionCount(record.permissions);
        const totalModules = Object.keys(record.permissions).length;
        const activeModules = Object.values(record.permissions).filter(p => p.view).length;
        
        return (
          <div>
            <Text strong>{activeModules}/{totalModules}</Text>
            <Text type="secondary" className="text-sm block">
              modules access
            </Text>
            <Text type="secondary" className="text-xs">
              {permCount} total permissions
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin) => (
        <div>
          {lastLogin ? (
            <>
              <Text className="text-sm">
                {new Date(lastLogin).toLocaleDateString()}
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {new Date(lastLogin).toLocaleTimeString()}
              </Text>
            </>
          ) : (
            <Text type="secondary" className="text-sm">Never</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
            size="small"
            disabled={record.id === currentUser?.id || !hasPermission('user-management', 'edit')}
          />
          <Text className="text-sm">
            {record.isActive ? 'Active' : 'Inactive'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text className="text-sm">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Tooltip title={hasPermission('user-management', 'edit') ? 'Edit User' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={() => handleEdit(record)}
              disabled={!hasPermission('user-management', 'edit')}
              className="text-[#0E72BD]"
            />
          </Tooltip>
          
          <Tooltip title={
            !hasPermission('user-management', 'delete') ? 'No permission' :
            record.id === currentUser?.id ? 'Cannot delete own account' : 'Delete User'
          }>
            <Popconfirm
              title="Are you sure you want to delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
              disabled={record.id === currentUser?.id || !hasPermission('user-management', 'delete')}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                disabled={record.id === currentUser?.id || !hasPermission('user-management', 'delete')}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!hasPermission('user-management', 'view')) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon name="lock" className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Access Denied</Title>
          <Text type="secondary">
            You do not have permission to view user management.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <PageHeader
          title="User Management"
          icon="people"
          subtitle="Manage user accounts and permissions"
          extra={
            <Space>
              <SearchInput
                placeholder="Search users..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-64"
              />
              {hasPermission('user-management', 'edit') && (
                <ActionButton.Primary 
                  icon="person_add"
                  onClick={() => setShowModal(true)}
                >
                  Add User
                </ActionButton.Primary>
              )}
            </Space>
          }
        />

        {/* User Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-[#0E72BD]">{users.length}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-500">Administrators</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.lastLogin && 
                  new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-gray-500">Active Today</div>
            </Card>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <UserModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        editingUser={editingUser}
      />
    </>
  );
}