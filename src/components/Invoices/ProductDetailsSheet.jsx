import { useState } from 'react';
import { Modal, Typography, Row, Col, Space, } from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarcodePresets } from '../../utils/barcodeGenerator';

const { Text } = Typography;

export function ProductDetailsSheet({ open, onClose, product }) {
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handlePrint = async () => {
    const element = document.getElementById('product-sheet-content');
    if (!element) {
      console.error('Product sheet content element not found');
      return;
    }

    // Create a temporary container in the document body
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '210mm';
    printContainer.style.height = 'auto';
    printContainer.style.padding = '8mm';
    printContainer.style.backgroundColor = '#ffffff';

    // Clone the content and append to the temporary container
    const clonedContent = element.cloneNode(true);
    printContainer.appendChild(clonedContent);
    document.body.appendChild(printContainer);

    // Force reflow to ensure content is rendered
    clonedContent.style.display = 'none';
    clonedContent.offsetHeight; // Trigger reflow
    clonedContent.style.display = 'block';

    // Wait briefly to ensure rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Trigger print
      window.print();
    } catch (error) {
      console.error('Error during print:', error);
    } finally {
      // Clean up: remove the temporary container
      document.body.removeChild(printContainer);
    }
  };

  const handleView = async () => {
    setLoading(true);
    const element = document.getElementById('product-sheet-content');
    if (!element) {
      console.error('Product sheet content element not found');
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
    const element = document.getElementById('product-sheet-content');
    if (!element) {
      console.error('Product sheet content element not found');
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
      const filename = `product-details-${product.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      handlePrint();
    } finally {
      setLoading(false);
    }
  };

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
            .ant-modal,
            .ant-modal-content,
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          `}
      </style>
      <Modal
        title={
          <Space>
            <Icon name="description" className="text-blue-600" />
            <span>Product Details Sheet</span>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={800}
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
          <div id="product-sheet-content" className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            {/* <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="rounded-xl flex items-center justify-center">
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
              <Title level={3} className="text-gray-800">PRODUCT SPECIFICATION SHEET</Title>
            </div> */}

            {/* Product Image and Basic Info */}
            {/* <Row gutter={32} className="mb-8">
              <Col span={10}>
                <div className="text-center">
                  <Image
                    src={product.image || 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={product.name}
                    width="100%"
                    height={250}
                    className="object-cover rounded-lg border"
                    preview={false}
                    style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                </div>
              </Col>
              <Col span={14}>
                <div className="space-y-4">
                  <div>
                    <Title level={3} className="m-0 text-blue-600">
                      {product.name}
                    </Title>
                    <Text type="secondary" className="text-lg">
                      {product.description}
                    </Text>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text strong className="block text-gray-600">Product Code:</Text>
                      <Text code className="text-lg">{product.barcode || 'N/A'}</Text>
                    </div>
                    <div>
                      <Text strong className="block text-gray-600">Category:</Text>
                      <Text className="text-lg">{product.category}</Text>
                    </div>
                    <div>
                      <Text strong className="block text-gray-600">Price:</Text>
                      <Text className="text-xl font-bold text-blue-600">
                        LKR {(product.price || 0).toFixed(2)}
                      </Text>
                    </div>
                    <div>
                      <Text strong className="block text-gray-600">Stock Available:</Text>
                      <Text className="text-lg">{product.stock} units</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row> */}

            {/* Size Variations */}
            {/* {product.hasSizes && product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <Title level={4} className="mb-4 text-blue-600">
                  <Icon name="straighten" className="mr-2" />
                  Available Sizes
                </Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.sizes.map((size, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Text strong className="text-lg">{size.name}</Text>
                        <Text className="text-lg font-bold text-blue-600">LKR {size.price.toFixed(2)}</Text>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <Text type="secondary">Stock:</Text>
                          <Text>{size.stock} units</Text>
                        </div>
                        {size.dimensions && (
                          <div className="flex justify-between">
                            <Text type="secondary">Dimensions:</Text>
                            <Text>{size.dimensions.length}×{size.dimensions.width}×{size.dimensions.height} {size.dimensions.unit}</Text>
                          </div>
                        )}
                        {size.weight && (
                          <div className="flex justify-between">
                            <Text type="secondary">Weight:</Text>
                            <Text>{size.weight} kg</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}


            {/* Assembly Information */}
            {/* <div className="mb-8">
              <Title level={4} className="mb-4 text-blue-600">
                <Icon name="build" className="mr-2" />
                Assembly Information
              </Title>
              
              <Row gutter={16}>
                <Col span={12}>
                  <div className="border rounded-lg p-4">
                    <Text strong className="block mb-2">Assembly Required:</Text>
                    <Text>Yes - Detailed instructions included</Text>
                    
                    <Text strong className="block mb-2 mt-3">Estimated Time:</Text>
                    <Text>30-60 minutes</Text>
                    
                    <Text strong className="block mb-2 mt-3">Tools Required:</Text>
                    <Text>Phillips screwdriver, Allen wrench (included)</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="border rounded-lg p-4">
                    <Text strong className="block mb-2">Professional Assembly:</Text>
                    <Text>Available for additional LKR 5,000</Text>
                    
                    <Text strong className="block mb-2 mt-3">Delivery Options:</Text>
                    <Text>Standard delivery, White glove service</Text>
                    
                    <Text strong className="block mb-2 mt-3">Return Policy:</Text>
                    <Text>30-day return policy applies</Text>
                  </div>
                </Col>
              </Row>
            </div> */}

            {/* Barcode and Additional Info */}
            <div className=" pt-6">
              <Row gutter={32}>
                {/* <Col span={product.barcode && BarcodePresets.large(product.barcode) ? 12 : 24}>
                  <div>
                    <Text strong className="block mb-2">Additional Information:</Text>
                    <Text type="secondary">
                      For more details, assembly videos, and customer reviews,
                      {product.barcode && BarcodePresets.large(product.barcode) 
                        ? ' scan the barcode or visit our website.'
                        : ' visit our website at www.vcarefurniture.com'
                      }
                    </Text>

                    <div className="mt-4 space-y-1">
                      <Text type="secondary" className="block">
                        <Icon name="phone" className="mr-2" />
                        Customer Service: (555) 123-4567
                      </Text>
                      <Text type="secondary" className="block">
                        <Icon name="email" className="mr-2" />
                        Email: support@vcarefurniture.com
                      </Text>
                      <Text type="secondary" className="block">
                        <Icon name="schedule" className="mr-2" />
                        Hours: Mon-Sat 9AM-7PM, Sun 11AM-5PM
                      </Text>
                    </div>
                  </div>
                </Col> */}
                {product.barcode && BarcodePresets.large(product.barcode) && (
                  <Col span={12}>
                    <div className="text-center">
                      {(() => {
                        const barcodeData = BarcodePresets.large(product.barcode);
                        return (
                          <>
                            <div className="w-40 h-12 mx-auto flex items-center justify-center">
                              <img
                                src={barcodeData.dataUrl}
                                alt="Product Barcode"
                                className="max-w-full h-full object-contain"
                                style={{ width: barcodeData.width, height: barcodeData.height }}
                              />
                            </div>
                            <Text type="secondary" className="text-xs  block">
                              {barcodeData.value}
                            </Text>

                            {/* <div className="mt-4 text-center">
                              <Text type="secondary" className="text-xs">
                                Generated on: {new Date().toLocaleDateString()}
                              </Text>
                            </div> */}
                          </>
                        );
                      })()}
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* Footer */}
            {/* <div className="mt-8 pt-6 border-t text-center">
              <Text type="secondary" className="text-sm">
                {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName
                  ? JSON.parse(localStorage.getItem('vcare_branding')).businessName
                  : "VCare Furniture Store"} - Your trusted partner for premium furniture solutions
              </Text>
              <br />
              <Text type="secondary" className="text-sm">
                {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).address
                  ? JSON.parse(localStorage.getItem('vcare_branding')).address
                  : "123 Main Street, City, State 12345"} | 
                {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).website
                  ? JSON.parse(localStorage.getItem('vcare_branding')).website
                  : "www.vcarefurniture.com"}
              </Text>
            </div> */}
          </div>
        </div>
      </Modal>
    </>
  );
}