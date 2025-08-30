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
  Modal,
  Form,
  Input,
  Select
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { DetailModal } from '../common/DetailModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCustomers, 
  fetchCustomerById, 
  updateCustomer, 
  deleteCustomer 
} from '../../features/customers/customersSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function CustomerManagement() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const customers = useSelector(state => state.customers.customersList);
  const loading = useSelector(state => state.customers.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (hasPermission('user-management', 'view')) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, hasPermission]);

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (customer) => {
    if (!hasPermission('user-management', 'edit')) {
      message.error('You do not have permission to edit customers');
      return;
    }
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setShowEditModal(true);
  };

  const handleDelete = (customerId) => {
    if (!hasPermission('user-management', 'delete')) {
      message.error('You do not have permission to delete customers');
      return;
    }
    dispatch(deleteCustomer({ id: customerId }));
  };

  const handleToggleStatus = (customer) => {
    if (!hasPermission('user-management', 'edit')) {
      message.error('You do not have permission to modify customers');
      return;
    }
    const updatedCustomer = { ...customer, isActive: !customer.isActive };
    dispatch(updateCustomer({ id: customer.id, customerData: updatedCustomer }));
  };

  const handleRowClick = (customer) => {
    dispatch(fetchCustomerById({ id: customer.id }));
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleSubmitEdit = async (values) => {
    try {
      const customerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        isActive: values.isActive
      };

      dispatch(updateCustomer({ id: editingCustomer.id, customerData }));
      setShowEditModal(false);
      setEditingCustomer(null);
      form.resetFields();
      message.success('Customer updated successfully');
    } catch (error) {
      message.error('Failed to update customer');
    }
  };

  const columns = [
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
              background: record.isActive ? '#0E72BD' : '#d9d9d9',
              color: 'white'
            }}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary" className="text-sm">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (record) => (
        <div>
          <Text>{record.phone}</Text>
          <br />
          <Text type="secondary" className="text-sm">{record.city}</Text>
        </div>
      ),
    },
    {
      title: 'Orders',
      key: 'orders',
      width: 120,
      render: (record) => (
        <div className="text-center">
          <Text strong className="text-blue-600">{record.totalOrders || 0}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Rs.{(record.totalSpent || 0).toFixed(2)}
          </Text>
        </div>
      ),
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
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (createdAt) => (
        <Text className="text-sm">
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <Tooltip title={hasPermission('user-management', 'edit') ? 'Edit Customer' : 'No permission'}>
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
            !hasPermission('user-management', 'delete') ? 'No permission' : 'Delete Customer'
          }>
            <Popconfirm
              title="Delete this customer?"
              description="This action cannot be undone. Customer with orders cannot be deleted."
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
          description="You do not have permission to view customer management."
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
        {/* Customer Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Customers</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.totalOrders > 0).length}
              </div>
              <div className="text-sm text-gray-500">With Orders</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {customers.filter(c => 
                  new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-gray-500">New (30 days)</div>
            </Card>
          </Col>
        </Row>
        
        <EnhancedTable
          title="E-commerce Customers"
          icon="people"
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-blue-50'
          })}
          searchFields={['firstName', 'lastName', 'email', 'phone', 'city']}
          searchPlaceholder="Search customers..."
          showSearch={true}
          emptyDescription="No customers found"
          emptyImage={<Icon name="people" className="text-6xl text-gray-300" />}
        />
      </Card>

      {/* Edit Customer Modal */}
      <Modal
        title="Edit Customer"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitEdit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea
              rows={3}
              placeholder="Enter address"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
              >
                <Input placeholder="Enter postal code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Active Customer" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <ActionButton onClick={() => setShowEditModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              Update Customer
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Customer Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCustomer(null);
        }}
        title={`Customer Details - ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
        icon="person"
        data={selectedCustomer}
        type="customer"
        actions={[
          hasPermission('user-management', 'edit') && (
            <ActionButton 
              key="edit" 
              icon="edit"
              onClick={() => {
                setShowDetailModal(false);
                handleEdit(selectedCustomer);
              }}
            >
              Edit Customer
            </ActionButton>
          )
        ].filter(Boolean)}
      />
    </>
  );
}