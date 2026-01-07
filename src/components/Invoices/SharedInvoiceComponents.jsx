import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export const InvoiceHeader = ({ businessName, logoPreview }) => (
  <div style={{ marginBottom: '12px' }}>
    
      
        <img
          src="/public/quotationTop.png"
          alt="Business Logo"
          className="w-full object-contain"
          crossOrigin="anonymous"
        />

      
      
    
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
  <div style={{ marginBottom: '12px' }}>
    <table className="w-full border-collapse" style={{ marginTop: '12px' }}>
      <thead>
        <tr style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <th className="p-2 text-left text-white font-bold" style={{ width: '45%' }}>DESCRIPTION</th>
          <th className="p-2 text-center text-white font-bold" style={{ width: '15%' }}>QTY</th>
          <th className="p-2 text-right text-white font-bold" style={{ width: '20%' }}>RATE</th>
          <th className="p-2 text-right text-white font-bold" style={{ width: '20%' }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const unitPrice = item.product?.price || item.unitPrice || item.price || 0;
          return (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-2">
                <div>
                  <Text strong className="block text-sm">{item.name || item.product?.name || item.productName}</Text>
                  {item.description && (
                    <Text className="block text-xs text-gray-600 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                      {item.description}
                    </Text>
                  )}
                  {(item.selectedVariant || item.selectedSize) && (
                    <Text className="block text-xs text-gray-500 mt-1">
                      {item.selectedVariant && `Color: ${item.selectedVariant}`}
                      {item.selectedVariant && item.selectedSize && ' • '}
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                    </Text>
                  )}
                </div>
              </td>
              <td className="p-2 text-center">
                <Text className="text-sm">{item.quantity}{item.unit ? ` ${item.unit}` : ' NOS'}</Text>
              </td>
              <td className="p-2 text-right">
                <Text className="text-sm">
                  LKR {unitPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Text>
              </td>
              <td className="p-2 text-right">
                <Text className="text-sm font-medium">
                  LKR {(unitPrice * item.quantity).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Text>
              </td>
            </tr>
          );
        })}
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
  tax = 0,
  deliveryCharge = 0
}) => {
  const calculatedGrandTotal = grandTotal || (subtotal - discount + tax + deliveryCharge);
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
          {deliveryCharge > 0 && (
            <div className="flex justify-between py-2 border-b">
              <Text className="text-base">DELIVERY CHARGE</Text>
              <Text className="text-base font-medium">
                {deliveryCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    <div style={{ marginTop: '12px' }}>
      <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Account details</Title>
      <div className="space-y-1">
        <Text className="block text-sm">{bankAccount.account_holder_name || bankAccount.accountHolderName}</Text>
        <Text className="block text-sm">{bankAccount.account_number || bankAccount.accountNumber}</Text>
        <Text className="block text-sm">{bankAccount.bank_name || bankAccount.bankName} {bankAccount.branch_name || bankAccount.branchName}</Text>
      </div>
    </div>
  );
};

export const InvoiceNotes = ({ notesTemplate }) => {
  if (!notesTemplate) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Note:-</Title>
      <div className="space-y-1">
        {notesTemplate.warranty_terms && (
          <Text className="block text-xs text-gray-700" style={{ lineHeight: '1.4' }}>
            {notesTemplate.warranty_terms || notesTemplate.warrantyTerms}
          </Text>
        )}
        {notesTemplate.quotation_validity && (
          <Text className="block text-xs text-gray-700" style={{ lineHeight: '1.4', marginTop: '4px' }}>
            {notesTemplate.quotation_validity || notesTemplate.quotationValidity}
          </Text>
        )}
        {notesTemplate.custom_notes && (
          <Text className="block text-xs text-gray-700" style={{ lineHeight: '1.4', marginTop: '4px' }}>
            {notesTemplate.custom_notes || notesTemplate.customNotes}
          </Text>
        )}
      </div>
    </div>
  );
};

export const InvoiceFooter = () => {
  return (
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
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
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
  );
};
