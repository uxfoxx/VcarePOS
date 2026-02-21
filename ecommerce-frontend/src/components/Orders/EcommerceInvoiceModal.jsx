import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

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

const EcommerceInvoiceModal = ({ order, isOpen, onClose }) => {
  const [invoiceConfig, setInvoiceConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      fetchInvoiceConfig();
    }
  }, [isOpen, order]);

  const fetchInvoiceConfig = async () => {
    try {
      const API_URL = 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/invoice-settings/complete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoiceConfig(data);
      } else {
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

  const generatePDF = async () => {
    const pages = document.querySelectorAll('.ecommerce-invoice-page');
    if (!pages || pages.length === 0) {
      console.error('No invoice pages found');
      return null;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

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

  const handleDownload = async () => {
    setLoading(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const filename = `invoice-${order.id}.pdf`;
        pdf.save(filename);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
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
      toast.error('Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContainer = document.getElementById('ecommerce-invoice-print-container');
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
          <title>Invoice - ${order.customerName}</title>
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
              .ecommerce-invoice-page {
                 page-break-after: always;
                 margin: 0 !important;
                 padding: 0 !important;
                 width: 210mm;
                 box-shadow: none !important;
              }
              .ecommerce-invoice-page:last-child {
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

  if (!isOpen || !order) return null;

  // const businessName = invoiceConfig?.settings?.business_name || '';
  // const businessAddress = invoiceConfig?.settings?.business_address || '';
  // const phoneNumber = invoiceConfig?.settings?.phone_number || '';

  const subtotal = order.totalAmount || order.items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);
  const discount = 0;
  const grandTotal = subtotal - discount;

  // Split items into pages of 10
  const itemPages = chunkArray(order.items, ITEMS_PER_PAGE);
  const totalPages = itemPages.length;

  return (
    <>


      <div className="invoice-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={onClose}>
        <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-gray-100 shadow-2xl print:h-auto print:max-w-none print:rounded-none print:bg-white print:shadow-none overflow-hidden print:overflow-visible" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden rounded-t-xl">
            <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Print
              </button>
              <button
                onClick={handleView}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'View PDF'}
              </button>
              <button
                onClick={handleDownload}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
            <div id="ecommerce-invoice-print-container" className="flex flex-col items-center gap-8 print:block print:gap-0 w-full">
              {itemPages.map((pageItems, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === totalPages - 1;

                return (
                  <div
                    key={pageIndex}
                    className="ecommerce-invoice-page bg-white shadow-lg print:shadow-none"
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      width: '210mm',
                      minHeight: '297mm',
                      position: 'relative',
                      boxSizing: 'border-box',
                      margin: '0 auto',
                      overflow: 'hidden',
                      marginBottom: pageIndex < totalPages - 1 ? '10mm' : '0'
                    }}
                  >
                    {/* Header Section */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                      <img
                        src="/invoiceTop.png"
                        alt="Invoice Header"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Content Section */}
                    <div style={{ position: 'absolute', top: '45mm', left: '10mm', right: '10mm', bottom: '30mm', overflow: 'hidden' }}>
                      {/* Customer and Invoice Details - First Page Only */}
                      {isFirstPage && (
                        <table style={{ width: '100%', marginBottom: '12px', borderCollapse: 'collapse', fontSize: '11px', lineHeight: '1.5' }}>
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '16px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>Invoice to:</div>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>{order.customerName}</div>
                                {order.customerAddress && <div style={{ color: '#4b5563', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: '2px' }}>{order.customerAddress}</div>}
                                {order.customerEmail && <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '2px' }}>{order.customerEmail}</div>}
                                {order.customerPhone && <div style={{ color: '#4b5563', fontSize: '11px' }}>{order.customerPhone}</div>}
                              </td>
                              <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '16px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ fontWeight: 'bold', paddingBottom: '4px', textAlign: 'left', verticalAlign: 'middle' }}>Date Issued:</td>
                                      <td style={{ paddingBottom: '4px', textAlign: 'right', verticalAlign: 'middle' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 'bold', textAlign: 'left', verticalAlign: 'middle' }}>No:</td>
                                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                                        <span style={{
                                          display: 'inline-block',
                                          fontFamily: 'monospace',
                                          backgroundColor: '#f5f5f5',
                                          padding: '2px 6px',
                                          borderRadius: '2px',
                                          border: '1px solid #d9d9d9',
                                          fontSize: '11px'
                                        }}>
                                          {order.id}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* Page indicator for multi-page */}
                      {totalPages > 1 && (
                        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                          <span className="text-xs text-gray-500">
                            Page {pageIndex + 1} of {totalPages}
                          </span>
                        </div>
                      )}

                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#2563eb' }}>
                            <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '15%', fontSize: '10px', padding: '8px 4px' }}>ITEM CODE</th>
                            <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '35%', fontSize: '10px', padding: '8px 4px' }}>DESCRIPTION</th>
                            <th style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', width: '10%', fontSize: '10px', padding: '8px 4px' }}>QTY</th>
                            <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '20%', fontSize: '10px', padding: '8px 4px' }}>RATE</th>
                            <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '20%', fontSize: '10px', padding: '8px 4px' }}>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageItems.map((item, index) => {
                            const unitPrice = item.unitPrice || 0;
                            const itemCode = item.sku || item.itemCode || `ITEM-${String(index + 1).padStart(3, '0')}`;
                            return (
                              <tr key={index}>
                                <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                  <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>{itemCode}</div>
                                </td>
                                <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{item.productName}</div>
                                    {(item.selectedColorId || item.selectedSize) && (
                                      <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                                        {item.selectedColorId && `Color: ${item.selectedColorId}`}
                                        {item.selectedColorId && item.selectedSize && ' • '}
                                        {item.selectedSize && `Size: ${item.selectedSize}`}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                                  <div style={{ fontSize: '11px' }}>{item.quantity} NOS</div>
                                </td>
                                <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                  <div style={{ fontSize: '11px' }}>
                                    LKR {unitPrice.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </div>
                                </td>
                                <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '500' }}>
                                  <div style={{ fontSize: '11px' }}>
                                    LKR {(unitPrice * item.quantity).toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Totals, Bank Details, Terms, Signatures - Last Page Only */}
                      {isLastPage && (
                        <>
                          <div style={{ marginTop: '12px' }}>
                            <table style={{ width: '50%', marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
                              <tbody>
                                <tr>
                                  <td style={{ textAlign: 'left', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb' }}>TOTAL</td>
                                  <td style={{ textAlign: 'right', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                                    {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                                {discount > 0 && (
                                  <tr>
                                    <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>DISCOUNT</td>
                                    <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                                      {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>GRAND TOTAL</td>
                                  <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>
                                    {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Bank Details - Always show if available */}
                          {invoiceConfig?.bankAccount && (
                            <div style={{ marginTop: '12px' }}>
                              <h3 style={{ fontSize: '14px', marginBottom: '8px' }} className="font-bold">Account details</h3>
                              <div className="space-y-1">
                                <p className="text-sm m-0">{invoiceConfig.bankAccount.account_holder_name}</p>
                                <p className="text-sm m-0">{invoiceConfig.bankAccount.account_number}</p>
                                <p className="text-sm m-0">
                                  {invoiceConfig.bankAccount.bank_name} {invoiceConfig.bankAccount.branch_name}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {invoiceConfig?.notesTemplate && (
                            <div style={{ marginTop: '12px' }}>
                              <h3 style={{ fontSize: '14px', marginBottom: '8px' }} className="font-bold">Note:-</h3>
                              <div className="space-y-1">
                                {invoiceConfig.notesTemplate.warranty_terms && (
                                  <p className="text-xs text-gray-700 m-0" style={{ lineHeight: '1.4' }}>
                                    {invoiceConfig.notesTemplate.warranty_terms}
                                  </p>
                                )}
                                {invoiceConfig.notesTemplate.quotation_validity && (
                                  <p className="text-xs text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
                                    {invoiceConfig.notesTemplate.quotation_validity}
                                  </p>
                                )}
                                {invoiceConfig.notesTemplate.custom_notes && (
                                  <p className="text-xs text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
                                    {invoiceConfig.notesTemplate.custom_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Terms and Conditions */}
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>Terms & Conditions:</div>
                            <div style={{ color: '#374151', fontSize: '10px', lineHeight: '1.6' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                  {[
                                    "Payment is due within 30 days from the date of invoice unless otherwise agreed.",
                                    "All prices are in LKR and include applicable taxes unless stated otherwise.",
                                    "Delivery charges may apply and will be calculated based on location and order size.",
                                    "Products are covered by manufacturer warranty. Terms apply as per warranty card.",
                                    "Returns accepted within 7 days with original packaging and receipt.",
                                    "Custom orders and special requests are non-refundable once production begins.",
                                    "The company reserves the right to make changes without prior notice."
                                  ].map((term, i) => (
                                    <tr key={i}>
                                      <td style={{ verticalAlign: 'top', paddingRight: '4px', width: '12px' }}>{i + 1}.</td>
                                      <td style={{ verticalAlign: 'top', paddingBottom: '2px' }}>{term}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Signature Section */}
                          <div style={{ marginTop: '20px', marginBottom: '12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                <tr>
                                  <td style={{ width: '45%', verticalAlign: 'top' }}>
                                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '10px', color: '#6b7280' }}>Signature:</span>
                                    </div>
                                    <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
                                      <tbody>
                                        <tr>
                                          <td style={{ borderBottom: '1px solid #333' }}></td>
                                          <td style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#4b5563', padding: '0 4px', verticalAlign: 'bottom' }}>Date:</td>
                                          <td style={{ width: '80px', borderBottom: '1px solid #333' }}></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <div style={{ fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>Received By</div>
                                  </td>
                                  <td style={{ width: '10%' }}></td>
                                  <td style={{ width: '45%', verticalAlign: 'top' }}>
                                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '10px', color: '#6b7280' }}>Signature:</span>
                                    </div>
                                    <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
                                      <tbody>
                                        <tr>
                                          <td style={{ borderBottom: '1px solid #333' }}></td>
                                          <td style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#4b5563', padding: '0 4px', verticalAlign: 'bottom' }}>Date:</td>
                                          <td style={{ width: '80px', borderBottom: '1px solid #333' }}></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <div style={{ fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>Checked By</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                      <div
                        style={{
                          width: '100%',
                          backgroundColor: '#2563eb',
                          padding: '12px 0',
                          textAlign: 'center'
                        }}
                      >
                        <table style={{ display: 'inline-table', borderCollapse: 'collapse', marginRight: '32px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: 0, paddingRight: '6px', verticalAlign: 'middle' }}>
                                <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ display: 'block' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </td>
                              <td style={{ padding: 0, verticalAlign: 'middle', color: 'white', fontSize: '12px', fontWeight: '500', lineHeight: '1' }}>
                                0112870330
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table style={{ display: 'inline-table', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: 0, paddingRight: '6px', verticalAlign: 'middle' }}>
                                <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ display: 'block' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </td>
                              <td style={{ padding: 0, verticalAlign: 'middle', color: 'white', fontSize: '12px', fontWeight: '500', lineHeight: '1' }}>
                                vcarepvtltd@gmail.com
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EcommerceInvoiceModal;
