import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
import { Phone, MapPin } from 'lucide-react';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

const { Text } = Typography;

export function InventoryLabelModal({ open, onClose, transaction }) {
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

  if (!transaction) return null;

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
    const element = document.getElementById('inventory-labels-content');
    if (!element) return;

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '210mm';
    printContainer.style.backgroundColor = '#ffffff';

    const clonedContent = element.cloneNode(true);
    printContainer.appendChild(clonedContent);
    document.body.appendChild(printContainer);

    clonedContent.style.display = 'none';
    clonedContent.offsetHeight;
    clonedContent.style.display = 'block';

    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      window.print();
    } catch (error) {
      console.error('Error during print:', error);
    } finally {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    }
  };

  const generatePDF = async (action = 'view') => {
    setLoading(true);
    const element = document.getElementById('inventory-labels-content');
    if (!element) {
      setLoading(false);
      return;
    }

    try {
      const pages = element.querySelectorAll('.label-page');
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          width: pages[i].scrollWidth,
          height: pages[i].scrollHeight
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      }

      if (action === 'download') {
        const filename = `inventory-labels-${transaction.id}.pdf`;
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

  const allLabels = [];
  transaction.items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      allLabels.push({
        product: item.product,
        itemNumber: i + 1,
        totalQuantity: item.quantity
      });
    }
  });

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
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            .label-page {
              page-break-after: always;
              break-after: page;
            }
            .label-page:last-child {
              page-break-after: auto;
              break-after: auto;
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
        destroyOnHidden
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Inventory Labels:</strong> One label per page, optimized for A4 printing.
              Total of {allLabels.length} labels will be generated.
            </Text>
          </div>
          <div id="inventory-labels-content">
            {allLabels.map((label, index) => {
              const barcodeDataUrl = label.product.barcode ? generateBarcode(label.product.barcode) : null;

              return (
                <div
                  key={index}
                  className="label-page"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    width: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#ffffff',
                    padding: '10mm',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: index < allLabels.length - 1 ? '10mm' : '0'
                  }}
                >
                  <div style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '0',
                    boxSizing: 'border-box'
                  }}>
                    {/* Top Border */}
                    <div style={{
                      borderTop: '3px solid #000',
                      marginBottom: '10mm'
                    }} />

                    {/* Logo Section */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '10mm',
                      borderBottom: '1px solid #000',
                      paddingBottom: '8mm'
                    }}>
                      <img
                        src={logoPreview}
                        alt="Logo"
                        style={{
                          height: '50px',
                          maxWidth: '200px',
                          objectFit: 'contain'
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Product Name */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '15mm',
                      padding: '8mm 0'
                    }}>
                      <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        color: '#000'
                      }}>
                        {label.product.name}
                      </div>
                    </div>

                    {/* SKU Section */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '8mm',
                      fontSize: '16px'
                    }}>
                      <div style={{
                        fontWeight: 'normal',
                        marginBottom: '3mm',
                        color: '#666'
                      }}>
                        SKU
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '18px',
                        letterSpacing: '2px',
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {label.product.barcode || 'N/A'}
                      </div>
                    </div>

                    {/* Barcode */}
                    {barcodeDataUrl && (
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '12mm',
                        padding: '5mm 0'
                      }}>
                        <img
                          src={barcodeDataUrl}
                          alt="Barcode"
                          style={{
                            maxWidth: '80%',
                            height: 'auto'
                          }}
                        />
                      </div>
                    )}

                    {/* Decorative Curved Line */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '8mm',
                      padding: '0 20mm'
                    }}>
                      <svg
                        width="100%"
                        height="60"
                        viewBox="0 0 600 60"
                        preserveAspectRatio="xMidYMid meet"
                        style={{ display: 'block' }}
                      >
                        <circle cx="20" cy="10" r="6" fill="#0E72BD" />
                        <path
                          d="M 20 10 Q 150 50, 300 50 T 580 10"
                          stroke="#0E72BD"
                          strokeWidth="3"
                          fill="none"
                        />
                        <circle cx="580" cy="10" r="6" fill="#0E72BD" />
                      </svg>
                    </div>

                    {/* Item Counter */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '8mm',
                      fontSize: '14px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      Item {label.itemNumber} of {label.totalQuantity}
                    </div>

                    {/* Footer Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15mm',
                      fontSize: '15px',
                      marginTop: '10mm'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Phone size={20} color="#000" strokeWidth={2} />
                        <span style={{ fontWeight: 'normal', color: '#000' }}>
                          {phoneNumber}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <MapPin size={20} color="#000" strokeWidth={2} />
                        <span style={{ fontWeight: 'normal', color: '#000' }}>
                          {businessAddress}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Border */}
                    <div style={{
                      borderBottom: '3px solid #000',
                      marginTop: '10mm'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
