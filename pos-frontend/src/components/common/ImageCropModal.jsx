import { useState, useRef, useCallback } from 'react';
import { Modal, Button, Slider, Space, message, Segmented, Input } from 'antd';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Icon } from './Icon';

/**
 * Image Crop Modal Component
 * Provides image cropping functionality with 4:3 aspect ratio
 */
export function ImageCropModal({ open, onClose, imageSrc, onCropComplete, aspectRatio = 4 / 3 }) {
  const [crop, setCrop] = useState({
    unit: '%',
    x: 5,
    y: 5,
    width: 90,
    height: 90 / aspectRatio,
    aspect: aspectRatio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [bgType, setBgType] = useState('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [blurAmount, setBlurAmount] = useState(20);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const aspect = aspectRatio;

    // Calculate crop dimensions to fit the image
    let cropWidth = 90;
    let cropHeight = (cropWidth / aspect) * (width / height);

    if (cropHeight > 90) {
      cropHeight = 90;
      cropWidth = cropHeight * aspect * (height / width);
    }

    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
      aspect: aspect
    });

    // Also set initial completedCrop in pixels so users can save immediately
    setCompletedCrop({
      unit: 'px',
      width: (cropWidth / 100) * width,
      height: (cropHeight / 100) * height,
      x: ((100 - cropWidth) / 2 / 100) * width,
      y: ((100 - cropHeight) / 2 / 100) * height,
      aspect: aspect
    });

    imgRef.current = e.currentTarget;
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      message.warning('Please select a crop area');
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');

    // Set canvas size to the target dimensions (dynamic height based on aspect ratio)
    const targetWidth = 800;
    const targetHeight = targetWidth / aspectRatio;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      message.error('Failed to get canvas context');
      return null;
    }

    // Background handling
    if (bgType === 'transparent') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'blur') {
      ctx.save();
      // Draw full image blurred to cover background
      ctx.filter = `blur(${blurAmount}px)`;
      const imgAspect = image.naturalWidth / image.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      // Optional: subtle dark overlay for better contrast
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Calculate source dimensions relative to the scaled and centered image in the layout box
    const viewScale = scale;
    const layoutWidth = image.width;
    const layoutHeight = image.height;

    // The CSS transform: scale() centers the scaled image by default. 
    // We need to find where the actual image pixels are within the layout box.
    const scaledWidth = layoutWidth * viewScale;
    const scaledHeight = layoutHeight * viewScale;
    const offsetX = (layoutWidth - scaledWidth) / 2;
    const offsetY = (layoutHeight - scaledHeight) / 2;

    const scaleX = image.naturalWidth / scaledWidth;
    const scaleY = image.naturalHeight / scaledHeight;

    const pixelCrop = {
      x: (completedCrop.x - offsetX) * scaleX,
      y: (completedCrop.y - offsetY) * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY
    };

    // Apply transformations
    ctx.save();

    // Translate to center
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation
    ctx.rotate((rotate * Math.PI) / 180);

    // Apply scale (this is the zoom factor)
    ctx.scale(scale, scale);

    // Draw image
    // Note: We use the full targetWidth/Height as the destination, 
    // but the source rect (pixelCrop) is mapped to the original image pixels.
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );

    ctx.restore();

    const format = bgType === 'transparent' ? 'image/png' : 'image/jpeg';
    const quality = format === 'image/jpeg' ? 0.9 : undefined;
    const extension = format === 'image/png' ? 'png' : 'jpg';

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = `cropped-image.${extension}`;
          resolve(blob);
        },
        format,
        quality
      );
    });
  }, [completedCrop, scale, rotate, aspectRatio, bgType, bgColor, blurAmount]);

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setBgType('transparent');
    setBgColor('#ffffff');
    setBlurAmount(20);
    setCrop({
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90 / aspectRatio,
      aspect: aspectRatio
    });
    message.info('Reset to default');
  };


  const handleCrop = async () => {
    try {
      setLoading(true);
      const croppedBlob = await getCroppedImg();

      if (croppedBlob) {
        // Convert blob to data URL for preview
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          onCropComplete({
            blob: croppedBlob,
            dataUrl: base64data
          });
          message.success('Image cropped successfully');
          onClose();
          handleReset();
        };
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      message.error('Failed to crop image');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      maskClosable={false}
      title="Crop Image"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="reset" onClick={handleReset}>
          <Icon name="refresh" className="mr-1" />
          Reset
        </Button>,
        <Button key="cancel" onClick={() => { onClose(); handleReset(); }}>
          Cancel
        </Button>,
        <Button
          key="crop"
          type="primary"
          onClick={handleCrop}
          loading={loading}
        >
          <Icon name="check" className="mr-1" />
          Crop & Apply
        </Button>
      ]}
    >
      <div className="space-y-4">
        {/* Crop Area */}
        <div className="flex justify-center bg-gray-200 rounded-lg p-4 overflow-hidden">
          <div
            className="relative shadow-lg overflow-hidden"
            style={{
              width: '100%',
              maxWidth: '500px',
              aspectRatio: aspectRatio,
              backgroundColor: bgType === 'color' ? bgColor : 'transparent',
              backgroundImage: bgType === 'transparent' ?
                'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' :
                'none',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Blur Background Layer */}
            {bgType === 'blur' && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${blurAmount}px)`,
                  transform: 'scale(1.1)', // Prevent edge bleeding
                  opacity: 0.7
                }}
              />
            )}

            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="z-10"
              style={{
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  transition: 'transform 0.2s ease-out',
                  maxHeight: '400px',
                  maxWidth: '100%',
                  display: 'block'
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          {/* Background Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <Icon name="settings" className="mr-1" />
              Background Settings
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Type</span>
                <Segmented
                  value={bgType}
                  onChange={setBgType}
                  options={[
                    { label: 'Transparent', value: 'transparent' },
                    { label: 'Color', value: 'color' },
                    { label: 'Blur', value: 'blur' }
                  ]}
                />
              </div>

              {bgType === 'color' && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Color</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      size="small"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-24"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}
            </div>

            {bgType === 'blur' && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Blur Intensity: {blurAmount}px</span>
                <Slider
                  min={0}
                  max={100}
                  value={blurAmount}
                  onChange={setBlurAmount}
                  marks={{
                    0: 'None',
                    20: 'Soft',
                    50: 'Medium',
                    100: 'Strong'
                  }}
                />
              </div>
            )}
          </div>
          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Icon name="zoom_in" className="mr-1" />
              Zoom: {scale.toFixed(2)}x
            </label>
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={scale}
              onChange={setScale}
              marks={{
                0.5: '0.5x',
                1: '1x',
                2: '2x',
                3: '3x'
              }}
            />
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Icon name="rotate_right" className="mr-1" />
              Rotation: {rotate}°
            </label>
            <div className="flex items-center space-x-2">
              <Slider
                min={0}
                max={360}
                step={90}
                value={rotate}
                onChange={setRotate}
                className="flex-1"
                marks={{
                  0: '0°',
                  90: '90°',
                  180: '180°',
                  270: '270°',
                  360: '360°'
                }}
              />
            </div>
          </div>

          {/* Quick Rotation Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Rotate
            </label>
            <Space>
              <Button
                size="small"
                onClick={() => setRotate((prev) => (prev - 90 + 360) % 360)}
              >
                <Icon name="rotate_left" />
                90° Left
              </Button>
              <Button
                size="small"
                onClick={() => setRotate((prev) => (prev + 90) % 360)}
              >
                <Icon name="rotate_right" />
                90° Right
              </Button>
            </Space>
          </div>

          <hr className="border-gray-200" />


        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <Icon name="info" className="mr-1" />
            Aspect Ratio: {aspectRatio === 4 / 3 ? '4:3' : aspectRatio === 16 / 9 ? '16:9' : aspectRatio === 1 ? '1:1' : aspectRatio.toFixed(2)}
            {' '}• Target Size: 800×600px • Format: JPEG
          </p>
        </div>
      </div>
    </Modal>
  );
}
