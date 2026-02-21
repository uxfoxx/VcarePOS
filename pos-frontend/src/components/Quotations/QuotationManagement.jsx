import { useState, useEffect } from 'react';
import { Form, Input, Card, DatePicker, InputNumber, Select, Table, message } from 'antd';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { ActionButton } from '../common/ActionButton';
import { QuotationPDF } from './QuotationPDF';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productsSlice';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { TextArea } = Input;
const { Option } = Select;

export function QuotationManagement() {
  const [form] = Form.useForm();
  const { productsList } = useSelector(state => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productsList]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quotationData, setQuotationData] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [_selectedColorData, setSelectedColorData] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const handleProductChange = (productId) => {
    const selectedProduct = productsList.find(p => p.id === productId);
    if (!selectedProduct) return;

    setSelectedProductData(selectedProduct);

    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
      setAvailableColors(selectedProduct.colors);
    } else {
      setAvailableColors([]);
    }

    setAvailableSizes([]);
    setSelectedColorData(null);

    form.setFieldsValue({
      unitPrice: selectedProduct.price || 0,
      productColor: undefined,
      productSize: undefined
    });
  };

  const handleColorChange = (colorId) => {
    if (!selectedProductData || !selectedProductData.colors) return;

    const selectedColor = selectedProductData.colors.find(c => c.id === colorId);
    if (!selectedColor) return;

    setSelectedColorData(selectedColor);

    if (selectedColor.sizes && selectedColor.sizes.length > 0) {
      setAvailableSizes(selectedColor.sizes);
    } else {
      setAvailableSizes([]);
    }

    form.setFieldsValue({
      productSize: undefined
    });
  };

  const handleAddProduct = () => {
    const product = form.getFieldValue('selectedProduct');
    const quantity = form.getFieldValue('quantity');
    const unitPrice = form.getFieldValue('unitPrice');

    if (!product || !quantity || !unitPrice) {
      message.warning('Please select a product and enter quantity and unit price');
      return;
    }

    const selectedProduct = productsList.find(p => p.id === product);
    if (!selectedProduct) return;

    const colorId = form.getFieldValue('productColor');
    const sizeId = form.getFieldValue('productSize');

    let colorName = '';
    let colorImage = '';
    let sizeName = '';

    if (colorId && selectedProduct.colors) {
      const color = selectedProduct.colors.find(c => c.id === colorId);
      if (color) {
        colorName = color.name;
        colorImage = color.image || '';

        if (sizeId && color.sizes) {
          const size = color.sizes.find(s => s.id === sizeId);
          if (size) {
            sizeName = size.name;
          }
        }
      }
    }

    const newProduct = {
      id: Date.now(),
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      productName: selectedProduct.name,
      quantity,
      unit_price: unitPrice,
      unitPrice,
      total_price: quantity * unitPrice,
      totalPrice: quantity * unitPrice,
      description: form.getFieldValue('productDescription') || '',
      selected_variant: colorName,
      selectedVariant: colorName,
      selected_size: sizeName,
      selectedSize: sizeName,
      color_image: colorImage,
      colorImage: colorImage
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    form.setFieldsValue({
      selectedProduct: undefined,
      quantity: 1,
      unitPrice: 0,
      productDescription: '',
      productColor: undefined,
      productSize: undefined
    });
    setSelectedProductData(null);
    setSelectedColorData(null);
    setAvailableColors([]);
    setAvailableSizes([]);
    message.success('Product added to quotation');
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    message.success('Product removed from quotation');
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = form.getFieldValue('discount') || 0;
    const tax = form.getFieldValue('tax') || 0;
    return subtotal - discount + tax;
  };

  const handleGenerateQuotation = () => {
    form.validateFields().then(values => {
      if (selectedProducts.length === 0) {
        message.warning('Please add at least one product to the quotation');
        return;
      }

      const quotation = {
        id: `QUO-${Date.now()}`,
        customer_name: values.customerName,
        customerName: values.customerName,
        customer_phone: values.customerPhone,
        customerPhone: values.customerPhone,
        customer_email: values.customerEmail,
        customerEmail: values.customerEmail,
        customer_address: values.customerAddress,
        customerAddress: values.customerAddress,
        items: selectedProducts,
        subtotal: calculateSubtotal(),
        discount: values.discount || 0,
        total_tax: values.tax || 0,
        totalTax: values.tax || 0,
        total: calculateTotal(),
        valid_until: values.validUntil ? values.validUntil.toISOString() : null,
        validUntil: values.validUntil ? values.validUntil.toISOString() : null,
        notes: values.notes || '',
        status: 'draft',
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setQuotationData(quotation);
      setShowPDF(true);
    }).catch(_error => {
      message.error('Please fill in all required fields');
    });
  };

  const handleClearForm = () => {
    form.resetFields();
    setSelectedProducts([]);
    message.success('Form cleared');
  };

  const generatePDF = async (action = 'view') => {
    setLoading(true);
    const element = document.getElementById('quotation-pdf-preview');
    if (!element) {
      setLoading(false);
      message.error('PDF content not found');
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Cache the image data to avoid regenerating it for each page
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);

      let heightLeft = imgHeight - pageHeight;

      // Only add new page if significant content remains (> 20mm)
      while (heightLeft > 20) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      if (action === 'download') {
        const filename = `quotation-${quotationData.id}.pdf`;
        pdf.save(filename);
        message.success('Quotation downloaded successfully');
      } else {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => generatePDF('download');
  const handleView = () => generatePDF('view');

  const handlePrint = () => {
    const printContainer = document.getElementById('quotation-pdf-preview');
    if (!printContainer) {
      console.error('Quotation print container not found');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    doc.write(`
      <html>
        <head>
          <title>Quotation - ${quotationData?.id || 'Preview'}</title>
          <style>
            @media print {
              body, html {
                margin: 0 !important;
                padding: 0 !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              .quotation-page {
                 page-break-after: always;
                 margin: 0 !important;
                 padding: 0 !important;
                 width: 210mm;
                 box-shadow: none !important;
              }
              .quotation-page:last-child {
                 page-break-after: auto;
              }
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="margin: 0; padding: 0; background-color: white;">
          ${printContainer.innerHTML}
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 1000);
  };

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <div className="flex items-start gap-3">
          {record.color_image && (
            <img
              src={record.color_image.startsWith('data:') ? record.color_image : `${import.meta.env.VITE_API_URL}${record.color_image}`}
              alt={record.selected_variant || 'Product'}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <div className="font-medium">{text}</div>
            {record.description && <div className="text-sm text-gray-500">{record.description}</div>}
            {(record.selected_variant || record.selected_size) && (
              <div className="text-xs text-gray-400 mt-1">
                {record.selected_variant && `Color: ${record.selected_variant}`}
                {record.selected_variant && record.selected_size && ' • '}
                {record.selected_size && `Size: ${record.selected_size}`}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      render: (price) => `LKR ${price.toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 120,
      render: (total) => `LKR ${total.toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <ActionButton
          size="small"
          icon="delete"
          danger
          onClick={() => handleRemoveProduct(record.id)}
        >
          Remove
        </ActionButton>
      )
    }
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Quotation Generator"
        subtitle="Create instant quotations without saving to database"
        icon="request_quote"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card title="Customer Information" className="shadow">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Customer Name"
                name="customerName"
                rules={[{ required: true, message: 'Please enter customer name' }]}
              >
                <Input placeholder="Enter customer name" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="customerPhone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="customerEmail"
              >
                <Input type="email" placeholder="Enter email address" />
              </Form.Item>

              <Form.Item
                label="Address"
                name="customerAddress"
              >
                <TextArea rows={3} placeholder="Enter customer address" />
              </Form.Item>
            </Form>
          </Card>

          {/* Quotation Details */}
          <Card title="Quotation Details" className="shadow">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Valid Until"
                name="validUntil"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="MM/DD/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                label="Discount (LKR)"
                name="discount"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="Enter discount amount"
                />
              </Form.Item>

              <Form.Item
                label="Tax (LKR)"
                name="tax"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="Enter tax amount"
                />
              </Form.Item>

              <Form.Item
                label="Notes"
                name="notes"
              >
                <TextArea rows={4} placeholder="Enter special terms or notes" />
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* Right Column - Products */}
        <div className="space-y-6">
          {/* Add Products */}
          <Card title="Add Products" className="shadow">
            <Form form={form} layout="vertical">
              <Form.Item label="Select Product" name="selectedProduct">
                <Select
                  showSearch
                  placeholder="Search and select product"
                  optionFilterProp="children"
                  onChange={handleProductChange}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {productsList.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name} - LKR {product.price}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Description" name="productDescription">
                <Input placeholder="Optional product description" />
              </Form.Item>

              {selectedProductData && availableColors.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Color/Variant"
                    name="productColor"
                    rules={[{ required: true, message: 'Please select a color' }]}
                  >
                    <Select
                      placeholder="Select color"
                      onChange={handleColorChange}
                      optionLabelProp="label"
                    >
                      {availableColors.map(color => (
                        <Option
                          key={color.id}
                          value={color.id}
                          label={color.name}
                        >
                          <div className="flex items-center gap-2">
                            {color.image && (
                              <img
                                src={color.image.startsWith('data:') ? color.image : `${import.meta.env.VITE_API_URL}${color.image}`}
                                alt={color.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span>{color.name}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Size"
                    name="productSize"
                    rules={[{ required: availableSizes.length > 0, message: 'Please select a size' }]}
                  >
                    <Select
                      placeholder="Select size"
                      disabled={availableSizes.length === 0}
                    >
                      {availableSizes.map(size => (
                        <Option key={size.id} value={size.id}>
                          {size.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  initialValue={1}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>

                <Form.Item
                  label="Unit Price (LKR)"
                  name="unitPrice"
                  initialValue={0}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                  />
                </Form.Item>
              </div>

              <ActionButton
                block
                icon="add"
                onClick={handleAddProduct}
              >
                Add Product to Quotation
              </ActionButton>
            </Form>
          </Card>

          {/* Summary */}
          <Card title="Quotation Summary" className="shadow">
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span className="font-medium">LKR {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Discount:</span>
                <span className="font-medium">LKR {(form.getFieldValue('discount') || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Tax:</span>
                <span className="font-medium">LKR {(form.getFieldValue('tax') || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span>LKR {calculateTotal().toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500">
                {selectedProducts.length} product(s) in quotation
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Products Table */}
      {selectedProducts.length > 0 && (
        <Card title="Selected Products" className="shadow mt-6">
          <Table
            columns={productColumns}
            dataSource={selectedProducts}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <ActionButton
          icon="clear"
          onClick={handleClearForm}
        >
          Clear Form
        </ActionButton>
        <ActionButton.Primary
          icon="request_quote"
          onClick={handleGenerateQuotation}
          disabled={selectedProducts.length === 0}
        >
          Generate Quotation
        </ActionButton.Primary>
      </div>

      {/* PDF Preview Modal */}
      {showPDF && (
        <>

          <div className="invoice-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={() => setShowPDF(false)}>
            <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-gray-100 shadow-2xl print:h-auto print:max-w-none print:rounded-none print:bg-white print:shadow-none overflow-hidden print:overflow-visible" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="request_quote" className="text-blue-600" />
                  <span>Quotation Preview</span>
                </h2>
                <div className="flex items-center space-x-3">
                  <ActionButton key="print" icon="print" onClick={handlePrint}>Print</ActionButton>
                  <ActionButton key="view" icon="visibility" onClick={handleView} loading={loading}>View PDF</ActionButton>
                  <ActionButton key="download" icon="download" onClick={handleDownload} loading={loading}>Download PDF</ActionButton>
                  <button onClick={() => setShowPDF(false)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
                <div id="quotation-pdf-preview" className="flex flex-col items-center gap-8 print:block print:gap-0 w-full">
                  {quotationData && <QuotationPDF quotation={quotationData} />}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
