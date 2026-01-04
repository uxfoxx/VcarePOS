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
              padding: '15mm 20mm',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ flex: 1 }}>
              {/* Top Border */}
              <div style={{
                borderTop: '2px solid #000',
                marginBottom: '20px'
              }} />

              {/* Logo Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #000'
              }}>
                <img
                  src={logoPreview}
                  alt="Logo"
                  style={{
                    height: '40px',
                    maxWidth: '180px',
                    objectFit: 'contain'
                  }}
                  crossOrigin="anonymous"
                />
              </div>

              {/* Product Name */}
              <div style={{
                textAlign: 'center',
                marginTop: '60px',
                marginBottom: '80px'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  color: '#000'
                }}>
                  {product.name}
                </div>
              </div>

              {/* SKU Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: '40px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'normal',
                  marginBottom: '10px',
                  color: '#666'
                }}>
                  SKU
                </div>
                <div style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '20px',
                  letterSpacing: '3px',
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
                  marginBottom: '50px'
                }}>
                  <img
                    src={barcodeDataUrl}
                    alt="Barcode"
                    style={{
                      width: '60%',
                      maxWidth: '300px',
                      height: 'auto'
                    }}
                  />
                </div>
              )}

              {/* Decorative Curved Line */}
              <div style={{
                textAlign: 'center',
                marginBottom: '60px',
                padding: '0 40px'
              }}>
                <svg
                  width="100%"
                  height="40"
                  viewBox="0 0 600 40"
                  preserveAspectRatio="none"
                  style={{ display: 'block' }}
                >
                  <circle cx="15" cy="8" r="8" fill="#4A90E2" />
                  <path
                    d="M 15 8 Q 300 35, 585 8"
                    stroke="#4A90E2"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle cx="585" cy="8" r="8" fill="#4A90E2" />
                </svg>
              </div>
            </div>

            {/* Footer Section */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={18} color="#000" strokeWidth={2} />
                  <span style={{ color: '#000' }}>
                    {phoneNumber}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MapPin size={18} color="#000" strokeWidth={2} />
                  <span style={{ color: '#000' }}>
                    {businessAddress}
                  </span>
                </div>
              </div>

              {/* Bottom Border */}
              <div style={{
                borderBottom: '2px solid #000'
              }} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
