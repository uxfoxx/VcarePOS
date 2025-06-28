import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Typography,
  Tag,
  Switch,
  DatePicker,
  Popconfirm,
  message,
  Row,
  Col
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export function CouponManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  const coupons = state.coupons || [];

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      const couponData = {
        id: editingCoupon?.id || `COUPON-${Date.now()}`,
        code: values.code.toUpperCase(),
        description: values.description,
        discountType: values.discountType,
        discountPercent: values.discountPercent,
        discountAmount: values.discountAmount,
        minimumAmount: values.minimumAmount || 0,
        maxDiscount: values.maxDiscount,
        usageLimit: values.usageLimit,
        usedCount: editingCoupon?.usedCount || 0,
        validFrom: values.dateRange ? values.dateRange[0].toDate() : new Date(),
        validTo: values.dateRange ? values.dateRange[1].toDate() : null,
        isActive: values.isActive !== false,
        applicableCategories: values.applicableCategories || [],
        createdAt: editingCoupon?.createdAt || new Date()
      };

      if (editingCoupon) {
        dispatch({ type: 'UPDATE_COUPON', payload: couponData });
        message.success('Coupon updated successfully');
      } else {
        dispatch({ type: 'ADD_COUPON', payload: couponData });
        message.success('Coupon created successfully');
      }

      setShowModal(false);
      setEditingCoupon(null);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      ...coupon,
      dateRange: coupon.validFrom && coupon.validTo ? [
        dayjs(coupon.validFrom),
        dayjs(coupon.validTo)
      ] : null
    });
    setShowModal(true);
  };

  const handleDelete = (couponId) => {
    dispatch({ type: 'DELETE_COUPON', payload: couponId });
    message.success('Coupon deleted successfully');
  };

  const handleToggleStatus = (coupon) => {
    const updatedCoupon = { ...coupon, isActive: !coupon.isActive };
    dispatch({ type: 'UPDATE_COUPON', payload: updatedCoupon });
    message.success(`Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'}`);
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code: result });
  };

  const columns = [
    {
      title: 'Coupon Code',
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => (
        <div>
          <Text strong className="font-mono">{code}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (record) => (
        <div>
          <Text strong>
            {record.discountType === 'percentage' 
              ? `${record.discountPercent}%` 
              : `$${record.discountAmount}`
            }
          </Text>
          {record.maxDiscount && (
            <>
              <br />
              <Text type="secondary" className="text-xs">
                Max: ${record.maxDiscount}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Minimum Amount',
      dataIndex: 'minimumAmount',
      key: 'minimumAmount',
      render: (amount) => amount > 0 ? `$${amount.toFixed(2)}` : 'No minimum',
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record) => (
        <div>
          <Text>{record.usedCount || 0}</Text>
          {record.usageLimit && (
            <>
              <Text type="secondary"> / {record.usageLimit}</Text>
              <br />
              <Text type="secondary" className="text-xs">
                {record.usageLimit - (record.usedCount || 0)} remaining
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Valid Period',
      key: 'validity',
      render: (record) => (
        <div>
          <Text className="text-xs">
            From: {new Date(record.validFrom).toLocaleDateString()}
          </Text>
          <br />
          <Text className="text-xs">
            To: {record.validTo ? new Date(record.validTo).toLocaleDateString() : 'No expiry'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => {
        const isExpired = record.validTo && new Date(record.validTo) < new Date();
        const isUsedUp = record.usageLimit && record.usedCount >= record.usageLimit;
        
        let status = 'Active';
        let color = 'green';
        
        if (!record.isActive) {
          status = 'Inactive';
          color = 'red';
        } else if (isExpired) {
          status = 'Expired';
          color = 'orange';
        } else if (isUsedUp) {
          status = 'Used Up';
          color = 'orange';
        }
        
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button 
            type="text" 
            icon={<span className="material-icons">edit</span>} 
            onClick={() => handleEdit(record)}
          />
          <Switch
            size="small"
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this coupon?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<span className="material-icons">delete</span>} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <span className="material-icons text-[#0E72BD]">local_offer</span>
          <Title level={4} className="m-0">Coupon Management</Title>
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Search coupons..."
            prefix={<span className="material-icons">search</span>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            allowClear
          />
          <Button 
            type="primary" 
            icon={<span className="material-icons">add</span>}
            onClick={() => setShowModal(true)}
          >
            Create Coupon
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredCoupons}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingCoupon(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Coupon Code"
                rules={[{ required: true, message: 'Please enter coupon code' }]}
              >
                <Input 
                  placeholder="Enter coupon code"
                  className="font-mono"
                  addonAfter={
                    <Button 
                      type="text" 
                      size="small"
                      onClick={generateCouponCode}
                      icon={<span className="material-icons text-sm">refresh</span>}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Discount Type"
                rules={[{ required: true, message: 'Please select discount type' }]}
                initialValue="percentage"
              >
                <Select>
                  <Option value="percentage">Percentage</Option>
                  <Option value="fixed">Fixed Amount</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discountPercent"
                label="Discount Percentage (%)"
                rules={[{ required: true, message: 'Please enter discount percentage' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={1}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxDiscount" label="Maximum Discount ($)">
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minimumAmount" label="Minimum Order Amount ($)">
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Usage Limit">
                <InputNumber
                  min={1}
                  placeholder="Unlimited"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="Valid Period">
                <RangePicker 
                  className="w-full"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="applicableCategories" label="Applicable Categories">
            <Select mode="multiple" placeholder="Select categories (leave empty for all)">
              <Option value="Tables">Tables</Option>
              <Option value="Chairs">Chairs</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter coupon description"
            />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <div className="flex items-center space-x-2">
              <Switch />
              <Text>Active</Text>
            </div>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}