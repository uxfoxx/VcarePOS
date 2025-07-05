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
    <div id={id} className="p-8 bg-white" style={{ width: '210mm', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <img 
              src={localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                ? JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                : "/VCARELogo 1.png"} 
              alt="VCare Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <Title level={2} className="m-0 text-blue-600">
              {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName 
                ? JSON.parse(localStorage.getItem('vcare_branding')).businessName 
                : "VCare Furniture Store"}
            </Title>
            <Text type="secondary">
              {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).tagline 
                ? JSON.parse(localStorage.getItem('vcare_branding')).tagline 
                : "Premium Furniture Solutions"}
            </Text>
          </div>
        </div>
        <Divider />
        <Title level={3} className="text-gray-800">GOODS RECEIVE NOTE</Title>
        <Text className="text-lg font-bold">{grnData.id}</Text>
      </div>

      {/* Reference Info */}
      <div className="flex justify-between mb-6">
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
      <Title level={5} className="mb-4">Received Items:</Title>
      <table className="w-full border-collapse mb-6">
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
        <div className="mb-6">
          <Title level={5} className="mb-2">Notes:</Title>
          <div className="bg-gray-50 p-4 rounded border text-sm">
            <Text>{grnData.notes}</Text>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="flex justify-between mt-12">
        <div className="w-1/3">
          <div className="border-t border-gray-400 pt-2 mt-12">
            <Text className="text-sm">Received By: {grnData.receivedBy}</Text>
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-t border-gray-400 pt-2 mt-12">
            <Text className="text-sm">Checked By: {grnData.checkedBy}</Text>
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-t border-gray-400 pt-2 mt-12">
            <Text className="text-sm">Authorized Signature</Text>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
        <Text>
          {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName 
            ? JSON.parse(localStorage.getItem('vcare_branding')).businessName 
            : "VCare Furniture Store"} | 
          {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).address 
            ? JSON.parse(localStorage.getItem('vcare_branding')).address 
            : "123 Main Street, City, State 12345"} | 
          {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).phoneNumber 
            ? JSON.parse(localStorage.getItem('vcare_branding')).phoneNumber 
            : "(555) 123-4567"}
        </Text>
        <br />
        <Text>
          Email: {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).emailAddress 
            ? JSON.parse(localStorage.getItem('vcare_branding')).emailAddress 
            : "inventory@vcarefurniture.com"} | 
          Website: {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).website 
            ? JSON.parse(localStorage.getItem('vcare_branding')).website 
            : "www.vcarefurniture.com"}
        </Text>
        <br />
        <Text className="text-xs mt-2">GRN #{grnData.id} - Generated on {new Date().toLocaleDateString()}</Text>
      </div>
    </div>
  );
}