-- Add invoice_description column to products, transaction_items, and quotation_items
ALTER TABLE products ADD COLUMN IF NOT EXISTS invoice_description TEXT;
ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS invoice_description TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS invoice_description TEXT;
