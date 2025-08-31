import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Typography, 
  Space,
  Row,
  Col,
  message,
  Alert,      // ← add this
  Divider
} from 'antd';
import { useSelector } from 'react-redux';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function CustomProductModal({ open, onClose, onAddToCart }) {
  const categories = useSelector(state => state.categories.categoriesList);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const customProduct = {
        id: `CUSTOM-${Date.now()}`,
        name: values.name,
        category: values.category || 'Custom',
        price: values.price,
        barcode: values.barcode || `CUSTOM-${Date.now()}`,
        description: values.description || '',
        stock: 1, // Custom products always have stock of 1
        isCustom: true,
        image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'
      };

      onAddToCart(customProduct);
      
      message.success('Custom product added to cart!');
      onClose();
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="add_box" className="text-green-600" />
          <span>Add Custom Product</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={600}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Alert
          message="Custom Product"
          description="Create a one-time product for special orders or services not in your regular inventory."
          type="info"
          showIcon
          className="mb-6"
        />

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input placeholder="Enter custom product name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                {categories?.filter(cat => cat.isActive).map(category => (
                  <Option key={category.id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Price (LKR)"
              rules={[
                { required: true, message: 'Please enter price' },
                { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
              ]}
            >
              <InputNumber
                min={0.01}
                step={100}
                placeholder="0.00"
                className="w-full"
                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="barcode" label="SKU/Barcode (Optional)">
              <Input placeholder="Enter SKU or leave blank for auto-generation" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description (Optional)">
          <TextArea
            rows={3}
            placeholder="Enter product description or special notes"
          />
        </Form.Item>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <Text className="text-sm">
            <Icon name="info" className="mr-2 text-yellow-600" />
            <strong>Note:</strong> Custom products are for one-time use and won't be saved to your inventory. 
            They're perfect for special orders, services, or unique items.
          </Text>
        </div>

        <Divider />

        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton.Primary 
            htmlType="submit" 
            loading={loading}
            icon="add_shopping_cart"
          >
            Add to Cart
          </ActionButton.Primary>
        </div>
      </Form>
    </Modal>
  );
}