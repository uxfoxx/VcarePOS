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
import { VariantManagementPanel } from './VariantManagementPanel';
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
  const [sizes, setSizes] = useState([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [hasAddons, setHasAddons] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [productData, setProductData] = useState({});
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const {rawMaterialsList, error} = useSelector(state => state.rawMaterials);
  const {categoriesList } = useSelector(state => state.categories);


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
      setHasSizes(editingProduct.hasSizes || false);
      setHasAddons(editingProduct.hasAddons || false);
      setHasVariants(editingProduct.hasVariants || false);
      
      if (editingProduct.hasSizes && editingProduct.sizes) {
        setSizes(editingProduct.sizes);
      } else {
        setSizes([]);
      }
      
      const enrichedMaterials = (editingProduct.rawMaterials || []).map(rawMat => {
        const fullMaterial = rawMaterialsList?.find(m => m.id === rawMat.rawMaterialId);
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
      
      // Set addons if any
      if (editingProduct.addons) {
        setSelectedAddons(editingProduct.addons.map(addon => {
          const material = rawMaterialsList?.find(m => m.id === addon.id);
          return {
            id: addon.id,
            name: material?.name || addon.name,
            quantity: addon.quantity || 1,
            price: addon.price || 0,
            unit: material?.unit || 'unit'
          };
        }));
      } else {
        setSelectedAddons([]);
      }
      
      // Set variants if any
      if (editingProduct.hasVariants && editingProduct.variants) {
        setVariants(editingProduct.variants);
      } else {
        setVariants([]);
      }
      
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
      setSizes([]);
      setVariants([]);
      setHasSizes(false);
      setHasAddons(false);
      setHasVariants(false);
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(0);
    }
  }, [editingProduct, open, productForm, rawMaterialsList]);

  const getSteps = () => {
    const baseSteps = [
      {
        title: 'Product Details',
        description: 'Basic information',
        icon: 'inventory_2',
        content: renderProductDetails
      }
    ];
    if (!hasVariants) {
       baseSteps.push({
        title: 'Raw Materials',
        description: 'Materials used',
        icon: 'category',
        content: renderRawMaterials
      });
    }
    if (hasAddons) {
      baseSteps.push({
        title: 'Add-ons',
        description: 'Optional extras',
        icon: 'add_circle',
        content: renderAddons
      });
    }
    
    if (hasSizes) {
      baseSteps.push({
        title: 'Sizes',
        description: 'Size variations',
        icon: 'aspect_ratio',
        content: renderSizes
      });
    }
    
    if (hasVariants) {
      baseSteps.push({
        title: 'Variants',
        description: 'Product variants',
        icon: 'style',
        content: renderVariants
      });
    }
    
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

  const handleAddSize = (values) => {
    const existingSize = sizes.find(s => s.name === values.name);
    if (existingSize) {
      message.error('Size name already exists');
      return;
    }

    const newSize = {
      id: `SIZE-${Date.now()}`,
      name: values.name,
      price: values.price,
      stock: values.stock,
      dimensions: values.dimensions || {},
      weight: values.weight || 0
    };

    setSizes([...sizes, newSize]);
    sizesForm.resetFields();
    message.success('Size added successfully');
  };

  const handleRemoveSize = (sizeId) => {
    setSizes(sizes.filter(s => s.id !== sizeId));
    message.success('Size removed');
  };

  const handleAddVariant = (variantData) => {
    const newVariant = {
      id: `VARIANT-${Date.now()}`,
      ...variantData,
      sizes: variantData.hasSizes ? [] : null,
      rawMaterials: []
    };
    
    setVariants([...variants, newVariant]);
    message.success('Variant added successfully');
  };
  
  const handleUpdateVariant = (variantId, updatedData) => {
    setVariants(variants.map(variant => 
      variant.id === variantId ? { ...variant, ...updatedData } : variant
    ));
    message.success('Variant updated successfully');
  };
  
  const handleRemoveVariant = (variantId) => {
    setVariants(variants.filter(variant => variant.id !== variantId));
    message.success('Variant removed');
  };
  
  const handleAddVariantSize = (variantId, sizeData) => {
    setVariants(variants.map(variant => {
      if (variant.id === variantId) {
        const sizes = variant.sizes || [];
        return {
          ...variant,
          sizes: [...sizes, {
            id: `SIZE-${Date.now()}`,
            ...sizeData
          }]
        };
      }
      return variant;
    }));
    message.success('Size added to variant');
  };
  
  const handleRemoveVariantSize = (variantId, sizeId) => {
    setVariants(variants.map(variant => {
      if (variant.id === variantId && variant.sizes) {
        return {
          ...variant,
          sizes: variant.sizes.filter(size => size.id !== sizeId)
        };
      }
      return variant;
    }));
    message.success('Size removed from variant');
  };
  
  const handleAddVariantMaterial = (variantId, materialData) => {
    setVariants(variants.map(variant => {
      if (variant.id === variantId) {
        return {
          ...variant,
          rawMaterials: [...(variant.rawMaterials || []), materialData]
        };
      }
      return variant;
    }));
    message.success('Material added to variant');
  };
  
  const handleRemoveVariantMaterial = (variantId, materialId) => {
    setVariants(variants.map(variant => {
      if (variant.id === variantId) {
        return {
          ...variant,
          rawMaterials: (variant.rawMaterials || []).filter(m => m.rawMaterialId !== materialId)
        };
      }
      return variant;
    }));
    message.success('Material removed from variant');
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
      if (!hasSizes) {
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

      if (hasSizes && sizes.length === 0) {
        setStepError('Please add at least one size for this product');
        setCurrentStep(steps.length - 1);
        return;
      }
      
      if (hasVariants && variants.length === 0) {
        setStepError('Please add at least one variant for this product');
        setCurrentStep(steps.length - 1);
        return;
      }

      const productSubmissionData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: finalProductData.name,
        category: finalProductData.category,
        description: finalProductData.description || '',
        image: imagePreview || finalProductData.image || '',
        hasSizes: hasSizes,
        hasVariants: hasVariants,
        hasAddons: hasAddons,
        
        // For products with sizes, calculate total stock from all sizes
        price: !hasSizes ? (Number(finalProductData.price) || 0) : (sizes.length > 0 ? Math.min(...sizes.map(s => s.price)) : 0),
        stock: hasSizes ? sizes.reduce((sum, size) => sum + size.stock, 0) : (Number(finalProductData.stock) || 0),
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
        rawMaterials: selectedMaterials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          quantity: m.quantity
          
        })),
        
        sizes: hasSizes ? sizes : [],
        
        addons: hasAddons ? selectedAddons : []
      };

      if (hasVariants) productSubmissionData.variants = variants;

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
    setSizes([]);
    setHasSizes(false);
    setHasVariants(false);
    setHasAddons(false);
    setImageFile(null);
    setImagePreview(null);
    setProductData({});
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

  const sizeColumns = [
    {
      title: 'Size Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `LKR ${(price || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Dimensions',
      key: 'dimensions',
      render: (record) => {
        if (record.dimensions && record.dimensions.length) {
          return `${record.dimensions.length}×${record.dimensions.width}×${record.dimensions.height} ${record.dimensions.unit}`;
        }
        return '-';
      },
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Popconfirm
          title="Remove this size?"
          onConfirm={() => handleRemoveSize(record.id)}
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
        <Col span={12}>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text strong>Product Variants</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Enable if this product has multiple variants (e.g., colors, materials)
                </Text>
              </div>
              <Switch
                checked={hasVariants}
                onChange={setHasVariants}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text strong>Product Add-ons</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Enable if this product has optional add-ons
                </Text>
              </div>
              <Switch
                checked={hasAddons}
                onChange={setHasAddons}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>
          </div>
        </Col>
      </Row>

      {hasVariants && (
        <Alert
          message="Product Variants Enabled"
          description="Since this product has variants, you'll be able to define different variants with their own properties, sizes, and raw materials in the Variants tab."
          type="info"
          showIcon
        />
      )}
    
        
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price (LKR)"
                rules={hasSizes ? [] : [
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
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock"
                rules={hasSizes ? [] : [
                  { required: true, message: 'Please enter stock' },
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
            <Col span={16}>
              <Form.Item name="barcode" label="SKU/Barcode">
                <Input placeholder="Enter SKU or barcode" />
              </Form.Item>
            </Col>
            
          </Row>
      {!hasSizes && !hasVariants && (
        <Row gutter={16}>
          <Col span={8}>
              <Form.Item name="color" label="Color">
                <Input placeholder="Enter color" />
              </Form.Item>
            </Col>
            </Row>
       
      )}

      {!hasSizes && (
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="barcode" label="SKU/Barcode">
              <Input placeholder="Enter SKU or barcode" />
            </Form.Item>
          </Col>
        </Row>
      )}

      {(hasSizes || hasVariants) && (
        <Alert
          message="Product Sizes Enabled"
          description="Since this product has sizes, the price and stock will be set for each size individually. The fields below represent the base values for reference."
          type="info"
          showIcon
        />
      )}

      {!hasVariants && (
        <>
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
        </>
      )}
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

  const renderSizes = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Product Sizes</Title>
        <Text type="secondary">
          Create different sizes of this product with unique prices and specifications
        </Text>
      </div>

      {hasSizes ? (
        <>
          <Card size="small">
            <Form form={sizesForm} onFinish={handleAddSize} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="name"
                    label="Size Name"
                    rules={[{ required: true, message: 'Please enter size name' }]}
                  >
                    <Input placeholder="e.g., Small, Medium, Large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Price (LKR)"
                    rules={[{ required: true, message: 'Please enter price' }]}
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
                    label="Stock"
                    rules={[{ required: true, message: 'Please enter stock' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      className="w-full"
                      step={1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                  <Form.Item label="Dimensions">
                    <Input.Group compact>
                      <Form.Item name={['dimensions', 'length']} noStyle>
                        <InputNumber placeholder="L" className="w-1/4" min={0} />
                      </Form.Item>
                      <Form.Item name={['dimensions', 'width']} noStyle>
                        <InputNumber placeholder="W" className="w-1/4" min={0} />
                      </Form.Item>
                      <Form.Item name={['dimensions', 'height']} noStyle>
                        <InputNumber placeholder="H" className="w-1/4" min={0} />
                      </Form.Item>
                      <Form.Item name={['dimensions', 'unit']} noStyle initialValue="cm">
                        <Select className="w-1/4">
                          <Option value="cm">cm</Option>
                          <Option value="inch">inch</Option>
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add Size
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {sizes.length > 0 ? (
            <div>
              <Title level={5}>Product Sizes ({sizes.length})</Title>
              <Table
                columns={sizeColumns}
                dataSource={sizes}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon name="straighten" className="text-4xl text-gray-300 mb-2" />
              <Text type="secondary">No sizes added yet</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Add sizes to create different options for this product
              </Text>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="info" className="text-4xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Product Sizes Disabled</Title>
          <Text type="secondary">
            This product is set as a single product without size variations.
            <br />
            Go back to Product Details to enable sizes if needed.
          </Text>
        </div>
      )}
    </div>
  );

  const renderVariants = () => (
    <VariantManagementPanel
      variants={variants}
      rawMaterials={rawMaterialsList}
      onAddVariant={handleAddVariant}
      onUpdateVariant={handleUpdateVariant}
      onRemoveVariant={handleRemoveVariant}
      onAddVariantSize={handleAddVariantSize}
      onRemoveVariantSize={handleRemoveVariantSize}
      onAddVariantMaterial={handleAddVariantMaterial}
      onRemoveVariantMaterial={handleRemoveVariantMaterial}
    />
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