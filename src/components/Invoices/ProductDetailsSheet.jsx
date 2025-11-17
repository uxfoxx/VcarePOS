import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
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
    printContainer.style.width = '210mm';
    printContainer.style.height = 'auto';
    printContainer.style.backgroundColor = '#ffffff';

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
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
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
              width: 210mm;
              height: auto;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            .ant-modal,
            .ant-modal-content,
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          }
          @page {
            size: A4;
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
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: '#ffffff',
              padding: '15mm',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '180mm',
              border: '3px solid #000',
              padding: '20mm',
              boxSizing: 'border-box'
            }}>
              {/* Logo Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: '15mm',
                borderBottom: '2px solid #000',
                paddingBottom: '10mm'
              }}>
                <img
                  src={logoPreview}
                  alt="Logo"
                  style={{
                    height: '25mm',
                    maxWidth: '80mm',
                    objectFit: 'contain',
                    marginBottom: '5mm'
                  }}
                  crossOrigin="anonymous"
                />
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginTop: '5mm'
                }}>
                  {businessName}
                </div>
              </div>

              {/* Product Name */}
              <div style={{
                textAlign: 'center',
                marginBottom: '10mm',
                padding: '8mm 0'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  lineHeight: '1.3',
                  minHeight: '20mm',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {product.name}
                </div>
              </div>

              {/* SKU Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: '8mm',
                fontSize: '16px'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '3mm'
                }}>
                  SKU
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  letterSpacing: '1px'
                }}>
                  {product.barcode || 'N/A'}
                </div>
              </div>

              {/* Barcode */}
              {barcodeDataUrl && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '10mm',
                  padding: '5mm 0'
                }}>
                  <img
                    src={barcodeDataUrl}
                    alt="Barcode"
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
              )}

              {/* Footer Section */}
              <div style={{
                borderTop: '2px solid #000',
                paddingTop: '8mm',
                marginTop: '10mm',
                textAlign: 'center',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '4mm'
                }}>
                  {phoneNumber}
                </div>
                <div style={{ color: '#333' }}>
                  {businessAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
