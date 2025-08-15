import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Table, 
  InputNumber, 
  Popconfirm,
  message,
  Tabs,
  Row,
  Col,
  Card,
  Tag,
  Alert
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export function PurchaseOrderModal({ 
  open, 
  onClose, 
  onSubmit, 
  editingOrder = null,
  products = [],
  rawMaterials = []
}) {
  const [form] = Form.useForm();
  const [itemsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [itemType, setItemType] = useState('product');
  const [vendors, setVendors] = useState([
    { id: 'V001', name: 'Premium Wood Co.', email: 'orders@premiumwood.com', phone: '123-456-7890', address: '123 Wood Lane, Timber City' },
    { id: 'V002', name: 'MetalWorks Inc.', email: 'sales@metalworks.com', phone: '234-567-8901', address: '456 Steel Ave, Metal Town' },
    { id: 'V003', name: 'Luxury Fabrics Inc.', email: 'orders@luxuryfabrics.com', phone: '345-678-9012', address: '789 Textile Blvd, Fabric City' },
    { id: 'V004', name: 'FastenRight Co.', email: 'support@fastenright.com', phone: '456-789-0123', address: '101 Screw Drive, Fastener Village' },
    { id: 'V005', name: 'Crystal Glass Co.', email: 'orders@crystalglass.com', phone: '567-890-1234', address: '202 Clear View, Glass City' }
  ]);

  // Initialize form data when editing
  useEffect(() => {
    if (editingOrder && open) {
      form.setFieldsValue({
        vendorId: editingOrder.vendorId,
        vendorName: editingOrder.vendorName,
        vendorEmail: editingOrder.vendorEmail,
        vendorPhone: editingOrder.vendorPhone,
        vendorAddress: editingOrder.vendorAddress,
        orderDate: dayjs(editingOrder.orderDate),
        expectedDeliveryDate: editingOrder.expectedDeliveryDate ? dayjs(editingOrder.expectedDeliveryDate) : null,
        shippingAddress: editingOrder.shippingAddress,
        notes: editingOrder.notes,
        paymentTerms: editingOrder.paymentTerms,
        shippingMethod: editingOrder.shippingMethod
      });
      setItems(editingOrder.items || []);
      setActiveTab('1');
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        orderDate: dayjs()
      });
      setItems([]);
      setActiveTab('1');
    }
  }, [editingOrder, open, form]);

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      form.setFieldsValue({
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorPhone: vendor.phone,
        vendorAddress: vendor.address
      });
    }
  };

  const handleAddItem = (values) => {
    const { itemId, quantity, unitPrice } = values;
    
    // Check if item already exists
    const existingItemIndex = items.findIndex(item => 
      item.itemId === itemId && item.type === itemType
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        unitPrice,
        total: (updatedItems[existingItemIndex].quantity + quantity) * unitPrice
      };
      setItems(updatedItems);
      message.success('Item quantity updated');
    } else {
      // Add new item
      let itemDetails;
      
      if (itemType === 'product') {
        const product = products.find(p => p.id === itemId);
        if (!product) {
          message.error('Product not found');
          return;
        }
        
        itemDetails = {
          itemId,
          type: 'product',
          name: product.name,
          sku: product.barcode,
          category: product.category,
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      } else {
        const material = rawMaterials.find(m => m.id === itemId);
        if (!material) {
          message.error('Raw material not found');
          return;
        }
        
        itemDetails = {
          itemId,
          type: 'material',
          name: material.name,
          sku: material.id,
          category: material.category,
          unit: material.unit,
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      }
      
      setItems([...items, itemDetails]);
      message.success('Item added successfully');
    }
    
    itemsForm.resetFields();
  };

  const handleRemoveItem = (itemId, type) => {
    setItems(items.filter(item => !(item.itemId === itemId && item.type === type)));
    message.success('Item removed');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one item to the purchase order');
        setLoading(false);
        return;
      }
      
      // Calculate total
      const total = items.reduce((sum, item) => sum + item.total, 0);
      
      // Prepare order data
      const orderData = {
        ...values,
        orderDate: values.orderDate.toDate(),
        expectedDeliveryDate: values.expectedDeliveryDate ? values.expectedDeliveryDate.toDate() : null,
        items,
        total,
        status: editingOrder?.status || 'draft'
      };
      
      // Submit order
      const result = await onSubmit(orderData);
      
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting purchase order:', error);
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'product' ? 'blue' : 'green'}>
          {type === 'product' ? 'Product' : 'Material'}
        </Tag>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            SKU: {record.sku} | {record.category}
          </Text>
        </div>
      )
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 120,
      render: (record) => (
        <Text>
          {record.quantity} {record.unit || 'units'}
        </Text>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price) => <Text>LKR {price.toFixed(2)}</Text>
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => <Text strong>LKR {total.toFixed(2)}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record) => (
        <Popconfirm
          title="Remove this item?"
          onConfirm={() => handleRemoveItem(record.itemId, record.type)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const orderTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Modal
      title={
        <Space>
          <Icon name="shopping_cart" className="text-blue-600" />
          <span>{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <Icon name="store" className="mr-2" />
              Vendor Details
            </span>
          } 
          key="1"
        >
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vendorId"
                  label="Select Vendor"
                >
                  <Select 
                    placeholder="Select a vendor" 
                    onChange={handleVendorChange}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {vendors.map(vendor => (
                      <Option key={vendor.id} value={vendor.id}>{vendor.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vendorName"
                  label="Vendor Name"
                  rules={[{ required: true, message: 'Please enter vendor name' }]}
                >
                  <Input placeholder="Enter vendor name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vendorEmail"
                  label="Vendor Email"
                >
                  <Input placeholder="Enter vendor email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vendorPhone"
                  label="Vendor Phone"
                >
                  <Input placeholder="Enter vendor phone" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="vendorAddress"
              label="Vendor Address"
            >
              <TextArea
                rows={3}
                placeholder="Enter vendor address"
              />
            </Form.Item>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="orderDate"
                  label="Order Date"
                  rules={[{ required: true, message: 'Please select order date' }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedDeliveryDate"
                  label="Expected Delivery Date"
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentTerms"
                  label="Payment Terms"
                >
                  <Select placeholder="Select payment terms">
                    <Option value="net30">Net 30</Option>
                    <Option value="net60">Net 60</Option>
                    <Option value="net90">Net 90</Option>
                    <Option value="cod">Cash on Delivery</Option>
                    <Option value="prepaid">Prepaid</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="shippingMethod"
                  label="Shipping Method"
                >
                  <Select placeholder="Select shipping method">
                    <Option value="standard">Standard Shipping</Option>
                    <Option value="express">Express Shipping</Option>
                    <Option value="overnight">Overnight Shipping</Option>
                    <Option value="pickup">Vendor Pickup</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="shippingAddress"
              label="Ship To Address"
              rules={[{ required: true, message: 'Please enter shipping address' }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter shipping address"
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea
                rows={3}
                placeholder="Enter any additional notes or instructions"
              />
            </Form.Item>
          </Form>

          <div className="flex justify-end mt-4">
            <Button 
              type="primary" 
              onClick={() => setActiveTab('2')}
              className="bg-blue-600"
            >
              Next: Add Items
              <Icon name="arrow_forward" className="ml-2" />
            </Button>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <Icon name="inventory_2" className="mr-2" />
              Order Items
            </span>
          } 
          key="2"
        >
          <div className="space-y-6">
            <Card size="small" title="Add Items">
              <Form
                form={itemsForm}
                layout="horizontal"
                onFinish={handleAddItem}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      name="itemType"
                      label="Item Type"
                      initialValue="product"
                    >
                      <Select onChange={setItemType}>
                        <Option value="product">Product</Option>
                        <Option value="material">Raw Material</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name="itemId"
                      label="Select Item"
                      rules={[{ required: true, message: 'Please select an item' }]}
                    >
                      <Select
                        placeholder={`Select ${itemType === 'product' ? 'product' : 'raw material'}`}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.children?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {itemType === 'product' ? (
                          products.filter(p => !p.isVariant).map(product => (
                            <Option key={product.id} value={product.id}>
                              {product.name} - {product.category}
                            </Option>
                          ))
                        ) : (
                          rawMaterials.map(material => (
                            <Option key={material.id} value={material.id}>
                              {material.name} - {material.category} ({material.unit})
                            </Option>
                          ))
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[{ required: true, message: 'Required' }]}
                      initialValue={1}
                    >
                      <InputNumber
                        min={1}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="unitPrice"
                      label="Unit Price"
                      rules={[{ required: true, message: 'Required' }]}
                      initialValue={0}
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        className="w-full"
                        formatter={value => `LKR ${value}`}
                        parser={value => value.replace(/LKR\s?/, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<Icon name="add" />}>
                    Add Item
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>Order Items</Title>
                <Text strong className="text-lg text-blue-600">
                  Total: LKR {orderTotal.toFixed(2)}
                </Text>
              </div>
              
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey={(record) => `${record.type}-${record.itemId}`}
                pagination={false}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong className="text-blue-600">
                        LKR {orderTotal.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                )}
              />
            </div>

            {items.length === 0 && (
              <Alert
                message="No Items Added"
                description="Please add at least one product or raw material to the purchase order."
                type="info"
                showIcon
              />
            )}

            <div className="flex justify-between mt-6">
              <Button onClick={() => setActiveTab('1')}>
                <Icon name="arrow_back" className="mr-2" />
                Back to Vendor Details
              </Button>
              <Space>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={items.length === 0}
                  className="bg-blue-600"
                >
                  {editingOrder ? 'Update' : 'Create'} Purchase Order
                </Button>
              </Space>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
}