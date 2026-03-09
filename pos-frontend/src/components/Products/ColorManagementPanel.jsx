import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Typography,
  Popconfirm,
  message,
  Button,
  Tabs,
  Row,
  Col,
  Upload,
  Empty,
  Tag,
  Collapse,
  Alert,
  Badge,
  Tooltip,
  ColorPicker
} from 'antd';
import { Icon } from '../common/Icon';
import { ImageCropModal } from '../common/ImageCropModal';

import { ActionButton } from '../common/ActionButton';
import { settingsApi } from '../../api/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function ColorManagementPanel({
  colors = [],
  rawMaterials = [],
  onAddColor,
  onUpdateColor,
  onRemoveColor,
  onAddColorSize,
  onRemoveColorSize,
  _onAddColorMaterial,
  _onRemoveColorMaterial,
  onUpdateColorSize
}) {
  const [colorForm] = Form.useForm();
  const [colorEditForm] = Form.useForm();
  const [sizeForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [sizeEditForm] = Form.useForm();
  const [activeColorId, setActiveColorId] = useState(null);
  const [activeSizeId, setActiveSizeId] = useState(null);
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [editingColorId, setEditingColorId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [colorSelectorImagePreview, setColorSelectorImagePreview] = useState(null);
  const [colorSelectorImagePath, setColorSelectorImagePath] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImagePath, setEditImagePath] = useState(null);
  const [editColorSelectorImagePreview, setEditColorSelectorImagePreview] = useState(null);
  const [editColorSelectorImagePath, setEditColorSelectorImagePath] = useState(null);
  const [_uploadingImage, setUploadingImage] = useState(false);
  const [_uploadingColorSelectorImage, setUploadingColorSelectorImage] = useState(false);
  const [_uploadingEditImage, setUploadingEditImage] = useState(false);
  const [_uploadingEditColorSelectorImage, setUploadingEditColorSelectorImage] = useState(false);
  const [materialSearchTerm, _setMaterialSearchTerm] = useState('');

  // Size image state
  const [newSizeImagePreview, setNewSizeImagePreview] = useState(null);
  const [newSizeImagePath, setNewSizeImagePath] = useState(null);
  const [editSizeImagePreview, setEditSizeImagePreview] = useState(null);
  const [editSizeImagePath, setEditSizeImagePath] = useState(null);
  const [_uploadingSizeImage, setUploadingSizeImage] = useState(false);

  // Image Cropping State
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropType, setCropType] = useState(null); // 'newImage', 'newSelector', 'editImage', 'editSelector'
  const [currentCroppingFile, setCurrentCroppingFile] = useState(null);
  const [croppingAspectRatio, setCroppingAspectRatio] = useState(4 / 3);

  const commonColors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#808080", // Gray
    "#C0C0C0", // Silver
    "#FF0000", // Red
    "#800000", // Maroon
    "#FFA500", // Orange
    "#FFFF00", // Yellow
    "#808000", // Olive
    "#00FF00", // Lime
    "#008000", // Green
    "#00FFFF", // Cyan
    "#008080", // Teal
    "#0000FF", // Blue
    "#000080", // Navy
    "#800080", // Purple
    "#FF00FF", // Magenta
    "#FFC0CB", // Pink
    "#A52A2A", // Brown
    "#F5F5DC"  // Beige
  ];

  const handleAddColor = (values) => {
    // If ColorPicker provides an object, call toHexString(), otherwise default to #000000
    let hexColor = '#000000';
    if (values.colorCode) {
      hexColor = typeof values.colorCode === 'string' ? values.colorCode : values.colorCode.toHexString();
    }

    const newColor = {
      name: values.name,
      colorCode: hexColor,
      productImageInColor: imagePath || '',
      colorSelectorImage: colorSelectorImagePath || ''
    };

    onAddColor(newColor);
    colorForm.resetFields();
    setImagePreview(null);
    setImagePath(null);
    setColorSelectorImagePreview(null);
    setColorSelectorImagePath(null);
  };

  const handleBeforeCrop = (file, type, aspectRatio = 4 / 3) => {
    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setCropType(type);
    setCurrentCroppingFile(file);
    setCroppingAspectRatio(aspectRatio);
    setShowCropModal(true);
    return false; // Prevent auto upload
  };

  const handleCropComplete = async ({ blob }) => {
    try {
      const croppedFile = new File([blob], currentCroppingFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      let uploadFunc;
      switch (cropType) {
        case 'newImage':
          uploadFunc = handleImageUpload;
          break;
        case 'newSelector':
          uploadFunc = handleColorSelectorImageUpload;
          break;
        case 'editImage':
          uploadFunc = handleEditImageUpload;
          break;
        case 'editSelector':
          uploadFunc = handleEditColorSelectorImageUpload;
          break;
        case 'newSizeImage':
          uploadFunc = handleNewSizeImageUpload;
          break;
        case 'editSizeImage':
          uploadFunc = handleEditSizeImageUpload;
          break;
        default:
          return;
      }

      await uploadFunc(croppedFile);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      message.error('Failed to process cropped image');
    } finally {
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop(null);
      setCurrentCroppingFile(null);
      setShowCropModal(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const response = await settingsApi.uploadColorImage(file);

      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;

        setImagePath(response.filePath);
        setImagePreview(fullPath);
        message.success('Color image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload color image:', error);
      message.error('Failed to upload color image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
    return false;
  };

  const handleColorSelectorImageUpload = async (file) => {
    try {
      setUploadingColorSelectorImage(true);
      const response = await settingsApi.uploadColorImage(file);

      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;

        setColorSelectorImagePath(response.filePath);
        setColorSelectorImagePreview(fullPath);
        message.success('Color selector image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload color selector image:', error);
      message.error('Failed to upload color selector image. Please try again.');
    } finally {
      setUploadingColorSelectorImage(false);
    }
    return false;
  };

  const handleEditImageUpload = async (file) => {
    try {
      setUploadingEditImage(true);
      const response = await settingsApi.uploadColorImage(file);

      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;

        setEditImagePath(response.filePath);
        setEditImagePreview(fullPath);
        message.success('Color image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload color image:', error);
      message.error('Failed to upload color image. Please try again.');
    } finally {
      setUploadingEditImage(false);
    }
    return false;
  };

  const handleEditColorSelectorImageUpload = async (file) => {
    try {
      setUploadingEditColorSelectorImage(true);
      const response = await settingsApi.uploadColorImage(file);

      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;

        setEditColorSelectorImagePath(response.filePath);
        setEditColorSelectorImagePreview(fullPath);
        message.success('Color selector image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload color selector image:', error);
      message.error('Failed to upload color selector image. Please try again.');
    } finally {
      setUploadingEditColorSelectorImage(false);
    }
    return false;
  };

  const handleNewSizeImageUpload = async (file) => {
    try {
      setUploadingSizeImage(true);
      const response = await settingsApi.uploadColorImage(file);
      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;
        setNewSizeImagePath(response.filePath);
        setNewSizeImagePreview(fullPath);
        message.success('Size image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload size image:', error);
      message.error('Failed to upload size image. Please try again.');
    } finally {
      setUploadingSizeImage(false);
    }
    return false;
  };

  const handleEditSizeImageUpload = async (file) => {
    try {
      setUploadingSizeImage(true);
      const response = await settingsApi.uploadColorImage(file);
      if (response.success) {
        const fullPath = response.filePath.startsWith('http')
          ? response.filePath
          : `${import.meta.env.VITE_API_URL}${response.filePath}`;
        setEditSizeImagePath(response.filePath);
        setEditSizeImagePreview(fullPath);
        message.success('Size image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload size image:', error);
      message.error('Failed to upload size image. Please try again.');
    } finally {
      setUploadingSizeImage(false);
    }
    return false;
  };

  const handleStartEditColor = (color) => {
    setEditingColorId(color.id);
    colorEditForm.setFieldsValue({
      name: color.name,
      colorCode: color.colorCode || '#000000'
    });
    setEditImagePath(color.productImageInColor || null);
    setEditImagePreview(color.productImageInColor ? getImageUrl(color.productImageInColor) : null);
    setEditColorSelectorImagePath(color.colorSelectorImage || null);
    setEditColorSelectorImagePreview(color.colorSelectorImage ? getImageUrl(color.colorSelectorImage) : null);
  };

  const handleCancelEditColor = () => {
    setEditingColorId(null);
    colorEditForm.resetFields();
    setEditImagePath(null);
    setEditImagePreview(null);
    setEditColorSelectorImagePath(null);
    setEditColorSelectorImagePreview(null);
  };

  const handleSaveEditColor = async () => {
    try {
      const values = await colorEditForm.validateFields();
      const colorToUpdate = colors.find(c => c.id === editingColorId);

      if (!colorToUpdate) {
        message.error('Color not found');
        return;
      }

      let hexColor = colorToUpdate.colorCode || '#000000';
      if (values.colorCode) {
        hexColor = typeof values.colorCode === 'string' ? values.colorCode : values.colorCode.toHexString();
      }

      const updatedData = {
        name: values.name,
        colorCode: hexColor,
        productImageInColor: editImagePath || colorToUpdate.productImageInColor || '',
        colorSelectorImage: editColorSelectorImagePath || colorToUpdate.colorSelectorImage || ''
      };

      onUpdateColor(editingColorId, updatedData);
      handleCancelEditColor();
      message.success('Color updated successfully');
    } catch (error) {
      console.error('Color update validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  const handleAddSize = (values) => {
    if (!activeColorId) {
      message.error('Please select a color first');
      return;
    }

    const sizeData = {
      name: values.name,
      stock: values.stock || 0,
      dimensions: values.dimensions || {},
      weight: values.weight || 0,
      sizeImage: newSizeImagePath || '',
      rawMaterials: [] // Initialize empty raw materials array
    };

    onAddColorSize(activeColorId, sizeData);
    sizeForm.resetFields();
    setNewSizeImagePreview(null);
    setNewSizeImagePath(null);
  };

  const handleUpdateSize = async (colorId, sizeId) => {
    try {
      const values = await sizeEditForm.validateFields();

      const updatedSizeData = {
        name: values.name,
        stock: Number(values.stock) || 0,
        weight: Number(values.weight) || 0,
        sizeImage: editSizeImagePath || undefined,
        dimensions: {
          length: Number(values.length) || 0,
          width: Number(values.width) || 0,
          height: Number(values.height) || 0,
          unit: values.unit || 'cm'
        }
      };

      if (onUpdateColorSize) {
        onUpdateColorSize(colorId, sizeId, updatedSizeData);
      }

      setEditingSizeId(null);
      setEditSizeImagePreview(null);
      setEditSizeImagePath(null);
      message.success('Size updated successfully');
    } catch (error) {
      console.error('Size update validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  const handleEditSize = (size) => {
    setEditingSizeId(size.id);
    sizeEditForm.setFieldsValue({
      name: size.name,
      stock: size.stock,
      weight: size.weight,
      length: size.dimensions?.length || 0,
      width: size.dimensions?.width || 0,
      height: size.dimensions?.height || 0,
      unit: size.dimensions?.unit || 'cm'
    });
    // Load existing size image
    setEditSizeImagePath(size.sizeImage || null);
    setEditSizeImagePreview(size.sizeImage ? getImageUrl(size.sizeImage) : null);
  };

  const handleCancelEdit = () => {
    setEditingSizeId(null);
    sizeEditForm.resetFields();
    setEditSizeImagePreview(null);
    setEditSizeImagePath(null);
  };

  const handleAddMaterialToSize = (colorId, sizeId, values) => {
    const material = rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    // Check if material already exists for this size
    const color = colors.find(c => c.id === colorId);
    const size = color?.sizes?.find(s => s.id === sizeId);
    const existingMaterial = size?.rawMaterials?.find(m => m.rawMaterialId === values.materialId);

    if (existingMaterial) {
      message.error('Material already added to this size');
      return;
    }

    const materialData = {
      rawMaterialId: values.materialId,
      quantity: values.quantity,
      name: material.name,
      unit: material.unit,
      unitPrice: material.unitPrice
    };

    // Update the specific size's raw materials
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: color.sizes.map(size => {
            if (size.id === sizeId) {
              return {
                ...size,
                rawMaterials: [...(size.rawMaterials || []), materialData]
              };
            }
            return size;
          })
        };
      }
      return color;
    });

    // Call the parent update function
    onUpdateColor(colorId, { sizes: updatedColors.find(c => c.id === colorId).sizes });
    materialForm.resetFields();
    message.success('Material added to size');
  };

  const handleRemoveMaterialFromSize = (colorId, sizeId, materialId) => {
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        return {
          ...color,
          sizes: color.sizes.map(size => {
            if (size.id === sizeId) {
              return {
                ...size,
                rawMaterials: (size.rawMaterials || []).filter(m => m.rawMaterialId !== materialId)
              };
            }
            return size;
          })
        };
      }
      return color;
    });

    // Call the parent update function
    onUpdateColor(colorId, { sizes: updatedColors.find(c => c.id === colorId).sizes });
    message.success('Material removed from size');
  };

  const getActiveColor = () => {
    return colors.find(c => c.id === activeColorId);
  };

  const _getActiveSize = () => {
    const color = getActiveColor();
    return color?.sizes?.find(s => s.id === activeSizeId);
  };

  const _filteredRawMaterials = rawMaterials.filter(material =>
    material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const renderColorsList = () => (
    <div className="space-y-4">
      <Card size="small" title="Add New Color">
        <Form
          form={colorForm}
          layout="vertical"
          onFinish={handleAddColor}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Color Name"
                rules={[{ required: true, message: 'Please enter color name' }]}
              >
                <Input placeholder="e.g., Natural Oak, Walnut, White" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="colorCode"
                label="Hex Color"
                initialValue="#000000"
                rules={[{ required: true, message: 'Select a color' }]}
              >
                <ColorPicker
                  showText
                  presets={[
                    {
                      label: 'Common',
                      colors: ['#000000', '#FFFFFF', '#8B4513', '#A0522D', '#D2B48C', '#808080', '#C0C0C0', '#F5F5DC']
                    }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add Color
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Color Selector Image (Optional)" help="Small thumbnail for color picker">
                <Upload
                  accept="image/*"
                  beforeUpload={(file) => handleBeforeCrop(file, 'newSelector', 1)}
                  showUploadList={false}
                  maxCount={1}
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    {colorSelectorImagePreview ? (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{
                              backgroundImage: `url(${colorSelectorImagePreview})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                        </div>
                        <div>
                          <Button icon={<Icon name="upload" />} size="small">
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Icon name="cloud_upload" className="text-2xl text-gray-400" />
                        <div>
                          <Text>Upload thumbnail</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            Shown in color selector
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Product Image in Color (Optional)" help="Full-size product image">
                <Upload
                  accept="image/*"
                  beforeUpload={(file) => handleBeforeCrop(file, 'newImage', 4 / 3)}
                  showUploadList={false}
                  maxCount={1}
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <img
                            src={imagePreview}
                            alt="Product"
                            className="h-16 w-16 object-cover rounded"
                          />
                        </div>
                        <div>
                          <Button icon={<Icon name="upload" />} size="small">
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Icon name="cloud_upload" className="text-2xl text-gray-400" />
                        <div>
                          <Text>Upload image</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            Shown in product gallery
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <div>
        <Title level={5} className="mb-4">Product Colors ({colors.length})</Title>

        {colors.length === 0 ? (
          <Empty
            description="No colors added yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colors.map(color => (
              editingColorId === color.id ? (
                <Card key={color.id} size="small" className="border-blue-500 bg-blue-50">
                  <Form form={colorEditForm} layout="vertical">
                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item
                          name="name"
                          label="Color Name"
                          rules={[{ required: true, message: 'Please enter color name' }]}
                        >
                          <Input placeholder="e.g., Natural Oak, Walnut, White" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="colorCode"
                          label="Hex Color"
                          rules={[{ required: true, message: 'Select a color' }]}
                        >
                          <ColorPicker
                            showText
                            presets={[
                              {
                                label: 'Common',
                                colors: commonColors
                              }
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Color Selector Image" help="Small thumbnail for color picker">
                          <Upload
                            accept="image/*"
                            beforeUpload={(file) => handleBeforeCrop(file, 'editSelector', 1)}
                            showUploadList={false}
                            maxCount={1}
                          >
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                              {editColorSelectorImagePreview ? (
                                <div className="space-y-2">
                                  <div className="flex justify-center">
                                    <div
                                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                                      style={{
                                        backgroundImage: `url(${editColorSelectorImagePreview})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                      }}
                                    />
                                  </div>
                                  <Button icon={<Icon name="upload" />} size="small">Change</Button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Icon name="cloud_upload" className="text-xl text-gray-400" />
                                  <div><Text className="text-xs">Upload thumbnail</Text></div>
                                </div>
                              )}
                            </div>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Product Image" help="Full-size product image">
                          <Upload
                            accept="image/*"
                            beforeUpload={(file) => handleBeforeCrop(file, 'editImage', 4 / 3)}
                            showUploadList={false}
                            maxCount={1}
                          >
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                              {editImagePreview ? (
                                <div className="space-y-2">
                                  <div className="flex justify-center">
                                    <img src={editImagePreview} alt="Product" className="h-10 w-10 object-cover rounded" />
                                  </div>
                                  <Button icon={<Icon name="upload" />} size="small">Change</Button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Icon name="cloud_upload" className="text-xl text-gray-400" />
                                  <div><Text className="text-xs">Upload image</Text></div>
                                </div>
                              )}
                            </div>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className="flex justify-end space-x-2 mt-2">
                      <Button onClick={handleCancelEditColor}>Cancel</Button>
                      <Button type="primary" onClick={handleSaveEditColor} icon={<Icon name="save" />}>
                        Save Changes
                      </Button>
                    </div>
                  </Form>
                </Card>
              ) : (
                <Card
                  key={color.id}
                  size="small"
                  className={`cursor-pointer transition-all hover:shadow-md ${activeColorId === color.id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setActiveColorId(color.id)}
                  actions={[
                    <Tooltip title="Edit Color" key="edit">
                      <Button
                        type="text"
                        icon={<Icon name="edit" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditColor(color);
                        }}
                      >
                        Edit
                      </Button>
                    </Tooltip>,
                    <Tooltip title="Manage Sizes" key="manage">
                      <Button
                        type="text"
                        icon={<Icon name="straighten" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColorId(color.id);
                        }}
                      >
                        Manage
                      </Button>
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="Delete this color?"
                      description="This will also delete all sizes and raw materials for this color."
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        onRemoveColor(color.id);
                        if (activeColorId === color.id) {
                          setActiveColorId(null);
                          setActiveSizeId(null);
                          setEditingSizeId(null);
                        }
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Icon name="delete" />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex-shrink-0"
                        style={{
                          backgroundImage: color.colorSelectorImage ? `url(${getImageUrl(color.colorSelectorImage)})` : (color.productImageInColor ? `url(${getImageUrl(color.productImageInColor)})` : 'none'),
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: color.colorCode || '#f0f0f0'
                        }}
                      >
                        {!color.colorSelectorImage && !color.productImageInColor && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="palette" className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      {color.colorSelectorImage && (
                        <Tag color="green" className="text-xs">Thumbnail</Tag>
                      )}
                    </div>
                    <div className="flex-1">
                      <Text strong className="block">{color.name}</Text>
                      <div className="flex space-x-2 mt-1">
                        <Badge
                          count={color.sizes?.length || 0}
                          showZero
                          style={{ backgroundColor: '#722ed1' }}
                        />
                        <Text type="secondary" className="text-xs">sizes</Text>
                        <Badge
                          count={color.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0}
                          showZero
                          style={{ backgroundColor: '#fa8c16' }}
                        />
                        <Text type="secondary" className="text-xs">materials</Text>
                      </div>
                      <Text type="secondary" className="text-xs block mt-1">
                        Total Stock: {color.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0} units
                      </Text>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderColorDetails = () => {
    const activeColor = getActiveColor();

    if (!activeColor) {
      return (
        <div className="text-center py-12">
          <Icon name="palette" className="text-4xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">No Color Selected</Title>
          <Text type="secondary">Please select a color from the Colors tab to manage its sizes and materials.</Text>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Color Header */}
        <Card size="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full border-2 border-gray-300"
                style={{
                  backgroundImage: activeColor.productImageInColor ? `url(${getImageUrl(activeColor.productImageInColor)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: activeColor.colorCode || '#f0f0f0'
                }}
              >
                {!activeColor.productImageInColor && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="palette" className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Title level={4} className="mb-1">{activeColor.name}</Title>
                <Text type="secondary">
                  {activeColor.sizes?.length || 0} size{(activeColor.sizes?.length || 0) !== 1 ? 's' : ''} •
                  {activeColor.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0} material{(activeColor.sizes?.reduce((total, size) => total + (size.rawMaterials?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                </Text>
              </div>
            </div>
            <ActionButton
              onClick={() => { setEditingSizeId(null); setActiveColorId(null) }}
              icon="arrow_back"
            // setEditingSizeId(null);
            >
              Back to Colors
            </ActionButton>
          </div>
        </Card>

        {/* Add Size Form */}
        <Card size="small" title="Add New Size">
          <Form
            form={sizeForm}
            layout="vertical"
            onFinish={handleAddSize}
          >
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
                  name="stock"
                  label="Stock Quantity"
                  rules={[{ required: true, message: 'Please enter stock quantity' }]}
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
                <Form.Item label=" ">
                  <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                    Add Size
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Size Image (Optional)" help="Image shown when this size is selected on the product page">
                  <Upload
                    accept="image/*"
                    beforeUpload={(file) => handleBeforeCrop(file, 'newSizeImage', 4 / 3)}
                    showUploadList={false}
                    maxCount={1}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      {newSizeImagePreview ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={newSizeImagePreview}
                            alt="Size"
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <div>
                            <Button icon={<Icon name="upload" />} size="small">Change Image</Button>
                            <div
                              className="text-xs text-red-500 mt-1 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setNewSizeImagePreview(null); setNewSizeImagePath(null); }}
                            >
                              Remove
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Icon name="photo_camera" className="text-2xl text-gray-400" />
                          <div>
                            <Text>Upload size image</Text><br />
                            <Text type="secondary" className="text-xs">Shown when this size is selected</Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Sizes List with Raw Materials */}
        <div>
          <Title level={5} className="mb-4">
            Sizes for {activeColor.name} ({activeColor.sizes?.length || 0})
          </Title>

          {!activeColor.sizes || activeColor.sizes.length === 0 ? (
            <Empty
              description="No sizes added yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Collapse
              accordion
              className="bg-white"
              expandIcon={({ isActive }) => <Icon name={isActive ? 'expand_less' : 'expand_more'} />}
            >
              {activeColor.sizes.map(size => (
                <Panel
                  key={size.id}
                  header={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-4">
                        {/* Size Image Thumbnail */}
                        <div className="flex-shrink-0">
                          {size.sizeImage ? (
                            <Tooltip title="Size image">
                              <img
                                src={getImageUrl(size.sizeImage)}
                                alt={size.name}
                                className="w-10 h-10 rounded object-cover border border-gray-200 shadow-sm"
                              />
                            </Tooltip>
                          ) : (
                            <div className="w-10 h-10 rounded border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              <Icon name="photo_camera" className="text-gray-300 text-sm" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Text strong className="text-base">{size.name}</Text>
                          <div className="flex space-x-4 mt-1">
                            <Text type="secondary" className="text-sm">
                              Stock: {size.stock || 0} units
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          count={size.rawMaterials?.length || 0}
                          showZero
                          style={{ backgroundColor: '#fa8c16' }}
                        />
                        <Text type="secondary" className="text-xs">materials</Text>
                        {editingSizeId !== size.id && (
                          <Tooltip title="Edit Size">
                            <Button
                              type="text"
                              icon={<Icon name="edit" />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSize(size);
                              }}
                              className="text-blue-600"
                            />
                          </Tooltip>
                        )}
                        <Popconfirm
                          title="Delete this size?"
                          description="This will also delete all raw materials for this size."
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            onRemoveColorSize(activeColorId, size.id);
                            if (activeSizeId === size.id) {
                              setActiveSizeId(null);
                            }
                            if (editingSizeId === size.id) {
                              setEditingSizeId(null);
                            }
                          }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Icon name="delete" />}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  }
                  extra={null}
                >
                  <div className="space-y-4">
                    {/* Size Details */}
                    {editingSizeId === size.id ? (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Title level={5} className="mb-3">Edit Size Specifications</Title>
                        <Form
                          form={sizeEditForm}
                          layout="vertical"
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="name"
                                label="Size Name"
                                rules={[{ required: true, message: 'Please enter size name' }]}
                              >
                                <Input placeholder="e.g., Small, Medium, Large" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="stock"
                                label="Stock Quantity"
                                rules={[{ required: true, message: 'Please enter stock quantity' }]}
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
                              <Form.Item
                                name="weight"
                                label="Weight (kg)"
                              >
                                <InputNumber
                                  min={0}
                                  step={0.1}
                                  placeholder="0.0"
                                  className="w-full"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="Unit">
                                <Form.Item name="unit" noStyle initialValue="cm">
                                  <Select className="w-full">
                                    <Option value="cm">cm</Option>
                                    <Option value="inch">inch</Option>
                                    <Option value="mm">mm</Option>
                                    <Option value="ft">ft</Option>
                                  </Select>
                                </Form.Item>
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                name="length"
                                label="Length"
                              >
                                <InputNumber
                                  min={0}
                                  placeholder="0"
                                  className="w-full"
                                  step={0.1}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name="width"
                                label="Width"
                              >
                                <InputNumber
                                  min={0}
                                  placeholder="0"
                                  className="w-full"
                                  step={0.1}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name="height"
                                label="Height"
                              >
                                <InputNumber
                                  min={0}
                                  placeholder="0"
                                  className="w-full"
                                  step={0.1}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item label="Size Image (Optional)" help="Image shown when this size is selected">
                                <Upload
                                  accept="image/*"
                                  beforeUpload={(file) => handleBeforeCrop(file, 'editSizeImage', 4 / 3)}
                                  showUploadList={false}
                                  maxCount={1}
                                >
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    {editSizeImagePreview ? (
                                      <div className="flex items-center gap-4">
                                        <img
                                          src={editSizeImagePreview}
                                          alt="Size"
                                          className="h-14 w-14 object-cover rounded border"
                                        />
                                        <div>
                                          <Button icon={<Icon name="upload" />} size="small">Change Image</Button>
                                          <div
                                            className="text-xs text-red-500 mt-1 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); setEditSizeImagePreview(null); setEditSizeImagePath(null); }}
                                          >
                                            Remove
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <Icon name="photo_camera" className="text-xl text-gray-400" />
                                        <div><Text className="text-xs">Upload size image</Text></div>
                                      </div>
                                    )}
                                  </div>
                                </Upload>
                              </Form.Item>
                            </Col>
                          </Row>

                          <div className="flex justify-end space-x-2">
                            <Button onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              onClick={() => handleUpdateSize(activeColorId, size.id)}
                              icon={<Icon name="save" />}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </Form>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Title level={5} className="mb-3">Size Specifications</Title>
                        <Row gutter={16}>
                          <Col span={6}>
                            <Text type="secondary">Name:</Text>
                            <br />
                            <Text strong>{size.name}</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary">Stock:</Text>
                            <br />
                            <Text strong>{size.stock || 0} units</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary">Weight:</Text>
                            <br />
                            <Text strong>{size.weight || 0} kg</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary">Dimensions:</Text>
                            <br />
                            <Text strong>
                              {size.dimensions?.length || 0}×{size.dimensions?.width || 0}×{size.dimensions?.height || 0} {size.dimensions?.unit || 'cm'}
                            </Text>
                          </Col>
                        </Row>
                      </div>
                    )}

                    {/* Raw Materials for this Size */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Title level={5} className="mb-0">
                          Raw Materials for {size.name} ({size.rawMaterials?.length || 0})
                        </Title>
                      </div>

                      {/* Add Material Form */}
                      <Card size="small" className="mb-4">
                        <Form
                          layout="vertical"
                          onFinish={(values) => handleAddMaterialToSize(activeColorId, size.id, values)}
                        >
                          <Row gutter={16}>
                            <Col span={14}>
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
                                  {rawMaterials?.map(material => (
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
                            <Col span={6}>
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

                      {/* Materials List */}
                      {size.rawMaterials && size.rawMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {size.rawMaterials.map((material, index) => (
                            <div key={`${material.rawMaterialId}-${index}`} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Icon name="category" className="text-orange-600 text-sm" />
                                  </div>
                                  <div>
                                    <Text strong>{material.name || 'Unknown Material'}</Text>
                                    <br />
                                    <Text type="secondary" className="text-sm">
                                      {material.quantity} {material.unit || 'units'} •
                                      LKR {((material.unitPrice || 0) * material.quantity).toFixed(2)} total cost
                                    </Text>
                                  </div>
                                </div>
                                <Popconfirm
                                  title="Remove this material?"
                                  onConfirm={() => handleRemoveMaterialFromSize(activeColorId, size.id, material.rawMaterialId)}
                                >
                                  <Button type="text" danger icon={<Icon name="delete" />} size="small" />
                                </Popconfirm>
                              </div>
                            </div>
                          ))}

                          {/* Material Cost Summary */}
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center">
                              <Text strong>Total Material Cost for {size.name}:</Text>
                              <Text strong className="text-green-600 text-lg">
                                LKR {(size.rawMaterials.reduce((sum, material) =>
                                  sum + ((material.unitPrice || 0) * material.quantity), 0
                                )).toFixed(2)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Icon name="category" className="text-3xl text-gray-300 mb-2" />
                          <Text type="secondary">No raw materials added for {size.name}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            Add raw materials required to manufacture this size
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        activeKey={activeColorId ? 'details' : 'colors'}
        onChange={(key) => {
          if (key === 'colors') {
            setActiveColorId(null);
            setActiveSizeId(null);
            setEditingSizeId(null);
          }
        }}
        items={[
          {
            key: 'colors',
            label: (
              <span className="flex items-center space-x-2">
                <Icon name="palette" />
                <span>Colors ({colors.length})</span>
              </span>
            ),
            children: renderColorsList()
          },
          {
            key: 'details',
            label: (
              <span className="flex items-center space-x-2">
                <Icon name="straighten" />
                <span>Sizes & Materials</span>
                {activeColorId && (
                  <Badge
                    count={getActiveColor()?.sizes?.length || 0}
                    size="small"
                    style={{ backgroundColor: '#722ed1' }}
                  />
                )}
              </span>
            ),
            children: renderColorDetails(),
            disabled: !activeColorId
          }
        ]}
      />

      {colors.length === 0 && (
        <Alert
          message="No Colors Added"
          description="Please add at least one color for this product. Each color can have multiple sizes, and each size can have its own raw materials."
          type="info"
          showIcon
        />
      )}

      <ImageCropModal
        open={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={croppingAspectRatio}
      />
    </div>
  );
}