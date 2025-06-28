import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Typography,
  Tag,
  Image,
  Popconfirm,
  message,
  Row,
  Col,
  Dropdown
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { FormModal } from '../common/FormModal';
import { ProductDetailsSheet } from '../Invoices/ProductDetailsSheet';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function ProductManagement() {
  const { state, dispatch } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [form] = Form.useForm();

  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const handleSubmit = async (values) => {
    try {
      const productData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: values.name,
        price: values.price,
        category: values.category,
        stock: values.stock,
        barcode: values.barcode,
        description: values.description,
        dimensions: values.dimensions ? {
          length: values.dimensions.length,
          width: values.dimensions.width,
          height: values.dimensions.height,
          unit: values.dimensions.unit
        } : undefined,
        weight: values.weight,
        material: values.material,
        color: values.color,
        image: values.image
      };

      if (editingProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
        message.success('Product updated successfully');
      } else {
        dispatch({ type: 'ADD_PRODUCT', payload: productData });
        message.success('Product added successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      dimensions: product.dimensions
    });
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    message.success('Product deleted successfully');
  };

  const handlePrintProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductSheet(true);
  };

  const getActionMenuItems = (record) => [
    {
      key: 'edit',
      icon: <Icon name="edit" />,
      label: 'Edit Product',
      onClick: () => handleEdit(record)
    },
    {
      key: 'print',
      icon: <Icon name="print" />,
      label: 'Print Details Sheet',
      onClick: () => handlePrintProductDetails(record)
    },
    {
      key: 'delete',
      icon: <Icon name="delete" />,
      label: 'Delete Product',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Are you sure you want to delete this product?',
          content: 'This action cannot be undone.',
          onOk: () => handleDelete(record.id),
          okText: 'Yes, Delete',
          cancelText: 'Cancel',
          okType: 'danger'
        });
      }
    }
  ];

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={record.name}
            width={50}
            height={50}
            className="object-cover rounded"
            preview={false}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.description}</Text>
            <br />
            <Text type="secondary" className="text-xs">SKU: {record.barcode}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'Tables' ? 'green' : 'orange'}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>${price.toFixed(2)}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Specifications',
      key: 'specs',
      render: (record) => (
        <Space direction="vertical" size="small">
          {record.dimensions && (
            <div className="flex items-center space-x-1">
              <Icon name="straighten" className="text-gray-400" size="text-sm" />
              <Text className="text-xs">
                {record.dimensions.length}×{record.dimensions.width}×{record.dimensions.height} {record.dimensions.unit}
              </Text>
            </div>
          )}
          {record.material && (
            <Text className="text-xs">
              <Icon name="texture" size="text-xs" className="mr-1" />
              {record.material}
            </Text>
          )}
          {record.color && (
            <div className="flex items-center space-x-1">
              <Icon name="palette" className="text-gray-400" size="text-sm" />
              <Text className="text-xs">{record.color}</Text>
            </div>
          )}
          {record.weight && (
            <Text className="text-xs">
              <Icon name="scale" size="text-xs" className="mr-1" />
              {record.weight} kg
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record)
          }}
          trigger={['click']}
        >
          <ActionButton.Text
            icon="more_vert"
            className="text-[#0E72BD] hover:text-blue-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <Card>
        <PageHeader
          title="Product Management"
          icon="inventory_2"
          extra={
            <Space>
              <SearchInput
                placeholder="Search products..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="w-64"
              />
              <ActionButton.Primary 
                icon="add"
                onClick={() => setShowModal(true)}
              >
                Add Product
              </ActionButton.Primary>
            </Space>
          }
        />
        
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <FormModal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        width={800}
        submitText={editingProduct ? 'Update Product' : 'Add Product'}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>
            
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Option value="Tables">Tables</Option>
                <Option value="Chairs">Chairs</Option>
              </Select>
            </Form.Item>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price ($)"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label="Stock"
                  rules={[{ required: true, message: 'Please enter stock' }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="barcode" label="Barcode/SKU">
              <Input placeholder="Enter barcode or SKU" />
            </Form.Item>

            <Form.Item name="image" label="Image URL">
              <Input placeholder="Enter image URL" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Dimensions">
              <Input.Group compact>
                <Form.Item name={['dimensions', 'length']} noStyle>
                  <InputNumber placeholder="Length" className="w-1/4" />
                </Form.Item>
                <Form.Item name={['dimensions', 'width']} noStyle>
                  <InputNumber placeholder="Width" className="w-1/4" />
                </Form.Item>
                <Form.Item name={['dimensions', 'height']} noStyle>
                  <InputNumber placeholder="Height" className="w-1/4" />
                </Form.Item>
                <Form.Item name={['dimensions', 'unit']} noStyle>
                  <Select placeholder="Unit" className="w-1/4">
                    <Option value="cm">cm</Option>
                    <Option value="inch">inch</Option>
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name="weight" label="Weight (kg)">
                  <InputNumber
                    min={0}
                    step={0.1}
                    placeholder="0.0"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="color" label="Color">
                  <Input placeholder="Enter color" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="material" label="Material">
              <Input placeholder="Enter material type" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={3}
                placeholder="Enter product description"
              />
            </Form.Item>
          </Col>
        </Row>
      </FormModal>

      {/* Product Details Sheet Modal */}
      <ProductDetailsSheet
        open={showProductSheet}
        onClose={() => {
          setShowProductSheet(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
}