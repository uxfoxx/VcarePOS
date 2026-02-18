import React, { useState } from 'react';
import { 
  Modal, 
  Table, 
  Typography, 
  Space, 
  Tag, 
  Progress, 
  Select,
  Button,
  Tooltip
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { ExportModal } from '../common/ExportModal';

const { Title, Text } = Typography;
const { Option } = Select;

export function StockLevelModal({ 
  open, 
  onClose, 
  rawMaterials = [], 
  products = [],
  onEditMaterial,
  onEditProduct
}) {
  const [filterType, setFilterType] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDataType, setExportDataType] = useState('raw-materials');

  // Filter materials based on stock level
  const filteredMaterials = rawMaterials.filter(material => {
    if (filterType === 'out-of-stock') {
      return material.stockQuantity === 0;
    } else if (filterType === 'low-stock') {
      return material.stockQuantity <= material.minimumStock && material.stockQuantity > 0;
    } else if (filterType === 'medium-stock') {
      return material.stockQuantity <= material.minimumStock * 2 && material.stockQuantity > material.minimumStock;
    } else {
      return true;
    }
  });

  // Filter products based on stock level
  const filteredProducts = products.filter(product => {
    if (filterType === 'out-of-stock') {
      return product.stock === 0;
    } else if (filterType === 'low-stock') {
      return product.stock <= 5 && product.stock > 0;
    } else if (filterType === 'medium-stock') {
      return product.stock <= 10 && product.stock > 5;
    } else {
      return true;
    }
  });

  const materialColumns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.category}</Text>
        </div>
      ),
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (record) => {
        const percentage = Math.min((record.stockQuantity / (record.minimumStock * 3)) * 100, 100);
        const isOutOfStock = record.stockQuantity === 0;
        const isLowStock = record.stockQuantity <= record.minimumStock;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Text strong>{record.stockQuantity} {record.unit}</Text>
              <Tag color={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={isOutOfStock ? 'exception' : isLowStock ? 'active' : 'normal'}
              showInfo={false}
            />
            <Text type="secondary" className="text-xs">
              Minimum: {record.minimumStock} {record.unit}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier || 'N/A',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <ActionButton.Text 
          icon="edit"
          onClick={() => onEditMaterial?.(record)}
          className="text-blue-600"
        />
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.category}</Text>
          <br />
          <Text code className="text-xs">{record.barcode}</Text>
        </div>
      ),
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (record) => {
        const percentage = Math.min((record.stock / 20) * 100, 100);
        const isOutOfStock = record.stock === 0;
        const isLowStock = record.stock <= 5;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Text strong>{record.stock} units</Text>
              <Tag color={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={isOutOfStock ? 'exception' : isLowStock ? 'active' : 'normal'}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <ActionButton.Text 
          icon="edit"
          onClick={() => onEditProduct?.(record)}
          className="text-blue-600"
        />
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <Icon name="inventory_2" className="text-blue-600" />
            <span>Stock Level Report</span>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={900}
        footer={[
          <ActionButton key="close" onClick={onClose}>
            Close
          </ActionButton>,
          <Dropdown
            key="export"
            menu={{
              items: [
                {
                  key: 'raw-materials',
                  label: 'Export Raw Materials',
                  icon: <Icon name="category" />,
                  onClick: () => {
                    setExportDataType('raw-materials');
                    setShowExportModal(true);
                  }
                },
                {
                  key: 'products',
                  label: 'Export Products',
                  icon: <Icon name="inventory_2" />,
                  onClick: () => {
                    setExportDataType('products');
                    setShowExportModal(true);
                  }
                }
              ]
            }}
          >
            <ActionButton.Primary icon="download">
              Export Report
            </ActionButton.Primary>
          </Dropdown>
        ]}
      >
        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="flex justify-between items-center">
            <Title level={5} className="m-0">Stock Level Overview</Title>
            <Select
              value={filterType}
              onChange={setFilterType}
              className="w-40"
            >
              <Option value="all">All Items</Option>
              <Option value="out-of-stock">Out of Stock</Option>
              <Option value="low-stock">Low Stock</Option>
              <Option value="medium-stock">Medium Stock</Option>
            </Select>
          </div>

          {/* Raw Materials */}
          <div>
            <Title level={5} className="mb-3">Raw Materials</Title>
            <Table
              columns={materialColumns}
              dataSource={filteredMaterials}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>

          {/* Products */}
          <div>
            <Title level={5} className="mb-3">Products</Title>
            <Table
              columns={productColumns}
              dataSource={filteredProducts}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Text type="secondary">Out of Stock Materials</Text>
                <div className="text-xl font-bold text-red-600">
                  {rawMaterials.filter(m => m.stockQuantity === 0).length}
                </div>
              </div>
              <div className="text-center">
                <Text type="secondary">Low Stock Materials</Text>
                <div className="text-xl font-bold text-orange-500">
                  {rawMaterials.filter(m => m.stockQuantity <= m.minimumStock && m.stockQuantity > 0).length}
                </div>
              </div>
              <div className="text-center">
                <Text type="secondary">Out of Stock Products</Text>
                <div className="text-xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </div>
              </div>
              <div className="text-center">
                <Text type="secondary">Low Stock Products</Text>
                <div className="text-xl font-bold text-orange-500">
                  {products.filter(p => p.stock <= 5 && p.stock > 0).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType={exportDataType}
        data={{
          products,
          rawMaterials
        }}
      />
    </>
  );
}