import React from 'react';
import { Modal, Typography, Row, Col, Space } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export function InventoryLabelModal({ open, onClose, transaction }) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('inventory-labels-content');
    if (!element) {
      console.error('Inventory labels content element not found');
      return;
    }

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better barcode quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate PDF dimensions for label sheets (A4 with multiple labels)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const filename = `inventory-labels-${transaction.id}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    }
  };

  // Generate a simple barcode pattern (in real app, use proper barcode library)
  const generateBarcodePattern = (code) => {
    const patterns = {
      '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
      '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
      '8': '0110111', '9': '0001011', 'A': '0100001', 'B': '0110001',
      'C': '0001001', 'D': '0101001', 'E': '0011001', 'F': '0111001',
      'G': '0001101', 'H': '0010001', 'I': '0001001', 'J': '0010001',
      'K': '0100001', 'L': '0110001', 'M': '0001101', 'N': '0010011',
      'O': '0001011', 'P': '0010001', 'Q': '0100001', 'R': '0001001',
      'S': '0010001', 'T': '0001001', 'U': '0100001', 'V': '0110001',
      'W': '0001101', 'X': '0010011', 'Y': '0001011', 'Z': '0010001',
      '-': '0010001'
    };
    
    let pattern = '101'; // Start pattern
    for (let char of code.toUpperCase()) {
      pattern += patterns[char] || '0001001';
    }
    pattern += '101'; // End pattern
    
    return pattern;
  };

  const renderBarcode = (code) => {
    const pattern = generateBarcodePattern(code);
    const bars = pattern.split('').map((bit, index) => (
      <div
        key={index}
        style={{
          width: '1px',
          height: '30px',
          backgroundColor: bit === '1' ? '#000' : '#fff',
          display: 'inline-block'
        }}
      />
    ));
    
    return (
      <div className="flex justify-center items-center bg-white p-2 border">
        <div style={{ fontSize: 0, lineHeight: 0 }}>
          {bars}
        </div>
      </div>
    );
  };

  const renderInventoryLabels = () => (
    <div id="inventory-labels-content" className="p-4 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="grid grid-cols-2 gap-4">
        {transaction.items.map((item, itemIndex) => 
          Array.from({ length: item.quantity }, (_, qtyIndex) => (
            <div key={`${itemIndex}-${qtyIndex}`} className="border-2 border-gray-800 p-4 bg-white" style={{ width: '95mm', height: '65mm', pageBreakInside: 'avoid' }}>
              {/* Company Header */}
              <div className="border-b border-gray-400 pb-2 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong className="text-lg">VCare Furniture Ltd.</Text>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VC</span>
                  </div>
                </div>
              </div>

              {/* Label Information Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <Text strong>Lot:</Text>
                  <div className="border-b border-gray-400 pb-1">
                    <Text className="font-mono text-sm">L{String(itemIndex + 1).padStart(5, '0')}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Printed:</Text>
                  <div className="border-b border-gray-400 pb-1">
                    <Text className="text-xs">{new Date().toLocaleDateString('en-GB')}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Part No.:</Text>
                  <div className="border-b border-gray-400 pb-1">
                    <Text className="font-mono text-sm">{item.product.barcode || 'A00004'}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Quantity:</Text>
                  <div className="border-b border-gray-400 pb-1">
                    <Text className="text-sm">{item.quantity} pcs</Text>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-3">
                <Text strong className="text-xs">Part description:</Text>
                <div className="text-center mt-1">
                  <Text className="text-sm font-semibold">{item.product.name}</Text>
                </div>
              </div>

              {/* Barcode */}
              <div className="mt-2">
                {renderBarcode(item.product.barcode || 'A00004')}
                <div className="text-center mt-1">
                  <Text className="font-mono text-xs">{item.product.barcode || 'A00004'}</Text>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Order: {transaction.id}</span>
                  <span>Item {qtyIndex + 1}/{item.quantity}</span>
                </div>
                {item.product.material && (
                  <div className="text-center mt-1">
                    <Text className="text-xs">Material: {item.product.material}</Text>
                  </div>
                )}
                {item.product.color && (
                  <div className="text-center">
                    <Text className="text-xs">Color: {item.product.color}</Text>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <Icon name="label" className="text-blue-600" />
          <span>Inventory Labels</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <ActionButton key="close" onClick={onClose}>
          Close
        </ActionButton>,
        <ActionButton key="download" icon="download" onClick={handleDownload}>
          Download PDF
        </ActionButton>,
        <ActionButton.Primary key="print" icon="print" onClick={handlePrint}>
          Print Labels
        </ActionButton.Primary>
      ]}
      className="inventory-labels-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <Text className="text-sm">
            <Icon name="info" className="mr-2 text-blue-600" />
            <strong>Inventory Labels:</strong> These labels are designed to be printed on standard label sheets. 
            Each product in the order will have {transaction?.items?.reduce((sum, item) => sum + item.quantity, 0)} labels generated 
            (one for each quantity ordered). Cut along the borders and stick to your inventory items.
          </Text>
        </div>
        {renderInventoryLabels()}
      </div>
    </Modal>
  );
}