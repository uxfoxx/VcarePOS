import React, { useState, useEffect } from 'react';
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
  Tooltip
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { EnhancedStepper } from '../common/EnhancedStepper';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { 
  generateProductSKU, 
  generateVariationSKU, 
  parseSKU, 
  describeSKU, 
  validateSKU,
  getSKUSuggestions 
} from '../../utils/skuGenerator';

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
  const [variationsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [variations, setVariations] = useState([]);
  const [hasVariations, setHasVariations] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productData, setProductData] = useState({});
  const [skuSuggestions, setSkuSuggestions] = useState([]);
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct && open) {
      const formData = {
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.basePrice || editingProduct.price || 0,
        stock: editingProduct.baseStock || editingProduct.stock || 0,
        barcode: editingProduct.barcode || '',
        description: editingProduct.description || '',
        weight: editingProduct.baseWeight || editingProduct.weight || 0,
        color: editingProduct.baseColor || editingProduct.color || '',
        dimensions: editingProduct.baseDimensions || editingProduct.dimensions || {}
      };
      
      productForm.setFieldsValue(formData);
      setProductData(formData);
      setHasVariations(editingProduct.hasVariations || false);
      
      if (editingProduct.hasVariations && editingProduct.variations) {
        setVariations(editingProduct.variations);
      } else {
        setVariations([]);
      }
      
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
      setVariations([]);
      setHasVariations(false);
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(0);
      setSkuSuggestions([]);
      setShowSkuSuggestions(false);
    }
  }, [editingProduct, open, productForm, state.rawMaterials]);

  const steps = [
    {
      title: 'Product Details',
      description: 'Basic product information',
      icon: 'inventory_2'
    },
    {
      title: 'Raw Materials',
      description: 'Materials used in production',
      icon: 'category'
    },
    {
      title: 'Variations',
      description: 'Product variations and options',
      icon: 'tune'
    }
  ];

  const generateSKU = () => {
    const currentValues = productForm.getFieldsValue();
    const productForSKU = { ...productData, ...currentValues };
    
    if (!productForSKU.name || !productForSKU.category) {
      message.warning('Please enter product name and category first');
      return;
    }

    const allProducts = [...state.products, ...state.allProducts];
    const generatedSKU = generateProductSKU(productForSKU, allProducts);
    
    productForm.setFieldsValue({ barcode: generatedSKU });
    setProductData(prev => ({ ...prev, barcode: generatedSKU }));
    
    // Show SKU information
    const skuInfo = parseSKU(generatedSKU);
    if (skuInfo) {
      message.success(`Generated SKU: ${generatedSKU} (${describeSKU(generatedSKU)})`);
    }
  };

  const generateVariationSKU = () => {
    const currentValues = productForm.getFieldsValue();
    const productForSKU = { ...productData, ...currentValues };
    
    if (!productForSKU.name || !productForSKU.category) {
      message.warning('Please enter product name and category first');
      return;
    }

    const allProducts = [...state.products, ...state.allProducts];
    const variationIndex = variations.length;
    const generatedSKU = generateVariationSKU(productForSKU, {}, variationIndex, allProducts);
    
    variationsForm.setFieldsValue({ sku: generatedSKU });
    return generatedSKU;
  };

  const showSKUSuggestions = () => {
    const currentValues = productForm.getFieldsValue();
    const productForSKU = { ...productData, ...currentValues };
    
    if (!productForSKU.name || !productForSKU.category) {
      message.warning('Please enter product name and category first');
      return;
    }

    const allProducts = [...state.products, ...state.allProducts];
    const suggestions = getSKUSuggestions(productForSKU, allProducts);
    setSkuSuggestions(suggestions);
    setShowSkuSuggestions(true);
  };

  const applySKUSuggestion = (sku) => {
    productForm.setFieldsValue({ barcode: sku });
    setProductData(prev => ({ ...prev, barcode: sku }));
    setShowSkuSuggestions(false);
    message.success('SKU applied successfully');
  };

  const validateCurrentSKU = () => {
    const currentSKU = productForm.getFieldValue('barcode');
    if (!currentSKU) {
      message.warning('Please enter a SKU first');
      return;
    }

    const isValid = validateSKU(currentSKU);
    if (isValid) {
      const description = describeSKU(currentSKU);
      message.success(`Valid SKU: ${description}`);
    } else {
      message.error('Invalid SKU format or checksum');
    }
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
    const material = state.rawMaterials.find(m => m.id === values.materialId);
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

  const handleAddVariation = (values) => {
    const existingVariation = variations.find(v => v.sku === values.sku);
    if (existingVariation) {
      message.error('SKU already exists in variations');
      return;
    }

    const newVariation = {
      id: `VAR-${Date.now()}`,
      name: values.name,
      sku: values.sku,
      price: values.price,
      stock: values.stock,
      dimensions: values.dimensions || {},
      weight: values.weight || 0,
      color: values.color || '',
      description: values.description || '',
      image: values.image || imagePreview || '',
      rawMaterials: [...selectedMaterials.map(m => ({
        rawMaterialId: m.rawMaterialId,
        quantity: m.quantity
      }))]
    };

    setVariations([...variations, newVariation]);
    variationsForm.resetFields();
    
    // Auto-generate next variation SKU
    const nextSKU = generateVariationSKU(
      { ...productData, ...productForm.getFieldsValue() }, 
      {}, 
      variations.length + 1, 
      [...state.products, ...state.allProducts]
    );
    variationsForm.setFieldsValue({ sku: nextSKU });
    
    message.success('Variation added successfully');
  };

  const handleRemoveVariation = (variationId) => {
    setVariations(variations.filter(v => v.id !== variationId));
    message.success('Variation removed');
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
    try {
      setLoading(true);
      setStepError('');
      
      const currentFormValues = productForm.getFieldsValue();
      const finalProductData = { ...productData, ...currentFormValues };
      
      const requiredFields = ['name', 'category'];
      if (!hasVariations) {
        requiredFields.push('price', 'stock');
      }
      
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
          'price': 'Price',
          'stock': 'Stock'
        };
        const missingLabels = missingFields.map(field => fieldLabels[field] || field);
        setStepError(`Please fill in required fields: ${missingLabels.join(', ')}`);
        setCurrentStep(0);
        return;
      }

      if (hasVariations && variations.length === 0) {
        setStepError('Please add at least one variation for this product');
        setCurrentStep(2);
        return;
      }

      // Validate SKU
      if (finalProductData.barcode && !validateSKU(finalProductData.barcode)) {
        setStepError('Invalid SKU format. Please generate a valid SKU.');
        setCurrentStep(0);
        return;
      }

      // Validate variation SKUs
      if (hasVariations) {
        for (const variation of variations) {
          if (!validateSKU(variation.sku)) {
            setStepError(`Invalid SKU format for variation: ${variation.name}`);
            setCurrentStep(2);
            return;
          }
        }
      }

      const productSubmissionData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: finalProductData.name,
        category: finalProductData.category,
        description: finalProductData.description || '',
        image: imagePreview || finalProductData.image || '',
        hasVariations: hasVariations,
        
        basePrice: hasVariations ? (Number(finalProductData.price) || 0) : undefined,
        baseStock: hasVariations ? 0 : undefined,
        baseDimensions: hasVariations && finalProductData.dimensions ? {
          length: Number(finalProductData.dimensions.length) || 0,
          width: Number(finalProductData.dimensions.width) || 0,
          height: Number(finalProductData.dimensions.height) || 0,
          unit: finalProductData.dimensions.unit || 'cm'
        } : undefined,
        baseWeight: hasVariations ? (Number(finalProductData.weight) || 0) : undefined,
        baseColor: hasVariations ? (finalProductData.color || '') : undefined,
        
        price: !hasVariations ? (Number(finalProductData.price) || 0) : undefined,
        stock: !hasVariations ? (Number(finalProductData.stock) || 0) : undefined,
        barcode: !hasVariations ? (finalProductData.barcode || '') : undefined,
        dimensions: !hasVariations && finalProductData.dimensions ? {
          length: Number(finalProductData.dimensions.length) || 0,
          width: Number(finalProductData.dimensions.width) || 0,
          height: Number(finalProductData.dimensions.height) || 0,
          unit: finalProductData.dimensions.unit || 'cm'
        } : undefined,
        weight: !hasVariations ? (Number(finalProductData.weight) || 0) : undefined,
        color: !hasVariations ? (finalProductData.color || '') : undefined,
        rawMaterials: !hasVariations ? selectedMaterials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          quantity: m.quantity
        })) : [],
        
        variations: hasVariations ? variations : []
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
    variationsForm.resetFields();
    setSelectedMaterials([]);
    setVariations([]);
    setHasVariations(false);
    setImageFile(null);
    setImagePreview(null);
    setProductData({});
    setSkuSuggestions([]);
    setShowSkuSuggestions(false);
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

  const variationColumns = [
    {
      title: 'Variation Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">SKU: {record.sku}</Text>
          {validateSKU(record.sku) ? (
            <Tag color="green" size="small" className="ml-2">Valid</Tag>
          ) : (
            <Tag color="red" size="small" className="ml-2">Invalid SKU</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Specifications',
      key: 'specs',
      render: (record) => (
        <div className="space-y-1">
          {record.color && (
            <Tag size="small" color="blue">{record.color}</Tag>
          )}
          {record.dimensions && record.dimensions.length && (
            <div className="text-xs text-gray-500">
              {record.dimensions.length}×{record.dimensions.width}×{record.dimensions.height} {record.dimensions.unit}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this variation?"
          onConfirm={() => handleRemoveVariation(record.id)}
        >
          <ActionButton.Text icon="delete" danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  const renderProductDetails = () => (
    <Form 
      form={productForm} 
      layout="vertical" 
      className="space-y-4"
      onValuesChange={handleFormChange}
      preserve={false}
    >
      <Row gutter={16}>
        <Col span={12}>
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
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" allowClear>
              {state.categories?.filter(cat => cat.isActive).map(category => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Text strong>Product Variations</Text>
            <br />
            <Text type="secondary" className="text-sm">
              Enable if this product has multiple variations (size, color, etc.)
            </Text>
          </div>
          <Switch
            checked={hasVariations}
            onChange={setHasVariations}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </div>
      </div>

      {!hasVariations && (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[
                  { required: true, message: 'Please enter price' },
                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                ]}
              >
                <InputNumber
                  min={0.01}
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
                rules={[
                  { required: true, message: 'Please enter stock' },
                  { type: 'number', min: 0, message: 'Stock cannot be negative' }
                ]}
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
                  placeholder="Enter SKU or generate one"
                  addonAfter={
                    <Space.Compact>
                      <Tooltip title="Generate Smart SKU">
                        <Button 
                          type="text" 
                          size="small"
                          onClick={generateSKU}
                          icon={<Icon name="auto_awesome" size="text-sm" />}
                        />
                      </Tooltip>
                      <Tooltip title="SKU Suggestions">
                        <Button 
                          type="text" 
                          size="small"
                          onClick={showSKUSuggestions}
                          icon={<Icon name="lightbulb" size="text-sm" />}
                        />
                      </Tooltip>
                      <Tooltip title="Validate SKU">
                        <Button 
                          type="text" 
                          size="small"
                          onClick={validateCurrentSKU}
                          icon={<Icon name="verified" size="text-sm" />}
                        />
                      </Tooltip>
                    </Space.Compact>
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
        </>
      )}

      {hasVariations && (
        <Alert
          message="Product Variations Enabled"
          description="Since this product has variations, the base price, stock, and other details will be set for each variation individually. The fields below represent the base/default values for reference."
          type="info"
          showIcon
        />
      )}

      <Row gutter={16}>
        <Col span={hasVariations ? 12 : 8}>
          <Form.Item name={hasVariations ? "price" : undefined} label={hasVariations ? "Base Price ($)" : undefined}>
            {hasVariations && (
              <InputNumber
                min={0.01}
                step={0.01}
                placeholder="0.00"
                className="w-full"
              />
            )}
          </Form.Item>
        </Col>
        <Col span={hasVariations ? 12 : 8}>
          <Form.Item name="color" label={hasVariations ? "Base Color" : "Color"}>
            <Input placeholder="Enter color" />
          </Form.Item>
        </Col>
        {!hasVariations && (
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
        )}
      </Row>

      <Form.Item label={hasVariations ? "Base Dimensions" : "Dimensions"}>
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

      {/* SKU Information Display */}
      {productForm.getFieldValue('barcode') && (
        <div className="bg-green-50 p-4 rounded-lg">
          <Text strong className="block mb-2">SKU Information:</Text>
          <Text className="text-sm">
            {describeSKU(productForm.getFieldValue('barcode'))}
          </Text>
          {validateSKU(productForm.getFieldValue('barcode')) ? (
            <Tag color="green" className="mt-2">Valid SKU Format</Tag>
          ) : (
            <Tag color="red" className="mt-2">Invalid SKU Format</Tag>
          )}
        </div>
      )}
    </Form>
  );

  const renderRawMaterials = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Raw Materials</Title>
        <Text type="secondary">
          {hasVariations 
            ? "Add base raw materials. You can customize materials for each variation later."
            : "Specify the raw materials used to manufacture this product"
          }
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
                    <Text strong>${totalCost.toFixed(2)}</Text>
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

  const renderVariations = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Product Variations</Title>
        <Text type="secondary">
          Create different variations of this product with unique SKUs, prices, and specifications
        </Text>
      </div>

      {hasVariations ? (
        <>
          <Card size="small">
            <Form form={variationsForm} onFinish={handleAddVariation} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="name"
                    label="Variation Name"
                    rules={[{ required: true, message: 'Please enter variation name' }]}
                  >
                    <Input placeholder="e.g., Large, Red, Premium" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'Please enter SKU' }]}
                  >
                    <Input 
                      placeholder="Enter unique SKU"
                      addonAfter={
                        <Tooltip title="Generate Variation SKU">
                          <Button 
                            type="text" 
                            size="small"
                            onClick={generateVariationSKU}
                            icon={<Icon name="auto_awesome" size="text-sm" />}
                          />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Price ($)"
                    rules={[{ required: true, message: 'Please enter price' }]}
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

              <Row gutter={16}>
                <Col span={6}>
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
                <Col span={6}>
                  <Form.Item name="weight" label="Weight (kg)">
                    <InputNumber
                      min={0}
                      step={0.1}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="color" label="Color">
                    <Input placeholder="Color" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label=" ">
                    <ActionButton.Primary htmlType="submit" icon="add" block>
                      Add Variation
                    </ActionButton.Primary>
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

              <Form.Item name="description" label="Variation Description">
                <TextArea
                  rows={2}
                  placeholder="Describe this specific variation"
                />
              </Form.Item>
            </Form>
          </Card>

          {variations.length > 0 ? (
            <div>
              <Title level={5}>Product Variations ({variations.length})</Title>
              <Table
                columns={variationColumns}
                dataSource={variations}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon name="tune" className="text-4xl text-gray-300 mb-2" />
              <Text type="secondary">No variations added yet</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Add variations to create different options for this product
              </Text>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="info" className="text-4xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Product Variations Disabled</Title>
          <Text type="secondary">
            This product is set as a single product without variations.
            <br />
            Go back to Product Details to enable variations if needed.
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
      case 2:
        return renderVariations();
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={open}
        onCancel={handleClose}
        width={1000}
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
              <LoadingSkeleton type="form" />
            ) : (
              renderStepContent()
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

      {/* SKU Suggestions Modal */}
      <Modal
        title="SKU Suggestions"
        open={showSkuSuggestions}
        onCancel={() => setShowSkuSuggestions(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Text type="secondary">
            Based on your product information, here are some SKU suggestions:
          </Text>
          
          {skuSuggestions.map((suggestion, index) => (
            <Card 
              key={index} 
              size="small" 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => applySKUSuggestion(suggestion.sku)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="font-mono">{suggestion.sku}</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    {suggestion.description}
                  </Text>
                </div>
                <div>
                  <Tag color={
                    suggestion.confidence === 'high' ? 'green' : 
                    suggestion.confidence === 'medium' ? 'orange' : 'blue'
                  }>
                    {suggestion.confidence} confidence
                  </Tag>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="bg-blue-50 p-3 rounded">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              Click on any suggestion to apply it to your product. The SKU format encodes 
              category, type, sequence, material, size, and includes a validation checksum.
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
}