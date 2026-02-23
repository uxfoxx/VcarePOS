import { useState, useEffect } from 'react';
import { Typography, message } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  InvoiceHeader,
  InvoiceDetails,
  InvoiceCustomerSection,
  InvoiceItemsTable,
  InvoicePaymentSummary,
  InvoiceAccountDetails,
  InvoiceNotes,
  InvoiceTermsAndConditions,
  InvoiceSignatureSection,
  InvoiceFooter
} from './SharedInvoiceComponents';
import apiClient from '../../api/apiClient';

const { Text } = Typography;

const ITEMS_PER_PAGE = 10;

const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Chunk array into smaller arrays
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export function InvoiceModal({ open, onClose, transaction, type = 'detailed' }) {
  const [loading, setLoading] = useState(false);
  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    if (open) {
      fetchInvoiceConfig();
    }
  }, [open]);

  const fetchInvoiceConfig = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/complete');
      console.log("resss", response)
      setInvoiceConfig(response);
    } catch (error) {
      console.error('Error fetching invoice configuration:', error);
      setInvoiceConfig({
        settings: {
          business_name: '',
          business_address: '',
          phone_number: ''
        },
        bankAccount: null,
        notesTemplate: null
      });
    }
  };

  if (!transaction || !open) return null;

  const handlePrint = async () => {
    const printContainer = document.getElementById('invoice-print-container');
    if (!printContainer) {
      console.error('Invoice print container not found');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    doc.write(`
      <html>
        <head>
          <title>${type === 'detailed' ? 'Invoice' : 'Item Labels'} - ${transaction.id}</title>
          <style>
            @media print {
              body, html {
                margin: 0 !important;
                padding: 0 !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              .invoice-page {
                 page-break-after: always;
                 margin: 0 !important;
                 padding: 0 !important;
                 width: 210mm;
                 box-shadow: none !important;
              }
              .invoice-page:last-child {
                 page-break-after: auto;
              }
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="margin: 0; padding: 0; background-color: white;">
          ${printContainer.innerHTML}
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 1000);
  };

  const generatePDF = async () => {
    const pages = document.querySelectorAll('.invoice-page');
    if (!pages || pages.length === 0) {
      console.error('No invoice pages found');
      return null;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Convert images to base64
        const logoElements = page.querySelectorAll('img');
        for (let img of logoElements) {
          try {
            const base64Image = await convertImageToBase64(img.src);
            img.src = base64Image;
          } catch (error) {
            console.warn('Failed to convert image to base64:', error);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0,
          width: page.offsetWidth,
          height: page.offsetHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 210;
        const imgHeight = 297;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleView = async () => {
    setLoading(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      message.error('Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const filename = `invoice-${transaction.id}.pdf`;
        pdf.save(filename);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      message.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailedInvoice = () => {
    const savedBranding = localStorage.getItem('vcare_branding') ? JSON.parse(localStorage.getItem('vcare_branding')) : null;

    const businessName = invoiceConfig?.settings?.business_name ||
      savedBranding?.businessName ||
      '';

    const logoPreview = invoiceConfig?.settings?.logo_url ||
      savedBranding?.logoPreview ||
      '/VCARELogo 1.png';

    // Split items into pages of 10
    const itemPages = chunkArray(transaction.items, ITEMS_PER_PAGE);
    const totalPages = itemPages.length;

    return (
      <div className="w-full">
        {itemPages.map((pageItems, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === totalPages - 1;

          return (
            <div
              key={pageIndex}
              className="invoice-page"
              style={{
                fontFamily: 'Arial, sans-serif',
                width: '210mm',
                height: '297mm',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                pageBreakAfter: isLastPage ? 'auto' : 'always',
                breakAfter: isLastPage ? 'auto' : 'page',
                margin: '0 auto',
                marginBottom: pageIndex < totalPages - 1 ? '10mm' : '0'
              }}
            >
              {/* Header Section - Fixed at top */}
              <div style={{
                padding: '8mm 10mm 5mm 10mm',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10
              }}>
                <InvoiceHeader
                  businessName={businessName}
                  logoPreview={logoPreview}
                />
              </div>

              {/* Content Section */}
              <div style={{
                position: 'absolute',
                top: '45mm',
                left: '10mm',
                right: '10mm',
                bottom: '30mm',
                overflow: 'hidden'
              }}>
                {/* Customer and Invoice Details - First Page Only */}
                {isFirstPage && (
                  <table style={{ width: '100%', marginBottom: '12px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '16px' }}>
                          <InvoiceCustomerSection
                            customerName={transaction.customerName}
                            customerAddress={transaction.customerAddress}
                            customerEmail={transaction.customerEmail}
                            customerPhone={transaction.customerPhone}
                          />
                        </td>
                        <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '16px' }}>
                          <InvoiceDetails
                            invoiceNumber={transaction.id}
                            dateIssued={new Date(transaction.timestamp).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Page indicator for multi-page */}
                {totalPages > 1 && (
                  <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                    <Text className="text-xs text-gray-500">
                      Page {pageIndex + 1} of {totalPages}
                    </Text>
                  </div>
                )}

                {/* Items Table */}
                <InvoiceItemsTable items={pageItems} />

                {/* Totals, Bank Details, Terms, Signatures - Last Page Only */}
                {isLastPage && (
                  <>
                    <InvoicePaymentSummary
                      subtotal={transaction.subtotal}
                      discount={transaction.discount || 0}
                      grandTotal={transaction.total}
                      deliveryCharge={transaction.deliveryCharge || 0}
                      advancedPayment={transaction.advancedPayment || 0}
                      balancePayment={transaction.balancePayment || 0}
                      tax={transaction.totalTax || 0}
                    />

                    {/* Bank Details - Always show if available */}
                    {invoiceConfig?.bankAccount && (
                      <InvoiceAccountDetails bankAccount={invoiceConfig.bankAccount} />
                    )}

                    {/* Notes */}
                    {invoiceConfig?.notesTemplate && (
                      <InvoiceNotes notesTemplate={invoiceConfig.notesTemplate} />
                    )}

                    {/* Terms and Conditions */}
                    <InvoiceTermsAndConditions />

                    {/* Signature Section */}
                    <InvoiceSignatureSection />
                  </>
                )}
              </div>

              {/* Footer Section - Fixed at bottom */}
              <InvoiceFooter settings={invoiceConfig?.settings} />
            </div>
          );
        })}
      </div>
    );
  };

  const renderItemLabel = () => (
    <div className="p-4 bg-white max-w-md mx-auto w-full">
      {transaction.items.map((item, itemIndex) =>
        Array.from({ length: item.quantity }, (_, qtyIndex) => (
          <div key={`${itemIndex}-${qtyIndex}`} className="border-2 border-dashed border-gray-400 p-4 mb-4 page-break-after">
            <div className="text-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">VC</span>
              </div>
              <Text strong className="text-lg">VCare Furniture</Text>
            </div>

            <div className="border-t border-gray-300 my-2" />

            <div className="space-y-2">
              <div>
                <Text strong className="text-base">{item.product.name}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary">SKU:</Text>
                <Text code>{item.product.barcode}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary">Category:</Text>
                <Text>{item.product.category}</Text>
              </div>

              {item.product.material && (
                <div className="flex justify-between">
                  <Text type="secondary">Material:</Text>
                  <Text>{item.product.material}</Text>
                </div>
              )}

              {item.product.color && (
                <div className="flex justify-between">
                  <Text type="secondary">Color:</Text>
                  <Text>{item.product.color}</Text>
                </div>
              )}

              {item.product.dimensions && (
                <div className="flex justify-between">
                  <Text type="secondary">Size:</Text>
                  <Text className="text-xs">
                    {item.product.dimensions.length}×{item.product.dimensions.width}×{item.product.dimensions.height} {item.product.dimensions.unit}
                  </Text>
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 my-2" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Order:</Text>
                <Text className="text-xs">{transaction.id}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Customer:</Text>
                <Text className="text-xs">{transaction.customerName || 'Walk-in'}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Date:</Text>
                <Text className="text-xs">{new Date(transaction.timestamp).toLocaleDateString()}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Item:</Text>
                <Text className="text-xs">{qtyIndex + 1} of {item.quantity}</Text>
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className="w-16 h-16 bg-gray-200 mx-auto flex items-center justify-center border">
                <Text type="secondary" className="text-xs">QR</Text>
              </div>
              <Text type="secondary" className="text-xs mt-1">Scan for details</Text>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>

      <div className="invoice-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={onClose}>
        <div className={`relative flex h-[90vh] w-full ${type === 'detailed' ? 'max-w-4xl' : 'max-w-2xl'} flex-col rounded-xl bg-gray-100 shadow-2xl print:h-auto print:max-w-none print:rounded-none print:bg-white print:shadow-none overflow-hidden print:overflow-visible`} onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden rounded-t-xl">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name={type === 'detailed' ? 'receipt_long' : 'label'} className="text-blue-600" />
              <span>{type === 'detailed' ? 'Invoice' : 'Item Labels'}</span>
            </h2>
            <div className="flex items-center space-x-3">
              <ActionButton key="print" icon="print" onClick={handlePrint}>Print</ActionButton>
              <ActionButton key="view" icon="visibility" onClick={handleView} loading={loading}>View PDF</ActionButton>
              <ActionButton key="download" icon="download" onClick={handleDownload} loading={loading}>Download PDF</ActionButton>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
            <div id="invoice-print-container" className="flex flex-col items-center gap-8 print:block print:gap-0 w-full">
              {type === 'detailed' ? renderDetailedInvoice() : renderItemLabel()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
