import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  Input, 
  Typography, 
  Space, 
  Card, 
  Alert,
  List,
  Tag,
  message
} from 'antd';
import { useSelector } from 'react-redux';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';

const { Title, Text } = Typography;
const { Search } = Input;

export function BarcodeScannerModal({ 
  open, 
  onClose, 
  onProductFound 
}) {
  const products = useSelector(state => state.products.productsList);
  const [scanInput, setScanInput] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setScanInput('');
      setIsScanning(false);
      // Focus on input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleScan = (scannedValue) => {
    if (!scannedValue || !scannedValue.trim()) {
      return;
    }

    setIsScanning(true);
    
    // Search for product by barcode/SKU
    const foundProduct = products.find(product => 
      product.barcode && product.barcode.toLowerCase() === scannedValue.toLowerCase()
    );

    if (foundProduct) {
      // Add to recent scans
      const scanResult = {
        id: Date.now(),
        barcode: scannedValue,
        product: foundProduct,
        timestamp: new Date(),
        success: true
      };
      
      setRecentScans(prev => [scanResult, ...prev.slice(0, 4)]); // Keep last 5 scans
      
      // Check stock
      if (foundProduct.stock <= 0 && !foundProduct.allowPreorder) {
        message.warning(`${foundProduct.name} is out of stock`);
        setIsScanning(false);
        return;
      }

      message.success(`Product found: ${foundProduct.name}`);
      onProductFound(foundProduct);
      onClose();
    } else {
      // Add failed scan to recent scans
      const scanResult = {
        id: Date.now(),
        barcode: scannedValue,
        product: null,
        timestamp: new Date(),
        success: false
      };
      
      setRecentScans(prev => [scanResult, ...prev.slice(0, 4)]);
      message.error(`No product found with barcode: ${scannedValue}`);
    }

    setIsScanning(false);
    setScanInput('');
  };

  const handleManualSearch = (searchValue) => {
    if (!searchValue || !searchValue.trim()) {
      return;
    }

    // Search by name or barcode
    const foundProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchValue.toLowerCase()))
    );

    if (foundProducts.length === 1) {
      handleScan(foundProducts[0].barcode || foundProducts[0].name);
    } else if (foundProducts.length > 1) {
      message.info(`Found ${foundProducts.length} products. Please be more specific.`);
    } else {
      message.error('No products found matching your search');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="qr_code_scanner" className="text-blue-600" />
          <span>Barcode Scanner</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <ActionButton key="close" onClick={onClose}>
          Close
        </ActionButton>
      ]}
      destroyOnClose
    >
      <div className="space-y-6">
        <Alert
          message="Barcode Scanning"
          description="Scan a product barcode or enter it manually to quickly add items to your cart."
          type="info"
          showIcon
        />

        {/* Scanner Input */}
        <Card size="small" title="Scan or Enter Barcode">
          <div className="space-y-4">
            <Search
              ref={inputRef}
              placeholder="Scan barcode or enter product code..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onSearch={handleScan}
              onPressEnter={(e) => handleScan(e.target.value)}
              size="large"
              loading={isScanning}
              enterButton={
                <ActionButton.Primary 
                  icon="qr_code_scanner"
                  loading={isScanning}
                >
                  Scan
                </ActionButton.Primary>
              }
            />
            
            <div className="text-center">
              <Text type="secondary" className="text-sm">
                Or search by product name
              </Text>
              <br />
              <Search
                placeholder="Search by product name..."
                onSearch={handleManualSearch}
                className="mt-2"
                enterButton="Search"
              />
            </div>
          </div>
        </Card>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card size="small" title="Recent Scans">
            <List
              dataSource={recentScans}
              renderItem={scan => (
                <List.Item>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        scan.success ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Icon 
                          name={scan.success ? 'check_circle' : 'error'} 
                          className={scan.success ? 'text-green-600' : 'text-red-600'}
                          size="text-sm"
                        />
                      </div>
                      <div>
                        <Text strong className="block">
                          {scan.success ? scan.product.name : 'Product not found'}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          Barcode: {scan.barcode}
                        </Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text type="secondary" className="text-xs">
                        {scan.timestamp.toLocaleTimeString()}
                      </Text>
                      {scan.success && (
                        <br />
                        <Tag color="blue" className="text-xs">
                          {scan.product.stock} in stock
                        </Tag>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Title level={5} className="mb-2">
            <Icon name="info" className="mr-2 text-blue-600" />
            How to Use
          </Title>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="barcode_scanner" className="text-blue-600" size="text-sm" />
              <Text>Use a barcode scanner to scan product barcodes</Text>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="keyboard" className="text-blue-600" size="text-sm" />
              <Text>Manually type the barcode and press Enter</Text>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="search" className="text-blue-600" size="text-sm" />
              <Text>Search by product name if barcode is not available</Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}