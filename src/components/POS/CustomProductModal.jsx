import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Typography, 
  Space, 
  Divider, 
  List, 
  Tag,
  Button,
  message,
  Steps,
  Card,
  Row,
  Col
} from 'antd';
import { usePOS } from '../../contexts/POSContext';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import { EnhancedStepper } from '../common/EnhancedStepper';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

export function CustomProductModal({ open, onClose, onAddToCart }) {
  const { state } = usePOS();
  const [form] = Form.useForm();
  const [materialsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [editablePrice, setEditablePrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedMaterials([]);
      setTotalPrice(0);
      setEditablePrice(0);
      setCustomName('');
      setCustomDescription('');
      setCurrentStep(0);
      setSearchTerm('');
    }
  }, [open, form]);

  // Calculate total price whenever selected materials change
  useEffect(() => {
    const calculatedPrice = selectedMaterials.reduce((sum, material) => {
      return sum + (material.quantity * material.unitPrice * 1.5); // 50% markup
    }, 0);
    setTotalPrice(calculatedPrice);
    setEditablePrice(calculatedPrice);
  }, [selectedMaterials]);

  // Filter materials based on search term
  const filteredMaterials = state.rawMaterials.filter(material => 
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMaterial = (values) => {
    const material = state.rawMaterials.find(m => m.id === values.materialId);
    if (!material) {
      message.error('Material not found');
      return;
    }

    const existingMaterial = selectedMaterials.find(m => m.id === values.materialId);
    if (existingMaterial) {
      // Update quantity if material already exists
      setSelectedMaterials(selectedMaterials.map(m => 
        m.id === values.materialId 
          ? { ...m, quantity: m.quantity + values.quantity } 
          : m
      ));
    } else {
      // Add new material
      setSelectedMaterials([...selectedMaterials, {
        id: material.id,
        name: material.name,
        unit: material.unit,
        quantity: values.quantity,
        unitPrice: material.unitPrice,
        totalPrice: values.quantity * material.unitPrice
      }]);
    }
    
    materialsForm.resetFields(['materialId', 'quantity']);
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate product info
      if (!customName.trim()) {
        message.error('Please enter a name for the custom product');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (selectedMaterials.length === 0) {
      message.error('Please add at least one material');
      return;
    }

    if (!customName.trim()) {
      message.error('Please enter a name for the custom product');
      return;
    }

    try {
      setLoading(true);
      
      // Create custom product
      const customProduct = {
        id: `CUSTOM-${Date.now()}`,
        name: customName,
        description: customDescription || 'Custom product',
        price: editablePrice,
        category: 'Custom',
        stock: 999, // Unlimited stock for custom products
        barcode: `CUSTOM-${Date.now()}`,
        rawMaterials: selectedMaterials.map(m => ({
          rawMaterialId: m.id,
          quantity: m.quantity
        })),
        isCustom: true
      };

      // Add to cart
      onAddToCart(customProduct);
      
      message.success('Custom product added to cart');
      onClose();
    } catch (error) {
      message.error('Failed to create custom product');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Product Info',
      description: 'Basic details',
      icon: 'info',
      content: (
        <div className="space-y-4">
          <Title level={5}>Custom Product Information</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text strong>Name:</Text>
              <Input 
                placeholder="Enter custom product name" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1"
                size="large"
              />
            </div>
            <div>
              <Text strong>Price:</Text>
              <InputNumber
                className="w-full mt-1"
                value={editablePrice}
                onChange={(value) => setEditablePrice(value)}
                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                step={100}
                size="large"
              />
              <Text type="secondary" className="text-xs block mt-1">
                Price is calculated based on materials (50% markup) but can be adjusted
              </Text>
            </div>
          </div>
          <div>
            <Text strong>Description:</Text>
            <TextArea
              placeholder="Enter description (optional)"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Add Materials',
      description: 'Select materials',
      icon: 'category',
      content: (
        <div className="space-y-4">
          <Title level={5}>Add Raw Materials</Title>
          
          <Search
            placeholder="Search materials..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {filteredMaterials.map(material => (
              <Card 
                key={material.id} 
                size="small" 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  materialsForm.setFieldsValue({
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
          
          <Form
            form={materialsForm}
            layout="horizontal"
            onFinish={handleAddMaterial}
          >
            <div className="flex gap-2">
              <Form.Item
                name="materialId"
                rules={[{ required: true, message: 'Please select a material' }]}
                className="flex-1"
              >
                <Select 
                  placeholder="Select material"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {state.rawMaterials.map(material => (
                    <Option key={material.id} value={material.id}>
                      {material.name} (LKR {material.unitPrice}/{material.unit}) - Stock: {material.stockQuantity}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
                className="w-24"
              >
                <InputNumber
                  min={0.1}
                  step={0.1}
                  placeholder="Qty"
                  className="w-full"
                />
              </Form.Item>
              <Form.Item className="w-20">
                <Button type="primary" htmlType="submit" icon={<Icon name="add" />} block>
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>

          {/* Selected Materials List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Selected Materials</Text>
              <Text strong>Total: LKR {totalPrice.toFixed(2)}</Text>
            </div>
            
            {selectedMaterials.length === 0 ? (
              <div className="text-center py-4">
                <Icon name="category" className="text-gray-300 text-2xl mb-2" />
                <Text type="secondary">No materials added yet</Text>
              </div>
            ) : (
              <List
                dataSource={selectedMaterials}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    className="flex justify-between items-center"
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<Icon name="delete" />} 
                        onClick={() => handleRemoveMaterial(item.id)}
                      />
                    ]}
                  >
                    <div>
                      <Text>{item.name}</Text>
                      <div>
                        <Text type="secondary" className="text-sm">
                          {item.quantity} {item.unit} × LKR {item.unitPrice.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                    <Text strong>LKR {(item.quantity * item.unitPrice).toFixed(2)}</Text>
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <Icon name="build" className="text-blue-600" />
          <span>Create Custom Product</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6">
        <EnhancedStepper
          current={currentStep}
          steps={steps}
        />
        
        <div className="min-h-[400px] mt-6">
          {steps[currentStep].content}
        </div>

        <Divider />

        {/* Footer */}
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
            <ActionButton onClick={onClose}>
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
                disabled={selectedMaterials.length === 0 || !customName.trim()}
                icon="add_shopping_cart"
              >
                Add to Cart
              </ActionButton.Primary>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}