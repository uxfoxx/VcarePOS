import React, { useState } from 'react';
import { 
  Card, 
  Table, 
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
  Select
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function TaxManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [form] = Form.useForm();

  const taxes = state.taxes || [];

  const filteredTaxes = taxes.filter(tax =>
    tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tax.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (values) => {
    try {
      const taxData = {
        id: editingTax?.id || `TAX-${Date.now()}`,
        name: values.name,
        description: values.description,
        rate: values.rate,
        type: values.type,
        isActive: values.isActive !== false,
        isDefault: values.isDefault || false,
        applicableCategories: values.applicableCategories || [],
        createdAt: editingTax?.createdAt || new Date()
      };

      // If this is set as default, remove default from others
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

      // Update tax settings if this is the default tax
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
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (tax) => {
    setEditingTax(tax);
    form.setFieldsValue(tax);
    setShowModal(true);
  };

  const handleDelete = (taxId) => {
    dispatch({ type: 'DELETE_TAX', payload: taxId });
    message.success('Tax deleted successfully');
  };

  const handleToggleStatus = (tax) => {
    const updatedTax = { ...tax, isActive: !tax.isActive };
    dispatch({ type: 'UPDATE_TAX', payload: updatedTax });
    message.success(`Tax ${updatedTax.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleSetDefault = (tax) => {
    // Clear default from all taxes
    dispatch({ type: 'CLEAR_DEFAULT_TAX' });
    
    // Set this tax as default
    const updatedTax = { ...tax, isDefault: true, isActive: true };
    dispatch({ type: 'UPDATE_TAX', payload: updatedTax });
    
    // Update global tax settings
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

  const columns = [
    {
      title: 'Tax Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{record.name}</Text>
          {record.isDefault && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Icon name="star" className="mr-1" size="text-xs" />
                Default
              </span>
            </div>
          )}
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate) => <Text strong>{rate}%</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-sm">
          {type}
        </span>
      ),
    },
    {
      title: 'Categories',
      dataIndex: 'applicableCategories',
      key: 'applicableCategories',
      render: (categories) => (
        <div>
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <span key={category} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                {category}
              </span>
            ))
          ) : (
            <Text type="secondary" className="text-xs">All categories</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record)}
          size="small"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <ActionButton.Text 
            icon="edit"
            onClick={() => handleEdit(record)}
            className="text-[#0E72BD]"
          />
          {!record.isDefault && (
            <ActionButton.Text
              icon="star"
              onClick={() => handleSetDefault(record)}
              className="text-yellow-500"
              title="Set as default"
            />
          )}
          <Popconfirm
            title="Are you sure you want to delete this tax?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.isDefault}
          >
            <ActionButton.Text 
              icon="delete"
              danger
              disabled={record.isDefault}
              title={record.isDefault ? "Cannot delete default tax" : "Delete tax"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <PageHeader
          title="Tax Management"
          icon="receipt"
          subtitle={`Current default tax: ${state.taxSettings?.name || 'Sales Tax'} (${state.taxSettings?.rate || 8}%)`}
          extra={
            <Space>
              <SearchInput
                placeholder="Search taxes..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-64"
              />
              <ActionButton.Primary 
                icon="add"
                onClick={() => setShowModal(true)}
              >
                Add Tax
              </ActionButton.Primary>
            </Space>
          }
        />
        
        <Table
          columns={columns}
          dataSource={filteredTaxes}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      <FormModal
        title={editingTax ? 'Edit Tax' : 'Add New Tax'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingTax(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={600}
        submitText={editingTax ? 'Update Tax' : 'Add Tax'}
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Tax Type"
              rules={[{ required: true, message: 'Please select tax type' }]}
              initialValue="sales"
            >
              <Select>
                <Option value="sales">Sales Tax</Option>
                <Option value="vat">VAT</Option>
                <Option value="gst">GST</Option>
                <Option value="service">Service Tax</Option>
                <Option value="luxury">Luxury Tax</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="applicableCategories" label="Applicable Categories">
              <Select mode="multiple" placeholder="Select categories (leave empty for all)">
                <Option value="Tables">Tables</Option>
                <Option value="Chairs">Chairs</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
      </FormModal>
    </>
  );
}