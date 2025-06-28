import React, { useState } from 'react';
import { 
  Modal, 
  Steps, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Typography,
  Row,
  Col,
  Upload,
  Button,
  Space,
  Table,
  Popconfirm,
  message,
  Card,
  Divider
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function ProductModal({ 
  open, 
  onClose, 
  onSubmit, 
  editingProduct = null 
}) {
  const { state } = usePOS();
  const [currentStep, setCurrentStep] = useState(0);
  const [productForm] = Form.useForm();
  const [materialsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingProduct && open) {
      productForm.setFieldsValue({
        ...editingProduct,
        dimensions: editingProduct.dimensions
      });
      
      // Enrich raw materials with full details from state
      const enrichedMaterials = (editingProduct.rawMaterials || []).map(rawMat => {
        const fullMaterial = state.rawMaterials?.find(m => m.id === rawMat.rawMaterialId);
        if (fullMaterial) {
          return {
            rawMaterialId: rawMat.rawMaterialId,
            name: fullMaterial.name,
            unit: fullMaterial.unit,
            quantity: rawMat.quantity,
            unitPrice: fullMaterial.unitPrice || 0,
            totalCost: (fullMaterial.unitPrice || 0) * rawMat.quantity
          };
        }
        // Fallback for missing materials
        return {
          rawMaterialId: rawMat.rawMaterialId,
          name: 'Unknown Material',
          unit: 'unit',
          quantity: rawMat.quantity || 0,
          unitPrice: 0,
          totalCost: 0
        };
      });
      
      setSelectedMaterials(enrichedMaterials);
      setImagePreview(editingProduct.image);
      setCurrentStep(0);
    } else if (open && !editingProduct) {
      // Reset for new product
      productForm.resetFields();
      setSelectedMaterials([]);
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(0);
      // Generate initial SKU
      generateSKU();
    }
  }, [editingProduct, open, productForm, state.rawMaterials]);

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const sku = `SKU-${timestamp}${random}`;
    productForm.setFieldsValue({ barcode: sku });
  };

  const handleImageUpload = (file) => {
    // In a real application, you would upload to a server
    // For now, we'll create a local URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    return false; // Prevent automatic upload
  };

  const handleAddMaterial = (values) => {
    const material = state.rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    // Check if material already added
    const existingMaterial = selectedMaterials.find(m => m.rawMaterialId === values.materialId);
    if (existingMaterial) {
      message.error('Material already added');
      return;
    }

    const newMaterial = {
      rawMaterialId: values.materialId,
      name: material.name,
      unit: material.unit,
      quantity: values.quantity,
      unitPrice: material.unitPrice || 0,
      totalCost: (material.unitPrice || 0) * values.quantity
    };

    setSelectedMaterials([...selectedMaterials, newMaterial]);
    materialsForm.resetFields();
    message.success('Material added successfully');
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.rawMaterialId !== materialId));
    message.success('Material removed');
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await productForm.validateFields();
        setCurrentStep(1);
      } catch (error) {
        message.error('Please fill in all required product details');
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const productValues = await productForm.validateFields();
      
      const productData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: productValues.name,
        price: productValues.price,
        category: productValues.category,
        stock: productValues.stock,
        barcode: productValues.barcode,
        description: productValues.description,
        dimensions: productValues.dimensions ? {
          length: productValues.dimensions.length,
          width: productValues.dimensions.width,
          height: productValues.dimensions.height,
          unit: productValues.dimensions.unit
        } : undefined,
        weight: productValues.weight,
        material: productValues.material,
        color: productValues.color,
        image: imagePreview || productValues.image,
        rawMaterials: selectedMaterials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          quantity: m.quantity
        }))
      };

      await onSubmit(productData);
      handleClose();
    } catch (error) {
      message.error('Please complete all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    productForm.resetFields();
    materialsForm.resetFields();
    setSelectedMaterials([]);
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  const steps = [
    {
      title: 'Product Details',
      icon: <Icon name="inventory_2" />,
      description: 'Basic product information'
    },
    {
      title: 'Raw Materials',
      icon: <Icon name="category" />,
      description: 'Materials used in production'
    }
  ];

  const materialColumns = [
    {
      title: 'Material',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => `${record.quantity || 0} ${record.unit || 'unit'}`,
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => `$${(cost || 0).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this material?"
          onConfirm={() => handleRemoveMaterial(record.rawMaterialId)}
        >
          <ActionButton.Text icon="delete" danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  const renderProductDetails = () => (
    <Form form={productForm} layout="vertical" className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {state.categories?.filter(cat => cat.isActive).map(category => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
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
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item name="weight" label="Weight (kg)">
            <InputNumber
              min={0}
              step={0.1}
              placeholder="0.0"
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item name="barcode" label="SKU/Barcode">
            <Input 
              placeholder="Enter SKU or barcode"
              addonAfter={
                <Button 
                  type="text" 
                  size="small"
                  onClick={generateSKU}
                  icon={<Icon name="refresh" size="text-sm" />}
                  title="Generate SKU"
                />
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="color" label="Color">
            <Input placeholder="Enter color" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="material" label="Material">
        <Input placeholder="Enter material type" />
      </Form.Item>

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

      <Form.Item name="description" label="Description">
        <TextArea
          rows={3}
          placeholder="Enter product description"
        />
      </Form.Item>

      <Form.Item label="Product Image">
        <Upload
          accept="image/*"
          beforeUpload={handleImageUpload}
          showUploadList={false}
          maxCount={1}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            {imagePreview ? (
              <div className="space-y-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover mx-auto rounded"
                />
                <div>
                  <ActionButton icon="upload" size="small">
                    Change Image
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Icon name="cloud_upload" className="text-4xl text-gray-400" />
                <div>
                  <Text>Click to upload product image</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Supports: JPG, PNG, GIF (Max: 5MB)
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Upload>
      </Form.Item>
    </Form>
  );

  const renderRawMaterials = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Add Raw Materials</Title>
        <Text type="secondary">
          Specify the raw materials used to manufacture this product
        </Text>
      </div>

      <Card size="small">
        <Form form={materialsForm} onFinish={handleAddMaterial} layout="vertical">
          <Row gutter={16}>
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
                label="Quantity Required"
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
            <Col span={4}>
              <Form.Item label=" ">
                <ActionButton.Primary htmlType="submit" icon="add" block>
                  Add
                </ActionButton.Primary>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {selectedMaterials.length > 0 && (
        <div>
          <Title level={5}>Selected Materials</Title>
          <Table
            columns={materialColumns}
            dataSource={selectedMaterials}
            rowKey="rawMaterialId"
            pagination={false}
            size="small"
            summary={(pageData) => {
              const totalCost = pageData.reduce((sum, record) => sum + (record.totalCost || 0), 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>
                    <Text strong>Total Material Cost</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text strong>${totalCost.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      )}

      {selectedMaterials.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icon name="category" className="text-4xl text-gray-300 mb-2" />
          <Text type="secondary">No materials added yet</Text>
          <br />
          <Text type="secondary" className="text-sm">
            Add raw materials used in manufacturing this product
          </Text>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderProductDetails();
      case 1:
        return renderRawMaterials();
      default:
        return null;
    }
  };

  return (
    <Modal
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
      open={open}
      onCancel={handleClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        <Steps current={currentStep} items={steps} />
        
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>

        <Divider />

        <div className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <ActionButton onClick={handlePrev}>
                <Icon name="arrow_back" className="mr-2" />
                Previous
              </ActionButton>
            )}
          </div>
          
          <div className="space-x-2">
            <ActionButton onClick={handleClose}>
              Cancel
            </ActionButton>
            
            {currentStep < steps.length - 1 ? (
              <ActionButton.Primary onClick={handleNext}>
                Next
                <Icon name="arrow_forward" className="ml-2" />
              </ActionButton.Primary>
            ) : (
              <ActionButton.Primary 
                onClick={handleSubmit}
                loading={loading}
                icon="check"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </ActionButton.Primary>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}