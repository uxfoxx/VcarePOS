import React from 'react';
import { Modal, Typography, Space } from 'antd';
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

  const handleView = async () => {
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

      // Open PDF in new tab
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    }
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
          height: '40px',
          backgroundColor: bit === '1' ? '#000' : '#fff',
          display: 'inline-block'
        }}
      />
    ));
    
    return (
      <div className="flex justify-center items-center bg-white p-2">
        <div style={{ fontSize: 0, lineHeight: 0 }}>
          {bars}
        </div>
      </div>
    );
  };

  const renderInventoryLabels = () => (
    <div id="inventory-labels-content" className="p-4 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="grid grid-cols-2 gap-6">
        {transaction.items.map((item, itemIndex) => 
          Array.from({ length: item.quantity }, (_, qtyIndex) => (
            <div key={`${itemIndex}-${qtyIndex}`} className="border-2 border-gray-800 p-4 bg-white" style={{ width: '90mm', height: '60mm', pageBreakInside: 'avoid' }}>
              
              {/* Company Header with Logo */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-400">
                <div>
                  <Text strong className="text-lg">VCare Furniture</Text>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VC</span>
                </div>
              </div>

              {/* Product Name */}
              <div className="mb-4 text-center">
                <Text strong className="text-base leading-tight block">
                  {item.product.name}
                </Text>
              </div>

              {/* SKU */}
              <div className="mb-4 text-center">
                <Text className="text-sm text-gray-600 block mb-1">SKU:</Text>
                <Text strong className="font-mono text-lg">
                  {item.product.barcode || 'N/A'}
                </Text>
              </div>

              {/* Barcode */}
              <div className="mt-auto">
                {renderBarcode(item.product.barcode || 'NOBARCODE')}
                <div className="text-center mt-1">
                  <Text className="font-mono text-xs">
                    {item.product.barcode || 'N/A'}
                  </Text>
                </div>
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
        <ActionButton key="view" icon="visibility" onClick={handleView}>
          View PDF
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
            <strong>Inventory Labels:</strong> Simple labels with product name, SKU, and barcode. 
            Each item will have {transaction?.items?.reduce((sum, item) => sum + item.quantity, 0)} labels generated 
            (one for each quantity ordered). Perfect for sticking to inventory items.
          </Text>
        </div>
        {renderInventoryLabels()}
      </div>
    </Modal>
  );
}