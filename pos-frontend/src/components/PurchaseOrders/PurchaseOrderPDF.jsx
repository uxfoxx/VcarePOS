import { Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export function PurchaseOrderPDF({ order, id }) {
  if (!order) return null;

  const formatDate = (date) => {
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
              alt="VCare Logo"
              className=" h-10 object-contain"
            />
          </div>

        </div>
        <Divider />
        <Title level={3} className="text-gray-800" style={{ marginBottom: '4px' }}>PURCHASE ORDER</Title>
        <Text className="text-lg font-bold">{order.id}</Text>
      </div>

      {/* Content Section */}
      <div style={{ position: 'absolute', top: '50mm', left: '10mm', right: '10mm', bottom: '30mm', overflow: 'hidden' }}>
        {/* Order Info */}
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
          <div>
            <Title level={5} className="mb-2">Vendor:</Title>
            <div className="text-sm">
              <Text strong className="block">{order.vendorName}</Text>
              {order.vendorEmail && <Text className="block">{order.vendorEmail}</Text>}
              {order.vendorPhone && <Text className="block">{order.vendorPhone}</Text>}
              {order.vendorAddress && <Text className="block whitespace-pre-line">{order.vendorAddress}</Text>}
            </div>
          </div>
          <div className="text-right">
            <Title level={5} className="mb-2">Order Information:</Title>
            <div className="text-sm">
              <div className="mb-1">
                <Text strong>Order Date:</Text> {formatDate(order.orderDate)}
              </div>
              {order.expectedDeliveryDate && (
                <div className="mb-1">
                  <Text strong>Expected Delivery:</Text> {formatDate(order.expectedDeliveryDate)}
                </div>
              )}
              <div className="mb-1">
                <Text strong>Status:</Text> <span className="capitalize">{order.status}</span>
              </div>
              {order.paymentTerms && (
                <div className="mb-1">
                  <Text strong>Payment Terms:</Text> {order.paymentTerms}
                </div>
              )}
              {order.shippingMethod && (
                <div className="mb-1">
                  <Text strong>Shipping Method:</Text> {order.shippingMethod}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ship To */}
        <div style={{ marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Ship To:</Title>
          <div className="border-l-4 border-blue-600 pl-4 text-sm">
            <Text className="whitespace-pre-line">{order.shippingAddress}</Text>
          </div>
        </div>

        {/* Order Items */}
        <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Order Items:</Title>
        <table className="w-full border-collapse" style={{ marginBottom: '12px' }}>
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">SKU</th>
              <th className="border p-2 text-right">Quantity</th>
              <th className="border p-2 text-right">Unit Price</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.type}-${item.itemId}-${index}`}>
                <td className="border p-2">
                  <Text strong>{item.name}</Text>
                  <br />
                  <Text type="secondary" className="text-xs">{item.category}</Text>
                </td>
                <td className="border p-2 capitalize">{item.type}</td>
                <td className="border p-2">{item.sku}</td>
                <td className="border p-2 text-right">{item.quantity} {item.unit || 'units'}</td>
                <td className="border p-2 text-right">LKR {item.unitPrice.toFixed(2)}</td>
                <td className="border p-2 text-right">LKR {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="border p-2 text-right">
                <Text strong>Total:</Text>
              </td>
              <td className="border p-2 text-right">
                <Text strong>LKR {order.total.toFixed(2)}</Text>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Notes */}
        {order.notes && (
          <div style={{ marginBottom: '12px' }}>
            <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Notes:</Title>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <Text>{order.notes}</Text>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div style={{ marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>Terms & Conditions:</Title>
          <div className="text-xs text-gray-600">
            <ol className="list-decimal pl-4 space-y-1">
              <li>All prices are in LKR and exclude applicable taxes unless otherwise stated.</li>
              <li>Payment is due according to the terms specified in this purchase order.</li>
              <li>Please confirm receipt of this purchase order within 2 business days.</li>
              <li>Any changes to this purchase order must be approved in writing.</li>
              <li>Goods must be delivered to the shipping address specified above.</li>
              <li>All goods must be delivered in good condition and as per specifications.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '10mm' }}>
        {/* Signatures */}
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
          <div className="w-1/3">
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-sm">Authorized By</Text>
            </div>
          </div>
          <div className="w-1/3">
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-sm">Approved By</Text>
            </div>
          </div>
          <div className="w-1/3">
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-sm">Received By</Text>
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
        </div>
      </div>
    </div>
  );
}