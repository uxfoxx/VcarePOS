/*
  # Rollback: Invoice Settings and Configuration

  This migration removes all invoice settings tables:
  - invoice_notes_templates
  - bank_account_details
  - invoice_settings
*/

-- Drop indexes
DROP INDEX IF EXISTS idx_invoice_notes_templates_is_default;
DROP INDEX IF EXISTS idx_bank_account_details_is_default;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS trigger_update_quotation_updated_at ON quotations;
DROP FUNCTION IF EXISTS update_quotation_updated_at();

-- Drop policies for invoice_notes_templates
DROP POLICY IF EXISTS "Admins can delete invoice notes templates" ON invoice_notes_templates;
DROP POLICY IF EXISTS "Admins can update invoice notes templates" ON invoice_notes_templates;
DROP POLICY IF EXISTS "Admins can insert invoice notes templates" ON invoice_notes_templates;
DROP POLICY IF EXISTS "Authenticated users can view invoice notes templates" ON invoice_notes_templates;

-- Drop policies for bank_account_details
DROP POLICY IF EXISTS "Admins can delete bank account details" ON bank_account_details;
DROP POLICY IF EXISTS "Admins can update bank account details" ON bank_account_details;
DROP POLICY IF EXISTS "Admins can insert bank account details" ON bank_account_details;
DROP POLICY IF EXISTS "Authenticated users can view bank account details" ON bank_account_details;

-- Drop policies for invoice_settings
DROP POLICY IF EXISTS "Admins can update invoice settings" ON invoice_settings;
DROP POLICY IF EXISTS "Admins can insert invoice settings" ON invoice_settings;
DROP POLICY IF EXISTS "Authenticated users can view invoice settings" ON invoice_settings;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS invoice_notes_templates CASCADE;
DROP TABLE IF EXISTS bank_account_details CASCADE;
DROP TABLE IF EXISTS invoice_settings CASCADE;
