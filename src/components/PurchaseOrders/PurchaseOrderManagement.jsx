import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Space, 
  Typography, 
  Button, 
  Table, 
  Tag, 
  Tooltip, 
  Popconfirm,
  message,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Tabs
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { EnhancedTable } from '../common/EnhancedTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { VendorManagement } from './VendorManagement';
import { 
  fetchPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus
} from '../../features/purchaseOrders/purchaseOrdersSlice';
import { fetchProducts } from '../../features/products/productsSlice';
import { fetchRawMaterials } from '../../features/rawMaterials/rawMaterialsSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

export function PurchaseOrderManagement() {
  const dispatch = useDispatch();
  const purchaseOrders = useSelector(state => state.purchaseOrders.purchaseOrdersList);
  const loading = useSelector(state => state.purchaseOrders.loading);
  const products = useSelector(state => state.products.productsList);
  const rawMaterials = useSelector(state => state.rawMaterials.rawMaterialsList);
  const { currentUser, hasPermission, logAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); 

  // Load purchase orders from state or cache
  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProducts());
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  // Filter purchase orders based on search term, status, and date range
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const orderDate = new Date(order.orderDate);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      matchesDate = orderDate >= startDate && orderDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleCreateOrder = (orderData) => {
    // In a real app, this would send to an API
    const newOrder = {
      ...orderData,
      id: `PO-${Date.now()}`,
      createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date(),
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date(),
          user: `${currentUser.firstName} ${currentUser.lastName}`,
          notes: 'Purchase order created and pending'
        }
      ]
    };
    
    // Add to state
    dispatch(addPurchaseOrder(newOrder));
    
    // Log action
    if (logAction) {
      logAction(
        'CREATE',
        'purchase-orders',
        `Created purchase order: ${newOrder.id}`,
        { orderId: newOrder.id, total: newOrder.total }
      );
    }
    
    message.success('Purchase order created successfully');
    return newOrder;
  };

  const handleUpdateOrder = (orderId, orderData) => {
    // Find existing order
    const existingOrder = purchaseOrders.find(o => o.id === orderId);
    if (!existingOrder) {
      message.error('Purchase order not found');
      return null;
    }
    
    // In a real app, this would send to an API
    const updatedOrder = {
      ...existingOrder,
      ...orderData,
      updatedAt: new Date()
    };
    
    // Update in state
    dispatch(updatePurchaseOrder(updatedOrder));
    
    // Log action
    if (logAction) {
      logAction(
        'UPDATE',
        'purchase-orders',
        `Updated purchase order: ${updatedOrder.id}`,
        { orderId: updatedOrder.id }
      );
    }
    
    message.success('Purchase order updated successfully');
    return updatedOrder;
  };

  const handleDeleteOrder = (orderId) => {
    // In a real app, this would send to an API
    dispatch(deletePurchaseOrder({ id: orderId }));
    
    // Log action
    if (logAction) {
      logAction(
        'DELETE',
        'purchase-orders',
        `Deleted purchase order: ${orderId}`,
        { orderId }
      );
    }
    
    message.success('Purchase order deleted successfully');
  };

  const handleBulkDelete = (orderIds) => {
    orderIds.forEach(id => {
      dispatch(deletePurchaseOrder({ id }));
      
      // Log action
      if (logAction) {
        logAction(
          'DELETE',
          'purchase-orders',
          `Deleted purchase order: ${id}`,
          { orderId: id }
        );
      }
    });
    
    message.success(`${orderIds.length} purchase orders deleted successfully`);
    setSelectedRowKeys([]);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: newStatus,
      updatedAt: new Date(),
      timeline: [
        ...(order.timeline || []),
        {
          status: newStatus,
          timestamp: new Date(),
          user: `${currentUser.firstName} ${currentUser.lastName}`,
          notes: `Status changed to ${newStatus}`
        }
      ]
    };
    
    dispatch(updatePurchaseOrder(updatedOrder));
    
    // Log action
    if (logAction) {
      logAction(
        'UPDATE',
        'purchase-orders',
        `Updated purchase order status: ${orderId} to ${newStatus}`,
        { orderId, status: newStatus }
      );
    }
    
    message.success(`Purchase order status updated to ${newStatus}`);
    
    // If we're viewing the order details, update the selected order
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleUpdateInventory = (productsToUpdate, materials) => {
    // Update product inventory
    productsToUpdate.forEach(product => {
      dispatch({
        type: 'RESTORE_PRODUCT_STOCK',
        payload: {
          productId: product.id,
          quantity: product.quantity
        }
      });
      
      // Log action
      if (logAction) {
        logAction(
          'UPDATE',
          'products',
          `Updated product stock from PO: ${product.id} (+${product.quantity} units)`,
          { productId: product.id, quantity: product.quantity }
        );
      }
    });
    // Update raw materials inventory
    materials.forEach(material => {
      const rawMaterial = rawMaterials.find(m => m.id === material.id);
      if (rawMaterial) {
        dispatch({
          type: 'UPDATE_RAW_MATERIAL',
          payload: {
            ...rawMaterial,
            stockQuantity: rawMaterial.stockQuantity + material.quantity
          }
        });
        
        // Log action
        if (logAction) {
          logAction(
            'UPDATE',
            'raw-materials',
            `Updated raw material stock from PO: ${material.id} (+${material.quantity} ${rawMaterial.unit})`,
            { materialId: material.id, quantity: material.quantity }
          );
        }
      }
    });
    message.success('Inventory updated successfully');
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'completed': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id) => <Text strong>{id}</Text>,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorName',
      key: 'vendorName',
      width: 200,
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.vendorEmail}</Text>
        </div>
      ),
      sorter: (a, b) => a.vendorName.localeCompare(b.vendorName),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date) => <Text>{new Date(date).toLocaleDateString()}</Text>,
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 150,
      render: (date) => date ? <Text>{new Date(date).toLocaleDateString()}</Text> : <Text type="secondary">Not specified</Text>,
      sorter: (a, b) => {
        if (!a.expectedDeliveryDate) return 1;
        if (!b.expectedDeliveryDate) return -1;
        return new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate);
      },
    },
    {
      title: 'Items',
      key: 'items',
      width: 100,
      render: (record) => {
        const totalItems = record.items.length;
        const productCount = record.items.filter(item => item.type === 'product').length;
        const materialCount = record.items.filter(item => item.type === 'material').length;
        
        return (
          <div>
            <Tag color="blue">{totalItems} items</Tag>
            <div className="text-xs text-gray-500 mt-1">
              {productCount > 0 && <span className="mr-2">{productCount} products</span>}
              {materialCount > 0 && <span>{materialCount} materials</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => <Text strong className="text-blue-600">LKR {total.toFixed(2)}</Text>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <ActionButton.Text
              icon="visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
              className="text-blue-600"
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Edit">
              <ActionButton.Text
                icon="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(record);
                  setShowCreateModal(true);
                }}
                className="text-gray-600"
              />
            </Tooltip>
          )}
          {record.status !== 'completed' && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this purchase order?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDeleteOrder(record.id);
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
          )}
        </Space>
      ),
    },
  ];

  const renderOrdersTab = () => {
    if (loading) {
      return <LoadingSkeleton type="table" />;
    }

    return (
      <EnhancedTable
        title="Purchase Orders"
        icon="shopping_cart"
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
          getCheckboxProps: (record) => ({
            disabled: record.status === 'completed' || record.status === 'cancelled'
          })
        }}
        onDelete={handleBulkDelete}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-blue-50'
        })}
        searchFields={['id', 'vendorName', 'createdBy']}
        searchPlaceholder="Search purchase orders..."
        extra={
          <Space>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-32"
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
            </Select>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
            <ActionButton.Primary 
              icon="add"
              onClick={() => {
                setSelectedOrder(null);
                setShowCreateModal(true);
              }}
            >
              Create Order
            </ActionButton.Primary>
          </Space>
        }
        emptyDescription="No purchase orders found"
        emptyImage={<Icon name="shopping_cart" className="text-6xl text-gray-300" />}
      />
    );
  };

  const tabItems = [
    {
      key: 'orders',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="shopping_cart" />
          <span>Purchase Orders</span>
        </span>
      ),
      children: renderOrdersTab()
    },
    {
      key: 'vendors',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="store" />
          <span>Vendors</span>
        </span>
      ),
      children: <VendorManagement />
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

      {/* Create/Edit Purchase Order Modal */}
      <PurchaseOrderModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedOrder(null);
        }}
        onSubmit={selectedOrder ? 
          (data) => handleUpdateOrder(selectedOrder.id, data) : 
          handleCreateOrder
        }
        editingOrder={selectedOrder}
        products={products}
        rawMaterials={rawMaterials}
      />

      {/* Purchase Order Detail Modal */}
      <PurchaseOrderDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onUpdateInventory={handleUpdateInventory}
        onEdit={() => {
          setShowDetailModal(false);
          setShowCreateModal(true);
        }}
      />
    </>
  );
}