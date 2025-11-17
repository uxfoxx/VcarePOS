import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
            business_name: 'VCare Furniture Store',
            business_address: '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka',
            phone_number: '+94 76 767 5044'
          },
          bankAccount: null,
          notesTemplate: null
        });
      }
    } catch (error) {
      console.error('Error fetching invoice configuration:', error);
      setInvoiceConfig({
        settings: {
          business_name: 'VCare Furniture Store',
          business_address: '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka',
          phone_number: '+94 76 767 5044'
        },
        bankAccount: null,
        notesTemplate: null
      });
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    const element = document.getElementById('ecommerce-invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      setLoading(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgWidth = 210;
      const pageHeight = 295;
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

      const filename = `invoice-${order.id}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  const businessName = invoiceConfig?.settings?.business_name || 'VCare Furniture Store';
  const businessAddress = invoiceConfig?.settings?.business_address || '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka';
  const phoneNumber = invoiceConfig?.settings?.phone_number || '+94 76 767 5044';

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

          <div id="ecommerce-invoice-content" className="p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src="/VCARELogo 1.png"
                    alt="Business Logo"
                    className="h-16 object-contain"
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-blue-600 m-0">
                      {businessName}
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-5xl font-bold text-black m-0">
                    INVOICE
                  </h1>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 my-3"></div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{phoneNumber}</span>
                <span>{businessAddress}</span>
              </div>
            </div>

            {/* Invoice Details and Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="font-bold mb-2">Invoice to:</p>
                <p className="font-bold text-base">{order.customerName}</p>
                {order.customerAddress && <p className="text-sm text-gray-600">{order.customerAddress}</p>}
                {order.customerEmail && <p className="text-sm text-gray-600">{order.customerEmail}</p>}
                {order.customerPhone && <p className="text-sm text-gray-600">{order.customerPhone}</p>}
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

            {/* Items Table */}
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

            {/* Payment Summary */}
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

            {/* Bank Account Details */}
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

            {/* Notes */}
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

            {/* Footer */}
            <div
              className="mt-8 -mx-8 -mb-8 p-4 text-center text-white"
              style={{
                background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '40px'
              }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-white text-sm">{phoneNumber}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-sm">{businessAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EcommerceInvoiceModal;
