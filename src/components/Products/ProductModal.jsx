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
import { ColorManagementPanel } from './ColorManagementPanel';
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
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [productData, setProductData] = useState({});
  const [colors, setColors] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState(null); // Track selected card
  const { rawMaterialsList, error } = useSelector(state => state.rawMaterials);
  const { categoriesList } = useSelector(state => state.categories);

  // Generate SKU based on category
  const generateSKU = () => {
    const currentValues = productForm.getFieldsValue();
    const category = currentValues.category;

    if (!category) {
      message.warning('Please select a category first');
      return;
    }

    // Get category initials
    const categoryInitials = category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    // Generate unique number (timestamp-based) 
    const uniqueNumber = Date.now().toString().slice(-6);

    // Create SKU
    const generatedSKU = `${categoryInitials}${uniqueNumber}`;

    // Set the SKU in the form
    productForm.setFieldsValue({ barcode: generatedSKU });
    setProductData(prev => ({ ...prev, barcode: generatedSKU }));

    message.success('SKU generated successfully');
  };


  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct && open) {
      const formData = {
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.price || 0,
        barcode: editingProduct.barcode || '',
        description: editingProduct.description || '',
        color: editingProduct.color || '',
      };

      productForm.setFieldsValue(formData);
      setProductData(formData);
      setHasSizes(editingProduct.hasSizes || false);
      setHasAddons(editingProduct.hasAddons || false);

      // Set colors from editing product 
      if (editingProduct.colors) {
        setColors(editingProduct.colors);
      } else {
        setColors([]);
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

      // Set addons if any (always available now)
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

      setImagePreview(editingProduct.image);
      if (editingProduct.media) {
        setMediaPreviews(editingProduct.media);
      }
      setCurrentStep(0);
    } else if (open && !editingProduct) {
      const initialData = {
        name: '',
        category: '',
        price: 0,
        barcode: '',
        description: '',
        color: '',
      };

      productForm.resetFields();
      setProductData(initialData);
      setSelectedMaterials([]);
      setSelectedAddons([]);
      setColors([]);
      setHasSizes(false);
      setHasAddons(false);
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(0);
      setSelectedMaterialId(null);
      setMediaFiles([]);
      setMediaPreviews([]);
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

    baseSteps.push({
      title: 'Colors & Variations',
      description: 'Color variations',
      icon: 'palette',
      content: renderColors
    });

    if (hasAddons) {
      baseSteps.push({
        title: 'Add-ons',
        description: 'Optional extras',
        icon: 'add_circle',
        content: renderAddons
      });
    }

    return baseSteps;
  };

  // Helper function to validate media file
  const validateMediaFile = (file, mediaPreviews) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const maxDimensions = { width: 2000, height: 2000 };

    // Validate type
    if (!isImage && !isVideo) {
      message.error('Please upload only image or video files.');
      return false;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      message.error(`File size exceeds ${maxSizeMB}MB. Please upload a smaller file.`);
      return false;
    }

    // Allowed types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (isImage && !allowedImageTypes.includes(file.type)) {
      message.error('Invalid image type. Please upload a JPG, PNG, or GIF image.');
      return false;
    }
    if (isVideo && !allowedVideoTypes.includes(file.type)) {
      message.error('Invalid video type. Please upload an MP4, WebM, or OGG video.');
      return false;
    }

    // Validate count
    if (mediaPreviews.length >= 5) {
      message.error('Maximum 5 media files allowed.');
      return false;
    }

    return { isImage, isVideo, maxDimensions };
  };

  // Main upload handler
  const handleMediaUpload = (file) => {
    const validation = validateMediaFile(file, mediaPreviews);
    if (!validation) return false;

    const { isImage, maxDimensions } = validation;

    if (isImage) {
      // Check dimensions only for images
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
          message.error(
            `Image dimensions exceed ${maxDimensions.width}x${maxDimensions.height} pixels. Please upload a smaller image.`
          );
          URL.revokeObjectURL(objectUrl);
          return;
        }
        URL.revokeObjectURL(objectUrl);
        processFile(file);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        message.error('Failed to process image. Please try another file.');
      };

      img.src = objectUrl;
    } else {
      // For videos → directly process (convert to Base64 as well)
      processFile(file);
    }

    return false; // Prevent default upload behavior
  };

  // Convert file (image or video) to Base64
  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newMediaUrl = e.target.result; // Base64 string (image/video)
      setImagePreview(newMediaUrl);
      setMediaPreviews((prev) => [...prev, newMediaUrl]);
      setMediaFiles((prev) => [...prev, file]);
      setProductData((prev) => ({
        ...prev,
        image: prev.image || newMediaUrl, // first one becomes primary
        media: [...(prev.media || []), newMediaUrl],
      }));
    };
    reader.readAsDataURL(file); // Works for both images and videos
  };
  console.log("sadasdasdsadasd", {
    imagePreview,
    mediaPreviews,
  })

  const handleRemoveMedia = (index) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setProductData(prev => ({
      ...prev,
      media: (prev.media || []).filter((_, i) => i !== index)
    }));
    message.success('Media file removed');
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
    setSelectedMaterialId(null); // Reset selected card
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

  const handleAddColor = (colorData) => {
    const newColor = {
      id: `COLOR-${Date.now()}`,
      name: colorData.name,
      colorCode: colorData.colorCode,
      image: colorData.image,
      sizes: [],
      rawMaterials: []
    };

    setColors([...colors, newColor]);
    message.success('Color added successfully');
  };

  const handleUpdateColor = (colorId, updatedData) => {
    setColors(colors.map(color =>
      color.id === colorId ? { ...color, ...updatedData } : color
    ));
    message.success('Color updated successfully');
  };

  const handleRemoveColor = (colorId) => {
    setColors(colors.filter(color => color.id !== colorId));
    message.success('Color removed successfully');
  };

  const handleAddColorSize = (colorId, sizeData) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: [...(color.sizes || []), {
            id: `SIZE-${Date.now()}`,
            ...sizeData
          }]
        };
      }
      return color;
    }));
    message.success('Size added to color');
  };

  const handleRemoveColorSize = (colorId, sizeId) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: (color.sizes || []).filter(size => size.id !== sizeId)
        };
      }
      return color;
    }));
    message.success('Size removed from color');
  };

  const handleAddColorMaterial = (colorId, materialData) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          rawMaterials: [...(color.rawMaterials || []), materialData]
        };
      }
      return color;
    }));
    message.success('Material added to color');
  };

  const handleRemoveColorMaterial = (colorId, materialId) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          rawMaterials: (color.rawMaterials || []).filter(m => m.rawMaterialId !== materialId)
        };
      }
      return color;
    }));
    message.success('Material removed from color');
  };

  const handleUpdateColorSize = (colorId, sizeId, updatedSizeData) => {
    setColors(colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: (color.sizes || []).map(size => {
            if (size.id === sizeId) {
              return {
                ...size,
                ...updatedSizeData
              };
            }
            return size;
          })
        };
      }
      return color;
    }));
    message.success('Size updated successfully');
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

      const requiredFields = ['name', 'category', 'price'];

      const missingFields = [];
      requiredFields.forEach(field => {
        const value = finalProductData[field];
        if (value === undefined || value === null || value === '') {
          missingFields.push(field);
        } else if (field === 'price' && Number(value) < 0) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        const fieldLabels = {
          'name': 'Product Name',
          'category': 'Category',
          'price': 'Price',
        };
        const missingLabels = missingFields.map(field => fieldLabels[field] || field);
        setStepError(`Please fill in required fields: ${missingLabels.join(', ')}`);
        setCurrentStep(0);
        return;
      }

      if (colors.length === 0) {
        setStepError('Please add at least one color for this product');
        setCurrentStep(1); // Colors step
        return;
      }

      // Validate that each color has at least one size
      const colorsWithoutSizes = colors.filter(color => !color.sizes || color.sizes.length === 0);
      if (colorsWithoutSizes.length > 0) {
        setStepError(`Please add at least one size for color(s): ${colorsWithoutSizes.map(c => c.name).join(', ')}`);
        setCurrentStep(1); // Colors step
        return;
      }

      const productSubmissionData = {
        id: editingProduct?.id || `PROD-${Date.now()}`,
        name: finalProductData.name,
        category: finalProductData.category,
        description: finalProductData.description || '',
        image: imagePreview || finalProductData.image || '',
        // image: mediaPreviews.length > 0 ? mediaPreviews[0] : (imagePreview || finalProductData.image || ''),
        hasAddons: hasAddons,

        // Fixed price for the product
        price: Number(finalProductData.price) || 0,
        // Calculate total stock from all color sizes
        stock: colors.reduce((total, color) =>
          total + (color.sizes || []).reduce((colorTotal, size) => colorTotal + (size.stock || 0), 0), 0
        ),
        barcode: finalProductData.barcode || '',
        color: finalProductData.color || '',
        material: finalProductData.material || '',

        // New color-based structure
        colors: colors,

        // Media array instead of single image
        media: mediaPreviews.length > 0 ? mediaPreviews : [],

        addons: hasAddons ? selectedAddons : []
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
    setSizes([]);
    setColors([]);
    setHasAddons(false);
    setImageFile(null);
    setImagePreview(null);
    setMediaFiles([]);
    setMediaPreviews([]);
    setProductData({});
    setSelectedMaterialId(null);
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

      <Row gutter={16}>
        <Col span={24}>
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
                  icon={<Icon name="auto_awesome" />}
                  className="text-blue-600"
                >
                  Generate
                </Button>
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea
          rows={3}
          placeholder="Enter product description"
        />
      </Form.Item>

      <Form.Item label="Product Media (Images & Videos)">
        <div className="space-y-4">
          <Upload
            accept="image/*,video/*"
            beforeUpload={handleMediaUpload}
            showUploadList={false}
            multiple={true}
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="space-y-2">
                <Icon name="cloud_upload" className="text-4xl text-gray-400" />
                <div>
                  <Text>Click to upload media files</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Supports: Images (JPG, PNG, GIF) and Videos (MP4, WebM, MOV)
                  </Text>
                  <br />
                  <Text type="secondary" className="text-xs">
                    (Max: 5MB, 2000x2000 pixels) per file, 5 files total ({mediaPreviews.length}/5 used)
                  </Text>
                </div>
              </div>
            </div>
          </Upload>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text strong>Media Files ({mediaPreviews.length}/5)</Text>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    setMediaPreviews([]);
                    setMediaFiles([]);
                    setProductData(prev => ({ ...prev, media: [] }));
                    message.success('All media files removed');
                  }}
                >
                  Remove All
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto overflow-x-clip">
                {mediaPreviews.map((mediaUrl, index) => {
                  const isVideo = mediaUrl.startsWith('data:video/') ||
                    mediaUrl.toLowerCase().includes('.mp4') ||
                    mediaUrl.toLowerCase().includes('.webm') ||
                    mediaUrl.toLowerCase().includes('.mov');

                  return (
                    <div key={index} className="relative group">
                      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 aspect-square">
                            <Icon name="play_circle" className="text-2xl text-gray-500" />
                            <video
                              src={mediaUrl}
                              className="absolute inset-0 w-full h-full object-cover opacity-50"
                              muted
                            />
                          </div>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Remove button */}
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Icon name="close" />}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveMedia(index)}
                      />

                      {/* Media type indicator */}
                      <div className="absolute bottom-1 left-1">
                        <Tag size="small" color={isVideo ? 'purple' : 'blue'}>
                          {isVideo ? 'Video' : 'Image'}
                        </Tag>
                      </div>

                      {/* Primary indicator */}
                      {index === 0 && (
                        <div className="absolute top-1 left-1">
                          <Tag size="small" color="gold">
                            Primary
                          </Tag>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Text type="secondary" className="text-xs">
                The first media file will be used as the primary image in product listings.
                Drag and drop to reorder (coming soon).
              </Text>
            </div>
          )}
        </div>
      </Form.Item>
    </Form>
  );

  const renderColors = () => (
    <div className="space-y-6">
      <div>
        <Title level={5}>Product Colors</Title>
        <Text type="secondary">
          Define color variations for this product. Each color can have its own sizes and raw materials.
        </Text>
      </div>

      <ColorManagementPanel
        colors={colors}
        rawMaterials={rawMaterialsList}
        onAddColor={handleAddColor}
        onUpdateColor={handleUpdateColor}
        onRemoveColor={handleRemoveColor}
        onAddColorSize={handleAddColorSize}
        onRemoveColorSize={handleRemoveColorSize}
        onAddColorMaterial={handleAddColorMaterial}
        onRemoveColorMaterial={handleRemoveColorMaterial}
        onUpdateColorSize={handleUpdateColorSize}
      />
    </div>
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
                    <Option
                      key={material.id}
                      value={material.id}
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

          {rawMaterialsList?.length > 0 ? (
            filteredRawMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {filteredRawMaterials.map(material => (
                  <Card
                    key={material.id}
                    size="small"
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedMaterialId === material.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                      }`}
                    onClick={() => {
                      setSelectedMaterialId(material.id);
                      addonsForm.setFieldsValue({
                        materialId: material.id,
                        quantity: 1
                      });
                    }}
                    hoverable
                    role="button"
                    aria-label={`Select ${material.name} as add-on`}
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
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Icon name="search_off" className="text-4xl text-gray-300 mb-2" />
                <Text type="secondary">No materials match your search</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Try adjusting your search term to find available materials
                </Text>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon name="warning" className="text-4xl text-yellow-500 mb-2" />
              <Text type="secondary">No raw materials available</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Please add raw materials to the system before creating add-ons
              </Text>
            </div>
          )}

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
                  value={selectedMaterialId}
                  onChange={(value) => {
                    console.log('Select changed:', value);
                    setSelectedMaterialId(value);
                    addonsForm.setFieldsValue({ materialId: value });
                  }}
                >
                  {rawMaterialsList?.map(material => (
                    <Option
                      key={material.id}
                      value={material.id}
                      label={`${material.name} (LKR ${material.unitPrice.toFixed(2)}/${material.unit})`}
                    >
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
    </Modal >
  );
}