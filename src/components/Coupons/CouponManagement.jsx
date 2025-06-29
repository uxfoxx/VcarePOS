import React, { useState } from 'react';
import { 
  Card, 
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
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
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
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const coupons = state.coupons || [];

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const handleRowClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailModal(true);
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
      fixed: 'left',
      width: 200,
      render: (code, record) => (
        <div>
          <Text strong className="font-mono">{code}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
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
      sorter: (a, b) => {
        const aValue = a.discountType === 'percentage' ? a.discountPercent : a.discountAmount;
        const bValue = b.discountType === 'percentage' ? b.discountPercent : b.discountAmount;
        return aValue - bValue;
      },
    },
    {
      title: 'Minimum Amount',
      dataIndex: 'minimumAmount',
      key: 'minimumAmount',
      width: 150,
      render: (amount) => amount > 0 ? `$${amount.toFixed(2)}` : 'No minimum',
      sorter: (a, b) => a.minimumAmount - b.minimumAmount,
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 120,
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
      sorter: (a, b) => (a.usedCount || 0) - (b.usedCount || 0),
    },
    {
      title: 'Valid Period',
      key: 'validity',
      width: 180,
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
      sorter: (a, b) => new Date(a.validFrom) - new Date(b.validFrom),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
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
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Expired', value: 'expired' },
        { text: 'Used Up', value: 'used-up' },
      ],
      onFilter: (value, record) => {
        const isExpired = record.validTo && new Date(record.validTo) < new Date();
        const isUsedUp = record.usageLimit && record.usedCount >= record.usageLimit;
        
        if (value === 'active') return record.isActive && !isExpired && !isUsedUp;
        if (value === 'inactive') return !record.isActive;
        if (value === 'expired') return isExpired;
        if (value === 'used-up') return isUsedUp;
        return true;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <ActionButton.Text 
            icon="edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            className="text-blue-600"
          />
          <Switch
            size="small"
            checked={record.isActive}
            onChange={(checked, e) => {
              e?.stopPropagation();
              handleToggleStatus(record);
            }}
            onClick={(checked, e) => e.stopPropagation()}
          />
          <Popconfirm
            title="Are you sure you want to delete this coupon?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton.Text 
              icon="delete"
              danger
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <EnhancedTable
        title="Coupon Management"
        icon="local_offer"
        subtitle="Create and manage discount coupons"
        columns={columns}
        dataSource={filteredCoupons}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['code', 'description']}
        searchPlaceholder="Search coupons..."
        extra={
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowModal(true)}
          >
            Create Coupon
          </ActionButton.Primary>
        }
        emptyDescription="No coupons found"
        emptyImage={<Icon name="local_offer" className="text-6xl text-gray-300" />}
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
                      icon={<Icon name="refresh" size="text-sm" />}
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
            <ActionButton onClick={() => setShowModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Coupon Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCoupon(null);
        }}
        title={`Coupon Details - ${selectedCoupon?.code}`}
        icon="local_offer"
        data={selectedCoupon}
        type="coupon"
        actions={[
          <ActionButton 
            key="edit" 
            icon="edit"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedCoupon);
            }}
          >
            Edit Coupon
          </ActionButton>
        ]}
      />
    </>
  );
}