import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { DocumentTemplate } from '../Invoices/DocumentTemplate';

// ─── Pagination constants ────────────────────────────────────────────────────
// Page 1: customer header consumes ~15mm vertical space
// Last page: summary (totals+bank+notes+T&C+signatures) needs ~130mm
// → last page can safely hold at most 4 item rows

const QuotationPDF = ({ quotation, id = 'quotation-pdf-content' }) => {

  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    fetchInvoiceConfig();
  }, []);

  const fetchInvoiceConfig = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/complete');
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

  if (!quotation) return null;

  return (
    <DocumentTemplate
      data={quotation}
      type="quotation"
      config={invoiceConfig}
      id={id}
    />
  );
}

export { QuotationPDF };
export default QuotationPDF;
