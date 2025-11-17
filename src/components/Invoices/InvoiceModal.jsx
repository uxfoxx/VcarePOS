import React, { useState, useEffect } from 'react';
import { Modal, Typography, Row, Col, Space, message } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  InvoiceHeader,
  InvoiceDetails,
  InvoiceCustomerSection,
  InvoiceItemsTable,
  InvoicePaymentSummary,
  InvoiceAccountDetails,
  InvoiceNotes,
  InvoiceFooter
} from './SharedInvoiceComponents';
import apiClient from '../../api/apiClient';

const { Title, Text } = Typography;

export function InvoiceModal({ open, onClose, transaction, type = 'detailed' }) {
  const [loading, setLoading] = useState(false);
  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    if (open) {
      fetchInvoiceConfig();
    }
  }, [open]);

  const fetchInvoiceConfig = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/complete');
      setInvoiceConfig(response.data);
    } catch (error) {
      console.error('Error fetching invoice configuration:', error);
      // Use default configuration if fetch fails
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

  if (!transaction) return null;

  const handlePrint = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      return;
    }

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '210mm';
    printContainer.style.height = 'auto';
    printContainer.style.padding = '8mm';
    printContainer.style.backgroundColor = '#ffffff';

    const clonedContent = element.cloneNode(true);
    printContainer.appendChild(clonedContent);
    document.body.appendChild(printContainer);

    clonedContent.style.display = 'none';
    clonedContent.offsetHeight;
    clonedContent.style.display = 'block';

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      window.print();
    } catch (error) {
      console.error('Error during print:', error);
    } finally {
      document.body.removeChild(printContainer);
    }
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

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
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

      const filename = `invoice-${transaction.id}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      handlePrint();
    } finally {
      setLoading(false);
    }
  };

  const renderDetailedInvoice = () => {
    const businessName = invoiceConfig?.settings?.business_name ||
      (localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName) ||
      'VCare Furniture Store';

    const businessAddress = invoiceConfig?.settings?.business_address ||
      (localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).address) ||
      '1100/1, Pannipitiya Road, Battaramulla, Sri Lanka';

    const phoneNumber = invoiceConfig?.settings?.phone_number ||
      (localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).phoneNumber) ||
      '+94 76 767 5044';

    const logoPreview = invoiceConfig?.settings?.logo_url ||
      (localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview) ||
      '/VCARELogo 1.png';

    return (
      <div id="invoice-content" className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        <InvoiceHeader
          businessName={businessName}
          businessAddress={businessAddress}
          phoneNumber={phoneNumber}
          logoPreview={logoPreview}
        />

        <Row gutter={32} className="mb-6">
          <Col span={12}>
            <InvoiceCustomerSection
              customerName={transaction.customerName}
              customerAddress={transaction.customerAddress}
              customerEmail={transaction.customerEmail}
              customerPhone={transaction.customerPhone}
            />
          </Col>
          <Col span={12}>
            <InvoiceDetails
              invoiceNumber={transaction.id}
              dateIssued={new Date(transaction.timestamp).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}
            />
          </Col>
        </Row>

        <InvoiceItemsTable items={transaction.items} />

        <InvoicePaymentSummary
          subtotal={transaction.subtotal}
          discount={transaction.discount || 0}
          grandTotal={transaction.total}
          advancedPayment={transaction.advancedPayment || 0}
          balancePayment={transaction.balancePayment || 0}
          tax={transaction.totalTax || 0}
        />

        {invoiceConfig?.bankAccount && (
          <InvoiceAccountDetails bankAccount={invoiceConfig.bankAccount} />
        )}

        {invoiceConfig?.notesTemplate && (
          <InvoiceNotes notesTemplate={invoiceConfig.notesTemplate} />
        )}

        <InvoiceFooter
          businessName={businessName}
          businessAddress={businessAddress}
          phoneNumber={phoneNumber}
        />
      </div>
    );
  };

  const renderItemLabel = () => (
    <div id="invoice-content" className="p-4 bg-white max-w-md mx-auto">
      {transaction.items.map((item, itemIndex) =>
        Array.from({ length: item.quantity }, (_, qtyIndex) => (
          <div key={`${itemIndex}-${qtyIndex}`} className="border-2 border-dashed border-gray-400 p-4 mb-4 page-break-after">
            <div className="text-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">VC</span>
              </div>
              <Text strong className="text-lg">VCare Furniture</Text>
            </div>

            <div className="border-t border-gray-300 my-2" />

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

            <div className="border-t border-gray-300 my-2" />

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
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-container,
            #print-container * {
              visibility: visible;
            }
            #print-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 210mm;
              height: auto;
              margin: 0;
              padding: 8mm;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            #print-container .page-break-after {
              page-break-after: always;
              break-after: page;
            }
            .ant-modal,
            .ant-modal-content,
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          }
        `}
      </style>
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
          </ActionButton.Primary>,
        ]}
        className="invoice-modal"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {type === 'detailed' ? renderDetailedInvoice() : renderItemLabel()}
        </div>
      </Modal>
    </>
  );
}
