export const InvoiceHeader = ({ businessName: _businessName, logoPreview: _logoPreview }) => (
  <div style={{ marginBottom: '10px' }}>
    <img
      src="/invoiceTop.png"
      alt="Business Logo"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block'
      }}
      crossOrigin="anonymous"
    />
  </div>
);

export const InvoiceDetails = ({ invoiceNumber, dateIssued }) => (
  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
    <tbody>
      <tr>
        <td style={{ fontWeight: 'bold', paddingBottom: '4px', textAlign: 'left', verticalAlign: 'middle' }}>Date Issued:</td>
        <td style={{ paddingBottom: '4px', textAlign: 'right', verticalAlign: 'middle' }}>{dateIssued}</td>
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
            {invoiceNumber}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
);

export const InvoiceCustomerSection = ({ customerName, customerAddress, customerEmail, customerPhone }) => (
  <div style={{ fontSize: '11px' }}>
    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>Invoice to:</div>
    <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>{customerName || 'Walk-in Customer'}</div>
    {customerAddress && <div style={{ color: '#4b5563', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: '2px' }}>{customerAddress}</div>}
    {customerEmail && <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '2px' }}>{customerEmail}</div>}
    {customerPhone && <div style={{ color: '#4b5563', fontSize: '11px' }}>{customerPhone}</div>}
  </div>
);

export const InvoiceItemsTable = ({ items, showImages: _showImages = false }) => (
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
        {items.map((item, index) => {
          const unitPrice = item.product?.price || item.unitPrice || item.price || 0;
          const itemCode = item.product?.barcode || item.product?.sku || item.itemCode || item.sku || `ITEM-${String(index + 1).padStart(3, '0')}`;
          return (
            <tr key={index}>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>{itemCode}</div>
              </td>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{item.name || item.product?.name || item.productName}</div>
                  {item.description && (
                    <div style={{ color: '#4b5563', whiteSpace: 'pre-wrap', fontSize: '10px', marginTop: '2px' }}>
                      {item.description}
                    </div>
                  )}
                  {(item.selectedVariant || item.selectedSize) && (
                    <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                      {item.selectedVariant && `Color: ${item.selectedVariant}`}
                      {item.selectedVariant && item.selectedSize && ' • '}
                      {item.selectedSize && `Size: ${item.selectedSize}`}
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
                  LKR {(unitPrice * item.quantity).toLocaleString('en-US', {
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
    <div style={{ marginTop: '16px' }}>
      <table style={{ width: '50%', marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb' }}>TOTAL</td>
            <td style={{ textAlign: 'right', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          {discount > 0 && (
            <tr>
              <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>DISCOUNT</td>
              <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          )}
          {deliveryCharge > 0 && (
            <tr>
              <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>DELIVERY CHARGE</td>
              <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                {deliveryCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>GRAND TOTAL</td>
            <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold', fontSize: '12px' }}>
              {calculatedGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          {advancedPayment > 0 && (
            <tr>
              <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>ADVANCED</td>
              <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                {advancedPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          )}
          {(advancedPayment > 0 || balancePayment > 0) && (
            <tr>
              <td style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold' }}>BALANCE PAYMENT</td>
              <td style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #374151', fontWeight: 'bold' }}>
                {calculatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const InvoiceAccountDetails = ({ bankAccount }) => {
  if (!bankAccount) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>Account Details</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: '11px', lineHeight: '1.8' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6b7280', paddingRight: '10px', whiteSpace: 'nowrap', fontWeight: '500' }}>Account Holder:</td>
            <td style={{ fontWeight: '600', color: '#111827' }}>{bankAccount.account_holder_name}</td>
          </tr>
          <tr>
            <td style={{ color: '#6b7280', paddingRight: '10px', whiteSpace: 'nowrap', fontWeight: '500' }}>Account No:</td>
            <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#111827', letterSpacing: '0.04em' }}>{bankAccount.account_number}</td>
          </tr>
          <tr>
            <td style={{ color: '#6b7280', paddingRight: '10px', whiteSpace: 'nowrap', fontWeight: '500' }}>Bank:</td>
            <td style={{ color: '#111827' }}>{bankAccount.bank_name}{bankAccount.branch_name ? ` — ${bankAccount.branch_name}` : ''}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const InvoiceNotes = ({ notesTemplate }) => {
  if (!notesTemplate) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>Note</h3>
      <div className="space-y-1">
        {notesTemplate.warranty_terms && (
          <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4' }}>
            {notesTemplate.warranty_terms}
          </p>
        )}
        {notesTemplate.quotation_validity && (
          <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
            {notesTemplate.quotation_validity}
          </p>
        )}
        {notesTemplate.custom_notes && (
          <p className="text-[10px] text-gray-700 m-0" style={{ lineHeight: '1.4', marginTop: '4px' }}>
            {notesTemplate.custom_notes}
          </p>
        )}
      </div>
    </div>
  );
};

export const InvoiceTermsAndConditions = () => {
  const terms = [
    "Payment is due within 30 days from the date of invoice unless otherwise agreed.",
    "All prices are in LKR and include applicable taxes unless stated otherwise.",
    "Delivery charges may apply and will be calculated based on location and order size.",
    "Products are covered by manufacturer warranty. Terms apply as per warranty card.",
    "Returns accepted within 7 days with original packaging and receipt.",
    "Custom orders and special requests are non-refundable once production begins.",
    "The company reserves the right to make changes without prior notice."
  ];

  return (
    <div style={{ marginTop: '12px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>Terms & Conditions</h3>
      <div style={{ color: '#374151', fontSize: '10px', lineHeight: '1.5' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {terms.map((term, i) => (
              <tr key={i}>
                <td style={{ verticalAlign: 'top', paddingRight: '4px', width: '12px' }}>{i + 1}.</td>
                <td style={{ verticalAlign: 'top', paddingBottom: '2px' }}>{term}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const InvoiceSignatureSection = () => {
  return (
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
  );
};

export const InvoiceFooter = ({ settings }) => {
  return (
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
                {settings?.business_address || ''}
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
                {settings?.phone_number || ''}
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
                {settings?.email_address || ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
