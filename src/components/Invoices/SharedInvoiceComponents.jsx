import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export const InvoiceHeader = ({ businessName, logoPreview }) => (
  <div className="mb-6">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <img
          src={logoPreview || (localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview) || "/VCARELogo 1.png"}
          alt="Business Logo"
          className="h-16 object-contain"
          crossOrigin="anonymous"
        />
        <div>
          <Title level={2} className="m-0 text-blue-600" style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {businessName}
          </Title>
        </div>
      </div>
      <div className="text-right">
        <Title level={1} className="m-0" style={{ fontSize: '36px', fontWeight: 'bold', color: '#000' }}>
          INVOICE
        </Title>
      </div>
    </div>
  </div>
);

export const InvoiceDetails = ({ invoiceNumber, dateIssued }) => (
  <div className="space-y-1">
    <div className="flex justify-between">
      <Text strong>Date Issued:</Text>
      <Text>{dateIssued}</Text>
    </div>
    <div className="flex justify-between">
      <Text strong>No:</Text>
      <Text code className="text-base">{invoiceNumber}</Text>
    </div>
  </div>
);

export const InvoiceCustomerSection = ({ customerName, customerAddress, customerEmail, customerPhone }) => (
  <div className="space-y-1">
    <Text strong className="block mb-2">Invoice to:</Text>
    <Text strong className="block text-base">{customerName || 'Walk-in Customer'}</Text>
    {customerAddress && <Text className="block text-sm text-gray-600">{customerAddress}</Text>}
    {customerEmail && <Text className="block text-sm text-gray-600">{customerEmail}</Text>}
    {customerPhone && <Text className="block text-sm text-gray-600">{customerPhone}</Text>}
  </div>
);

export const InvoiceItemsTable = ({ items, showImages = false }) => (
  <div className="mb-6">
    <table className="w-full border-collapse" style={{ marginTop: '24px' }}>
      <thead>
        <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <th className="p-3 text-left text-white font-bold" style={{ width: '55%' }}>DESCRIPTION</th>
          <th className="p-3 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
          <th className="p-3 text-right text-white font-bold" style={{ width: '30%' }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="border-b border-gray-200">
            <td className="p-4">
              <div>
                <Text strong className="block text-base">{item.name || item.product?.name || item.productName}</Text>
                {item.description && (
                  <Text className="block text-sm text-gray-600 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.description}
                  </Text>
                )}
                {(item.selectedVariant || item.selectedSize) && (
                  <Text className="block text-sm text-gray-500 mt-1">
                    {item.selectedVariant && `Color: ${item.selectedVariant}`}
                    {item.selectedVariant && item.selectedSize && ' • '}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </Text>
                )}
              </div>
            </td>
            <td className="p-4 text-center">
              <Text className="text-base">{item.quantity}{item.unit ? ` ${item.unit}` : 'NOS'}</Text>
            </td>
            <td className="p-4 text-right">
              <Text className="text-base font-medium">
                {((item.product?.price || item.unitPrice || item.price || 0) * item.quantity).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const InvoicePaymentSummary = ({
  subtotal,
  discount = 0,
  grandTotal,
  advancedPayment = 0,
  balancePayment = 0,
  tax = 0
}) => {
  const calculatedGrandTotal = grandTotal || (subtotal - discount + tax);
  const calculatedBalance = balancePayment || (calculatedGrandTotal - advancedPayment);

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between py-2 border-b">
            <Text className="text-base">TOTAL</Text>
            <Text className="text-base font-medium">
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-2 border-b">
              <Text className="text-base">DISCOUNT</Text>
              <Text className="text-base font-medium">
                {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </div>
          )}
          <div className="flex justify-between py-2 border-b-2 border-gray-800">
            <Text strong className="text-base">GRAND TOTAL</Text>
            <Text strong className="text-base">
              {calculatedGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </div>
          {advancedPayment > 0 && (
            <div className="flex justify-between py-2 border-b">
              <Text className="text-base">ADVANCED</Text>
              <Text className="text-base font-medium">
                {advancedPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </div>
          )}
          {(advancedPayment > 0 || balancePayment > 0) && (
            <div className="flex justify-between py-2 border-b-2 border-gray-800">
              <Text strong className="text-base">BALANCE PAYMENT</Text>
              <Text strong className="text-base">
                {calculatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const InvoiceAccountDetails = ({ bankAccount }) => {
  if (!bankAccount) return null;

  return (
    <div className="mt-8">
      <Title level={5} className="mb-3">Account details</Title>
      <div className="space-y-1">
        <Text className="block text-base">{bankAccount.account_holder_name || bankAccount.accountHolderName}</Text>
        <Text className="block text-base">{bankAccount.account_number || bankAccount.accountNumber}</Text>
        <Text className="block text-base">{bankAccount.bank_name || bankAccount.bankName} {bankAccount.branch_name || bankAccount.branchName}</Text>
      </div>
    </div>
  );
};

export const InvoiceNotes = ({ notesTemplate }) => {
  if (!notesTemplate) return null;

  return (
    <div className="mt-8">
      <Title level={5} className="mb-3">Note:-</Title>
      <div className="space-y-2">
        {notesTemplate.warranty_terms && (
          <Text className="block text-sm text-gray-700" style={{ lineHeight: '1.6' }}>
            {notesTemplate.warranty_terms || notesTemplate.warrantyTerms}
          </Text>
        )}
        {notesTemplate.quotation_validity && (
          <Text className="block text-sm text-gray-700 mt-2" style={{ lineHeight: '1.6' }}>
            {notesTemplate.quotation_validity || notesTemplate.quotationValidity}
          </Text>
        )}
        {notesTemplate.custom_notes && (
          <Text className="block text-sm text-gray-700 mt-2" style={{ lineHeight: '1.6' }}>
            {notesTemplate.custom_notes || notesTemplate.customNotes}
          </Text>
        )}
      </div>
    </div>
  );
};

export const InvoiceFooter = ({ businessAddress, phoneNumber }) => (
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
);
