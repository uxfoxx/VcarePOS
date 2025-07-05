import React, { useState } from 'react';
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
  const [vendors, setVendors] = useState([
    { id: 'V001', name: 'Premium Wood Co.', email: 'orders@premiumwood.com', phone: '123-456-7890', address: '123 Wood Lane, Timber City', category: 'Wood', isActive: true },
    { id: 'V002', name: 'MetalWorks Inc.', email: 'sales@metalworks.com', phone: '234-567-8901', address: '456 Steel Ave, Metal Town', category: 'Hardware', isActive: true },
    { id: 'V003', name: 'Luxury Fabrics Inc.', email: 'orders@luxuryfabrics.com', phone: '345-678-9012', address: '789 Textile Blvd, Fabric City', category: 'Upholstery', isActive: true },
    { id: 'V004', name: 'FastenRight Co.', email: 'support@fastenright.com', phone: '456-789-0123', address: '101 Screw Drive, Fastener Village', category: 'Hardware', isActive: true },
    { id: 'V005', name: 'Crystal Glass Co.', email: 'orders@crystalglass.com', phone: '567-890-1234', address: '202 Clear View, Glass City', category: 'Materials', isActive: false }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form] = Form.useForm();

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
          const updatedVendors = vendors.map(vendor => 
            vendor.id === editingVendor.id ? { ...vendor, ...values } : vendor
          );
          setVendors(updatedVendors);
          message.success('Vendor updated successfully');
        } else {
          // Add new vendor
          const newVendor = {
            id: `V${String(vendors.length + 1).padStart(3, '0')}`,
            ...values,
            isActive: true
          };
          setVendors([...vendors, newVendor]);
          message.success('Vendor added successfully');
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
    setVendors(vendors.filter(vendor => vendor.id !== vendorId));
    message.success('Vendor deleted successfully');
  };

  const handleToggleStatus = (vendor) => {
    const updatedVendors = vendors.map(v => 
      v.id === vendor.id ? { ...v, isActive: !v.isActive } : v
    );
    setVendors(updatedVendors);
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