import { useState } from 'react';
import { Modal, Typography, Space } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';
import { QRCode } from 'qrcode.react';

const { Text } = Typography;

export function InventoryLabelModal({ open, onClose, transaction }) {
  const [loading, setLoading] = useState(false);

  if (!transaction) return null;

  // Extract branding data from localStorage with error handling
  const getBrandingData = () => {
    try {
      const brandingData = localStorage.getItem('vcare_branding');
      return brandingData ? JSON.parse(brandingData) : {};
    } catch (error) {
      console.warn('Failed to parse branding data from localStorage:', error);
      return {};
    }
  };
  
  // Pre-calculate branding values at component level for consistent access
  const brandingData = getBrandingData();
  const businessName = brandingData.businessName || 'VCare Furniture';
  const primaryColor = brandingData.primaryColor || '#2563eb';
  const businessInitials = businessName.substring(0, 2).toUpperCase();
  const businessNameShort = businessName.substring(0, 15);

  const handlePrint = async () => {
    const element = document.getElementById('inventory-labels-content');
    if (!element) {
      console.warn('Inventory labels content element not found');
      return;
    }

    let printContainer = null;
    try {
      // Create a temporary container in the document body
      printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.style.position = 'absolute';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.width = '210mm';
      printContainer.style.height = 'auto';
      printContainer.style.padding = '5mm';
      printContainer.style.backgroundColor = '#ffffff';

      // Clone the content and append to the temporary container
      const clonedContent = element.cloneNode(true);
      printContainer.appendChild(clonedContent);
      document.body.appendChild(printContainer);

      // Force reflow to ensure content is rendered
      clonedContent.style.display = 'none';
      clonedContent.offsetHeight; // Trigger reflow
      clonedContent.style.display = 'block';

      // Wait briefly to ensure rendering
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trigger print
      window.print();
    } catch (error) {
      console.warn('Error during print:', error);
    } finally {
      // Clean up: remove the temporary container
      if (printContainer && document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    }
  };

  // Consolidated PDF generation function to eliminate code duplication
  const generatePDF = async (element, action = 'view') => {
    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better barcode quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
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

      if (action === 'download') {
        // Download the PDF
        const filename = `inventory-labels-${transaction.id}.pdf`;
        pdf.save(filename);
      } else {
        // Open PDF in new tab
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.warn('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    }
  };

  const handleView = async () => {
    setLoading(true);
    const element = document.getElementById('inventory-labels-content');
    if (!element) {
      console.warn('Inventory labels content element not found');
      setLoading(false);
      return;
    }

    await generatePDF(element, 'view');
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    const element = document.getElementById('inventory-labels-content');
    if (!element) {
      console.warn('Inventory labels content element not found');
      setLoading(false);
      return;
    }

    await generatePDF(element, 'download');
    setLoading(false);
  };

  // Utility function to truncate text to fit within 2 lines
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    
    // Split into words and reconstruct to fit approximately 2 lines
    const words = text.split(' ');
    if (words.length <= 4) return text; // Short text, no truncation needed
    
    // For longer text, try to fit in about 2 lines (roughly 15 chars per line)
    if (text.length <= maxLength) return text;
    
    // Truncate and add ellipsis
    return text.substring(0, maxLength - 3) + '...';
  };

  // Generate professional barcode using JsBarcode
  const renderBarcode = (code) => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code || 'NOCODE', {
        format: "CODE128",
        width: 1,
        height: 20,
        displayValue: false,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 0
      });
      
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#ffffff',
          padding: '2px 0'
        }}>
          <img 
            src={canvas.toDataURL('image/png')} 
            alt={`Barcode ${code}`}
            style={{ 
              maxWidth: '100%', 
              height: '20px',
              display: 'block'
            }}
          />
        </div>
      );
    } catch (error) {
      console.warn('Error generating barcode:', error);
      // Fallback to text display
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#ffffff',
          padding: '2px 0',
          fontSize: '8px',
          fontFamily: 'monospace'
        }}>
          {code || 'NOCODE'}
        </div>
      );
    }
  };

  // Generate QR code for POS scanning
  const renderQRCode = (code) => {
    if (!code) return null;
    
    try {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#ffffff',
          padding: '1px'
        }}>
          <QRCode 
            value={code}
            size={16}
            level="L"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
      );
    } catch (error) {
      console.warn('Error generating QR code:', error);
      return null;
    }
  };
  const renderInventoryLabels = () => (
    <div id="inventory-labels-content" style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '5mm',
      backgroundColor: '#ffffff'
    }}>
      {/* Grid layout: 4 columns x 6 rows = 24 labels per A4 page */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2mm',
          width: '200mm', // A4 width minus margins
          minHeight: '287mm',// A4 height minus margins
        }}
      >
        {transaction.items.map((item, itemIndex) =>
          Array.from({ length: item.quantity }, (_, qtyIndex) => (
            <div
              key={`${itemIndex}-${qtyIndex}`}
              className="inventory-label"
              style={{
                width: '48mm',
                height: '45mm',
                padding: '2mm',
                pageBreakInside: 'avoid',
                fontSize: '8px',
                lineHeight: '1.2',
                border: '1px solid #374151',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
              }}
            >
              
              {/* Company Header with Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2px',
                paddingBottom: '2px',
                borderBottom: '1px solid #9ca3af'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '9px' }}>
                    {businessNameShort}
                  </span>
                </div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: primaryColor,
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '6px',
                    lineHeight: '1'
                  }}>
                    {businessInitials}
                  </span>
                </div>
              </div>
              
              {/* Product Name */}
              <div style={{
                marginBottom: '4px',
                textAlign: 'center',
                flex: '1'
              }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '9px',
                    lineHeight: '1.2',
                    height: '21.6px', // Fixed height for exactly 2 lines
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    wordWrap: 'break-word',
                    textAlign: 'center',
                  }}
                >
                  {truncateText(item.product.name, 30)}
                </div>
              </div>
              
              {/* SKU */}
              <div style={{
                marginBottom: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '6px', color: '#666', marginBottom: '1px' }}>SKU:</div>
                <div style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '8px' }}>
                  {item.product.barcode || 'N/A'}
                </div>
              </div>
              
              {/* QR Code and Barcode */}
              <div style={{ marginTop: 'auto' }}>
                {/* QR Code for POS scanning */}
                <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                  {renderQRCode(item.product.barcode)}
                </div>
                
                <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  {renderBarcode(item.product.barcode || 'NOBARCODE')}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '6px' }}>
                    {item.product.barcode || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-container,
            #print-container * {
              visibility: visible;
            }
            #print-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 210mm;
              height: auto;
              margin: 0;
              padding: 5mm;
              box-sizing: border-box;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #print-container .inventory-label {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            #print-container * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .ant-modal,
            .ant-modal-content,
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          `}
      </style>
      <Modal
        title={
          <Space>
            <Icon name="label" className="text-blue-600" />
            <span>Inventory Labels</span>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={1000}
        footer={[
          <ActionButton key="close" onClick={onClose}>
            Close
          </ActionButton>,
          <ActionButton 
          key="view" 
          icon="visibility" 
          onClick={handleView} 
          loading={loading}
          >
            View PDF
          </ActionButton>,
          <ActionButton 
          key="download" 
          icon="download" 
          onClick={handleDownload} 
          loading={loading}
          >
            Download PDF
          </ActionButton>,
          <ActionButton.Primary 
          key="print" 
          icon="print" 
          onClick={handlePrint}
          >
            Print Labels 
          </ActionButton.Primary>
        ]}
        className="inventory-labels-modal"
        destroyOnClose
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Inventory Labels:</strong> Optimized for A4 printing with 24 labels per page (4×6 grid). Each label includes both QR code and barcode for POS scanning.
              Each item will have {transaction?.items?.reduce((sum, item) => sum + item.quantity, 0)} labels generated 
              (one for each quantity ordered). Perfect size for sticking to inventory items.
            </Text>
          </div>
          {renderInventoryLabels()}
        </div>
      </Modal>
    </>
  );
}