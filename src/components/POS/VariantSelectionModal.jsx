import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Tag, 
  Button, 
  Tabs, 
  Empty, 
  Image,
  Space
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export function VariantSelectionModal({ 
  open, 
  onClose, 
  product, 
  onVariantSelected 
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  // Reset selections when modal opens or product changes
  useEffect(() => {
    if (open && product) {
      setSelectedVariant(null);
      setSelectedSize(null);
      // If product has variants, start at variants tab
      // If product has no variants but has sizes, start at sizes tab
      // Otherwise start at variants tab
      setActiveTab(product.hasVariants ? '1' : product.hasSizes ? '2' : '1');
      
      // If product has no variants but has sizes, set the product itself as the "selected variant"
      // This allows us to use the existing size selection UI
      if (!product.hasVariants && product.hasSizes) {
        setSelectedVariant(product);
      }
    }
  }, [open, product]);

  if (!product) return null;

  // Ensure variants is always an array
  const variants = product.variants || [];

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedSize(null);
    
    // If variant has sizes, switch to sizes tab
    if (variant.hasSizes) {
      setActiveTab('2');
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    // If variant/product has sizes, require size selection
    if (selectedVariant.hasSizes && !selectedSize) {
      return;
    }
    
    // If we're using the product itself as the "variant" (for products with sizes but no variants)
    // and it's the same as the original product, pass null as the variant to indicate no variant was selected
    const variantToPass = selectedVariant === product && !product.hasVariants ? null : selectedVariant;
    
    onVariantSelected(variantToPass, selectedSize?.name);
  };
// here is the model
  return (
    <Modal
      title={
        <Space>
          <Icon name="style" className="text-blue-600" />
          <span>
            {product.hasVariants 
              ? `Select Variant for ${product.name}` 
              : product.hasSizes 
                ? `Select Size for ${product.name}` 
                : `Options for ${product.name}`}
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          disabled={(product.hasVariants && !selectedVariant) || (selectedVariant && selectedVariant.hasSizes && !selectedSize)}
          onClick={handleAddToCart}
          icon={<Icon name="add_shopping_cart" />}
        >
          {!selectedVariant 
            ? (product.hasVariants ? 'Select a Variant' : 'Continue')
            : selectedVariant.hasSizes && !selectedSize 
              ? 'Select a Size' 
              : 'Add to Cart'
          }
        </Button>
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <Icon name="style" className="mr-2" />
              Variants
            </span>
          } 
          key="1"
          disabled={!product.hasVariants}
          // Hide this tab completely if product has no variants
          style={product.hasVariants ? {} : { display: 'none' }}
        >
          <div className="space-y-4">
            <Text>Select a variant of {product.name}:</Text>
            
            {variants.length === 0 ? (
              <Empty description="No variants available for this product" />
            ) : (
              <Row gutter={[16, 16]}>
                {variants.map(variant => (
                  <Col key={variant.id} xs={24} sm={12} md={8}>
                    <Card
                      hoverable
                      className={`h-full cursor-pointer transition-all ${selectedVariant?.id === variant.id ? 'border-blue-500 shadow-md' : ''}`}
                      onClick={() => handleVariantSelect(variant)}
                      cover={
                        <div className="h-40 overflow-hidden">
                          <Image
                            alt={variant.name}
                            src={variant.image || product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                            className="w-full h-full object-cover"
                            preview={false}
                            style={{ objectFit: 'cover' }}
                          />
                          <div className="absolute top-2 right-2">
                            <Tag color="blue">
                              LKR {(variant.price || 0).toFixed(2)}
                            </Tag>
                          </div>
                          {variant.hasSizes && (
                            <div className="absolute bottom-2 right-2">
                              <Tag color="purple" size="small">
                                {variant.sizes?.length || 0} Sizes
                              </Tag>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-center space-x-2">
                            <Text strong>{variant?.name || 'Variant'}</Text>
                            {variant.hasSizes && (
                              <Tag color="purple">
                                {variant?.sizes?.length || 0} Sizes
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <Text type="secondary">{variant?.description || 'No description available'}</Text>
                            <div className="mt-1">
                              <Tag color="blue">LKR {(variant?.price || 0).toFixed(2)}</Tag>
                              <Tag color={variant?.stock > 10 ? 'green' : variant?.stock > 0 ? 'orange' : 'red'}>
                                Stock: {variant?.stock || 0}
                              </Tag>
                              {variant?.color && (
                                <Tag color="default">{variant?.color}</Tag>
                              )}
                              {variant?.material && (
                                <Tag color="default">{variant?.material}</Tag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <Icon name="aspect_ratio" className="mr-2" />
              Sizes
            </span>
          } 
          key="2"
          disabled={!selectedVariant || !selectedVariant.hasSizes}
        >
          {selectedVariant && selectedVariant.hasSizes ? (
            <div className="space-y-4">
              {/* Only show variant info if it's different from the product (i.e., we have an actual variant) */}
              {selectedVariant !== product && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0">
                      <Image
                        alt={selectedVariant.name}
                        src={selectedVariant.image || product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        className="w-full h-full object-cover"
                        preview={false}
                      />
                    </div>
                    <div>
                      <Text strong className="text-lg">{selectedVariant.name}</Text>
                      <br />
                      <Text type="secondary">{selectedVariant.description}</Text>
                    </div>
                  </div>
                </div>
              )}
              
              <Text>Select a size for {selectedVariant === product ? product.name : selectedVariant.name}:</Text>
              
              {selectedVariant.sizes?.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {selectedVariant.sizes.map(size => (
                    <Col key={size.id} xs={24} sm={12} md={8}>
                      <Card
                        hoverable
                        className={`cursor-pointer transition-all ${selectedSize?.id === size.id ? 'border-blue-500 shadow-md' : ''}`}
                        onClick={() => handleSizeSelect(size)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Text strong className="text-lg">{size.name}</Text>
                            <div className="mt-2">
                              <Text type="secondary">Dimensions:</Text>
                              <br />
                              <Text>
                                {size.dimensions?.length ? 
                                  `${size.dimensions.length}×${size.dimensions.width}×${size.dimensions.height} ${size.dimensions.unit || 'cm'}` : 
                                  'N/A'
                                }
                              </Text>
                            </div>
                          </div>
                          <div className="text-right">
                            <Tag color="blue" className="text-lg px-2 py-1">
                              LKR {(size.price || 0).toFixed(2)}
                            </Tag>
                            <div className="mt-2">
                              <Tag color={size.stock > 10 ? 'green' : size.stock > 0 ? 'orange' : 'red'}>
                                Stock: {size.stock || 0}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No sizes available for this variant" />
              )}
            </div>
          ) : (
            <Empty description="Please select a variant with sizes first" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
}