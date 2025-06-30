import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Typography,
  Row,
  Col,
  Card,
  Space,
  Table,
  Popconfirm,
  message,
  Alert,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function CustomProductModal({ open, onClose, onAddToCart }) {
  const { state } = usePOS();
  const [form] = Form.useForm();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddMaterial = (values) => {
    const material = state.rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    const existingMaterial = selectedMaterials.find(m => m.id === values.materialId);
    if (existingMaterial) {
      message.error('Material already added');
      return;
    }

    if (values.quantity > material.stockQuantity) {
      message.error(`Only ${material.stockQuantity} ${material.unit} available`);
      return;
    }

    const newMaterial = {
      id: material.id,
      name: material.name,
      unit: material.unit,
      unitPrice: material.unitPrice,
      quantity: values.quantity,
      totalCost: material.unitPrice * values.quantity,
      category: material.category
    };

    setSelectedMaterials([...selectedMaterials, newMaterial]);
    form.setFieldsValue({ materialId: undefined, quantity: 1 });
    message.success('Material added to custom product');
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
    message.success('Material removed');
  };

  const handleCreateCustomProduct = async (values) => {
    if (selectedMaterials.length === 0) {
      message.error('Please add at least one material');
      return;
    }

    setLoading(true);
    try {
      const totalCost = selectedMaterials.reduce((sum, m) => sum + m.totalCost, 0);
      const markup = (values.markup || 50) / 100; // Default 50% markup
      const finalPrice = totalCost * (1 + markup);

      const customProduct = {
        id: `CUSTOM-${Date.now()}`,
        name: values.name || 'Custom Product',
        description: values.description || 'Custom made product',
        price: finalPrice,
        category: 'Custom',
        stock: 1, // Custom products are made to order
        barcode: `CUSTOM-${Date.now()}`,
        isCustom: true,
        customMaterials: selectedMaterials,
        materialCost: totalCost,
        markup: values.markup || 50,
        image: 'https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=300',
        dimensions: values.dimensions || {},
        weight: selectedMaterials.reduce((sum, m) => sum + (m.weight || 0) * m.quantity, 0),
        color: values.color || 'Custom',
        material: selectedMaterials.map(m => m.name).join(', '),
        hasSizes: false,
        sizes: [],
        rawMaterials: selectedMaterials.map(m => ({
          rawMaterialId: m.id,
          quantity: m.quantity
        }))
      };

      onAddToCart(customProduct);
      handleClose();
      message.success('Custom product added to cart');
    } catch (error) {
      message.error('Failed to create custom product');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedMaterials([]);
    onClose();
  };

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
      title: 'Quantity',
      key: 'quantity',
      render: (record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => `$${cost.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this material?"
          onConfirm={() => handleRemoveMaterial(record.id)}
        >
          <ActionButton.Text icon="delete" danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  const totalMaterialCost = selectedMaterials.reduce((sum, m) => sum + m.totalCost, 0);
  const markup = Form.useWatch('markup', form) || 50;
  const finalPrice = totalMaterialCost * (1 + markup / 100);

  return (
    <Modal
      title={
        <Space>
          <Icon name="build" className="text-blue-600" />
          <span>Create Custom Product</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        <Alert
          message="Custom Product Builder"
          description="Create a custom product by combining raw materials. Set your markup percentage to determine the final selling price."
          type="info"
          showIcon
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCustomProduct}
        >
          {/* Product Details */}
          <Card size="small" title="Product Details" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: 'Please enter product name' }]}
                >
                  <Input placeholder="Enter custom product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="markup"
                  label="Markup Percentage (%)"
                  initialValue={50}
                  rules={[{ required: true, message: 'Please enter markup percentage' }]}
                >
                  <InputNumber
                    min={0}
                    max={500}
                    placeholder="50"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="color" label="Color">
                  <Input placeholder="Enter color" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Dimensions">
                  <Input.Group compact>
                    <Form.Item name={['dimensions', 'length']} noStyle>
                      <InputNumber placeholder="Length" className="w-1/3" min={0} />
                    </Form.Item>
                    <Form.Item name={['dimensions', 'width']} noStyle>
                      <InputNumber placeholder="Width" className="w-1/3" min={0} />
                    </Form.Item>
                    <Form.Item name={['dimensions', 'height']} noStyle>
                      <InputNumber placeholder="Height" className="w-1/3" min={0} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={2}
                placeholder="Enter product description"
              />
            </Form.Item>
          </Card>

          {/* Add Materials */}
          <Card size="small" title="Add Raw Materials" className="mb-4">
            <Row gutter={16} align="bottom">
              <Col span={12}>
                <Form.Item
                  name="materialId"
                  label="Raw Material"
                  rules={[{ required: true, message: 'Please select a material' }]}
                >
                  <Select
                    placeholder="Search and select material"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {state.rawMaterials?.map(material => (
                      <Option key={material.id} value={material.id}>
                        <div>
                          <Text strong>{material.name}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {material.category} • ${material.unitPrice}/{material.unit} • Stock: {material.stockQuantity}
                          </Text>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true, message: 'Please enter quantity' }]}
                  initialValue={1}
                >
                  <InputNumber
                    min={0.01}
                    step={0.01}
                    placeholder="1.00"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item>
                  <ActionButton.Primary 
                    onClick={() => {
                      form.validateFields(['materialId', 'quantity'])
                        .then(handleAddMaterial)
                        .catch(() => {});
                    }}
                    icon="add" 
                    block
                  >
                    Add
                  </ActionButton.Primary>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Selected Materials */}
          {selectedMaterials.length > 0 && (
            <Card size="small" title="Selected Materials" className="mb-4">
              <Table
                columns={materialColumns}
                dataSource={selectedMaterials}
                rowKey="id"
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>
                      <Text strong>Total Material Cost</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong>${totalMaterialCost.toFixed(2)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell />
                  </Table.Summary.Row>
                )}
              />
            </Card>
          )}

          {/* Pricing Summary */}
          {selectedMaterials.length > 0 && (
            <Card size="small" title="Pricing Summary" className="mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Material Cost:</Text>
                  <Text>${totalMaterialCost.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Markup ({markup}%):</Text>
                  <Text>${(totalMaterialCost * markup / 100).toFixed(2)}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <Text strong className="text-lg">Final Price:</Text>
                  <Text strong className="text-lg text-blue-600">
                    ${finalPrice.toFixed(2)}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-2">
            <ActionButton onClick={handleClose}>
              Cancel
            </ActionButton>
            <ActionButton.Primary 
              htmlType="submit" 
              loading={loading}
              icon="add_shopping_cart"
              disabled={selectedMaterials.length === 0}
            >
              Add to Cart
            </ActionButton.Primary>
          </div>
        </Form>
      </div>
    </Modal>
  );
}