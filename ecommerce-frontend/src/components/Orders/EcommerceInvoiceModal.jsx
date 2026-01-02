import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

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
    const element = document.getElementById('ecommerce-invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      return null;
    }

    try {
      const logoElements = element.querySelectorAll('img');
      for (let img of logoElements) {
        try {
          const base64Image = await convertImageToBase64(img.src);
          img.src = base64Image;
        } catch (error) {
          console.warn('Failed to convert image to base64:', error);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false,
        imageTimeout: 0
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ecommerce-invoice-content,
          #ecommerce-invoice-content * {
            visibility: visible;
          }
          #ecommerce-invoice-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
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

          <div
            id="ecommerce-invoice-content"
            className="bg-white"
            style={{
              fontFamily: 'Arial, sans-serif',
              width: '210mm',
              minHeight: '297mm',
              position: 'relative',
              padding: '10mm',
              paddingBottom: '25mm',
              boxSizing: 'border-box',
              margin: '0 auto'
            }}
          >
            <div style={{ minHeight: 'calc(297mm - 80px)', paddingBottom: '20px' }}>
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/VCARELogo 1.png"
                      alt="Business Logo"
                      className="h-16 object-contain"
                      crossOrigin="anonymous"
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-blue-600 m-0" style={{ fontSize: '28px' }}>
                        {businessName}
                      </h1>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-black m-0" style={{ fontSize: '36px' }}>
                      INVOICE
                    </h1>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
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

              <table className="w-full border-collapse" style={{ marginTop: '24px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                    <th className="p-3 text-left text-white font-bold" style={{ width: '55%' }}>DESCRIPTION</th>
                    <th className="p-3 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
                    <th className="p-3 text-right text-white font-bold" style={{ width: '30%' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-base m-0">{item.productName}</p>
                          {(item.selectedColorId || item.selectedSize) && (
                            <p className="text-sm text-gray-500 mt-1 m-0">
                              {item.selectedColorId && `Color: ${item.selectedColorId}`}
                              {item.selectedColorId && item.selectedSize && ' • '}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-base">{item.quantity}NOS</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-base font-medium">
                          {((item.unitPrice || 0) * item.quantity).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
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

              {invoiceConfig?.bankAccount && order.paymentMethod === 'bank_transfer' && (
                <div className="mt-8">
                  <h3 className="text-base font-bold mb-3">Account details</h3>
                  <div className="space-y-1">
                    <p className="text-base m-0">{invoiceConfig.bankAccount.account_holder_name}</p>
                    <p className="text-base m-0">{invoiceConfig.bankAccount.account_number}</p>
                    <p className="text-base m-0">
                      {invoiceConfig.bankAccount.bank_name} {invoiceConfig.bankAccount.branch_name}
                    </p>
                  </div>
                </div>
              )}

              {invoiceConfig?.notesTemplate && (
                <div className="mt-8">
                  <h3 className="text-base font-bold mb-3">Note:-</h3>
                  <div className="space-y-2">
                    {invoiceConfig.notesTemplate.warranty_terms && (
                      <p className="text-sm text-gray-700 m-0" style={{ lineHeight: '1.6' }}>
                        {invoiceConfig.notesTemplate.warranty_terms}
                      </p>
                    )}
                    {invoiceConfig.notesTemplate.quotation_validity && (
                      <p className="text-sm text-gray-700 mt-2 m-0" style={{ lineHeight: '1.6' }}>
                        {invoiceConfig.notesTemplate.quotation_validity}
                      </p>
                    )}
                    {invoiceConfig.notesTemplate.custom_notes && (
                      <p className="text-sm text-gray-700 mt-2 m-0" style={{ lineHeight: '1.6' }}>
                        {invoiceConfig.notesTemplate.custom_notes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '40px',
                position: 'absolute',
                bottom: '10mm',
                left: 0,
                right: 0,
                width: '100%',
                padding: '16px',
                marginTop: '20px',
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
                <span style={{ color: 'white', fontSize: '14px' }}>{phoneNumber || ''}</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ color: 'white', fontSize: '14px' }}>{businessAddress || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EcommerceInvoiceModal;
