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
    <div id={id} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={logoPreview}
              alt="Business Logo"
              className="h-16 object-contain"
              crossOrigin="anonymous"
            />
            
          </div>
          <div className="text-right">
            <Title level={1} className="m-0" style={{ fontSize: '36px', fontWeight: 'bold', color: '#000' }}>
              QUOTATION
            </Title>
          </div>
        </div>
      </div>

      <Divider />

      {/* Quotation Info */}
      <div className="flex justify-between mb-6">
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
      <Title level={5} className="mb-4">Quoted Items:</Title>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
            <th className="p-3 text-left text-white font-bold" style={{ width: '50%' }}>DESCRIPTION</th>
            <th className="p-3 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
            <th className="p-3 text-right text-white font-bold" style={{ width: '17.5%' }}>UNIT PRICE</th>
            <th className="p-3 text-right text-white font-bold" style={{ width: '17.5%' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items && quotation.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-4">
                <Text strong className="block text-base">{item.product_name || item.productName}</Text>
                {item.description && (
                  <Text className="block text-sm text-gray-600 mt-1">{item.description}</Text>
                )}
                {(item.selected_variant || item.selectedVariant || item.selected_size || item.selectedSize) && (
                  <Text className="block text-sm text-gray-500 mt-1">
                    {(item.selected_variant || item.selectedVariant) && `Color: ${item.selected_variant || item.selectedVariant}`}
                    {(item.selected_variant || item.selectedVariant) && (item.selected_size || item.selectedSize) && ' • '}
                    {(item.selected_size || item.selectedSize) && `Size: ${item.selected_size || item.selectedSize}`}
                  </Text>
                )}
              </td>
              <td className="p-4 text-center">
                <Text className="text-base">{item.quantity}</Text>
              </td>
              <td className="p-4 text-right">
                <Text className="text-base">LKR {(item.unit_price || item.unitPrice || 0).toFixed(2)}</Text>
              </td>
              <td className="p-4 text-right">
                <Text className="text-base font-medium">LKR {(item.total_price || item.totalPrice || 0).toFixed(2)}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Summary */}
      <div className="mt-6 mb-6">
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
        <div className="mb-6">
          <Title level={5} className="mb-2">Notes:</Title>
          <div className="bg-gray-50 p-4 rounded border text-sm">
            <Text>{quotation.notes}</Text>
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="mb-6">
        <Title level={5} className="mb-2">Terms & Conditions:</Title>
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

      {/* Footer */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          width: '100%',
          padding: '16px',
          marginTop: 'auto',
          marginBottom: '10mm'
        }}
      >
        {phoneNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{phoneNumber}</span>
          </div>
        )}
        {businessAddress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{businessAddress}</span>
          </div>
        )}
      </div>
    </div>
  );
}
