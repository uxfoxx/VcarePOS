import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  InputNumber, 
  Typography,
  Switch,
  Popconfirm,
  message,
  Row,
  Col,
  Select,
  Radio,
  Tag
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function TaxManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [taxType, setTaxType] = useState('full_bill');

  const taxes = state.taxes || [];
  const categories = state.categories?.filter(cat => cat.isActive) || [];

  const filteredTaxes = taxes.filter(tax =>
    tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tax.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const taxData = {
        id: editingTax?.id || `TAX-${Date.now()}`,
        name: values.name,
        description: values.description,
        rate: values.rate,
        taxType: values.taxType,
        isActive: values.isActive !== false,
        isDefault: values.isDefault || false,
        applicableCategories: values.taxType === 'category' ? (values.applicableCategories || []) : [],
        createdAt: editingTax?.createdAt || new Date()
      };

      if (taxData.isDefault) {
        dispatch({ type: 'CLEAR_DEFAULT_TAX' });
      }

      if (editingTax) {
        dispatch({ type: 'UPDATE_TAX', payload: taxData });
        message.success('Tax updated successfully');
      } else {
        dispatch({ type: 'ADD_TAX', payload: taxData });
        message.success('Tax added successfully');
      }

      if (taxData.isDefault) {
        dispatch({ 
          type: 'UPDATE_TAX_SETTINGS', 
          payload: { 
            rate: taxData.rate, 
            name: taxData.name,
            defaultTaxId: taxData.id
          } 
        });
      }

      setShowModal(false);
      setEditingTax(null);
      form.resetFields();
      setTaxType('full_bill');
    } catch (error) {
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tax) => {
    setEditingTax(tax);
    setTaxType(tax.taxType || 'full_bill');
    form.setFieldsValue({
      ...tax,
      taxType: tax.taxType || 'full_bill'
    });
    setShowModal(true);
  };

  const handleDelete = (taxId) => {
    const taxToDelete = taxes.find(t => t.id === taxId);
    if (taxToDelete?.isDefault) {
      message.error('Cannot delete default tax. Please set another tax as default first.');
      return;
    }
    
    dispatch({ type: 'DELETE_TAX', payload: taxId });
    message.success('Tax deleted successfully');
  };

  const handleToggleStatus = (tax) => {
    if (tax.isDefault && !tax.isActive) {
      message.error('Cannot deactivate default tax. Please set another tax as default first.');
      return;
    }
    
    const updatedTax = { ...tax, isActive: !tax.isActive };
    dispatch({ type: 'UPDATE_TAX', payload: updatedTax });
    message.success(`Tax ${updatedTax.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleSetDefault = (tax) => {
    dispatch({ type: 'CLEAR_DEFAULT_TAX' });
    
    const updatedTax = { ...tax, isDefault: true, isActive: true };
    dispatch({ type: 'UPDATE_TAX', payload: updatedTax });
    
    dispatch({ 
      type: 'UPDATE_TAX_SETTINGS', 
      payload: { 
        rate: tax.rate, 
        name: tax.name,
        defaultTaxId: tax.id
      } 
    });
    
    message.success(`${tax.name} set as default tax`);
  };

  const handleRowClick = (tax) => {
    setSelectedTax(tax);
    setShowDetailModal(true);
  };

  const handleTaxTypeChange = (e) => {
    const newTaxType = e.target.value;
    setTaxType(newTaxType);
    
    if (newTaxType === 'full_bill') {
      form.setFieldsValue({ applicableCategories: [] });
    }
  };

  const columns = [
    {
      title: 'Tax Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text, record) => (
        <div>
          <div className="flex items-center space-x-2">
            <Text strong>{record.name}</Text>
            {record.isDefault && (
              <Tag color="blue" icon={<Icon name="star" size="text-xs" />}>
                Default
              </Tag>
            )}
          </div>
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate) => <Text strong>{rate}%</Text>,
      sorter: (a, b) => a.rate - b.rate,
    },
    {
      title: 'Type',
      dataIndex: 'taxType',
      key: 'taxType',
      width: 120,
      render: (type) => (
        <Tag color={type === 'full_bill' ? 'green' : 'orange'}>
          {type === 'full_bill' ? 'Full Bill' : 'Category'}
        </Tag>
      ),
      filters: [
        { text: 'Full Bill', value: 'full_bill' },
        { text: 'Category', value: 'category' },
      ],
      onFilter: (value, record) => record.taxType === value,
    },
    {
      title: 'Applicable To',
      key: 'applicableTo',
      width: 200,
      render: (record) => (
        <div>
          {record.taxType === 'full_bill' ? (
            <Tag color="green">All Products</Tag>
          ) : (
            <div>
              {record.applicableCategories && record.applicableCategories.length > 0 ? (
                record.applicableCategories.map(category => (
                  <Tag key={category} color="blue" className="mb-1">
                    {category}
                  </Tag>
                ))
              ) : (
                <Text type="secondary" className="text-xs">No categories selected</Text>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked, e) => {
            e?.stopPropagation();
            handleToggleStatus(record);
          }}
          size="small"
          disabled={record.isDefault && record.isActive}
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
      width: 150,
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
          {!record.isDefault && (
            <ActionButton.Text
              icon="star"
              onClick={(e) => {
                e.stopPropagation();
                handleSetDefault(record);
              }}
              className="text-yellow-500"
              title="Set as default"
            />
          )}
          <Popconfirm
            title="Are you sure you want to delete this tax?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
            disabled={record.isDefault}
          >
            <ActionButton.Text 
              icon="delete"
              danger
              disabled={record.isDefault}
              title={record.isDefault ? "Cannot delete default tax" : "Delete tax"}
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
        title="Tax Management"
        icon="receipt"
        subtitle={`Current default tax: ${state.taxSettings?.name || 'Sales Tax'} (${state.taxSettings?.rate || 8}%)`}
        columns={columns}
        dataSource={filteredTaxes}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['name', 'description']}
        searchPlaceholder="Search taxes..."
        extra={
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowModal(true)}
          >
            Add Tax
          </ActionButton.Primary>
        }
        emptyDescription="No taxes found"
        emptyImage={<Icon name="receipt" className="text-6xl text-gray-300" />}
      />

      <FormModal
        title={editingTax ? 'Edit Tax' : 'Add New Tax'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingTax(null);
          setTaxType('full_bill');
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={700}
        submitText={editingTax ? 'Update Tax' : 'Add Tax'}
        loading={loading}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tax Name"
              rules={[{ required: true, message: 'Please enter tax name' }]}
            >
              <Input placeholder="e.g., Sales Tax, VAT" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rate"
              label="Tax Rate (%)"
              rules={[{ required: true, message: 'Please enter tax rate' }]}
            >
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                placeholder="0.00"
                className="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="taxType"
          label="Tax Type"
          rules={[{ required: true, message: 'Please select tax type' }]}
          initialValue="full_bill"
        >
          <Radio.Group onChange={handleTaxTypeChange} value={taxType}>
            <Space direction="vertical">
              <Radio value="full_bill">
                <div>
                  <Text strong>Full Bill Tax</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Applied to the entire order total (after discounts)
                  </Text>
                </div>
              </Radio>
              <Radio value="category">
                <div>
                  <Text strong>Category Tax</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Applied only to specific product categories
                  </Text>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {taxType === 'category' && (
          <Form.Item 
            name="applicableCategories" 
            label="Applicable Categories"
            rules={[
              { 
                required: taxType === 'category', 
                message: 'Please select at least one category for category tax' 
              }
            ]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select categories this tax applies to"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map(category => (
                <Option key={category.id} value={category.name}>
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <Text type="secondary" className="text-xs ml-2">
                      {state.products.filter(p => p.category === category.name).length} products
                    </Text>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Enter tax description"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
              <div className="flex items-center space-x-2">
                <Switch />
                <Text>Active</Text>
              </div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isDefault" valuePropName="checked">
              <div className="flex items-center space-x-2">
                <Switch />
                <Text>Set as Default Tax</Text>
              </div>
            </Form.Item>
          </Col>
        </Row>

        {taxType === 'full_bill' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-500" />
              <strong>Full Bill Tax:</strong> This tax will be applied to the entire order total after any discounts are applied.
            </Text>
          </div>
        )}

        {taxType === 'category' && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-orange-500" />
              <strong>Category Tax:</strong> This tax will be applied only to products in the selected categories. The tax is calculated on individual product prices.
            </Text>
          </div>
        )}
      </FormModal>

      {/* Tax Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTax(null);
        }}
        title={`Tax Details - ${selectedTax?.name}`}
        icon="receipt"
        data={selectedTax}
        type="tax"
        actions={[
          <ActionButton 
            key="edit" 
            icon="edit"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedTax);
            }}
          >
            Edit Tax
          </ActionButton>
        ]}
      />
    </>
  );
}