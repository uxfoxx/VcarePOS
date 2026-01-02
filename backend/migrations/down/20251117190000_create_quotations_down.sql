/*
  # Rollback: Create Quotations System

  This migration removes the quotations system including:
  - quotation_items table
  - quotations table
  - Related triggers and functions
*/

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_update_quotation_updated_at ON quotations;
DROP FUNCTION IF EXISTS update_quotation_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_quotation_items_product_id;
DROP INDEX IF EXISTS idx_quotation_items_quotation_id;
DROP INDEX IF EXISTS idx_quotations_created_at;
DROP INDEX IF EXISTS idx_quotations_created_by;
DROP INDEX IF EXISTS idx_quotations_valid_until;
DROP INDEX IF EXISTS idx_quotations_customer_phone;
DROP INDEX IF EXISTS idx_quotations_status;

-- Drop policies for quotation_items
DROP POLICY IF EXISTS "Admins can delete all quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can delete own draft quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Admins can update all quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can update own draft quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can insert own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Admins can view all quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can view own quotation items" ON quotation_items;

-- Drop policies for quotations
DROP POLICY IF EXISTS "Admins can delete all quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete own draft quotations" ON quotations;
DROP POLICY IF EXISTS "Admins can update all quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update own draft quotations" ON quotations;
DROP POLICY IF EXISTS "Users can create quotations" ON quotations;
DROP POLICY IF EXISTS "Admins can view all quotations" ON quotations;
DROP POLICY IF EXISTS "Users can view own quotations" ON quotations;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
