import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Typography, Space, Alert, Switch, InputNumber } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { Icon } from '../common/Icon';
import { message } from 'antd';

const { Text, Title } = Typography;

export function BarcodeScanner({ onProductFound, className = '' }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.productsList);
  const [scannerInput, setScannerInput] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const [autoAddToCart, setAutoAddToCart] = useState(true);
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const inputRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // Keep input focused for scanner input
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  // Auto-focus input when component mounts
  useEffect(() => {
    const focusInput = () => {
      if (isListening && inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Focus immediately
    focusInput();

    // Re-focus when clicking anywhere on the document
    document.addEventListener('click', focusInput);
    
    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, [isListening]);

  const handleBarcodeScan = (scannedValue) => {
    if (!scannedValue || !scannedValue.trim()) {
      return;
    }

    const trimmedValue = scannedValue.trim();

    // Add to scan history
    setScanHistory(prev => [
      {
        barcode: trimmedValue,
        timestamp: new Date(),
        found: false
      },
      ...prev.slice(0, 9) // Keep last 10 scans
    ]);

    // Search for product by barcode/SKU
    const foundProduct = products.find(product => 
      product.barcode && product.barcode.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (foundProduct) {
      // Update scan history to mark as found
      setScanHistory(prev => prev.map((scan, index) => 
        index === 0 ? { ...scan, found: true, productName: foundProduct.name } : scan
      ));

      // Check if product is out of stock
      if (foundProduct.stock <= 0) {
        message.warning(`${foundProduct.name} is out of stock`);
        return;
      }

      // Notify parent component
      if (onProductFound) {
        onProductFound(foundProduct);
      }

      if (autoAddToCart) {
        // If product has color/size variations, we can't auto-add
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          message.info(`${foundProduct.name} found! Please select color and size manually.`);
        } else {
          // Simple product without variations - add directly to cart
          dispatch(addToCart({ 
            product: foundProduct, 
            quantity: defaultQuantity,
            selectedColorId: null,
            selectedSize: null
          }));
          message.success(`${foundProduct.name} (${defaultQuantity}x) added to cart!`);
        }
      } else {
        message.success(`Product found: ${foundProduct.name}`);
      }
    } else {
      message.error(`No product found with barcode: ${trimmedValue}`);
    }

    // Clear the scanner input
    setScannerInput('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setScannerInput(value);

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Set a timeout to process the scan if no more input comes
    // This helps with scanners that don't send Enter key
    scanTimeoutRef.current = setTimeout(() => {
      if (value && value.trim()) {
        handleBarcodeScan(value.trim());
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    // Process immediately on Enter key (most scanners send this)
    if (e.key === 'Enter') {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      handleBarcodeScan(scannerInput);
    }
  };

  const toggleScanner = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Re-focus when enabling
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <Card 
      className={`${className}`}
      size="small"
      title={
        <div className="flex items-center justify-between">
          <Space>
            <Icon name="qr_code_scanner" className="text-blue-600" />
            <Title level={5} className="m-0">Barcode Scanner</Title>
          </Space>
          <Switch
            checked={isListening}
            onChange={toggleScanner}
            checkedChildren="ON"
            unCheckedChildren="OFF"
            size="small"
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Scanner Status */}
        <Alert
          message={isListening ? "Scanner Active" : "Scanner Disabled"}
          description={
            isListening 
              ? "Ready to scan barcodes. The input field will automatically capture scanner data."
              : "Enable the scanner to start capturing barcode input."
          }
          type={isListening ? "success" : "warning"}
          showIcon
          className="mb-4"
        />

        {/* Scanner Input */}
        <div>
          <Text strong className="block mb-2">Scan Barcode:</Text>
          <Input
            ref={inputRef}
            value={scannerInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Scan barcode here..." : "Scanner disabled"}
            disabled={!isListening}
            prefix={<Icon name="qr_code_scanner" className="text-gray-400" />}
            size="large"
            autoFocus
          />
        </div>

        {/* Scanner Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Text>Auto-add to cart:</Text>
            <Switch
              checked={autoAddToCart}
              onChange={setAutoAddToCart}
              size="small"
            />
          </div>
          
          {autoAddToCart && (
            <div className="flex items-center justify-between">
              <Text>Default quantity:</Text>
              <InputNumber
                min={1}
                max={10}
                value={defaultQuantity}
                onChange={setDefaultQuantity}
                size="small"
                className="w-20"
              />
            </div>
          )}
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div>
            <Text strong className="block mb-2">Recent Scans:</Text>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {scanHistory.map((scan, index) => (
                <div 
                  key={index} 
                  className={`text-xs p-2 rounded ${
                    scan.found ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Text code className="text-xs">{scan.barcode}</Text>
                    <Icon 
                      name={scan.found ? "check_circle" : "error"} 
                      className={`text-xs ${scan.found ? 'text-green-600' : 'text-red-600'}`} 
                    />
                  </div>
                  {scan.productName && (
                    <Text className="text-xs text-green-700">{scan.productName}</Text>
                  )}
                  <Text type="secondary" className="text-xs">
                    {scan.timestamp.toLocaleTimeString()}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}