import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Modal, 
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
  Divider,
  Switch,
  Tag,
  Alert,
  Steps,
  Tabs
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { ColorEditor } from './ColorEditor';
import { EnhancedStepper } from '../common/EnhancedStepper';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export function ProductModal({ 
  open, 
  onClose, 
  onSubmit, 
  editingProduct = null 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [productForm] = Form.useForm();
  const [materialsForm] = Form.useForm();
  const [sizesForm] = Form.useForm();
  const [addonsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [colors, setColors] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productData, setProductData] = useState({});
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [activeColorId, setActiveColorId] = useState(null);
  const { rawMaterialsList } = useSelector(state => state.rawMaterials);
  const { categoriesList } = useSelector(state => state.categories);

  // Color management functions
  const handleAddColor = () => {
    const newColor = {
      id: `COLOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      colorCode: '#000000',
      image: '',
      sizes: [],
      rawMaterials: []
    };
    setColors([...colors, newColor]);
    setActiveColorId(newColor.id);
  };

  const handleRemoveColor = (colorId) => {
    setColors(colors.filter(c => c.id !== colorId));
    if (activeColorId === colorId) {
      setActiveColorId(null);
    }
  };

  const handleUpdateColor = (colorId, updates) => {
    setColors(colors.map(color => 
      color.id === colorId ? { ...color, ...updates } : color
    ));
  };

  const handleAddSizeToColor = (colorId, sizeData) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        const newSize = {
          id: `SIZE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          ...sizeData
        };
        return {
          ...color,
          sizes: [...color.sizes, newSize]
        };
      }
      return color;
    }));
  };

  const handleRemoveSizeFromColor = (colorId, sizeId) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: color.sizes.filter(size => size.id !== sizeId)
        };
      }
      return color;
    }));
  };

  const handleAddMaterialToColor = (colorId, materialData) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          rawMaterials: [...color.rawMaterials, materialData]
        };
      }
      return color;
    }));
  };

  const handleRemoveMaterialFromColor = (colorId, materialId) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          rawMaterials: color.rawMaterials.filter(m => m.rawMaterialId !== materialId)
        };
      }
      return color;
    }));
  };
  const renderColorsAndSizes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={5}>Product Colors & Sizes</Title>
          <Text type="secondary">
            Define color variations for this product. Each color can have its own sizes and raw materials.
          </Text>
        </div>
        <ActionButton.Primary 
          icon="add"
          onClick={handleAddColor}
        >
          Add Color
        </ActionButton.Primary>
      </div>

      {colors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="palette" className="text-4xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">No Colors Added</Title>
          <Text type="secondary" className="block mb-4">
            Add color variations to define different options for this product
          </Text>
          <ActionButton.Primary 
            icon="add"
            onClick={handleAddColor}
          >
            Add First Color
          </ActionButton.Primary>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Color List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map(color => (
              <Card
                key={color.id}
                size="small"
                className={`cursor-pointer transition-all ${activeColorId === color.id ? 'border-blue-500 shadow-md' : 'hover:border-blue-300'}`}
                onClick={() => setActiveColorId(color.id)}
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.colorCode || '#000000' }}
                      />
                      <Text strong>{color.name || 'Unnamed Color'}</Text>
                    </div>
                    <ActionButton.Text
                      icon="delete"
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(color.id);
                      }}
                    />
                  </div>
                }
              >
                <div className="space-y-2">
                  <div>
                    <Text type="secondary" className="text-xs">Sizes:</Text>
                    <Text className="block">{color.sizes.length} size(s)</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Materials:</Text>
                    <Text className="block">{color.rawMaterials.length} material(s)</Text>
                  </div>
                  {color.image && (
                    <div className="mt-2">
                      <img 
                        src={color.image} 
                        alt={color.name} 
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Color Details Editor */}
          {activeColorId && (
            <Card title={`Edit Color: ${colors.find(c => c.id === activeColorId)?.name || 'Unnamed'}`}>
              <ColorEditor
                color={colors.find(c => c.id === activeColorId)}
                onUpdate={(updates) => handleUpdateColor(activeColorId, updates)}
                onAddSize={(sizeData) => handleAddSizeToColor(activeColorId, sizeData)}
                onRemoveSize={(sizeId) => handleRemoveSizeFromColor(activeColorId, sizeId)}
                onAddMaterial={(materialData) => handleAddMaterialToColor(activeColorId, materialData)}
                onRemoveMaterial={(materialId) => handleRemoveMaterialFromColor(activeColorId, materialId)}
                rawMaterials={rawMaterialsList}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );

  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct && open) {
      const formData = {
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.price || 0,
        stock: editingProduct.stock || 0,
        barcode: editingProduct.barcode || '',
        description: editingProduct.description || '',
        weight: editingProduct.weight || 0,
        color: editingProduct.color || '',
        dimensions: editingProduct.dimensions || {}
      };
      
      productForm.setFieldsValue(formData);
      setProductData(formData);
      
      if (editingProduct.colors && editingProduct.colors.length > 0) {
        setColors(editingProduct.colors);
      } else {
        // Create a default color from existing product data
        setColors([{
          id: `COLOR-${editingProduct.id}-DEFAULT`,
          name: editingProduct.color || 'Default',
          colorCode: '#000000',
          image: editingProduct.image || '',
          sizes: editingProduct.sizes || [],
          rawMaterials: editingProduct.rawMaterials || []
        }]);
      }
      
      setSelectedMaterials([]);
      setSelectedAddons([]);
      
      setImagePreview(editingProduct.image);
      setCurrentStep(0);
    } else if (open && !editingProduct) {
      const initialData = {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        barcode: '',
        description: '',
        weight: 0,
        color: '',
        dimensions: {}
      };
      
      productForm.resetFields();
      setProductData(initialData);
      setSelectedMaterials([]);
      setSelectedAddons([]);
      setColors([]);
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(0);
      setActiveColorId(null);
    }
  }, [editingProduct, open, productForm, rawMaterialsList]);

  const getSteps = () => {
    const baseSteps = [
      {
        title: 'Product Details',
        description: 'Basic information',
        icon: 'inventory_2',
        content: renderProductDetails
      },
      {
        title: 'Colors & Sizes',
        description: 'Color variations and sizes',
        icon: 'palette',
        content: renderColorsAndSizes
      }
    ];
    
    return baseSteps;
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setProductData(prev => ({ ...prev, image: e.target.result }));
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    return false;
  };

  const handleAddMaterial = (values) => {
    const material = rawMaterialsList.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

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

  const handleAddAddon = (values) => {
    const material = rawMaterialsList.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    const existingAddon = selectedAddons.find(a => a.id === values.materialId);
    if (existingAddon) {
      message.error('Add-on already added');
      return;
    }

    const newAddon = {
      id: values.materialId,
      name: material.name,
      quantity: values.quantity,
      price: material.unitPrice * values.quantity,
      unit: material.unit
    };

    setSelectedAddons([...selectedAddons, newAddon]);
    addonsForm.resetFields();
    message.success('Add-on added successfully');
  };

  const handleRemoveAddon = (addonId) => {
    setSelectedAddons(selectedAddons.filter(a => a.id !== addonId));
    message.success('Add-on removed');
  };

  const handleFormChange = (changedValues, allValues) => {
    setProductData(prev => ({ ...prev, ...allValues }));
  };

  const handleNext = async () => {
    setStepError('');
    
    if (currentStep === 0) {
      try {
        const values = await productForm.validateFields();
        setProductData(prev => ({ ...prev, ...values }));
        setCurrentStep(currentStep + 1);
      } catch (error) {
        if (error.errorFields && error.errorFields.length > 0) {
          const missingFields = error.errorFields.map(field => {
            const fieldName = Array.isArray(field.name) ? field.name.join('.') : field.name;
            const fieldLabels = {
              'name': 'Product Name',
              'category': 'Category',
              'price': 'Price',
              'stock': 'Stock',
              'barcode': 'SKU/Barcode',
              'description': 'Description',
              'weight': 'Weight',
              'color': 'Color'
            };
            return fieldLabels[fieldName] || fieldName;
          });
          
          setStepError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        } else {
          setStepError('Please fill in all required product details');
        }
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setStepError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStepError('');
      
      const currentFormValues = productForm.getFieldsValue();
      const finalProductData = { ...productData, ...currentFormValues };
      
      const requiredFields = ['name', 'category', 'price', 'stock'];
      
      const missingFields = [];
      requiredFields.forEach(field => {
        const value = finalProductData[field];
        if (value === undefined || value === null || value === '') {
          missingFields.push(field);
        } else if ((field === 'price' || field === 'stock') && Number(value) < 0) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        const fieldLabels = {
          'name': 'Product Name',
          'category': 'Category', 
          'price': 'Base Price',
          'stock': 'Base Stock'
        };
        const missingLabels = missingFields.map(field => fieldLabels[field] || field);
        setStepError(`Please fill in required fields: ${missingLabels.join(', ')}`);
        setCurrentStep(0);
        return;
      }

      const productSubmissionData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: finalProductData.name,
        category: finalProductData.category,
        description: finalProductData.description || '',
        image: imagePreview || finalProductData.image || '',
        
        // Calculate total stock from all color-size combinations, fallback to base values
        price: colors.length > 0 ? 
          Math.min(...colors.flatMap(c => c.sizes?.map(s => s.price) || [finalProductData.price])) : 
          (Number(finalProductData.price) || 0),
        stock: colors.length > 0 ? 
          colors.reduce((sum, c) => sum + (c.sizes?.reduce((sSum, s) => sSum + s.stock, 0) || 0), 0) : 
          (Number(finalProductData.stock) || 0),
        barcode: finalProductData.barcode || '',
        dimensions: finalProductData.dimensions ? {
          length: Number(finalProductData.dimensions.length) || 0,
          width: Number(finalProductData.dimensions.width) || 0,
          height: Number(finalProductData.dimensions.height) || 0,
          unit: finalProductData.dimensions.unit || 'cm'
        } : {},
        weight: Number(finalProductData.weight) || 0,
        color: finalProductData.color || '',
        material: finalProductData.material || '',
        colors: colors,
        addons: selectedAddons
      };

      await onSubmit(productSubmissionData);
      handleClose();
    } catch (error) {
      console.error('Error submitting product:', error);
      setStepError('Failed to save product. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setStepError('');
    productForm.resetFields();
    materialsForm.resetFields();
    sizesForm.resetFields();
    addonsForm.resetFields();
    setSelectedMaterials([]);
    setSelectedAddons([]);
    setColors([]);
    setActiveColorId(null);
    setActiveColorId(null);
    onClose();
  };

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
      render: (price) => `LKR ${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => `LKR ${(cost || 0).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this material?"
          onConfirm={() => handleRemoveMaterial(record.rawMaterialId)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const addonColumns = [
    {
      title: 'Add-on',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => `${record.quantity || 0} ${record.unit || 'unit'}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `LKR ${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this add-on?"
          onConfirm={() => handleRemoveAddon(record.id)}
        >
          <Button type="text" danger icon={<Icon name="delete" />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  // Filter raw materials for addons
  const filteredRawMaterials = rawMaterialsList.filter(material => 
    material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const renderProductDetails = () => (
    <Form 
      form={productForm} 
      layout="vertical" 
      className="space-y-4"
      onValuesChange={handleFormChange}
      preserve={true}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[
              { required: true, message: 'Please enter product name' },
              { min: 2, message: 'Product name must be at least 2 characters' }
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" allowClear>
              {categoriesList?.filter(cat => cat.isActive).map(category => (
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
            label="Base Price (LKR)"
            rules={[
              { required: true, message: 'Please enter base price' },
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
        <Col span={8}>
          <Form.Item
            name="stock"
            label="Base Stock"
            rules={[
              { required: true, message: 'Please enter base stock' },
              { type: 'number', min: 0, message: 'Stock cannot be negative' }
            ]}
          >
            <InputNumber
              min={0}
              placeholder="0"
              className="w-full"
              step={1}
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
        <Col span={12}>
          <Form.Item name="barcode" label="SKU/Barcode">
            <Input placeholder="Enter SKU or barcode" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="color" label="Default Color">
            <Input placeholder="Enter default color" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Dimensions">
        <Input.Group compact>
          <Form.Item name={['dimensions', 'length']} noStyle>
            <InputNumber placeholder="Length" className="w-1/4" min={0} />
          </Form.Item>
          <Form.Item name={['dimensions', 'width']} noStyle>
            <InputNumber placeholder="Width" className="w-1/4" min={0} />
          </Form.Item>
          <Form.Item name={['dimensions', 'height']} noStyle>
            <InputNumber placeholder="Height" className="w-1/4" min={0} />
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
                  <Button icon={<Icon name="upload" />} size="small">
                    Change Image
                  </Button>
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
        <Title level={5}>Raw Materials</Title>
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
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {rawMaterialsList?.map(material => (
                    <Option key={material.id} value={material.id} 
                    label={`${material.name} ${material.category}`}
                    >
                      <div>
                        <Text strong>{material.name}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {material.category} • LKR {material.unitPrice}/{material.unit} • Stock: {material.stockQuantity}
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
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {selectedMaterials.length > 0 ? (
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
                    <Text strong>LKR {totalCost.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      ) : (
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

  const renderAddons = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Product Add-ons</Title>
        <Text type="secondary">
          Define optional add-ons that customers can select when purchasing this product
        </Text>
      </div>

      <Card size="small">
        <Form form={addonsForm} onFinish={handleAddAddon} layout="vertical">
          <Row gutter={16}>
            <Col span={24} className="mb-4">
              <Input.Search
                placeholder="Search materials..."
                onChange={(e) => setMaterialSearchTerm(e.target.value)}
                className="w-full"
              />
            </Col>
          </Row>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredRawMaterials.map(material => (
              <Card 
                key={material.id} 
                size="small" 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  addonsForm.setFieldsValue({
                    materialId: material.id,
                    quantity: 1
                  });
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="category" className="text-blue-600" />
                  </div>
                  <div>
                    <Text strong className="block">{material.name}</Text>
                    <Text type="secondary" className="text-xs">
                      LKR {material.unitPrice.toFixed(2)} per {material.unit}
                    </Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      Stock: {material.stockQuantity} {material.unit}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="materialId"
                label="Selected Add-on"
                rules={[{ required: true, message: 'Please select an add-on' }]}
              >

                <Select
                  placeholder="Select add-on material"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {rawMaterialsList?.map(material => (
                    <Option key={material.id} value={material.id}
                     label= {`${material.name} (LKR ${material.unitPrice.toFixed(2)}/${material.unit})`}>
                    
                    {material.name} (LKR {material.unitPrice.toFixed(2)}/{material.unit})
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
                  min={1}
                  step={1}
                  placeholder="1"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {selectedAddons.length > 0 ? (
        <div>
          <Title level={5}>Selected Add-ons</Title>
          <Table
            columns={addonColumns}
            dataSource={selectedAddons}
            rowKey="id"
            pagination={false}
            size="small"
            summary={(pageData) => {
              const totalPrice = pageData.reduce((sum, record) => sum + (record.price || 0), 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={2}>
                    <Text strong>Total Add-on Price</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text strong>LKR {totalPrice.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icon name="add_circle" className="text-4xl text-gray-300 mb-2" />
          <Text type="secondary">No add-ons added yet</Text>
          <br />
          <Text type="secondary" className="text-sm">
            Add optional extras that customers can select when purchasing
          </Text>
        </div>
      )}
    </div>
  );

  const steps = getSteps();

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
        <EnhancedStepper
          current={currentStep}
          steps={steps}
          status={stepError ? 'error' : 'process'}
          errorMessage={stepError}
        />
        
        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <Text>Loading...</Text>
              </div>
            </div>
          ) : (
            steps[currentStep].content()
          )}
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