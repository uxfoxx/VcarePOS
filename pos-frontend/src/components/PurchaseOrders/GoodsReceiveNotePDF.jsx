import React from 'react';
import { Typography, Divider, Table, Tag } from 'antd';

const { Title, Text } = Typography;

export function GoodsReceiveNotePDF({ order, grnData, id }) {
  if (!order || !grnData) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div id={id} className="bg-white" style={{ width: '210mm', height: '297mm', fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="text-center" style={{ padding: '8mm 10mm 0 10mm', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className=" rounded-xl flex items-center justify-center">
            <img
              src={localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview
                ? JSON.parse(localStorage.getItem('vcare_branding')).logoPreview
                : "/VCARELogo 1.png"}
              alt="Business Logo"
              className="h-10 object-contain"
            />
          </div>
          {(() => {
            const branding = localStorage.getItem('vcare_branding') ? JSON.parse(localStorage.getItem('vcare_branding')) : {};
            return (branding.businessName || branding.tagline) ? (
              <div>
                {branding.businessName && (
                  <Title level={2} className="m-0 text-blue-600">
                    {branding.businessName}
                  </Title>
                )}
                {branding.tagline && (
                  <Text type="secondary">
                    {branding.tagline}
                  </Text>
                )}
              </div>
            ) : null;
          })()}
        </div>
        <Divider />
        <Title level={3} className="text-gray-800" style={{ marginBottom: '4px' }}>GOODS RECEIVE NOTE</Title>
        <Text className="text-lg font-bold">{grnData.id}</Text>
      </div>

      {/* Content Section */}
      <div style={{ position: 'absolute', top: '50mm', left: '10mm', right: '10mm', bottom: '30mm', overflow: 'hidden' }}>
        {/* Reference Info */}
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
        <div>
          <Title level={5} className="mb-2">Vendor:</Title>
          <div className="text-sm">
            <Text strong className="block">{order.vendorName}</Text>
            {order.vendorEmail && <Text className="block">{order.vendorEmail}</Text>}
            {order.vendorPhone && <Text className="block">{order.vendorPhone}</Text>}
          </div>
        </div>
        <div className="text-right">
          <Title level={5} className="mb-2">Reference Information:</Title>
          <div className="text-sm">
            <div className="mb-1">
              <Text strong>PO Number:</Text> {order.id}
            </div>
            <div className="mb-1">
              <Text strong>PO Date:</Text> {formatDate(order.orderDate)}
            </div>
            <div className="mb-1">
              <Text strong>Receive Date:</Text> {formatDate(grnData.receivedDate)}
            </div>
          </div>
          </div>
        </div>

        {/* Received Items */}
        <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Received Items:</Title>
        <table className="w-full border-collapse" style={{ marginBottom: '12px' }}>
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">SKU</th>
            <th className="border p-2 text-right">Ordered Qty</th>
            <th className="border p-2 text-right">Received Qty</th>
            <th className="border p-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {grnData.items.map((item, index) => (
            <tr key={`${item.type}-${item.itemId}-${index}`}>
              <td className="border p-2">
                <Text strong>{item.name}</Text>
                <br />
                <Text type="secondary" className="text-xs">{item.category}</Text>
              </td>
              <td className="border p-2 capitalize">{item.type}</td>
              <td className="border p-2">{item.sku}</td>
              <td className="border p-2 text-right">{item.quantity} {item.unit || 'units'}</td>
              <td className="border p-2 text-right">{item.receivedQuantity} {item.unit || 'units'}</td>
              <td className="border p-2">{item.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

        {/* Notes */}
        {grnData.notes && (
          <div style={{ marginBottom: '12px' }}>
            <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Notes:</Title>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <Text>{grnData.notes}</Text>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '10mm' }}>
        {/* Signatures */}
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
        <div className="w-1/3">
          <div className="border-t border-gray-400 pt-2">
            <Text className="text-sm">Received By: {grnData.receivedBy}</Text>
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-t border-gray-400 pt-2">
            <Text className="text-sm">Checked By: {grnData.checkedBy}</Text>
          </div>
        </div>
          <div className="w-1/3">
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-sm">Authorized Signature</Text>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t text-center text-xs text-gray-500">
        {(() => {
          const branding = localStorage.getItem('vcare_branding') ? JSON.parse(localStorage.getItem('vcare_branding')) : {};
          const parts = [];
          if (branding.businessName) parts.push(branding.businessName);
          if (branding.address) parts.push(branding.address);
          if (branding.phoneNumber) parts.push(branding.phoneNumber);
          return parts.length > 0 ? <Text>{parts.join(' | ')}</Text> : null;
        })()}
        {(() => {
          const branding = localStorage.getItem('vcare_branding') ? JSON.parse(localStorage.getItem('vcare_branding')) : {};
          const parts = [];
          if (branding.emailAddress) parts.push(`Email: ${branding.emailAddress}`);
          if (branding.website) parts.push(`Website: ${branding.website}`);
          return parts.length > 0 ? (
            <>
              <br />
              <Text>{parts.join(' | ')}</Text>
            </>
          ) : null;
        })()}
          <br />
          <Text className="text-xs mt-2">GRN #{grnData.id} - Generated on {new Date().toLocaleDateString()}</Text>
        </div>
      </div>
    </div>
  );
}