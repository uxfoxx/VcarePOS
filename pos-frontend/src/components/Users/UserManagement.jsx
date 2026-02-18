import React, { useState, useEffect } from 'react';
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
  Tabs
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { UserModal } from './UserModal';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser } from '../../features/users/usersSlice';
import apiClient from '../../api/apiClient';

const { Title, Text } = Typography;

export function UserManagement() {
  const dispatch = useDispatch();
  const { currentUser, hasPermission } = useAuth();

  const users = useSelector(state => state.users.usersList);
  const loading = useSelector(state => state.users.loading);

  const [activeTab, setActiveTab] = useState('pos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [customerStats, setCustomerStats] = useState({
    totalOrders: {},
    newCustomers: 0
  });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      dispatch(fetchUsers());
      fetchCustomerStats();
    }
  }, [currentUser, dispatch]);

  const fetchCustomerStats = async () => {
    try {
      const response = await apiClient.get('/ecommerce/orders');
      const orders = response.data;

      const ordersByCustomer = {};
      orders.forEach(order => {
        if (order.customer_email) {
          ordersByCustomer[order.customer_email] =
            (ordersByCustomer[order.customer_email] || 0) + 1;
        }
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const newCustomers = users.filter(
        u => u.role === 'customer' && new Date(u.createdAt) > thirtyDaysAgo
      ).length;

      setCustomerStats({
        totalOrders: ordersByCustomer,
        newCustomers
      });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const posUsers = users.filter(u => ['admin', 'manager', 'cashier'].includes(u.role));
  const ecommerceCustomers = users.filter(u => u.role === 'customer');

  const currentUsers = activeTab === 'pos' ? posUsers : ecommerceCustomers;

  const filteredUsers = currentUsers.filter(user =>
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
    dispatch(deleteUser({ userId }));
    message.success('User deleted successfully');
  };

  const handleBulkDelete = (userIds) => {
    if (!hasPermission('user-management', 'delete')) {
      message.error('You do not have permission to delete users');
      return;
    }
    const validUserIds = userIds.filter(id => id !== currentUser?.id);

    if (validUserIds.length !== userIds.length) {
      message.warning('Your own account was excluded from deletion');
    }

    if (validUserIds.length === 0) {
      return;
    }

    validUserIds.forEach(id => {
      dispatch(deleteUser({ userId: id }));
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
    dispatch(updateUser({ id: updatedUser.id, userData: updatedUser }));
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
      case 'customer': return 'purple';
      default: return 'default';
    }
  };

  const posColumns = [
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

  const customerColumns = [
    {
      title: 'Customer',
      key: 'customer',
      fixed: 'left',
      width: 250,
      render: (record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size={40}
            style={{
              background: record.isActive ? '#9333EA' : '#d9d9d9',
              color: 'white'
            }}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <Text type="secondary" className="text-sm block">@{record.username}</Text>
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
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => phone || <Text type="secondary">N/A</Text>
    },
    {
      title: 'Registration Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      render: (createdAt) => (
        <Text className="text-sm">
          {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Total Orders',
      key: 'totalOrders',
      width: 120,
      render: (record) => (
        <div className="text-center">
          <Text className="text-sm font-semibold">
            {customerStats.totalOrders[record.email] || 0}
          </Text>
        </div>
      ),
      sorter: (a, b) =>
        (customerStats.totalOrders[a.email] || 0) - (customerStats.totalOrders[b.email] || 0),
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
            disabled={!hasPermission('user-management', 'edit')}
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
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <ActionButton.Text
              icon="visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>

          <Tooltip title={
            !hasPermission('user-management', 'delete') ? 'No permission' : 'Delete Customer'
          }>
            <Popconfirm
              title="Delete this customer?"
              description="This action cannot be undone."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!hasPermission('user-management', 'delete')}
            >
              <ActionButton.Text
                icon="delete"
                danger
                disabled={!hasPermission('user-management', 'delete')}
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

  const customersWithOrders = ecommerceCustomers.filter(
    c => customerStats.totalOrders[c.email] > 0
  ).length;

  return (
    <>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchTerm('');
            setSelectedRowKeys([]);
          }}
          items={[
            {
              key: 'pos',
              label: (
                <span className="flex items-center gap-2">
                  <Icon name="badge" className="text-lg" />
                  POS Users
                </span>
              ),
              children: (
                <>
                  <Row gutter={16} className="mb-6">
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{posUsers.length}</div>
                        <div className="text-sm text-gray-500">Total POS Users</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {posUsers.filter(u => u.isActive).length}
                        </div>
                        <div className="text-sm text-gray-500">Active Users</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {posUsers.filter(u => u.role === 'admin').length}
                        </div>
                        <div className="text-sm text-gray-500">Administrators</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {posUsers.filter(u => u.lastLogin &&
                            new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ).length}
                        </div>
                        <div className="text-sm text-gray-500">Active Today</div>
                      </Card>
                    </Col>
                  </Row>

                  <EnhancedTable
                    title="POS Users"
                    icon="badge"
                    columns={posColumns}
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
                    searchPlaceholder="Search POS users..."
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
                    emptyDescription="No POS users found"
                    emptyImage={<Icon name="badge" className="text-6xl text-gray-300" />}
                  />
                </>
              )
            },
            {
              key: 'customers',
              label: (
                <span className="flex items-center gap-2">
                  <Icon name="shopping-bag" className="text-lg" />
                  E-commerce Customers
                </span>
              ),
              children: (
                <>
                  <Row gutter={16} className="mb-6">
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {ecommerceCustomers.length}
                        </div>
                        <div className="text-sm text-gray-500">Total Customers</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {ecommerceCustomers.filter(u => u.isActive).length}
                        </div>
                        <div className="text-sm text-gray-500">Active Customers</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {customersWithOrders}
                        </div>
                        <div className="text-sm text-gray-500">Customers with Orders</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {customerStats.newCustomers}
                        </div>
                        <div className="text-sm text-gray-500">New Customers (30d)</div>
                      </Card>
                    </Col>
                  </Row>

                  <EnhancedTable
                    title="E-commerce Customers"
                    icon="shopping-bag"
                    columns={customerColumns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    rowSelection={hasPermission('user-management', 'delete') ? {
                      type: 'checkbox',
                      onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
                    } : null}
                    onDelete={handleBulkDelete}
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                      className: 'cursor-pointer hover:bg-purple-50'
                    })}
                    searchFields={['firstName', 'lastName', 'username', 'email']}
                    searchPlaceholder="Search customers..."
                    showSearch={true}
                    emptyDescription="No customers found"
                    emptyImage={<Icon name="shopping-bag" className="text-6xl text-gray-300" />}
                  />
                </>
              )
            }
          ]}
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

      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        title={`${activeTab === 'pos' ? 'User' : 'Customer'} Details - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        icon={activeTab === 'pos' ? 'person' : 'shopping-bag'}
        data={selectedUser ? {
          ...selectedUser,
          ...(activeTab === 'customers' && {
            totalOrders: customerStats.totalOrders[selectedUser.email] || 0
          })
        } : null}
        type="user"
        actions={[
          hasPermission('user-management', 'edit') && activeTab === 'pos' && (
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
