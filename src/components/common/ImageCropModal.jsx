import { useState, useRef, useCallback } from 'react';
import { Modal, Button, Slider, Space, message } from 'antd';
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
    width: 90,
    aspect: aspectRatio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
    imgRef.current = e.currentTarget;
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      message.warning('Please select a crop area');
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the target dimensions (800x600 for 4:3)
    const targetWidth = 800;
    const targetHeight = 600;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      message.error('Failed to get canvas context');
      return null;
    }

    // Calculate source dimensions
    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY
    };

    // Apply transformations
    ctx.save();

    // Translate to center
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation
    ctx.rotate((rotate * Math.PI) / 180);

    // Apply scale
    ctx.scale(scale, scale);

    // Draw image
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

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = 'cropped-image.jpg';
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop, scale, rotate]);

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
        };
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      message.error('Failed to crop image');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setCrop({
      unit: '%',
      width: 90,
      aspect: aspectRatio
    });
    message.info('Reset to default');
  };

  return (
    <Modal
      title="Crop Image"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="reset" onClick={handleReset}>
          <Icon name="refresh" className="mr-1" />
          Reset
        </Button>,
        <Button key="cancel" onClick={onClose}>
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
        <div className="flex justify-center bg-gray-100 rounded-lg p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            style={{
              maxHeight: '400px',
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
                maxHeight: '400px',
                maxWidth: '100%'
              }}
            />
          </ReactCrop>
        </div>

        {/* Controls */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
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
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <Icon name="info" className="mr-1" />
            Aspect Ratio: {aspectRatio === 4/3 ? '4:3' : aspectRatio === 16/9 ? '16:9' : aspectRatio === 1 ? '1:1' : aspectRatio.toFixed(2)}
            {' '}• Target Size: 800×600px • Format: JPEG
          </p>
        </div>
      </div>
    </Modal>
  );
}
