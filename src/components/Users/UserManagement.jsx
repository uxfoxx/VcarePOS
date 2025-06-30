import React, { useState } from 'react';
import { 
  Card, 
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
  Checkbox
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { UserModal } from './UserModal';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;

export function UserManagement() {
  const { users, currentUser, hasPermission, updateUser, deleteUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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

  const handleBulkDelete = (userIds) => {
    if (!hasPermission('user-management', 'delete')) {
      message.error('You do not have permission to delete users');
      return;
    }
    
    // Filter out current user from deletion
    const validUserIds = userIds.filter(id => id !== currentUser?.id);
    
    if (validUserIds.length !== userIds.length) {
      message.warning('Your own account was excluded from deletion');
    }
    
    if (validUserIds.length === 0) {
      return;
    }
    
    validUserIds.forEach(id => {
      deleteUser(id);
    });
    
    message.success(`${validUserIds.length} users deleted successfully`);
    setSelectedRowKeys([]);
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

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
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
      fixed: 'left',
      width: 250,
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
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={getRoleColor(role)} className="capitalize">
          {role}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'Cashier', value: 'cashier' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
            size="small"
            disabled={record.id === currentUser?.id || !hasPermission('user-management', 'edit')}
            onClick={(checked, e) => e.stopPropagation()}
          />
          <Text className="text-sm">
            {record.isActive ? 'Active' : 'Inactive'}
          </Text>
        </div>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      sorter: (a, b) => new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0),
      render: (lastLogin) => (
        <div>
          {lastLogin ? (
            <Text className="text-sm">
              {new Date(lastLogin).toLocaleDateString()}
            </Text>
          ) : (
            <Text type="secondary" className="text-sm">Never</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <Tooltip title={hasPermission('user-management', 'edit') ? 'Edit User' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              disabled={!hasPermission('user-management', 'edit')}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title={
            !hasPermission('user-management', 'delete') ? 'No permission' :
            record.id === currentUser?.id ? 'Cannot delete own account' : 'Delete User'
          }>
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={record.id === currentUser?.id || !hasPermission('user-management', 'delete')}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                disabled={record.id === currentUser?.id || !hasPermission('user-management', 'delete')}
                onClick={(e) => e.stopPropagation()}
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
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view user management."
        />
      </Card>
    );
  }

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <Card>
        <PageHeader
          title="User Management"
          icon="people"
        />

        {/* User Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
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
        
        <EnhancedTable
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          rowSelection={hasPermission('user-management', 'delete') ? {
            type: 'checkbox',
            onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
            getCheckboxProps: (record) => ({
              disabled: record.id === currentUser?.id
            })
          } : null}
          onDelete={handleBulkDelete}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-blue-50'
          })}
          searchFields={['firstName', 'lastName', 'username', 'email', 'role']}
          searchPlaceholder="Search users..."
          showSearch={true}
          extra={
            hasPermission('user-management', 'edit') && (
              <ActionButton.Primary 
                icon="person_add"
                onClick={() => setShowModal(true)}
              >
                Add User
              </ActionButton.Primary>
            )
          }
          emptyDescription="No users found"
          emptyImage={<Icon name="people" className="text-6xl text-gray-300" />}
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

      {/* User Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        title={`User Details - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        icon="person"
        data={selectedUser}
        type="user"
        actions={[
          hasPermission('user-management', 'edit') && (
            <ActionButton 
              key="edit" 
              icon="edit"
              onClick={() => {
                setShowDetailModal(false);
                handleEdit(selectedUser);
              }}
            >
              Edit User
            </ActionButton>
          )
        ].filter(Boolean)}
      />
    </>
  );
}