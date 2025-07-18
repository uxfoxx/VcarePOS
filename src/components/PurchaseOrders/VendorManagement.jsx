import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchVendors, 
  addVendor, 
  updateVendor, 
  deleteVendor
} from '../../features/vendors/vendorsSlice';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Typography, 
  Popconfirm, 
  message,
  Tag,
  Tooltip,
  Select
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { SearchInput } from '../common/SearchInput';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function VendorManagement() {
  const dispatch = useDispatch();
  const vendors = useSelector(state => state.vendors.vendorsList);
  const loading = useSelector(state => state.vendors.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEdit = () => {
    form.validateFields()
      .then(values => {
        if (editingVendor) {
          // Update existing vendor
          const updatedVendor = { ...editingVendor, ...values };
          dispatch(updateVendor(updatedVendor));
          message.success('Vendor updated successfully'); // todo
        } else {
          // Add new vendor
          const newVendor = {
            id: `V${String(vendors.length + 1).padStart(3, '0')}`,
            ...values,
            isActive: true
          };
          dispatch(addVendor(newVendor));
          message.success('Vendor added successfully'); // todo
        }
        setModalVisible(false);
        form.resetFields();
        setEditingVendor(null);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    form.setFieldsValue(vendor);
    setModalVisible(true);
  };

  const handleDelete = (vendorId) => {
    dispatch(deleteVendor({ id: vendorId }));
    message.success('Vendor deleted successfully'); // todo
  };

  const handleToggleStatus = (vendor) => {
    const updatedVendor = { ...vendor, isActive: !vendor.isActive };
    dispatch(updateVendor(updatedVendor));
    message.success(`Vendor ${!vendor.isActive ? 'activated' : 'deactivated'} successfully`);
  };

  const columns = [
    {
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">ID: {record.id}</Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: [...new Set(vendors.map(v => v.category))].map(cat => ({
        text: cat,
        value: cat
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record) => (
        <div>
          <Text>{record.email}</Text>
          <br />
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <div 
          className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${record.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
          onClick={() => handleToggleStatus(record)}
        >
          <span 
            className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${record.isActive ? 'transform translate-x-5' : ''}`}
          />
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
      render: (record) => (
        <Space>
          <Tooltip title="Edit">
            <ActionButton.Text
              icon="edit"
              onClick={() => handleEdit(record)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this vendor?"
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <ActionButton.Text
                icon="delete"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="m-0">Vendor Management</Title>
        <Space>
          <SearchInput
            placeholder="Search vendors..."
            value={searchTerm}
            onSearch={setSearchTerm}
            className="w-64"
          />
          <ActionButton.Primary
            icon="add"
            onClick={() => {
              setEditingVendor(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Vendor
          </ActionButton.Primary>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredVendors}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingVendor(null);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setEditingVendor(null);
            form.resetFields();
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddEdit}>
            {editingVendor ? 'Update' : 'Add'}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Vendor Name"
            rules={[{ required: true, message: 'Please enter vendor name' }]}
          >
            <Input placeholder="Enter vendor name" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Select placeholder="Select category">
              <Option value="Wood">Wood</Option>
              <Option value="Hardware">Hardware</Option>
              <Option value="Upholstery">Upholstery</Option>
              <Option value="Finishing">Finishing</Option>
              <Option value="Metal">Metal</Option>
              <Option value="Fabric">Fabric</Option>
              <Option value="Materials">Materials</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter a valid email' },
              { required: true, message: 'Please enter email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea rows={3} placeholder="Enter address" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}