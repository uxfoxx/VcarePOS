import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export function QuotationPDF({ quotation, id = 'quotation-pdf-content' }) {
  if (!quotation) return null;

  const brandingData = (() => {
    try {
      const branding = localStorage.getItem('vcare_branding');
      return branding ? JSON.parse(branding) : {};
    } catch (error) {
      return {};
    }
  })();

  const businessName = brandingData.businessName || '';
  const businessAddress = brandingData.address || '';
  const phoneNumber = brandingData.phoneNumber || '';
  const logoPreview = brandingData.logoPreview || '/VCARELogo 1.png';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div id={id} className="bg-white" style={{ width: '210mm', height: '297mm', fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <img
          src="/quotationTop.png"
          alt="Quotation Header"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Content Section */}
      <div style={{ position: 'absolute', top: '45mm', left: '10mm', right: '10mm', bottom: '25mm', overflow: 'hidden' }}>
        <Divider style={{ marginTop: 0, marginBottom: '12px' }} />

        {/* Quotation Info */}
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
        <div>
          <Title level={5} className="mb-2">Quotation To:</Title>
          <div className="text-sm">
            <Text strong className="block">{quotation.customer_name || quotation.customerName}</Text>
            {(quotation.customer_phone || quotation.customerPhone) && (
              <Text className="block">{quotation.customer_phone || quotation.customerPhone}</Text>
            )}
            {(quotation.customer_email || quotation.customerEmail) && (
              <Text className="block">{quotation.customer_email || quotation.customerEmail}</Text>
            )}
            {(quotation.customer_address || quotation.customerAddress) && (
              <Text className="block whitespace-pre-line">{quotation.customer_address || quotation.customerAddress}</Text>
            )}
          </div>
        </div>
        <div className="text-right">
          <Title level={5} className="mb-2">Quotation Details:</Title>
          <div className="text-sm">
            <div className="mb-1">
              <Text strong>Quotation No:</Text> <Text code>{quotation.id}</Text>
            </div>
            <div className="mb-1">
              <Text strong>Date:</Text> {formatDate(quotation.created_at || quotation.createdAt || new Date())}
            </div>
            {(quotation.valid_until || quotation.validUntil) && (
              <div className="mb-1">
                <Text strong>Valid Until:</Text> {formatDate(quotation.valid_until || quotation.validUntil)}
              </div>
            )}
            <div className="mb-1">
              <Text strong>Status:</Text> <span className="capitalize">{quotation.status}</span>
            </div>
          </div>
          </div>
        </div>

        {/* Items Table */}
        <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Quoted Items:</Title>
        <table className="w-full border-collapse" style={{ marginBottom: '12px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <th className="p-2 text-left text-white font-bold" style={{ width: '50%' }}>DESCRIPTION</th>
              <th className="p-2 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
              <th className="p-2 text-right text-white font-bold" style={{ width: '17.5%' }}>UNIT PRICE</th>
              <th className="p-2 text-right text-white font-bold" style={{ width: '17.5%' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items && quotation.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2">
                  <Text strong className="block text-sm">{item.product_name || item.productName}</Text>
                  {item.description && (
                    <Text className="block text-xs text-gray-600 mt-1">{item.description}</Text>
                  )}
                  {(item.selected_variant || item.selectedVariant || item.selected_size || item.selectedSize) && (
                    <Text className="block text-xs text-gray-500 mt-1">
                      {(item.selected_variant || item.selectedVariant) && `Color: ${item.selected_variant || item.selectedVariant}`}
                      {(item.selected_variant || item.selectedVariant) && (item.selected_size || item.selectedSize) && ' • '}
                      {(item.selected_size || item.selectedSize) && `Size: ${item.selected_size || item.selectedSize}`}
                    </Text>
                  )}
                </td>
                <td className="p-2 text-center">
                  <Text className="text-sm">{item.quantity}</Text>
                </td>
                <td className="p-2 text-right">
                  <Text className="text-sm">LKR {(item.unit_price || item.unitPrice || 0).toFixed(2)}</Text>
                </td>
                <td className="p-2 text-right">
                  <Text className="text-sm font-medium">LKR {(item.total_price || item.totalPrice || 0).toFixed(2)}</Text>
                </td>
              </tr>
            ))}
          </tbody>
      </table>

        {/* Totals Summary */}
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div className="flex justify-end">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between py-2 border-b">
              <Text className="text-base">SUBTOTAL</Text>
              <Text className="text-base font-medium">LKR {(quotation.subtotal || 0).toFixed(2)}</Text>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between py-2 border-b">
                <Text className="text-base">DISCOUNT</Text>
                <Text className="text-base font-medium">LKR {(quotation.discount || 0).toFixed(2)}</Text>
              </div>
            )}
            {quotation.total_tax > 0 && (
              <div className="flex justify-between py-2 border-b">
                <Text className="text-base">TAX</Text>
                <Text className="text-base font-medium">LKR {(quotation.total_tax || quotation.totalTax || 0).toFixed(2)}</Text>
              </div>
            )}
            <div className="flex justify-between py-2 border-b-2 border-gray-800">
              <Text strong className="text-base">TOTAL AMOUNT</Text>
              <Text strong className="text-base">LKR {(quotation.total || 0).toFixed(2)}</Text>
            </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div style={{ marginBottom: '12px' }}>
            <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Notes:</Title>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <Text>{quotation.notes}</Text>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div style={{ marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Terms & Conditions:</Title>
          <div className="text-xs text-gray-600">
            <ol className="list-decimal pl-4 space-y-1">
              <li>This quotation is valid until the date specified above.</li>
              <li>Prices are in LKR and may be subject to change without notice.</li>
              <li>Payment terms will be discussed upon order confirmation.</li>
              <li>Delivery timelines will be confirmed after order placement.</li>
              <li>This quotation does not constitute a binding contract until order confirmation.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            width: '100%',
            padding: '16px'
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>0112870330</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>vcarepvtltd@gmail.com</span>
        </div>
        </div>
      </div>
    </div>
  );
}
