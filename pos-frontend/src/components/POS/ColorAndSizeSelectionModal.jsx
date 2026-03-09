import { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Empty,
  Space,
  Badge,
  Carousel
} from 'antd';
import { Icon } from '../common/Icon';
import { MediaViewerModal } from '../common/MediaViewerModal';
import { useRef } from 'react';

const { Text, Title } = Typography;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function ColorAndSizeSelectionModal({
  open,
  onClose,
  product,
  onColorAndSizeSelected
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [viewerState, setViewerState] = useState({ open: false, index: 0, media: [] });
  const carouselRef = useRef(null);

  // Reset selections when modal opens or product changes
  useEffect(() => {
    if (open && product) {
      setSelectedColor(null);
      setSelectedSize(null);
      setIsDescriptionExpanded(false);
    }
  }, [open, product]);

  if (!product) return null;

  const colors = product.colors || [];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size when color changes
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) return;

    onColorAndSizeSelected(selectedColor, selectedSize);
  };

  const getAvailableSizes = () => {
    if (!selectedColor) return [];
    return selectedColor.sizes || [];
  };

  const getTotalStock = (color) => {
    if (!color.sizes) return 0;
    return color.sizes.reduce((total, size) => total + (size.stock || 0), 0);
  };

  // Collect all media including color variant images
  let allMedia = [];
  if (product.media && Array.isArray(product.media)) {
    allMedia = [...product.media];
  }

  // Append unique color images
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach(color => {
      if (color.productImageInColor && !allMedia.includes(color.productImageInColor)) {
        allMedia.push(color.productImageInColor);
      }
    });
    product.colors.forEach((color) => {
      console.log("sizerecord.colors", color)

      if (Array.isArray(color.sizes)) {
        color.sizes.forEach((size) => {
          if (size.sizeImage) {
            allMedia.push(size.sizeImage);
          }
        });
      }
    });
  }

  return (
    <Modal
      title={
        <Space>
          <Icon name="palette" className="text-blue-600" />
          <span>Select Color and Size for {product.name}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          disabled={!selectedColor || !selectedSize}
          onClick={handleAddToCart}
          icon={<Icon name="add_shopping_cart" />}
        >
          {!selectedColor
            ? 'Select a Color'
            : !selectedSize
              ? 'Select a Size'
              : `Add to Cart - LKR ${(product.price || 0).toFixed(2)}`
          }
        </Button>
      ]}
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {allMedia.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="w-[360px] overflow-hidden rounded-lg bg-white border border-gray-100">
                    <div className="w-full h-full relative">
                      <Carousel autoplay={false} dots={false} arrows={true} infinite={false} ref={carouselRef}>
                        {allMedia.map((mediaItem, index) => {
                          const isVideo = mediaItem.startsWith('data:video/') ||
                            mediaItem.toLowerCase().includes('.mp4') ||
                            mediaItem.toLowerCase().includes('.webm') ||
                            mediaItem.toLowerCase().includes('.mov');

                          return (
                            <div key={index}>
                              <div className="flex justify-center items-center h-[360px] relative group overflow-hidden rounded-lg">
                                {isVideo ? (
                                  <div
                                    className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black"
                                    onClick={() => setViewerState({ open: true, index, media: allMedia })}
                                  >
                                    <video
                                      src={`${import.meta.env.VITE_API_URL}${mediaItem}`}
                                      className="object-cover h-[360px] w-full opacity-80"
                                      crossOrigin="anonymous"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <Icon name="play_circle" className="text-white text-6xl drop-shadow-md opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_API_URL}${mediaItem}`}
                                    alt={`${product.name} ${index + 1}`}
                                    className="object-cover h-[360px] w-full block cursor-pointer"
                                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                    crossOrigin="anonymous"
                                    onClick={() => setViewerState({ open: true, index, media: allMedia })}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </Carousel>
                    </div>
                  </div>

                  {/* Thumbnails Row */}
                  {allMedia.length > 1 && (
                    <div className="flex gap-2 w-[360px] overflow-x-auto pb-2 scrollbar-hide shrink-0">
                      {allMedia.map((mediaItem, index) => {
                        const isVideo = mediaItem.startsWith('data:video/') ||
                          mediaItem.toLowerCase().includes('.mp4') ||
                          mediaItem.toLowerCase().includes('.webm') ||
                          mediaItem.toLowerCase().includes('.mov');

                        return (
                          <div
                            key={`thumb-${index}`}
                            onClick={() => carouselRef.current?.goTo(index)}
                            className="w-16 h-16 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors relative bg-gray-100"
                          >
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="play_circle" className="text-gray-500 text-2xl" />
                              </div>
                            ) : (
                              <img
                                src={`${import.meta.env.VITE_API_URL}${mediaItem}`}
                                className="w-full h-full object-cover"
                                alt={`Thumbnail ${index + 1}`}
                                crossOrigin="anonymous"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[360px]">
                  <img
                    src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300'}
                    alt={product.name}
                    className="object-cover h-[360px] w-full rounded-lg cursor-pointer"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    onClick={() => setViewerState({
                      open: true,
                      index: 0,
                      media: [product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300']
                    })}
                  />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Title level={4} className="mb-1">{product.name}</Title>
              <div>
                <div
                  className={`text-gray-500 text-sm html-description transition-all duration-300 relative ${!isDescriptionExpanded ? 'max-h-20 overflow-hidden before:absolute before:bottom-0 before:left-0 before:w-full before:h-8 before:bg-gradient-to-t before:from-white before:to-transparent' : ''}`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                {product.description && product.description.replace(/<[^>]*>/g, '').length > 100 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-1 text-xs font-semibold text-[#0E72BD] hover:text-[#0b5c99] focus:outline-none flex items-center gap-1 transition-colors"
                  >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-2">
                <Tag color="blue">{product.category}</Tag>
                <Text strong className="text-xl text-blue-600 ml-4">
                  LKR {(product.price || 0).toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <Title level={5} className="mb-4">Step 1: Select Color</Title>
          {colors.length === 0 ? (
            <Empty description="No colors available for this product" />
          ) : (
            <Row gutter={[16, 16]}>
              {colors.map(color => (
                <Col key={color.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className={`cursor-pointer transition-all ${selectedColor?.id === color.id ? 'border-blue-500 shadow-md bg-blue-50' : ''}`}
                    onClick={() => handleColorSelect(color)}
                    // bodyStyle={{ padding: '16px' }}
                    styles={{
                      body: { padding: '16px' }
                    }}
                  >
                    <div className="text-center space-y-3">
                      {/* Color Image Circle */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div
                            className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden"
                            style={{
                              backgroundImage: color.image ? `url(${getImageUrl(color.image)})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: color.colorCode || '#f0f0f0'
                            }}
                          >
                            {!color.image && (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="palette" className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          {selectedColor?.id === color.id && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon name="check" className="text-white text-sm" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Color Name */}
                      <div>
                        <Text strong className="block">{color.name}</Text>
                        <Badge
                          count={getTotalStock(color)}
                          showZero
                          style={{ backgroundColor: getTotalStock(color) > 0 ? '#52c41a' : '#ff4d4f' }}
                        />
                        <Text type="secondary" className="text-xs block mt-1">
                          {color.sizes?.length || 0} size{(color.sizes?.length || 0) !== 1 ? 's' : ''} available
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Size Selection */}
        {selectedColor && (
          <div>
            <Title level={5} className="mb-4">
              Step 2: Select Size for {selectedColor.name}
            </Title>
            {getAvailableSizes().length === 0 ? (
              <Empty description="No sizes available for this color" />
            ) : (
              <Row gutter={[16, 16]}>
                {getAvailableSizes().map(size => (
                  <Col key={size.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      className={`cursor-pointer transition-all ${selectedSize?.id === size.id ? 'border-blue-500 shadow-md bg-blue-50' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                      // bodyStyle={{ padding: '16px' }}
                      styles={{
                        body: { padding: '16px' }
                      }}
                    >
                      <div className="text-center space-y-2">
                        <div className="relative">
                          <Text strong className="text-lg">{size.name}</Text>
                          {selectedSize?.id === size.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon name="check" className="text-white text-sm" />
                            </div>
                          )}
                        </div>

                        <div>
                          <Tag color={size.stock > 0 ? 'green' : 'red'} className="text-sm">
                            {size.stock} in stock
                          </Tag>
                        </div>

                        {size.dimensions && (
                          <Text type="secondary" className="text-xs block">
                            {size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit}
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {(selectedColor || selectedSize) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="mb-3">Selection Summary</Title>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>Product:</Text>
                <Text strong>{product.name}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text>Price:</Text>
                <Text strong className="text-blue-600">LKR {(product.price || 0).toFixed(2)}</Text>
              </div>
              {selectedColor && (
                <div className="flex items-center justify-between">
                  <Text>Color:</Text>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundImage: selectedColor.image ? `url(${getImageUrl(selectedColor.image)})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: selectedColor.colorCode || '#f0f0f0'
                      }}
                    />
                    <Text strong>{selectedColor.name}</Text>
                  </div>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center justify-between">
                  <Text>Size:</Text>
                  <Text strong>{selectedSize.name}</Text>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center justify-between">
                  <Text>Stock Available:</Text>
                  <Tag color={selectedSize.stock > 0 ? 'green' : 'red'}>
                    {selectedSize.stock} units
                  </Tag>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <MediaViewerModal
        open={viewerState.open}
        onClose={() => setViewerState({ ...viewerState, open: false })}
        media={viewerState.media}
        initialIndex={viewerState.index}
      />
    </Modal>
  );
}