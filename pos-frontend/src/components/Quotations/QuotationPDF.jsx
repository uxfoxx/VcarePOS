import { Typography, Divider } from 'antd';
import apiClient from '../../api/apiClient';
import { useEffect } from 'react';
import { useState } from 'react';

const { Title, Text } = Typography;

// ─── Pagination constants ────────────────────────────────────────────────────
// Page 1: customer header consumes ~15mm vertical space
// Last page: summary (totals+bank+notes+T&C+signatures) needs ~130mm
// → last page can safely hold at most 4 item rows
const FIRST_PAGE_ITEMS = 5;   // page 1: customer header takes space
const MIDDLE_PAGE_ITEMS = 9;   // continuation pages: full-height
const LAST_PAGE_MAX = 4;   // last page: must leave room for summary

const paginateItems = (items) => {
  if (!items || items.length === 0) return [[]];

  // Tiny order: fits entirely on one page (items + summary)
  if (items.length <= LAST_PAGE_MAX) return [[...items]];

  const pages = [];
  let remaining = [...items];

  // Page 1
  pages.push(remaining.splice(0, FIRST_PAGE_ITEMS));

  // Middle pages — stop when remaining fits on a "last" page
  while (remaining.length > LAST_PAGE_MAX) {
    pages.push(remaining.splice(0, MIDDLE_PAGE_ITEMS));
  }

  // Last page: ≤ LAST_PAGE_MAX items + full summary section
  if (remaining.length > 0) {
    pages.push([...remaining]);
  }

  return pages;
};

// function QuotationPDF({ quotation, id = 'quotation-pdf-content' }) {
const QuotationPDF = ({ quotation, id = 'quotation-pdf-content' }) => {

  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    fetchInvoiceConfig();
  }, []);

  const fetchInvoiceConfig = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/complete');
      console.log("resss", response)
      setInvoiceConfig(response);
    } catch (error) {
      console.error('Error fetching invoice configuration:', error);
      setInvoiceConfig({
        settings: {
          business_name: '',
          business_address: '',
          phone_number: ''
        },
        bankAccount: null,
        notesTemplate: null
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  if (!quotation) return null;

  // Split items into pages of 10
  const itemPages = paginateItems(quotation.items || []);
  const totalPages = itemPages.length;

  return (
    <div id={id}>
      {itemPages.map((pageItems, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;

        return (
          <div
            key={pageIndex}
            className="quotation-page bg-white"
            style={{
              width: '210mm',
              height: '297mm',
              fontFamily: 'Arial, sans-serif',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              pageBreakAfter: isLastPage ? 'auto' : 'always',
              breakAfter: isLastPage ? 'auto' : 'page',
              margin: '0 auto',
              marginBottom: pageIndex < totalPages - 1 ? '10mm' : '0'
            }}
          >
            {/* Header */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <img
                src="/quotationTop.png"
                alt="Quotation Header"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Content Section */}
            <div style={{ position: 'absolute', top: '27mm', left: '10mm', right: '10mm', bottom: '20mm', overflow: 'hidden' }}>
              {/* Quotation Info - First Page Only */}
              {isFirstPage && (
                <>
                  <Divider style={{ marginTop: 0, marginBottom: '12px' }} />

                  <table style={{ width: '100%', marginBottom: '12px', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '50%' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>Quotation To:</div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{quotation.customer_name || quotation.customerName}</div>
                            {(quotation.customer_phone || quotation.customerPhone) && (
                              <div style={{ color: '#4b5563', fontSize: '11px' }}>{quotation.customer_phone || quotation.customerPhone}</div>
                            )}
                            {(quotation.customer_email || quotation.customerEmail) && (
                              <div style={{ color: '#4b5563', fontSize: '11px' }}>{quotation.customer_email || quotation.customerEmail}</div>
                            )}
                            {(quotation.customer_address || quotation.customerAddress) && (
                              <div style={{ color: '#4b5563', whiteSpace: 'pre-wrap', fontSize: '11px' }}>{quotation.customer_address || quotation.customerAddress}</div>
                            )}
                          </div>
                        </td>
                        <td style={{ verticalAlign: 'top', width: '50%' }}>
                          {/* <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px', textAlign: 'right' }}>Quotation Details:</div> */}
                          <table style={{ width: '100%', fontSize: '11px', lineHeight: '1.5', borderCollapse: 'collapse' }}>
                            <tbody>
                              <tr>
                                <td style={{ textAlign: 'right', paddingBottom: '4px', paddingRight: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Quotation No:</td>
                                <td style={{ textAlign: 'right', paddingBottom: '4px', verticalAlign: 'middle' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    fontFamily: 'monospace',
                                    backgroundColor: '#f5f5f5',
                                    padding: '2px 6px',
                                    borderRadius: '2px',
                                    border: '1px solid #d9d9d9',
                                    fontSize: '11px'
                                  }}>
                                    {quotation.id}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ textAlign: 'right', paddingRight: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Date:</td>
                                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>{formatDate(quotation.created_at || quotation.createdAt || new Date())}</td>
                              </tr>
                              {(quotation.valid_until || quotation.validUntil) && (
                                <tr>
                                  <td style={{ textAlign: 'right', paddingRight: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Valid Until:</td>
                                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>{formatDate(quotation.valid_until || quotation.validUntil)}</td>
                                </tr>
                              )}
                              <tr>
                                <td style={{ textAlign: 'right', paddingRight: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Status:</td>
                                <td style={{ textAlign: 'right', textTransform: 'capitalize', verticalAlign: 'middle' }}>{quotation.status}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}

              {/* Page indicator for multi-page */}
              {totalPages > 1 && (
                <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '10px', color: '#6b7280' }}>
                    Page {pageIndex + 1} of {totalPages}
                  </Text>
                </div>
              )}

              {/* Items Table */}
              <Title level={5} style={{ marginBottom: '8px', fontSize: '12px' }}>Quoted Items:</Title>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2563eb' }}>
                    <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '15%', fontSize: '10px', padding: '8px 4px' }}>ITEM CODE</th>
                    <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '35%', fontSize: '10px', padding: '8px 4px' }}>DESCRIPTION</th>
                    <th style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', width: '10%', fontSize: '10px', padding: '8px 4px' }}>QTY</th>
                    <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '20%', fontSize: '10px', padding: '8px 4px' }}>UNIT PRICE</th>
                    <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '20%', fontSize: '10px', padding: '8px 4px' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems && pageItems.map((item, index) => {
                    const itemCode = item.item_code || item.itemCode || item.sku || `ITEM-${String(index + 1).padStart(3, '0')}`;
                    return (
                      <tr key={index}>
                        <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                          <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>{itemCode}</div>
                        </td>
                        <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{item.product_name || item.productName}</div>
                          {item.description && (
                            <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '2px' }}>{item.description}</div>
                          )}
                          {(item.selected_variant || item.selectedVariant || item.selected_size || item.selectedSize) && (
                            <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                              {(item.selected_variant || item.selectedVariant) && `Color: ${item.selected_variant || item.selectedVariant}`}
                              {(item.selected_variant || item.selectedVariant) && (item.selected_size || item.selectedSize) && ' • '}
                              {(item.selected_size || item.selectedSize) && `Size: ${item.selected_size || item.selectedSize}`}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px' }}>{item.quantity}</div>
                        </td>
                        <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                          <div style={{ fontSize: '11px' }}>LKR {(item.unit_price || item.unitPrice || 0).toFixed(2)}</div>
                        </td>
                        <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '500' }}>
                          <div style={{ fontSize: '11px' }}>LKR {(item.total_price || item.totalPrice || 0).toFixed(2)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals, Bank Details, Terms, Signatures - Last Page Only */}
              {isLastPage && (
                <>
                  {/* Totals Summary */}
                  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <table style={{ width: '50%', marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'left', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb' }}>SUBTOTAL</td>
                          <td style={{ textAlign: 'right', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                            LKR {(quotation.subtotal || 0).toFixed(2)}
                          </td>
                        </tr>
                        {quotation.discount > 0 && (
                          <tr>
                            <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>DISCOUNT</td>
                            <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                              LKR {(quotation.discount || 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                        {quotation.total_tax > 0 && (
                          <tr>
                            <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>TAX</td>
                            <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                              LKR {(quotation.total_tax || quotation.totalTax || 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>TOTAL AMOUNT</td>
                          <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>
                            LKR {(quotation.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {quotation.notes && (
                    <div style={{ marginBottom: '8px' }}>
                      <Title level={5} style={{ marginBottom: '4px', fontSize: '12px' }}>Notes:</Title>
                      <div className="bg-gray-50 p-2 rounded border">
                        <Text style={{ fontSize: '10px', lineHeight: '1.4' }}>{quotation.notes}</Text>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>Terms & Conditions</h3>
                    <div className="text-gray-600" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                      <ol className="list-decimal pl-4 space-y-1" style={{ margin: 0, fontSize: '10px', color: '#4b5563' }}>
                        <li >This quotation is valid until the date specified above.</li>
                        <li>Prices are in LKR and may be subject to change without notice.</li>
                        <li>Payment terms will be discussed upon order confirmation.</li>
                        <li>Delivery timelines will be confirmed after order placement.</li>
                        <li>This quotation does not constitute a binding contract until order confirmation.</li>
                        <li>Products are covered by manufacturer warranty as per warranty card.</li>
                        <li>Custom orders are non-refundable once production begins.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '45%', verticalAlign: 'top' }}>
                            <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>Signature:</span>
                            </div>
                            <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
                              <tbody>
                                <tr>
                                  <td style={{ borderBottom: '1px solid #333' }}></td>
                                  <td style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#4b5563', padding: '0 4px', verticalAlign: 'bottom' }}>Date:</td>
                                  <td style={{ width: '80px', borderBottom: '1px solid #333' }}></td>
                                </tr>
                              </tbody>
                            </table>
                            <div style={{ fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>Received By</div>
                          </td>
                          <td style={{ width: '10%' }}></td>
                          <td style={{ width: '45%', verticalAlign: 'top' }}>
                            <div style={{ borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>Signature:</span>
                            </div>
                            <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
                              <tbody>
                                <tr>
                                  <td style={{ borderBottom: '1px solid #333' }}></td>
                                  <td style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#4b5563', padding: '0 4px', verticalAlign: 'bottom' }}>Date:</td>
                                  <td style={{ width: '80px', borderBottom: '1px solid #333' }}></td>
                                </tr>
                              </tbody>
                            </table>
                            <div style={{ fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>Checked By</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  padding: '12px 0',
                  textAlign: 'center'
                }}
              >
                <table style={{ display: 'inline-table', borderCollapse: 'collapse', marginRight: '32px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, paddingRight: '6px', verticalAlign: 'middle' }}>
                        <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ display: 'block' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </td>
                      <td style={{ padding: 0, verticalAlign: 'middle', color: 'white', fontSize: '11px', fontWeight: '500', lineHeight: '1' }}>
                        {invoiceConfig?.settings?.business_address || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ display: 'inline-table', borderCollapse: 'collapse', marginRight: '32px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, paddingRight: '6px', verticalAlign: 'middle' }}>
                        <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ display: 'block' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </td>
                      <td style={{ padding: 0, verticalAlign: 'middle', color: 'white', fontSize: '12px', fontWeight: '500', lineHeight: '1' }}>
                        {invoiceConfig?.settings?.phone_number || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ display: 'inline-table', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, paddingRight: '6px', verticalAlign: 'middle' }}>
                        <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ display: 'block' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </td>
                      <td style={{ padding: 0, verticalAlign: 'middle', color: 'white', fontSize: '12px', fontWeight: '500', lineHeight: '1' }}>
                        {invoiceConfig?.settings?.email_address || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { QuotationPDF };
export default QuotationPDF;
