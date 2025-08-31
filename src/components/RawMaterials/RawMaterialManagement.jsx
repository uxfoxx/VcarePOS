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
  Progress,
  Tooltip,
  InputNumber,
  Select,
  Modal,
  Form,
  Input
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { FormModal } from '../common/FormModal';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ExportModal } from '../common/ExportModal';
import { StockLevelModal } from './StockLevelModal';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRawMaterials, 
  addRawMaterials, 
  updateRawMaterials, 
  deleteRawMaterials,
  updateStock
} from '../../features/rawMaterials/rawMaterialsSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RawMaterialManagement() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const rawMaterials = useSelector(state => state.rawMaterials.rawMaterialsList);
  const loading = useSelector(state => state.rawMaterials.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStockLevelModal, setShowStockLevelModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  const filteredMaterials = rawMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.supplier && material.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (values) => {
    const materialData = {
      id: editingMaterial?.id || `RM-${Date.now()}`,
      name: values.name,
      category: values.category,
      unit: values.unit,
      stockQuantity: values.stockQuantity || 0,
      unitPrice: values.unitPrice || 0,
      supplier: values.supplier,
      minimumStock: values.minimumStock || 0,
      description: values.description,
      createdAt: editingMaterial?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingMaterial) {
      dispatch(updateRawMaterials({ materialData }));
      message.success('Raw material updated successfully');
    } else {
      dispatch(addRawMaterials({ materialData }));
      message.success('Raw material added successfully');
    }

    setShowModal(false);
    setEditingMaterial(null);
    form.resetFields();
  };

  const handleEdit = (material) => {
    if (!hasPermission('raw-materials', 'edit')) {
      message.error('You do not have permission to edit raw materials');
      return;
    }
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setShowModal(true);
  };

  const handleDelete = (materialId) => {
    if (!hasPermission('raw-materials', 'delete')) {
      message.error('You do not have permission to delete raw materials');
      return;
    }
    dispatch(deleteRawMaterials({ materialId }));
    message.success('Raw material deleted successfully');
  };

  const handleBulkDelete = (materialIds) => {
    if (!hasPermission('raw-materials', 'delete')) {
      message.error('You do not have permission to delete raw materials');
      return;
    }
    materialIds.forEach(id => {
      dispatch(deleteRawMaterials({ materialId: id }));
    });
    message.success(`${materialIds.length} raw materials deleted successfully`);
    setSelectedRowKeys([]);
  };

  const handleStockUpdate = (material) => {
    setSelectedMaterial(material);
    stockForm.setFieldsValue({
      currentStock: material.stockQuantity,
      operation: 'add',
      quantity: 0
    });
    setShowStockModal(true);
  };

  const handleStockSubmit = (values) => {
    dispatch(updateStock({
      id: selectedMaterial.id,
      quantity: values.quantity,
      operation: values.operation
    }));
    
    message.success('Stock updated successfully');
    setShowStockModal(false);
    setSelectedMaterial(null);
    stockForm.resetFields();
  };

  const getStockStatus = (material) => {
    if (material.stockQuantity <= 0) return 'out-of-stock';
    if (material.stockQuantity <= material.minimumStock) return 'low-stock';
    if (material.stockQuantity <= material.minimumStock * 2) return 'medium-stock';
    return 'high-stock';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'high-stock': return 'green';
      case 'medium-stock': return 'blue';
      case 'low-stock': return 'orange';
      case 'out-of-stock': return 'red';
      default: return 'default';
    }
  };

  const getStockPercentage = (material) => {
    const maxStock = material.minimumStock * 3; // Assume 3x minimum is "full"
    return Math.min((material.stockQuantity / maxStock) * 100, 100);
  };

  const columns = [
    {
      title: 'Material',
      key: 'material',
      fixed: 'left',
      width: 250,
      render: (record) => (
        <div>
          <Text strong className="block">{record.name}</Text>
          <Text type="secondary" className="text-xs">
            {record.category} • {record.supplier || 'No supplier'}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      width: 200,
      render: (record) => {
        const status = getStockStatus(record);
        const percentage = getStockPercentage(record);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text strong>{record.stockQuantity} {record.unit}</Text>
              <Tag color={getStockColor(status)}>
                {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={status === 'out-of-stock' ? 'exception' : status === 'low-stock' ? 'active' : 'normal'}
              showInfo={false}
            />
            <Text type="secondary" className="text-xs">
              Minimum: {record.minimumStock} {record.unit}
            </Text>
          </div>
        );
      },
      filters: [
        { text: 'High Stock', value: 'high-stock' },
        { text: 'Medium Stock', value: 'medium-stock' },
        { text: 'Low Stock', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
      ],
      onFilter: (value, record) => getStockStatus(record) === value,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price, record) => (
        <div>
          <Text strong className="text-blue-600">
            LKR {price.toFixed(2)}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            per {record.unit}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Total Value',
      key: 'totalValue',
      width: 120,
      render: (record) => (
        <Text strong className="text-green-600">
          LKR {(record.stockQuantity * record.unitPrice).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => (a.stockQuantity * a.unitPrice) - (b.stockQuantity * b.unitPrice),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (record) => (
        <Space>
          <Tooltip title="Update Stock">
            <ActionButton.Text 
              icon="inventory"
              onClick={(e) => {
                e.stopPropagation();
                handleStockUpdate(record);
              }}
              className="text-green-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('raw-materials', 'edit') ? 'Edit Material' : 'No permission'}>
            <ActionButton.Text 
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              disabled={!hasPermission('raw-materials', 'edit')}
              className="text-blue-600"
            />
          </Tooltip>
          
          <Tooltip title={hasPermission('raw-materials', 'delete') ? 'Delete Material' : 'No permission'}>
            <Popconfirm
              title="Delete this material?"
              description="This action cannot be undone."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!hasPermission('raw-materials', 'delete')}
            >
              <ActionButton.Text 
                icon="delete"
                danger
                disabled={!hasPermission('raw-materials', 'delete')}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!hasPermission('raw-materials', 'view')) {
    return (
      <Card>
        <EmptyState
          icon="lock"
          title="Access Denied"
          description="You do not have permission to view raw materials."
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
        {/* Raw Materials Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{rawMaterials.length}</div>
              <div className="text-sm text-gray-500">Total Materials</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rawMaterials.filter(m => getStockStatus(m) === 'high-stock').length}
              </div>
              <div className="text-sm text-gray-500">High Stock</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {rawMaterials.filter(m => getStockStatus(m) === 'low-stock').length}
              </div>
              <div className="text-sm text-gray-500">Low Stock</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rawMaterials.filter(m => getStockStatus(m) === 'out-of-stock').length}
              </div>
              <div className="text-sm text-gray-500">Out of Stock</div>
            </Card>
          </Col>
        </Row>
        
        <EnhancedTable
          title="Raw Materials Inventory"
          icon="category"
          columns={columns}
          dataSource={filteredMaterials}
          rowKey="id"
          rowSelection={hasPermission('raw-materials', 'delete') ? {
            type: 'checkbox',
            onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
          } : null}
          onDelete={handleBulkDelete}
          searchFields={['name', 'category', 'supplier']}
          searchPlaceholder="Search raw materials..."
          extra={
            <Space>
              <ActionButton 
                icon="analytics"
                onClick={() => setShowStockLevelModal(true)}
              >
                Stock Report
              </ActionButton>
              <ActionButton 
                icon="download"
                onClick={() => setShowExportModal(true)}
              >
                Export
              </ActionButton>
              {hasPermission('raw-materials', 'edit') && (
                <ActionButton.Primary 
                  icon="add"
                  onClick={() => {
                    setEditingMaterial(null);
                    form.resetFields();
                    setShowModal(true);
                  }}
                >
                  Add Material
                </ActionButton.Primary>
              )}
            </Space>
          }
          emptyDescription="No raw materials found"
          emptyImage={<Icon name="category" className="text-6xl text-gray-300" />}
        />
      </Card>

      <FormModal
        title={editingMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingMaterial(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={700}
        submitText={editingMaterial ? 'Update Material' : 'Add Material'}
        loading={loading}
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
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Select placeholder="Select or enter category">
                <Option value="Wood">Wood</Option>
                <Option value="Hardware">Hardware</Option>
                <Option value="Upholstery">Upholstery</Option>
                <Option value="Finishing">Finishing</Option>
                <Option value="Metal">Metal</Option>
                <Option value="Fabric">Fabric</Option>
                <Option value="Materials">Materials</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="unit"
              label="Unit of Measurement"
              rules={[{ required: true, message: 'Please enter unit' }]}
            >
              <Select placeholder="Select unit">
                <Option value="sq ft">Square Feet</Option>
                <Option value="pieces">Pieces</Option>
                <Option value="liters">Liters</Option>
                <Option value="kg">Kilograms</Option>
                <Option value="meters">Meters</Option>
                <Option value="pairs">Pairs</Option>
                <Option value="units">Units</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="stockQuantity"
              label="Current Stock"
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="0.00"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="minimumStock"
              label="Minimum Stock"
              rules={[{ required: true, message: 'Please enter minimum stock' }]}
            >
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
            <Form.Item
              name="unitPrice"
              label="Unit Price (LKR)"
              rules={[{ required: true, message: 'Please enter unit price' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="0.00"
                className="w-full"
                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="supplier" label="Supplier">
              <Input placeholder="Enter supplier name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Enter material description"
          />
        </Form.Item>
      </FormModal>

      {/* Stock Update Modal */}
      <Modal
        title={
          <Space>
            <Icon name="inventory" className="text-green-600" />
            <span>Update Stock - {selectedMaterial?.name}</span>
          </Space>
        }
        open={showStockModal}
        onCancel={() => {
          setShowStockModal(false);
          setSelectedMaterial(null);
          stockForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={stockForm}
          layout="vertical"
          onFinish={handleStockSubmit}
          className="mt-4"
        >
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <Text>Current Stock:</Text>
              <Text strong className="text-blue-600">
                {selectedMaterial?.stockQuantity} {selectedMaterial?.unit}
              </Text>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operation"
                label="Operation"
                rules={[{ required: true, message: 'Please select operation' }]}
                initialValue="add"
              >
                <Select>
                  <Option value="add">Add Stock</Option>
                  <Option value="subtract">Remove Stock</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <ActionButton onClick={() => setShowStockModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton.Primary htmlType="submit" loading={loading}>
              Update Stock
            </ActionButton.Primary>
          </div>
        </Form>
      </Modal>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType="raw-materials"
        data={{ rawMaterials }}
      />

      {/* Stock Level Modal */}
      <StockLevelModal
        open={showStockLevelModal}
        onClose={() => setShowStockLevelModal(false)}
        rawMaterials={rawMaterials}
        products={[]} // Pass empty array since this is raw materials only
        onEditMaterial={handleEdit}
      />
    </>
  );
}