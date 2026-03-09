import React from 'react';
import { Typography } from 'antd';
import {
    InvoiceHeader,
    InvoicePaymentSummary,
    InvoiceAccountDetails,
    InvoiceTermsAndConditions,
    InvoiceSignatureSection,
    InvoiceFooter
} from './SharedInvoiceComponents';

const { Text } = Typography;

// ─── Pagination constants ────────────────────────────────────────────────────
const FIRST_PAGE_ITEMS = 5;
const MIDDLE_PAGE_ITEMS = 9;
const LAST_PAGE_MAX = 4;

const paginateItems = (items) => {
    if (!items || items.length === 0) return [[]];
    if (items.length <= LAST_PAGE_MAX) return [[...items]];

    const pages = [];
    let remaining = [...items];

    // Page 1
    pages.push(remaining.splice(0, FIRST_PAGE_ITEMS));

    // Middle pages
    while (remaining.length > LAST_PAGE_MAX) {
        pages.push(remaining.splice(0, MIDDLE_PAGE_ITEMS));
    }

    // Last page
    if (remaining.length > 0) {
        pages.push([...remaining]);
    }

    return pages;
};

/**
 * DocumentTemplate component for standardized A4 documents (Invoices/Quotations)
 * @param {Object} props
 * @param {Object} props.data - The data object (Transaction, Quotation, or Ecommerce Order)
 * @param {string} props.type - 'invoice' | 'quotation' | 'ecommerceOrder'
 * @param {Object} props.config - Invoice configuration (settings, bankAccount, notesTemplate)
 * @param {string} props.id - Component ID for printing/PDF generation
 */
export const DocumentTemplate = ({ data, type = 'invoice', config, id }) => {
    if (!data || !config) return null;
    console.log("dats,sta", data)
    const isQuotation = type === 'quotation';
    const isEcommerce = type === 'ecommerceOrder';

    // Normalize data mapping
    const normalizedData = {
        documentId: data.id,
        date: isQuotation ? (data.created_at || data.createdAt) : (data.timestamp || data.createdAt),
        customerName: data.customerName || data.customer_name || 'Walk-in Customer',
        customerAddress: data.customerAddress || data.customer_address,
        customerEmail: data.customerEmail || data.customer_email,
        customerPhone: data.customerPhone || data.customer_phone,
        items: data.items || [],
        subtotal: isEcommerce ? (data.totalAmount - (data.deliveryCharge || 0)) : (data.subtotal || 0),
        discount: data.discount || 0,
        tax: data.totalTax || data.total_tax || 0,
        total: data.total || data.totalAmount || 0,
        deliveryCharge: data.deliveryCharge || 0,
        advancedPayment: data.advancedPayment || 0,
        balancePayment: data.balancePayment || 0,
        notes: data.notes || '',
        validUntil: data.validUntil || data.valid_until,
        status: data.status || data.orderStatus,
        paymentMethod: data.paymentMethod
    };


    const itemPages = paginateItems(normalizedData.items);
    const totalPages = itemPages.length;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div id={id} className="w-full">
            {itemPages.map((pageItems, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === totalPages - 1;

                return (
                    <div
                        key={pageIndex}
                        className="document-page"
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            width: '210mm',
                            height: '297mm',
                            boxSizing: 'border-box',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            pageBreakAfter: isLastPage ? 'auto' : 'always',
                            breakAfter: isLastPage ? 'auto' : 'page',
                            margin: '0 auto',
                            marginBottom: pageIndex < totalPages - 1 ? '10mm' : '0',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)' // Only visible in preview, hidden in print
                        }}
                    >
                        {/* Header Section */}
                        <div style={{
                            padding: '8mm 10mm 5mm 10mm',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 10
                        }}>
                            <InvoiceHeader
                                type={type}
                            />
                        </div>

                        {/* Content Section */}
                        <div style={{
                            position: 'absolute',
                            top: '38mm',
                            left: '10mm',
                            right: '10mm',
                            bottom: '20mm',
                            overflow: 'hidden'
                        }}>
                            {/* Customer and Document Details - First Page Only */}
                            {isFirstPage && (
                                <table style={{ width: '100%', marginBottom: '12px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '16px' }}>
                                                <div style={{ fontSize: '11px' }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                                                        {isQuotation ? 'Quotation To:' : 'Invoice To:'}
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>{normalizedData.customerName}</div>
                                                    {normalizedData.customerAddress && (
                                                        <div style={{ color: '#4b5563', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: '2px' }}>
                                                            {normalizedData.customerAddress}
                                                        </div>
                                                    )}
                                                    {normalizedData.customerEmail && (
                                                        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '2px' }}>
                                                            {normalizedData.customerEmail}
                                                        </div>
                                                    )}
                                                    {normalizedData.customerPhone && (
                                                        <div style={{ color: '#4b5563', fontSize: '11px' }}>
                                                            {normalizedData.customerPhone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '16px' }}>
                                                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ fontWeight: 'bold', paddingBottom: '4px', textAlign: 'left', verticalAlign: 'middle' }}>Date:</td>
                                                            <td style={{ paddingBottom: '4px', textAlign: 'right', verticalAlign: 'middle' }}>{formatDate(normalizedData.date)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ fontWeight: 'bold', textAlign: 'left', verticalAlign: 'middle' }}>No:</td>
                                                            <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    fontFamily: 'monospace',
                                                                    backgroundColor: '#f5f5f5',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '2px',
                                                                    border: '1px solid #d9d9d9',
                                                                    fontSize: '11px'
                                                                }}>
                                                                    {normalizedData.documentId}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {isQuotation && normalizedData.validUntil && (
                                                            <tr>
                                                                <td style={{ fontWeight: 'bold', textAlign: 'left', verticalAlign: 'middle' }}>Valid Until:</td>
                                                                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>{formatDate(normalizedData.validUntil)}</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td style={{ fontWeight: 'bold', textAlign: 'left', verticalAlign: 'middle' }}>Status:</td>
                                                            <td style={{ textAlign: 'right', textTransform: 'capitalize', verticalAlign: 'middle' }}>{normalizedData.status}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}

                            {/* Page indicator for multi-page */}
                            {totalPages > 1 && (
                                <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                                    <Text className="text-xs text-gray-500">
                                        Page {pageIndex + 1} of {totalPages}
                                    </Text>
                                </div>
                            )}

                            {/* Items Table */}
                            <div style={{ marginBottom: '10px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#2563eb' }}>
                                            <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '15%', fontSize: '10px', padding: '8px 4px' }}>ITEM CODE</th>
                                            <th style={{ textAlign: 'left', color: 'white', fontWeight: 'bold', width: '35%', fontSize: '10px', padding: '8px 4px' }}>DESCRIPTION</th>
                                            <th style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', width: '12%', fontSize: '10px', padding: '8px 4px' }}>QTY</th>
                                            <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '19%', fontSize: '10px', padding: '8px 4px' }}>RATE</th>
                                            <th style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', width: '19%', fontSize: '10px', padding: '8px 4px' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageItems.map((item, index) => {
                                            const unitPrice = item.unit_price || item.unitPrice || item.price || item.product?.price || 0;
                                            const totalPrice = item.total_price || item.totalPrice || (unitPrice * item.quantity);
                                            const itemCode = item.item_code || item.itemCode || item.product?.barcode || item.product?.sku || item.sku || `ITEM-${String(index + 1).padStart(3, '0')}`;
                                            const itemName = item.product_name || item.productName || item.name || item.product?.name;

                                            return (
                                                <tr key={index}>
                                                    <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                                        <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>{itemCode}</div>
                                                    </td>
                                                    <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{itemName}</div>
                                                            {(item.invoiceDescription || item.invoice_description || item.product?.invoiceDescription || item.description || item.product?.description) && (
                                                                <div
                                                                    style={{ color: '#4b5563', fontSize: '10px', marginTop: '2px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                                                                    dangerouslySetInnerHTML={{ __html: item.invoiceDescription || item.invoice_description || item.product?.invoiceDescription || item.description || item.product?.description }}
                                                                />
                                                            )}
                                                            {(item.selected_variant || item.selectedVariant || item.selected_size || item.selectedSize) && (
                                                                <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                                                                    {(item.selected_variant || item.selectedVariant) && `Color: ${item.selected_variant || item.selectedVariant}`}
                                                                    {(item.selected_variant || item.selectedVariant) && (item.selected_size || item.selectedSize) && ' • '}
                                                                    {(item.selected_size || item.selectedSize) && `Size: ${item.selected_size || item.selectedSize}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '11px' }}>{item.quantity}{item.unit ? ` ${item.unit}` : ' NOS'}</div>
                                                    </td>
                                                    <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                        <div style={{ fontSize: '11px' }}>
                                                            LKR {unitPrice.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '500' }}>
                                                        <div style={{ fontSize: '11px' }}>
                                                            LKR {totalPrice.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals, Bank Details, Terms, Signatures - Last Page Only */}
                            {isLastPage && (
                                <>
                                    <InvoicePaymentSummary
                                        subtotal={normalizedData.subtotal}
                                        discount={normalizedData.discount}
                                        grandTotal={normalizedData.total}
                                        deliveryCharge={normalizedData.deliveryCharge}
                                        advancedPayment={normalizedData.advancedPayment}
                                        balancePayment={normalizedData.balancePayment}
                                        tax={normalizedData.tax}
                                    />

                                    {/* Bank Details */}
                                    {!isQuotation && config.bankAccount && (
                                        <InvoiceAccountDetails bankAccount={config.bankAccount} />
                                    )}

                                    {/* Notes */}
                                    {!isQuotation && (normalizedData.notes || config.notesTemplate) && (
                                        <div style={{ marginTop: '12px' }}>
                                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>Note</h3>
                                            <div className="space-y-1">
                                                {normalizedData.notes && (
                                                    <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4' }}>
                                                        {normalizedData.notes}
                                                    </p>
                                                )}
                                                {!normalizedData.notes && config.notesTemplate && (
                                                    <>
                                                        {config.notesTemplate.warranty_terms && (
                                                            <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4' }}>
                                                                {config.notesTemplate.warranty_terms}
                                                            </p>
                                                        )}
                                                        {config.notesTemplate.quotation_validity && (
                                                            <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
                                                                {config.notesTemplate.quotation_validity}
                                                            </p>
                                                        )}
                                                        {config.notesTemplate.custom_notes && (
                                                            <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
                                                                {config.notesTemplate.custom_notes}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms and Conditions */}
                                    <InvoiceTermsAndConditions />

                                    {/* Signature Section */}
                                    <InvoiceSignatureSection />
                                </>
                            )}
                        </div>

                        {/* Footer Section */}
                        <InvoiceFooter settings={config.settings} />
                    </div>
                );
            })}
        </div>
    );
};
