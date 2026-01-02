import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Popconfirm,
  message,
  Typography,
  Card,
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import {
  fetchDeliveryChargesRequest,
  createDeliveryChargeRequest,
  updateDeliveryChargeRequest,
  deleteDeliveryChargeRequest,
} from '../../features/deliveryCharges/deliveryChargesSlice';

const { Title, Text } = Typography;

export function DeliveryChargesSettings() {
  const dispatch = useDispatch();
  const { deliveryCharges, loading, error } = useSelector(state => state.deliveryCharges);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [form] = Form.useForm();
  const [lastAction, setLastAction] = useState(null);
  const prevLoadingRef = React.useRef(loading);

  useEffect(() => {
    dispatch(fetchDeliveryChargesRequest({}));
  }, [dispatch]);

  useEffect(() => {
    // Show success/error messages when operations complete
    if (prevLoadingRef.current && !loading && lastAction) {
      if (error) {
        message.error(error);
      } else {
        const messages = {
          create: 'Delivery charge created successfully',
          update: 'Delivery charge updated successfully',
          delete: 'Delivery charge deleted successfully',
        };
        if (messages[lastAction]) {
          message.success(messages[lastAction]);
        }
        if (lastAction !== 'delete') {
          setModalVisible(false);
          form.resetFields();
        }
      }
      setLastAction(null);
    }
    prevLoadingRef.current = loading;
  }, [loading, error, lastAction, form]);

  const handleCreate = () => {
    setEditingCharge(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCharge(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    setLastAction('delete');
    dispatch(deleteDeliveryChargeRequest(id));
  };

  const handleSubmit = (values) => {
    if (editingCharge) {
      setLastAction('update');
      dispatch(updateDeliveryChargeRequest({ id: editingCharge.id, ...values }));
    } else {
      setLastAction('create');
      dispatch(createDeliveryChargeRequest(values));
    }
  };

  const columns = [
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location_name',
      sorter: (a, b) => a.location_name.localeCompare(b.location_name),
    },
    {
      title: 'Charge Amount',
      dataIndex: 'charge_amount',
      key: 'charge_amount',
      render: (amount) => `Rs. ${parseFloat(amount).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.charge_amount) - parseFloat(b.charge_amount),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Icon name="edit" />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this delivery charge?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<Icon name="delete" />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Title level={4}>Delivery Charges</Title>
          <Text type="secondary">
            Manage delivery charges for different locations
          </Text>
        </div>
        <ActionButton.Primary onClick={handleCreate} icon={<Icon name="add" />}>
          Add Delivery Charge
        </ActionButton.Primary>
      </div>

      <Table
        columns={columns}
        dataSource={deliveryCharges}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} charges`,
        }}
      />

      <Modal
        title={editingCharge ? 'Edit Delivery Charge' : 'Add Delivery Charge'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="location_name"
            label="Location Name"
            rules={[{ required: true, message: 'Please enter location name' }]}
          >
            <Input placeholder="e.g., Colombo, Kandy" />
          </Form.Item>

          <Form.Item
            name="charge_amount"
            label="Charge Amount (Rs.)"
            rules={[
              { required: true, message: 'Please enter charge amount' },
              { type: 'number', min: 0, message: 'Amount must be positive' },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              step={50}
              precision={2}
              placeholder="e.g., 500.00"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <ActionButton.Primary htmlType="submit" loading={loading}>
                {editingCharge ? 'Update' : 'Create'}
              </ActionButton.Primary>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
