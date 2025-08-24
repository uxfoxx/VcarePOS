import { useState, useEffect } from 'react';
import { 
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
  Tag,
  Alert,
  Tooltip
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTax,
  updateTax,
  deleteTax,
  fetchTaxes,
  bulkUpdateStatus,
  bulkDeleteTaxes
} from '../../features/taxes/taxesSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { fetchProducts } from '../../features/products/productsSlice';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function TaxManagement() {
  const dispatch = useDispatch();
  const taxes = useSelector(state => state.taxes.taxesList) || [];
  const categories = useSelector(state => state.categories.categoriesList)?.filter(cat => cat.isActive) || [];
  const products = useSelector(state => state.products.productsList) || [];
  const loading = useSelector(state => state.taxes.loading);

  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [form] = Form.useForm();
  const [taxType, setTaxType] = useState('full_bill');
  const [showGlobalTaxSettings, setShowGlobalTaxSettings] = useState(false);
  const [globalTaxEnabled, setGlobalTaxEnabled] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    dispatch(fetchTaxes());
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    try {
      const taxData = {
        id: editingTax?.id || `TAX-${Date.now()}`,
        name: values.name,
        description: values.description,
        rate: values.rate,
        taxType: values.taxType,
        isActive: values.isActive !== false,
        applicableCategories: values.taxType === 'category' ? (values.applicableCategories || []) : [],
        createdAt: editingTax?.createdAt || new Date()
      };

      if (editingTax) {
        dispatch(updateTax(taxData));
        message.success('Tax updated successfully');
      } else {
        dispatch(addTax(taxData));
        message.success('Tax added successfully');
      }

      setShowModal(false);
      setEditingTax(null);
      form.resetFields();
      setTaxType('full_bill');
    } catch (error) {
      console.error('Error submitting tax:', error);
      message.error('Failed to save tax. Please check all required fields.');
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
    dispatch(deleteTax(taxId));
    message.success('Tax deleted successfully');
  };

  const handleBulkDelete = (taxIds) => {
    if (!taxIds || taxIds.length === 0) return;
    
    // Dispatch the action and let Redux saga handle the async operation
    dispatch(bulkDeleteTaxes({ taxIds }));
    setSelectedRowKeys([]);
  };

  const handleToggleStatus = async (tax) => {
    try {
      const updatedTax = { ...tax, isActive: !tax.isActive };
      await dispatch(updateTax(updatedTax));
      message.success(`Tax ${updatedTax.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling tax status:', error);
      message.error('Failed to update tax status. Please try again.');
    }
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

  const handleSaveGlobalTaxSettings = () => {
    const action = globalTaxEnabled ? 'enable' : 'disable';
    const taxIds = 'all'; // Enable/disable all taxes
    
    // Dispatch the action and let Redux saga handle the async operation
    dispatch(bulkUpdateStatus({ action, taxIds }));
    setShowGlobalTaxSettings(false);
  };

  const columns = [
    {
      title: 'Tax Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
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
            <div className="flex flex-wrap gap-1">
              {record.applicableCategories && record.applicableCategories.length > 0 ? (
                record.applicableCategories.slice(0, 2).map(category => (
                  <Tag key={category} color="blue">
                    {category}
                  </Tag>
                ))
              ) : (
                <Text type="secondary" className="text-xs">No categories</Text>
              )}
              {record.applicableCategories && record.applicableCategories.length > 2 && (
                <Tag>+{record.applicableCategories.length - 2} more</Tag>
              )}
            </div>
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
          onChange={(checked, e) => {
            e?.stopPropagation();
            handleToggleStatus(record);
          }}
          size="small"
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
          <Tooltip title="Edit">
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this tax?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Check if all taxes are inactive
  const areTaxesDisabled = taxes.every(tax => !tax.isActive);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <>
      <EnhancedTable
        title="Tax Management"
        icon="receipt"
        subtitle={areTaxesDisabled ? "All taxes are currently disabled" : "Manage tax rates and settings"}
        columns={columns}
        dataSource={taxes}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        onDelete={handleBulkDelete}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['name', 'description']}
        searchPlaceholder="Search taxes..."
        extra={
          <Space>
            <ActionButton 
              icon={areTaxesDisabled ? "toggle_off" : "toggle_on"}
              loading={loading}
              onClick={() => {
                setGlobalTaxEnabled(!areTaxesDisabled);
                setShowGlobalTaxSettings(true);
              }}
              disabled={loading}
            >
              {areTaxesDisabled ? "Enable Taxes" : "Disable All Taxes"}
            </ActionButton>
            <ActionButton.Primary 
              icon="add"
              onClick={() => setShowModal(true)}
              disabled={loading}
            >
              Add Tax
            </ActionButton.Primary>
          </Space>
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
              rules={[
                { required: true, message: 'Please enter tax rate' },
                { 
                  type: 'number', 
                  min: 0, 
                  max: 100, 
                  message: 'Tax rate must be between 0 and 100' 
                }
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                placeholder="0.00"
                className="w-full"
                precision={2}
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
                      {products.filter(p => p.category === category.name).length} products
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

        <Form.Item name="isActive" label="Active Status" valuePropName="checked" initialValue={true}>
            <Switch />
        </Form.Item>

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

      {/* Global Tax Settings Modal */}
      <Modal
        title={
          <Space>
            <Icon name={globalTaxEnabled ? "toggle_on" : "toggle_off"} className={globalTaxEnabled ? "text-green-600" : "text-red-600"} />
            <span>{globalTaxEnabled ? "Enable" : "Disable"} All Taxes</span>
          </Space>
        }
        open={showGlobalTaxSettings}
        onCancel={() => setShowGlobalTaxSettings(false)}
        footer={[
          <ActionButton 
            key="cancel" 
            onClick={() => setShowGlobalTaxSettings(false)}
            disabled={loading}
          >
            Cancel
          </ActionButton>,
          <ActionButton.Primary 
            key="save" 
            onClick={handleSaveGlobalTaxSettings}
            loading={loading}
          >
            {globalTaxEnabled ? "Enable Taxes" : "Disable All Taxes"}
          </ActionButton.Primary>
        ]}
        width={500}
        closable={!loading}
        maskClosable={!loading}
      >
        <div className="space-y-4">
          {loading && (
            <Alert
              message="Processing..."
              description={`Updating ${taxes.length} taxes. Please wait...`}
              type="info"
              showIcon
            />
          )}
          
          <Alert
            message={globalTaxEnabled ? "Enable Tax Collection" : "Disable All Taxes"}
            description={
              globalTaxEnabled 
                ? "This will enable tax collection based on your configured tax rules."
                : "This will disable ALL taxes in the system. No taxes will be applied to any orders."
            }
            type={globalTaxEnabled ? "info" : "warning"}
            showIcon
          />
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Text strong>Tax Collection</Text>
              <br />
              <Text type="secondary">
                {globalTaxEnabled 
                  ? "Taxes will be applied to orders according to your tax rules" 
                  : "No taxes will be applied to any orders"
                }
              </Text>
            </div>
            <Switch 
              checked={globalTaxEnabled} 
              onChange={setGlobalTaxEnabled}
              size="default"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Note:</strong> {globalTaxEnabled 
                ? "Individual taxes can still be enabled or disabled in the tax management table." 
                : "This will override individual tax settings and disable all taxes in the system."
              }
            </Text>
          </div>
        </div>
      </Modal>

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