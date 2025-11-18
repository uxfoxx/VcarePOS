import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
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
        destroyOnClose
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
                    maxWidth: '180mm',
                    border: '2px solid #000',
                    padding: '10mm',
                    boxSizing: 'border-box'
                  }}>
                    {/* Logo Section */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '8mm',
                      borderBottom: '1px solid #000',
                      paddingBottom: '6mm'
                    }}>
                      <img
                        src={logoPreview}
                        alt="Logo"
                        style={{
                          height: '15mm',
                          maxWidth: '70mm',
                          objectFit: 'contain',
                          marginBottom: '3mm'
                        }}
                        crossOrigin="anonymous"
                      />
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginTop: '3mm'
                      }}>
                        {businessName}
                      </div>
                    </div>

                    {/* Product Name */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '6mm',
                      padding: '4mm 0'
                    }}>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        minHeight: '12mm',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {label.product.name}
                      </div>
                    </div>

                    {/* SKU Section */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '5mm',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        marginBottom: '2mm'
                      }}>
                        SKU
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        letterSpacing: '1px'
                      }}>
                        {label.product.barcode || 'N/A'}
                      </div>
                    </div>

                    {/* Barcode */}
                    {barcodeDataUrl && (
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '6mm',
                        padding: '3mm 0'
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

                    {/* Item Counter */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '5mm',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      Item {label.itemNumber} of {label.totalQuantity}
                    </div>

                    {/* Footer Section */}
                    <div style={{
                      borderTop: '1px solid #000',
                      paddingTop: '5mm',
                      marginTop: '6mm',
                      textAlign: 'center',
                      fontSize: '13px',
                      lineHeight: '1.4'
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        marginBottom: '2mm'
                      }}>
                        {phoneNumber}
                      </div>
                      <div style={{ color: '#333' }}>
                        {businessAddress}
                      </div>
                    </div>
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
