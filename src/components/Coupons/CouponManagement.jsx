import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Space, 
  Typography,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Switch,
  Tooltip,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Radio
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ExportModal } from '../common/ExportModal';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addCoupon, 
  updateCoupon, 
  deleteCoupon, 
  fetchCoupons 
} from '../../features/coupons/couponsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export function CouponManagement() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const coupons = useSelector(state => state.coupons.couponsList);
  const categories = useSelector(state => state.categories.categoriesList);
  const loading = useSelector(state => state.coupons.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('percentage');

  useEffect(() => {
    dispatch(fetchCoupons());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (values) => {
    const couponData = {
      id: editingCoupon?.id || `COUPON-${Date.now()}`,
      code: values.code.toUpperCase(),
      description: values.description,
      discountType: values.discountType,
      discountPercent: values.discountType === 'percentage' ? values.discountPercent : 0,
      discountAmount: values.discountType === 'fixed' ? values.discountAmount : 0,
      minimumAmount: values.minimumAmount || 0,
      maxDiscount: values.maxDiscount,
      usageLimit: values.usageLimit,
      usedCount: editingCoupon?.usedCount || 0,
      validFrom: values.validFrom.toDate(),
      validTo: values.validTo ? values.validTo.toDate() : null,
      isActive: values.isActive !== false,
      applicableCategories: values.applicableCategories || [],
      createdAt: editingCoupon?.createdAt || new Date()
    };

    if (editingCoupon) {
      dispatch(updateCoupon(couponData));
      message.success('Coupon updated successfully');
    } else {
      dispatch(addCoupon(couponData));
      message.success('Coupon added successfully');
    }

    setShowModal(false);
    setEditingCoupon(null);
    form.resetFields();
    setDiscountType('percentage');
  };

  const handleEdit = (coupon) => {
    if (!hasPermission('coupons', 'edit')) {
      message.error('You do not have permission to edit coupons');
      return;
    }
    setEditingCoupon(coupon);
    setDiscountType(coupon.discountType);
    form.setFieldsValue({
      ...coupon,
      validFrom: dayjs(coupon.validFrom),
      validTo: coupon.validTo ? dayjs(coupon.validTo) : null
    });
    setShowModal(true);
  };

  const handleDelete = (couponId) => {
    if (!hasPermission('coupons', 'delete')) {
      message.error('You do not have permission to delete coupons');
      return;
    }
    dispatch(deleteCoupon({ id: couponId }));
    message.success('Coupon deleted successfully');
  };

  const handleToggleStatus = (coupon) => {
    if (!hasPermission('coupons', 'edit')) {
      message.error('You do not have permission to modify coupons');
      return;
    }
    const updatedCoupon = { ...coupon, isActive: !coupon.isActive };
    dispatch(updateCoupon(updatedCoupon));
    message.success(`Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'}`);
  };

  const isExpired = (coupon) => {
    return coupon.validTo && new Date(coupon.validTo) < new Date();
  };

  const isUsedUp = (coupon) => {
    return coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return 'inactive';
    if (isExpired(coupon)) return 'expired';
    if (isUsedUp(coupon)) return 'used-up';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'default';
      case 'expired': return 'red';
      case 'used-up': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Coupon Code',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 150,
      render: (code, record) => (
        <div>
          <Text strong className="text-lg">{code}</Text>
          <br />
          <Tag color={getStatusColor(getCouponStatus(record))}>
            {getCouponStatus(record).replace('-', ' ').toUpperCase()}
          </Tag>
        </div>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || 'No description',
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
      render: (record) => (
        <div>
          {record.discountType === 'percentage' ? (
            <div>
              <Text strong className="text-green-600 text-lg">
                {record.discountPercent}%
              </Text>
              {record.maxDiscount && (
                <Text type="secondary" className="text-xs block">
                  Max: LKR {record.maxDiscount.toFixed(2)}
                </Text>
              )}
            </div>
          ) : (
            <Text strong className="text-green-600 text-lg">
              LKR {record.discountAmount.toFixed(2)}
            </Text>
          )}
          {record.minimumAmount > 0 && (
            <Text type="secondary" className="text-xs block">
              Min order: LKR {record.minimumAmount.toFixed(2)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 120,
      render: (record) => (
        <div className="text-center">
          <Text strong className="block">
            {record.usedCount}
            {record.usageLimit && ` / ${record.usageLimit}`}
          </Text>
          <Text type="secondary" className="text-xs">
            {record.usageLimit ? 'Limited' : 'Unlimited'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Validity',
      key: 'validity',
      width: 150,
      render: (record) => (
        <div>
          <Text className="text-sm block">
            From: {new Date(record.validFrom).toLocaleDateString()}
          </Text>
          <Text className="text-sm block">
            To: {record.validTo ? new Date(record.validTo).toLocaleDateString() : 'No expiry'}
          </Text>
          {isExpired(record) && (
            <Tag color="red" size="small" className="mt-1">
              Expired
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record)}
          size="small"
          disabled={!hasPermission('coupons', 'edit')}
          onClick={(checked, e) => e.stopPropagation()}
        />
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
          <Tooltip title={hasPermission('coupons', 'edit') ? 'Edit Coupon' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              disabled={!hasPermission('coupons', 'edit')}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('coupons', 'delete') ? 'Delete Coupon' : 'No permission'}>
            <Popconfirm
              title="Delete this coupon?"
              description="This action cannot be undone."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!hasPermission('coupons', 'delete')}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                disabled={!hasPermission('coupons', 'delete')}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!hasPermission('coupons', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view coupon management."
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
        {/* Coupon Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{coupons.length}</div>
              <div className="text-sm text-gray-500">Total Coupons</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {coupons.filter(c => c.isActive && !isExpired(c) && !isUsedUp(c)).length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {coupons.filter(c => isExpired(c)).length}
              </div>
              <div className="text-sm text-gray-500">Expired</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {coupons.filter(c => isUsedUp(c)).length}
              </div>
              <div className="text-sm text-gray-500">Used Up</div>
            </Card>
          </Col>
        </Row>
        
        <EnhancedTable
          title="Coupon Management"
          icon="local_offer"
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="id"
          searchFields={['code', 'description']}
          searchPlaceholder="Search coupons..."
          extra={
            <Space>
              <ActionButton 
                icon="download"
                onClick={() => setShowExportModal(true)}
              >
                Export
              </ActionButton>
              {hasPermission('coupons', 'edit') && (
                <ActionButton.Primary 
                  icon="add"
                  onClick={() => {
                    setEditingCoupon(null);
                    form.resetFields();
                    setDiscountType('percentage');
                    setShowModal(true);
                  }}
                >
                  Add Coupon
                </ActionButton.Primary>
              )}
            </Space>
          }
          emptyDescription="No coupons found"
          emptyImage={<Icon name="local_offer" className="text-6xl text-gray-300" />}
        />
      </Card>

      <FormModal
        title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingCoupon(null);
          setDiscountType('percentage');
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={700}
        submitText={editingCoupon ? 'Update Coupon' : 'Add Coupon'}
        loading={loading}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Coupon Code"
              rules={[
                { required: true, message: 'Please enter coupon code' },
                { min: 3, message: 'Code must be at least 3 characters' },
                { pattern: /^[A-Z0-9]+$/, message: 'Code must contain only uppercase letters and numbers' }
              ]}
            >
              <Input 
                placeholder="Enter coupon code" 
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setFieldsValue({ code: value });
                }}
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
              <Radio.Group onChange={(e) => setDiscountType(e.target.value)}>
                <Radio value="percentage">Percentage</Radio>
                <Radio value="fixed">Fixed Amount</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={2}
            placeholder="Enter coupon description"
          />
        </Form.Item>

        <Row gutter={16}>
          {discountType === 'percentage' ? (
            <>
              <Col span={12}>
                <Form.Item
                  name="discountPercent"
                  label="Discount Percentage"
                  rules={[
                    { required: true, message: 'Please enter discount percentage' },
                    { type: 'number', min: 0.01, max: 100, message: 'Percentage must be between 0.01 and 100' }
                  ]}
                >
                  <InputNumber
                    min={0.01}
                    max={100}
                    step={0.01}
                    placeholder="0.00"
                    className="w-full"
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxDiscount" label="Maximum Discount (LKR)">
                  <InputNumber
                    min={0}
                    step={100}
                    placeholder="No limit"
                    className="w-full"
                    formatter={value => value ? `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col span={12}>
              <Form.Item
                name="discountAmount"
                label="Discount Amount (LKR)"
                rules={[
                  { required: true, message: 'Please enter discount amount' },
                  { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                ]}
              >
                <InputNumber
                  min={0.01}
                  step={100}
                  placeholder="0.00"
                  className="w-full"
                  formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="minimumAmount" label="Minimum Order Amount (LKR)">
              <InputNumber
                min={0}
                step={100}
                placeholder="0.00"
                className="w-full"
                formatter={value => value ? `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="usageLimit" label="Usage Limit">
              <InputNumber
                min={1}
                placeholder="Unlimited"
                className="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="validFrom"
              label="Valid From"
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="validTo" label="Valid Until">
              <DatePicker className="w-full" placeholder="No expiry date" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="applicableCategories" label="Applicable Categories">
          <Select 
            mode="multiple" 
            placeholder="All categories (leave empty for all)"
            allowClear
          >
            {categories?.filter(cat => cat.isActive).map(category => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="isActive" label="Active Status" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </FormModal>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType="coupons"
        data={{ coupons }}
      />
    </>
  );
}