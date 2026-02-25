-- Update ecommerce_orders payment_method check constraint
ALTER TABLE ecommerce_orders DROP CONSTRAINT IF EXISTS ecommerce_orders_payment_method_check;

ALTER TABLE ecommerce_orders ADD CONSTRAINT ecommerce_orders_payment_method_check 
CHECK (payment_method IN ('cash_on_delivery', 'bank_transfer', 'store_pickup'));
