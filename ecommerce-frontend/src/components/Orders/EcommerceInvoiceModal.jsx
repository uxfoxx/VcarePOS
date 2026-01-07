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

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  const businessName = invoiceConfig?.settings?.business_name || '';
  const businessAddress = invoiceConfig?.settings?.business_address || '';
  const phoneNumber = invoiceConfig?.settings?.phone_number || '';

  const subtotal = order.totalAmount || order.items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);
  const discount = 0;
  const grandTotal = subtotal - discount;

  // Split items into pages of 10
  const itemPages = chunkArray(order.items, ITEMS_PER_PAGE);
  const totalPages = itemPages.length;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ecommerce-invoice-print-container,
          #ecommerce-invoice-print-container * {
            visibility: visible;
          }
          #ecommerce-invoice-print-container {
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
          }
          .ecommerce-invoice-page {
            page-break-after: always;
            break-after: page;
            margin: 0 !important;
          }
          .ecommerce-invoice-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .invoice-modal-overlay {
            display: none !important;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>

      <div className="invoice-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Print
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

          <div id="ecommerce-invoice-print-container">
            {itemPages.map((pageItems, pageIndex) => {
              const isFirstPage = pageIndex === 0;
              const isLastPage = pageIndex === totalPages - 1;

              return (
                <div
                  key={pageIndex}
                  className="ecommerce-invoice-page bg-white"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    width: '210mm',
                    height: '297mm',
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
                      <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '12px' }}>
                        <div>
                          <p className="font-bold mb-2">Invoice to:</p>
                          <p className="font-bold text-base m-0">{order.customerName}</p>
                          {order.customerAddress && <p className="text-sm text-gray-600 m-0">{order.customerAddress}</p>}
                          {order.customerEmail && <p className="text-sm text-gray-600 m-0">{order.customerEmail}</p>}
                          {order.customerPhone && <p className="text-sm text-gray-600 m-0">{order.customerPhone}</p>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-bold">Date Issued:</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">No:</span>
                            <span className="font-mono text-base">{order.id}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Page indicator for multi-page */}
                    {totalPages > 1 && (
                      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                        <span className="text-xs text-gray-500">
                          Page {pageIndex + 1} of {totalPages}
                        </span>
                      </div>
                    )}

                    <table className="w-full border-collapse" style={{ marginTop: '12px' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                          <th className="p-2 text-left text-white font-bold" style={{ width: '15%' }}>ITEM CODE</th>
                          <th className="p-2 text-left text-white font-bold" style={{ width: '30%' }}>DESCRIPTION</th>
                          <th className="p-2 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
                          <th className="p-2 text-right text-white font-bold" style={{ width: '20%' }}>RATE</th>
                          <th className="p-2 text-right text-white font-bold" style={{ width: '20%' }}>AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((item, index) => {
                          const unitPrice = item.unitPrice || 0;
                          const itemCode = item.sku || item.itemCode || `ITEM-${String(index + 1).padStart(3, '0')}`;
                          return (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="p-2">
                                <span className="text-xs font-mono">{itemCode}</span>
                              </td>
                              <td className="p-2">
                                <div>
                                  <p className="font-bold text-sm m-0">{item.productName}</p>
                                  {(item.selectedColorId || item.selectedSize) && (
                                    <p className="text-xs text-gray-500 mt-1 m-0">
                                      {item.selectedColorId && `Color: ${item.selectedColorId}`}
                                      {item.selectedColorId && item.selectedSize && ' • '}
                                      {item.selectedSize && `Size: ${item.selectedSize}`}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <span className="text-sm">{item.quantity} NOS</span>
                              </td>
                              <td className="p-2 text-right">
                                <span className="text-sm">
                                  LKR {unitPrice.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <span className="text-sm font-medium">
                                  LKR {(unitPrice * item.quantity).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Totals, Bank Details, Terms, Signatures - Last Page Only */}
                    {isLastPage && (
                      <>
                        <div style={{ marginTop: '12px' }} className="flex justify-end">
                          <div className="w-1/2 space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-base">TOTAL</span>
                              <span className="text-base font-medium">
                                {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-base">DISCOUNT</span>
                                <span className="text-base font-medium">
                                  {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b-2 border-gray-800">
                              <span className="font-bold text-base">GRAND TOTAL</span>
                              <span className="font-bold text-base">
                                {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
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
                          <h3 style={{ fontSize: '14px', marginBottom: '8px' }} className="font-bold">Terms & Conditions:</h3>
                          <div className="text-xs text-gray-700" style={{ lineHeight: '1.6' }}>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Payment is due within 30 days from the date of invoice unless otherwise agreed.</li>
                              <li>All prices are in LKR and include applicable taxes unless stated otherwise.</li>
                              <li>Delivery charges may apply and will be calculated based on location and order size.</li>
                              <li>Products are covered by manufacturer warranty. Terms apply as per warranty card.</li>
                              <li>Returns accepted within 7 days with original packaging and receipt.</li>
                              <li>Custom orders and special requests are non-refundable once production begins.</li>
                              <li>The company reserves the right to make changes without prior notice.</li>
                            </ol>
                          </div>
                        </div>

                        {/* Signature Section */}
                        <div style={{ marginTop: '20px', marginBottom: '12px' }}>
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                                <span className="text-xs text-gray-500">Signature:</span>
                              </div>
                              <div className="flex justify-between items-end" style={{ marginTop: '30px' }}>
                                <div style={{ flex: 1, borderBottom: '1px solid #333', marginRight: '8px' }}></div>
                                <span className="text-xs text-gray-600">Date:</span>
                                <div style={{ width: '80px', borderBottom: '1px solid #333', marginLeft: '8px' }}></div>
                              </div>
                              <span className="font-bold text-xs block mt-1">Received By</span>
                            </div>
                            <div>
                              <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                                <span className="text-xs text-gray-500">Signature:</span>
                              </div>
                              <div className="flex justify-between items-end" style={{ marginTop: '30px' }}>
                                <div style={{ flex: 1, borderBottom: '1px solid #333', marginRight: '8px' }}></div>
                                <span className="text-xs text-gray-600">Date:</span>
                                <div style={{ width: '80px', borderBottom: '1px solid #333', marginLeft: '8px' }}></div>
                              </div>
                              <span className="font-bold text-xs block mt-1">Checked By</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                    <div
                      style={{
                        background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '40px',
                        width: '100%',
                        padding: '16px',
                        pageBreakInside: 'avoid'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="white"
                          viewBox="0 0 24 24"
                          style={{ flexShrink: 0 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>0112870330</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="white"
                          viewBox="0 0 24 24"
                          style={{ flexShrink: 0 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>vcarepvtltd@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default EcommerceInvoiceModal;
