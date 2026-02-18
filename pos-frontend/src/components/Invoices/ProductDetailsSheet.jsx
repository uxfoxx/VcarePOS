import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
import { Phone, MapPin } from 'lucide-react';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

const { Text } = Typography;

export function ProductDetailsSheet({ open, onClose, product }) {
  const [loading, setLoading] = useState(false);
  const [brandingData, setBrandingData] = useState({});

  useEffect(() => {
    try {
      const branding = localStorage.getItem('vcare_branding');
      if (branding) {
        setBrandingData(JSON.parse(branding));
      }
    } catch (error) {
      console.error('Error loading branding data:', error);
    }
  }, []);

  if (!product) return null;

  const businessName = brandingData.businessName || 'VCare Furniture';
  const businessAddress = brandingData.address || '123 Main Street, City, State 12345';
  const phoneNumber = brandingData.phoneNumber || '(555) 123-4567';
  const logoPreview = brandingData.logoPreview || '/VCARELogo 1.png';

  const generateBarcode = (code) => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code || 'NOCODE', {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 5
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating barcode:', error);
      return null;
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('product-sheet-content');
    if (!element) return;

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '6in';
    printContainer.style.height = '4in';
    printContainer.style.backgroundColor = '#f5f5f5';

    const clonedContent = element.cloneNode(true);
    printContainer.appendChild(clonedContent);
    document.body.appendChild(printContainer);

    clonedContent.style.display = 'none';
    clonedContent.offsetHeight;
    clonedContent.style.display = 'block';

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      window.print();
    } catch (error) {
      console.error('Error during print:', error);
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  const generatePDF = async (action = 'view') => {
    setLoading(true);
    const element = document.getElementById('product-sheet-content');
    if (!element) {
      setLoading(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#f5f5f5',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgWidth = 152.4; // 6 inches in mm
      const imgHeight = 101.6; // 4 inches in mm

      const pdf = new jsPDF('l', 'mm', [152.4, 101.6]); // landscape, 6x4 inches
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      if (action === 'download') {
        const filename = `product-label-${product.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        pdf.save(filename);
      } else {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => generatePDF('view');
  const handleDownload = () => generatePDF('download');

  const barcodeDataUrl = product.barcode ? generateBarcode(product.barcode) : null;

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
              width: 6in;
              height: 4in;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              background-color: #f5f5f5;
            }
            .ant-modal,
            .ant-modal-content,
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          }
          @page {
            size: 6in 4in landscape;
            margin: 0;
          }
        `}
      </style>
      <Modal
        title={
          <Space>
            <Icon name="description" className="text-blue-600" />
            <span>Product Details Sheet</span>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={800}
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
            Print
          </ActionButton.Primary>
        ]}
        className="invoice-modal"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div
            id="product-sheet-content"
            style={{
              fontFamily: 'Arial, sans-serif',
              width: '6in',
              height: '4in',
              backgroundColor: '#f5f5f5',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: '3px solid #000'
            }}
          >
            {/* Logo Section */}
            <div style={{
              textAlign: 'center',
              padding: '0.3in 0.4in 0.25in 0.4in',
              borderBottom: '1px solid #ddd'
            }}>
              <img
                src={logoPreview}
                alt="Logo"
                style={{
                  height: '0.5in',
                  maxWidth: '3in',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Product Name */}
            <div style={{
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0.5in'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                color: '#000',
                letterSpacing: '-0.5px'
              }}>
                {product.name}
              </div>
            </div>

            {/* SKU Section */}
            <div style={{
              textAlign: 'center',
              padding: '0 0.4in',
              marginBottom: '0.15in'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '0.08in',
                color: '#666',
                letterSpacing: '1px'
              }}>
                SKU
              </div>
              <div style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '16px',
                letterSpacing: '2px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {product.barcode || 'N/A'}
              </div>
            </div>

            {/* Barcode */}
            {barcodeDataUrl && (
              <div style={{
                textAlign: 'center',
                marginBottom: '0.2in',
                padding: '0 0.4in'
              }}>
                <img
                  src={barcodeDataUrl}
                  alt="Barcode"
                  style={{
                    width: '3.5in',
                    height: 'auto',
                    maxHeight: '0.6in',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              </div>
            )}

            

            {/* Footer Section */}
            <div style={{
              padding: '0 0.4in 0.25in 0.4in'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1in',
                fontSize: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Phone size={16} color="#000" strokeWidth={2} />
                  <span style={{ color: '#000', fontWeight: '500' }}>
                    {phoneNumber}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MapPin size={16} color="#000" strokeWidth={2} />
                  <span style={{ color: '#000', fontWeight: '500' }}>
                    {businessAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}