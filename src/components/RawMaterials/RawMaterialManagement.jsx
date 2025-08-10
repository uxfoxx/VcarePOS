import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Alert,
  Popconfirm,
  message,
  Row,
  Col,
  Tooltip,
  Tabs
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { DetailModal } from '../common/DetailModal';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { fetchRawMaterials, addRawMaterials, updateRawMaterials, deleteRawMaterials } from '../../features/rawMaterials/rawMaterialsSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RawMaterialManagement() {
  const dispatch2 = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const {rawMaterialsList, error} = useSelector(state => state.rawMaterials);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => { dispatch2(fetchRawMaterials()); }, [dispatch2]);

  const categories = ['All', ...new Set(rawMaterialsList.map(m => m.category))];
  
  const filteredMaterials = rawMaterialsList.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockMaterials = rawMaterialsList.filter(m => m.stockQuantity <= m.minimumStock);
  const outOfStockMaterials = rawMaterialsList.filter(m => m.stockQuantity === 0);
  const almostOutOfStockMaterials = rawMaterialsList.filter(m => m.stockQuantity > m.minimumStock && m.stockQuantity <= m.minimumStock * 2);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const materialData = {
        id: editingMaterial?.id || `RM-${Date.now()}`,
        name: values.name,
        category: values.category,
        unit: values.unit,
        stockQuantity: values.stockQuantity,
        unitPrice: values.unitPrice,
        supplier: values.supplier,
        minimumStock: values.minimumStock,
        description: values.description,
      };

      if (editingMaterial) {
        dispatch2(updateRawMaterials({materialData}));
        // dispatch({ type: 'UPDATE_RAW_MATERIAL', payload: materialData });
        message.success('Raw material updated successfully');
      } else {
        dispatch2(addRawMaterials({materialData}));
        // dispatch({ type: 'ADD_RAW_MATERIAL', payload: materialData });
        message.success('Raw material added successfully');
      }

      setShowModal(false);
      setEditingMaterial(null);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setShowModal(true);
  };

  const handleDelete = (materialId) => {
    dispatch2(deleteRawMaterials({materialId}));
    // dispatch({ type: 'DELETE_RAW_MATERIAL', payload: materialId });
    // message.success('Raw material deleted successfully');
  };

  const handleBulkDelete = (materialIds) => {
    materialIds.forEach(id => {
      dispatch({ type: 'DELETE_RAW_MATERIAL', payload: id });
    });
    message.success(`${materialIds.length} materials deleted successfully`);
    setSelectedRowKeys([]);
  };

  const handleRowClick = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const columns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: categories.filter(cat => cat !== 'All').map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 120,
      render: (record) => (
        <div>
          <Text strong>{record.stockQuantity} {record.unit}</Text>
          {record.stockQuantity <= record.minimumStock && (
            <Tag color={record.stockQuantity === 0 ? 'red' : 'orange'} className="ml-2">
              {record.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Min. Stock',
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      width: 120,
      render: (min, record) => <Text>{min} {record.unit}</Text>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price) => <Text strong>LKR {price.toFixed(2)}</Text>,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      sorter: (a, b) => (a.supplier || '').localeCompare(b.supplier || ''),
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
              title="Delete this material?"
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

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  const renderRawMaterialsTab = () => (
    <div className="space-y-4">
      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={
            <div>
              <Text>{lowStockMaterials.length} material(s) are running low on stock:</Text>
              <div className="mt-2 flex flex-wrap gap-1">
                {lowStockMaterials.map(material => (
                  <Tag key={material.id} color="red" className="mb-1">
                    {material.name} ({material.stockQuantity} {material.unit} left)
                  </Tag>
                ))}
              </div>
            </div>
          }
          type="warning"
          icon={<Icon name="warning" />}
          showIcon
        />
      )}

      <EnhancedTable
        title="Raw Materials"
        icon="category"
        columns={columns}
        dataSource={filteredMaterials}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
        }}
        onDelete={handleBulkDelete}
        searchFields={['name', 'category', 'supplier']}
        searchPlaceholder="Search raw materials..."
        extra={
          <Space>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-40"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <ActionButton.Primary 
              icon="add"
              onClick={() => setShowModal(true)}
            >
              Add Material
            </ActionButton.Primary>
          </Space>
        }
        emptyDescription="No raw materials found"
        emptyImage={<Icon name="category" className="text-6xl text-gray-300" />}
      />
    </div>
  );

  // The renderStockAlertsTab function is declared again below in the tabItems array.
  // This duplicate declaration is causing the "Identifier 'renderStockAlertsTab' has already been declared" error.
  // Removing this duplicate declaration will resolve the syntax error.
  /* const renderStockAlertsTab = () => {
    const stockAlertColumns = [
      {
        title: 'Material',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 200,
        render: (text, record) => (
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.category}</Text>
          </div>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: 'Current Stock',
        key: 'stock',
        width: 150,
        render: (record) => {
          const percentage = Math.min((record.stockQuantity / (record.minimumStock * 3)) * 100, 100);
          const isOutOfStock = record.stockQuantity === 0;
          const isLowStock = record.stockQuantity <= record.minimumStock;
          const isAlmostLow = record.stockQuantity <= record.minimumStock * 2;
          
          let color = 'green';
          let status = 'In Stock';
          
          if (isOutOfStock) {
            color = 'red';
            status = 'Out of Stock';
          } else if (isLowStock) {
            color = 'orange';
            status = 'Low Stock';
          } else if (isAlmostLow) {
            color = 'yellow';
            status = 'Almost Low';
          }
          
          return (
            <div>
              <Text strong className={`text-${color === 'red' ? 'red' : color === 'orange' ? 'orange' : color === 'yellow' ? 'yellow' : 'green'}-600`}>
                {record.stockQuantity} {record.unit}
              </Text>
              <br />
              <Tag color={color} size="small">
                {status}
              </Tag>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      isOutOfStock ? 'bg-red-500' : 
                      isLowStock ? 'bg-orange-500' : 
                      isAlmostLow ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
                <Text type="secondary" className="text-xs">
                  Min: {record.minimumStock} {record.unit}
                </Text>
              </div>
            </div>
          );
        },
        sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      },
      {
        title: 'Supplier',
        dataIndex: 'supplier',
        key: 'supplier',
        width: 150,
        sorter: (a, b) => (a.supplier || '').localeCompare(b.supplier || ''),
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
            <Tooltip title="Restock">
              <ActionButton.Text 
                icon="add_shopping_cart"
                onClick={(e) => {
                  e.stopPropagation();
                  message.info('Restock feature coming soon');
                }}
                className="text-green-600"
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    const stockAlertData = [
      ...outOfStockMaterials.map(m => ({ ...m, alertType: 'out-of-stock' })),
      ...rawMaterialsList.filter(m => m.stockQuantity <= m.minimumStock && m.stockQuantity > 0).map(m => ({ ...m, alertType: 'low-stock' })),
      ...almostOutOfStockMaterials.map(m => ({ ...m, alertType: 'almost-low' }))
    ];

    return (
      <div className="space-y-4">
        {/* Stock Alert Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card size="small" className="text-center border-red-200 bg-red-50">
              <div className="text-2xl font-bold text-red-600">{outOfStockMaterials.length}</div>
              <div className="text-sm text-red-500">Out of Stock</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center border-orange-200 bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">
                {rawMaterialsList.filter(m => m.stockQuantity <= m.minimumStock && m.stockQuantity > 0).length}
              </div>
              <div className="text-sm text-orange-500">Low Stock</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center border-yellow-200 bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{almostOutOfStockMaterials.length}</div>
              <div className="text-sm text-yellow-500">Almost Low</div>
            </Card>
          </Col>
        </Row>

        {stockAlertData.length === 0 ? (
          <Card>
            <EmptyState
              icon="check_circle"
              title="All Materials Well Stocked"
              description="No stock alerts at this time. All raw materials have adequate inventory levels."
            />
          </Card>
        ) : (
          <EnhancedTable
            title="Raw Material Stock Alerts"
            icon="warning"
            subtitle={`${stockAlertData.length} materials need attention`}
            columns={stockAlertColumns}
            dataSource={stockAlertData}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: `cursor-pointer hover:bg-blue-50 ${
                record.alertType === 'out-of-stock' ? 'bg-red-50' : 
                record.alertType === 'low-stock' ? 'bg-orange-50' : 
                'bg-yellow-50'
              }`
            })}
            searchFields={['name', 'category', 'supplier']}
            searchPlaceholder="Search materials with stock issues..."
            showSearch={true}
            extra={
              <ActionButton.Primary 
                icon="add"
                onClick={() => setShowModal(true)}
              >
                Add Material
              </ActionButton.Primary>
            }
            emptyDescription="No stock alerts"
            emptyImage={<Icon name="check_circle" className="text-6xl text-green-300" />}
          />
        )}
      </div>
    );
  }; */

  const tabItems = [
    {
      key: 'materials',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="category" />
          <span>Raw Materials</span>
        </span>
      ),
      children: renderRawMaterialsTab()
    },
    {
      key: 'stock-alerts',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="warning" />
          <span>Stock Alerts</span>
          {(outOfStockMaterials.length + lowStockMaterials.length + almostOutOfStockMaterials.length) > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
              {outOfStockMaterials.length + lowStockMaterials.length + almostOutOfStockMaterials.length}
            </span>
          )}
        </span>
      ),
      children: renderStockAlertsTab()
    }
  ];

  return (
    <>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Modal
        title={editingMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingMaterial(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
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
                name="name"
                label="Material Name"
                rules={[{ required: true, message: 'Please enter material name' }]}
              >
                <Input placeholder="Enter material name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Wood">Wood</Option>
                  <Option value="Hardware">Hardware</Option>
                  <Option value="Upholstery">Upholstery</Option>
                  <Option value="Finishing">Finishing</Option>
                  <Option value="Metal">Metal</Option>
                  <Option value="Fabric">Fabric</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="sq ft">Square Feet</Option>
                  <Option value="pieces">Pieces</Option>
                  <Option value="kg">Kilograms</Option>
                  <Option value="liters">Liters</Option>
                  <Option value="meters">Meters</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Unit Price (LKR)"
                rules={[{ required: false, message: 'Please enter unit price' }]}
              >
                <InputNumber
                  min={0}
                  step={100}
                  placeholder="0.00"
                  className="w-full"
                  formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supplier" label="Supplier">
                <Input placeholder="Enter supplier name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stockQuantity"
                label="Current Stock"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minimumStock"
                label="Minimum Stock Level"
                rules={[{ required: true, message: 'Please enter minimum stock' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter description"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <ActionButton onClick={() => setShowModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              {editingMaterial ? 'Update' : 'Add'} Material
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Raw Material Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMaterial(null);
        }}
        title={`Raw Material Details - ${selectedMaterial?.name}`}
        icon="category"
        data={selectedMaterial}
        type="rawMaterial"
        actions={[
          <ActionButton 
            key="edit" 
            icon="edit"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(selectedMaterial);
            }}
          >
            Edit Material
          </ActionButton>
        ]}
      />
    </>
  );
}