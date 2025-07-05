import React, { useState } from 'react';
import { Modal, Typography, Divider, Row, Col, Space, Image, Button } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export function InvoiceModal({ open, onClose, transaction, type = 'detailed' }) {
  const [loading, setLoading] = useState(false);
  
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleView = async () => {
    setLoading(true);
    const element = document.getElementById('invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      setLoading(false);
      return;
    }

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Open PDF in new tab
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    const element = document.getElementById('invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      setLoading(false);
      return;
    }

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const filename = `${type === 'detailed' ? 'invoice' : 'labels'}-${transaction.id}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    } finally {
      setLoading(false);
    }
  };

  const renderDetailedInvoice = () => (
    <div id="invoice-content" className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
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
        <Title level={3} className="text-gray-800">INVOICE</Title>
      </div>

      {/* Invoice Details */}
      <Row gutter={32} className="mb-6">
        <Col span={12}>
          <div className="space-y-2">
            <Text strong>Invoice Number:</Text>
            <Text className="block">{transaction.id}</Text>
            
            <Text strong>Date:</Text>
            <Text className="block">{new Date(transaction.timestamp).toLocaleDateString()}</Text>
            
            <Text strong>Time:</Text>
            <Text className="block">{new Date(transaction.timestamp).toLocaleTimeString()}</Text>
            
            <Text strong>Cashier:</Text>
            <Text className="block">{transaction.cashier}</Text>

            {transaction.salesperson && (
              <>
                <Text strong>Sales Person:</Text>
                <Text className="block">{transaction.salesperson}</Text>
              </>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="space-y-2">
            <Text strong>Bill To:</Text>
            <div className="border-l-4 border-blue-600 pl-4">
              <Text className="block font-semibold">
                {transaction.customerName || 'Walk-in Customer'}
              </Text>
              {transaction.customerPhone && (
                <Text className="block">{transaction.customerPhone}</Text>
              )}
              {transaction.customerEmail && (
                <Text className="block">{transaction.customerEmail}</Text>
              )}
              {transaction.customerAddress && (
                <Text className="block">{transaction.customerAddress}</Text>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Items Table */}
      <div className="mb-6">
        <Title level={4} className="mb-4">Items Purchased</Title>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">Item</th>
              <th className="border border-gray-300 p-3 text-left">SKU</th>
              <th className="border border-gray-300 p-3 text-center">Qty</th>
              <th className="border border-gray-300 p-3 text-right">Unit Price</th>
              <th className="border border-gray-300 p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={item.product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="object-cover rounded"
                      preview={false}
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    <div className="flex-1">
                      <Text strong className="block">{item.product.name}</Text>
                      {item.selectedVariant && (
                        <Text type="secondary" className="text-sm">
                          Variant: {item.selectedVariant}
                        </Text>
                      )}
                      {item.selectedSize && (
                        <Text type="secondary" className="text-sm">
                          Size: {item.selectedSize}
                        </Text>
                      )}
                      <Text type="secondary" className="text-sm">
                        SKU: {item.product.barcode} | Qty: {item.quantity}
                      </Text>
                    </div>
                      className="object-cover rounded"
                      preview={false}
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    <div className="flex-1">
                      <Text strong className="block">{item.product.name}</Text>
                      {item.selectedVariant && (
                        <Text type="secondary" className="text-sm">
                          Variant: {item.selectedVariant}
                        </Text>
                      )}
                      {item.selectedSize && (
                        <Text type="secondary" className="text-sm">
                          Size: {item.selectedSize}
                        </Text>
                      )}
                      <Text type="secondary" className="text-sm">
                        SKU: {item.product.barcode} | Qty: {item.quantity}
                      </Text>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">
                  <Text code>{item.product.barcode}</Text>
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 p-3 text-right">
                  LKR {item.product.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-3 text-right">
                  LKR {(item.product.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <Row gutter={32}>
        <Col span={12}>
          {/* Payment Info */}
          <div className="space-y-2">
            <Text strong>Payment Information:</Text>
            <div className="border-l-4 border-green-500 pl-4">
              <Text className="block">Method: {transaction.paymentMethod.toUpperCase()}</Text>
              <Text className="block">Status: PAID</Text>
              {transaction.appliedCoupon && (
                <Text className="block">Coupon: {transaction.appliedCoupon}</Text>
              )}
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Subtotal:</Text>
              <Text>LKR {transaction.subtotal.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Tax:</Text>
              <Text>LKR {transaction.totalTax.toFixed(2)}</Text>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <Text>Discount:</Text>
                <Text>-LKR {transaction.discount.toFixed(2)}</Text>
              </div>
            )}
            <Divider className="my-2" />
            <div className="flex justify-between">
              <Title level={4} className="m-0">Total:</Title>
              <Title level={4} className="m-0 text-blue-600">
                LKR {transaction.total.toFixed(2)}
              </Title>
            </div>
          </div>
        </Col>
      </Row>

      {/* Notes */}
      {transaction.notes && (
        <div className="mt-6">
          <Text strong>Order Notes:</Text>
          <div className="mt-2 p-3 bg-gray-50 border rounded">
            <Text>{transaction.notes}</Text>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center">
        <Text type="secondary" className="text-sm">
          {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).receiptFooter 
            ? JSON.parse(localStorage.getItem('vcare_branding')).receiptFooter 
            : "Thank you for your business! For any questions, please contact us."}
        </Text>
        <br />
        <Text type="secondary" className="text-sm">
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
      </div>
    </div>
  );

  const renderItemLabel = () => (
    <div id="invoice-content" className="p-4 bg-white max-w-md mx-auto">
      {/* Multiple labels for each item */}
      {transaction.items.map((item, itemIndex) => 
        Array.from({ length: item.quantity }, (_, qtyIndex) => (
          <div key={`${itemIndex}-${qtyIndex}`} className="border-2 border-dashed border-gray-400 p-4 mb-4 page-break-after">
            {/* Header */}
            <div className="text-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">VC</span>
              </div>
              <Text strong className="text-lg">VCare Furniture</Text>
            </div>

            <Divider className="my-2" />

            {/* Item Info */}
            <div className="space-y-2">
              <div>
                <Text strong className="text-base">{item.product.name}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary">SKU:</Text>
                <Text code>{item.product.barcode}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary">Category:</Text>
                <Text>{item.product.category}</Text>
              </div>

              {item.product.material && (
                <div className="flex justify-between">
                  <Text type="secondary">Material:</Text>
                  <Text>{item.product.material}</Text>
                </div>
              )}

              {item.product.color && (
                <div className="flex justify-between">
                  <Text type="secondary">Color:</Text>
                  <Text>{item.product.color}</Text>
                </div>
              )}

              {item.product.dimensions && (
                <div className="flex justify-between">
                  <Text type="secondary">Size:</Text>
                  <Text className="text-xs">
                    {item.product.dimensions.length}×{item.product.dimensions.width}×{item.product.dimensions.height} {item.product.dimensions.unit}
                  </Text>
                </div>
              )}
            </div>

            <Divider className="my-2" />

            {/* Order Info */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Order:</Text>
                <Text className="text-xs">{transaction.id}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Customer:</Text>
                <Text className="text-xs">{transaction.customerName || 'Walk-in'}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Date:</Text>
                <Text className="text-xs">{new Date(transaction.timestamp).toLocaleDateString()}</Text>
              </div>

              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Item:</Text>
                <Text className="text-xs">{qtyIndex + 1} of {item.quantity}</Text>
              </div>
            </div>

            {/* QR Code placeholder */}
            <div className="mt-3 text-center">
              <div className="w-16 h-16 bg-gray-200 mx-auto flex items-center justify-center border">
                <Text type="secondary" className="text-xs">QR</Text>
              </div>
              <Text type="secondary" className="text-xs mt-1">Scan for details</Text>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <Icon name={type === 'detailed' ? 'receipt_long' : 'label'} className="text-blue-600" />
          <span>{type === 'detailed' ? 'Invoice' : 'Item Labels'}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={type === 'detailed' ? 900 : 600}
      footer={[
        <ActionButton key="close" onClick={onClose}>
          Close
        </ActionButton>,
        <ActionButton 
          key="view" 
          icon="visibility" 
          onClick={handleView}
          loading={loading}
        >
          View PDF
        </ActionButton>,
        <ActionButton 
          key="download" 
          icon="download" 
          onClick={handleDownload}
          loading={loading}
        >
          Download PDF
        </ActionButton>,
        <ActionButton.Primary 
          key="print" 
          icon="print" 
          onClick={handlePrint}
        >
          Print
        </ActionButton.Primary>
      ]}
      className="invoice-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {type === 'detailed' ? renderDetailedInvoice() : renderItemLabel()}
      </div>
    </Modal>
  );
}