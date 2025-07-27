import { useState } from 'react';
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
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  ColorPicker
} from 'antd';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function VariantManagement() {
  const [activeTab, setActiveTab] = useState('types');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeForm] = Form.useForm();
  const [optionForm] = Form.useForm();

  const variantTypes =  [];
  const variantOptions =  [];

  const filteredTypes = variantTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOptions = variantOptions.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedTypeId || option.variantTypeId === selectedTypeId;
    return matchesSearch && matchesType;
  });

  const handleSubmitType = async (values) => {
    try {
      setLoading(true);
      const _typeData = {
        id: editingType?.id || `VT-${Date.now()}`,
        name: values.name,
        description: values.description,
        isActive: values.isActive !== false,
        createdAt: editingType?.createdAt || new Date()
      };

      if (editingType) {
        // dispatchPOS({ type: 'UPDATE_VARIANT_TYPE', payload: typeData });
        message.success('Variant type updated successfully');
      } else {
        // dispatchPOS({ type: 'ADD_VARIANT_TYPE', payload: typeData });
        message.success('Variant type created successfully');
      }

      setShowTypeModal(false);
      setEditingType(null);
      typeForm.resetFields();
    } catch{
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOption = async (values) => {
    try {
      setLoading(true);
      const _optionData = {
        id: editingOption?.id || `VO-${Date.now()}`,
        variantTypeId: values.variantTypeId,
        name: values.name,
        value: values.value || values.name.toLowerCase().replace(/\s+/g, '-'),
        colorCode: values.colorCode,
        sortOrder: values.sortOrder || 1,
        isActive: values.isActive !== false
      };

      if (editingOption) {
        // dispatchPOS({ type: 'UPDATE_VARIANT_OPTION', payload: optionData });
        message.success('Variant option updated successfully');
      } else {
        // dispatchPOS({ type: 'ADD_VARIANT_OPTION', payload: optionData });
        message.success('Variant option created successfully');
      }

      setShowOptionModal(false);
      setEditingOption(null);
      optionForm.resetFields();
    } catch  {
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    typeForm.setFieldsValue(type);
    setShowTypeModal(true);
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    optionForm.setFieldsValue(option);
    setShowOptionModal(true);
  };

  const handleDeleteType = (typeId) => {
    const relatedOptions = variantOptions.filter(opt => opt.variantTypeId === typeId);
    if (relatedOptions.length > 0) {
      message.error(`Cannot delete variant type. ${relatedOptions.length} option(s) are using this type.`);
      return;
    }

    // dispatchPOS({ type: 'DELETE_VARIANT_TYPE', payload: typeId });
    message.success('Variant type deleted successfully');
  };

  const handleDeleteOption = (_optionId) => {
    // dispatchPOS({ type: 'DELETE_VARIANT_OPTION', payload: optionId });
    message.success('Variant option deleted successfully');
  };

  const handleToggleTypeStatus = (type) => {
    const updatedType = { ...type, isActive: !type.isActive };
    // dispatchPOS({ type: 'UPDATE_VARIANT_TYPE', payload: updatedType });
    message.success(`Variant type ${updatedType.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleToggleOptionStatus = (option) => {
    const updatedOption = { ...option, isActive: !option.isActive };
    // dispatchPOS({ type: 'UPDATE_VARIANT_OPTION', payload: updatedOption });
    message.success(`Variant option ${updatedOption.isActive ? 'activated' : 'deactivated'}`);
  };

  const getTypeName = (typeId) => {
    const type = variantTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown';
  };

  const getOptionCount = (typeId) => {
    return variantOptions.filter(opt => opt.variantTypeId === typeId).length;
  };

  const typeColumns = [
    {
      title: 'Type Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Options',
      key: 'optionCount',
      render: (record) => {
        const count = getOptionCount(record.id);
        return (
          <Tag color={count > 0 ? 'blue' : 'default'}>
            {count} option{count !== 1 ? 's' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleTypeStatus(record)}
          size="small"
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <ActionButton.Text 
            icon="edit"
            onClick={() => handleEditType(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="Are you sure you want to delete this variant type?"
            description={getOptionCount(record.id) > 0 ? 
              `This type has ${getOptionCount(record.id)} option(s). Please remove them first.` : 
              'This action cannot be undone.'
            }
            onConfirm={() => handleDeleteType(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={getOptionCount(record.id) > 0}
          >
            <ActionButton.Text 
              icon="delete"
              danger
              disabled={getOptionCount(record.id) > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const optionColumns = [
    {
      title: 'Option Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          {record.colorCode && (
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: record.colorCode }}
            />
          )}
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">Value: {record.value}</Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Variant Type',
      dataIndex: 'variantTypeId',
      key: 'variantTypeId',
      render: (typeId) => (
        <Tag color="blue">{getTypeName(typeId)}</Tag>
      ),
      filters: variantTypes.map(type => ({ text: type.name, value: type.id })),
      onFilter: (value, record) => record.variantTypeId === value,
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleOptionStatus(record)}
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
            onClick={() => handleEditOption(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="Are you sure you want to delete this variant option?"
            onConfirm={() => handleDeleteOption(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton.Text 
              icon="delete"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderTypesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title level={5} className="m-0">Variant Types</Title>
          <Text type="secondary">Define the types of variants (Size, Color, Material, etc.)</Text>
        </div>
        <Space>
          <SearchInput
            placeholder="Search variant types..."
            value={searchTerm}
            onSearch={setSearchTerm}
            className="w-64"
          />
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowTypeModal(true)}
          >
            Add Variant Type
          </ActionButton.Primary>
        </Space>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{variantTypes.length}</div>
            <div className="text-sm text-gray-500">Total Types</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {variantTypes.filter(type => type.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Types</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {variantOptions.length}
            </div>
            <div className="text-sm text-gray-500">Total Options</div>
          </Card>
        </Col>
      </Row>
      
      <EnhancedTable
        columns={typeColumns}
        dataSource={filteredTypes}
        rowKey="id"
        searchFields={['name', 'description']}
        showSearch={false}
        emptyDescription="No variant types found"
        emptyImage={<Icon name="tune" className="text-6xl text-gray-300" />}
      />
    </div>
  );

  const renderOptionsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title level={5} className="m-0">Variant Options</Title>
          <Text type="secondary">Define specific options for each variant type</Text>
        </div>
        <Space>
          <Select
            placeholder="Filter by type"
            value={selectedTypeId}
            onChange={setSelectedTypeId}
            className="w-40"
            allowClear
          >
            {variantTypes.map(type => (
              <Option key={type.id} value={type.id}>{type.name}</Option>
            ))}
          </Select>
          <SearchInput
            placeholder="Search variant options..."
            value={searchTerm}
            onSearch={setSearchTerm}
            className="w-64"
          />
          <ActionButton.Primary 
            icon="add"
            onClick={() => setShowOptionModal(true)}
          >
            Add Variant Option
          </ActionButton.Primary>
        </Space>
      </div>
      
      <EnhancedTable
        columns={optionColumns}
        dataSource={filteredOptions}
        rowKey="id"
        searchFields={['name', 'value']}
        showSearch={false}
        emptyDescription="No variant options found"
        emptyImage={<Icon name="tune" className="text-6xl text-gray-300" />}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'types',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="category" />
          <span>Variant Types</span>
        </span>
      ),
      children: renderTypesTab()
    },
    {
      key: 'options',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="tune" />
          <span>Variant Options</span>
        </span>
      ),
      children: renderOptionsTab()
    }
  ];

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <Card>
        <PageHeader
          title="Variant Management"
          icon="tune"
          subtitle="Manage product variant types and options"
        />
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mt-4"
        />
      </Card>

      {/* Variant Type Modal */}
      <Modal
        title={editingType ? 'Edit Variant Type' : 'Add New Variant Type'}
        open={showTypeModal}
        onCancel={() => {
          setShowTypeModal(false);
          setEditingType(null);
          typeForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={typeForm}
          layout="vertical"
          onFinish={handleSubmitType}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Type Name"
            rules={[{ required: true, message: 'Please enter type name' }]}
          >
            <Input placeholder="e.g., Size, Color, Material" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter type description"
            />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <div className="flex items-center space-x-2">
              <Switch />
              <Text>Active</Text>
            </div>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <ActionButton onClick={() => setShowTypeModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              {editingType ? 'Update' : 'Create'} Type
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Variant Option Modal */}
      <Modal
        title={editingOption ? 'Edit Variant Option' : 'Add New Variant Option'}
        open={showOptionModal}
        onCancel={() => {
          setShowOptionModal(false);
          setEditingOption(null);
          optionForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={optionForm}
          layout="vertical"
          onFinish={handleSubmitOption}
          className="mt-4"
        >
          <Form.Item
            name="variantTypeId"
            label="Variant Type"
            rules={[{ required: true, message: 'Please select variant type' }]}
          >
            <Select placeholder="Select variant type">
              {variantTypes.filter(type => type.isActive).map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Option Name"
                rules={[{ required: true, message: 'Please enter option name' }]}
              >
                <Input placeholder="e.g., Small, Red, Oak Wood" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Option Value">
                <Input placeholder="Auto-generated from name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sortOrder" label="Sort Order">
                <InputNumber
                  min={1}
                  placeholder="1"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="colorCode" label="Color Code (Optional)">
                <ColorPicker 
                  showText 
                  className="w-full"
                  format="hex"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <div className="flex items-center space-x-2">
              <Switch />
              <Text>Active</Text>
            </div>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <ActionButton onClick={() => setShowOptionModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              {editingOption ? 'Update' : 'Create'} Option
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>
    </>
  );
}