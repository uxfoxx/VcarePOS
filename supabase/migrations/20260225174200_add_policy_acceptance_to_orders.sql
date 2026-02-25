-- Add policy acceptance columns to ecommerce_orders
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_policy_accepted BOOLEAN DEFAULT FALSE;
