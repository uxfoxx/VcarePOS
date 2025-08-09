import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Row, Col, InputNumber, Upload, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, updateProduct } from '../../features/products/productsSlice';
import ColorEditor from './ColorEditor';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const ProductModal = ({ visible, onCancel, product = null, categories = [], rawMaterials = [] }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [colors, setColors] = useState([]);
  const [activeColorId, setActiveColorId] = useState(null);

  const isEditing = !!product;

  useEffect(() => {
    if (visible) {
      if (isEditing && product) {
        // Initialize form with existing product data
        form.setFieldsValue({
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          barcode: product.barcode,
          color: product.color,
          weight: product.weight,
          length: product.length,
          width: product.width,
          height: product.height,
          unit: product.unit,
          description: product.description,
          image: product.image
        });
        
        // Initialize colors if they exist
        if (product.colors && product.colors.length > 0) {
          setColors(product.colors);
          setActiveColorId(product.colors[0].id);
        }
      } else {
        // Reset form for new product
        form.resetFields();
        setColors([]);
        setActiveColorId(null);
      }
      setCurrentStep(0);
    }
  }, [visible, isEditing, product, form]);

  const handleAddColor = () => {
    const newColor = {
      id: `color_${Date.now()}`,
      name: '',
      colorCode: '#000000',
      image: '',
      sizes: [],
      rawMaterials: []
    };
    const updatedColors = [...colors, newColor];
    setColors(updatedColors);
    setActiveColorId(newColor.id);
  };

  const handleRemoveColor = (colorId) => {
    const updatedColors = colors.filter(color => color.id !== colorId);
    setColors(updatedColors);
    
    if (activeColorId === colorId) {
      setActiveColorId(updatedColors.length > 0 ? updatedColors[0].id : null);
    }
  };

  const handleUpdateColor = (colorId, updatedColor) => {
    const updatedColors = colors.map(color => 
      color.id === colorId ? { ...color, ...updatedColor } : color
    );
    setColors(updatedColors);
  };

  const handleAddSizeToColor = (colorId) => {
    const newSize = {
      id: `size_${Date.now()}`,
      name: '',
      stock: 0,
      price: 0
    };
    
    const updatedColors = colors.map(color => 
      color.id === colorId 
        ? { ...color, sizes: [...color.sizes, newSize] }
        : color
    );
    setColors(updatedColors);
  };

  const handleRemoveSizeFromColor = (colorId, sizeId) => {
    const updatedColors = colors.map(color => 
      color.id === colorId 
        ? { ...color, sizes: color.sizes.filter(size => size.id !== sizeId) }
        : color
    );
    setColors(updatedColors);
  };

  const handleAddMaterialToColor = (colorId) => {
    const newMaterial = {
      id: `material_${Date.now()}`,
      rawMaterialId: '',
      quantity: 0
    };
    
    const updatedColors = colors.map(color => 
      color.id === colorId 
        ? { ...color, rawMaterials: [...color.rawMaterials, newMaterial] }
        : color
    );
    setColors(updatedColors);
  };

  const handleRemoveMaterialFromColor = (colorId, materialId) => {
    const updatedColors = colors.map(color => 
      color.id === colorId 
        ? { ...color, rawMaterials: color.rawMaterials.filter(material => material.id !== materialId) }
        : color
    );
    setColors(updatedColors);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate aggregated price and stock from colors if they exist
      let aggregatedPrice = values.price;
      let aggregatedStock = values.stock;
      
      if (colors.length > 0) {
        const allSizes = colors.flatMap(color => color.sizes);
        if (allSizes.length > 0) {
          aggregatedPrice = Math.min(...allSizes.map(size => size.price));
          aggregatedStock = allSizes.reduce((total, size) => total + size.stock, 0);
        }
      }

      const productData = {
        ...values,
        price: aggregatedPrice,
        stock: aggregatedStock,
        colors: colors
      };

      if (isEditing) {
        dispatch(updateProduct({ id: product.id, ...productData }));
      } else {
        dispatch(addProduct(productData));
      }

      handleCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setColors([]);
    setActiveColorId(null);
    setCurrentStep(0);
    onCancel();
  };

  const steps = [
    {
      title: 'Product Details',
      content: (
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
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select category">
                {categories.map(category => (
                  <Option key={category.name} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Base Price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Enter base price"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="stock"
              label="Base Stock"
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter stock quantity"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="barcode" label="Barcode/SKU">
              <Input placeholder="Enter barcode or SKU" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="color" label="Base Color">
              <Input placeholder="Enter base color" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="weight" label="Weight">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Weight"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="length" label="Length">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Length"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="width" label="Width">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Width"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="height" label="Height">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Height"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label="Unit">
              <Select placeholder="Select unit">
                <Option value="cm">Centimeters</Option>
                <Option value="m">Meters</Option>
                <Option value="in">Inches</Option>
                <Option value="ft">Feet</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="image" label="Product Image">
              <Input placeholder="Enter image URL" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Enter product description" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: 'Colors & Sizes',
      content: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              onClick={handleAddColor}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Color Variation
            </Button>
          </div>
          
          {colors.length > 0 && (
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
                  <h4>Colors</h4>
                  {colors.map(color => (
                    <div 
                      key={color.id}
                      style={{
                        padding: 8,
                        margin: '8px 0',
                        border: activeColorId === color.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => setActiveColorId(color.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: color.colorCode || '#000000',
                            marginRight: 8,
                            border: '1px solid #d9d9d9'
                          }}
                        />
                        <span>{color.name || 'Unnamed Color'}</span>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveColor(color.id);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Col>
              
              <Col span={16}>
                {activeColorId && (
                  <ColorEditor
                    color={colors.find(c => c.id === activeColorId)}
                    onUpdateColor={(updatedColor) => handleUpdateColor(activeColorId, updatedColor)}
                    onAddSize={() => handleAddSizeToColor(activeColorId)}
                    onRemoveSize={(sizeId) => handleRemoveSizeFromColor(activeColorId, sizeId)}
                    onAddMaterial={() => handleAddMaterialToColor(activeColorId)}
                    onRemoveMaterial={(materialId) => handleRemoveMaterialFromColor(activeColorId, materialId)}
                    rawMaterials={rawMaterials}
                  />
                )}
              </Col>
            </Row>
          )}
        </div>
      )
    }
  ];

  return (
    <Modal
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      visible={visible}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        currentStep > 0 && (
          <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        ),
        currentStep < steps.length - 1 ? (
          <Button key="next" type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
            Next
          </Button>
        ) : (
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        )
      ]}
    >
      <Form form={form} layout="vertical">
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        
        <div>{steps[currentStep].content}</div>
      </Form>
    </Modal>
  );
};

export default ProductModal;