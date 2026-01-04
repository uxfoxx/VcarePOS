/*
  # Add Delivery and Notification Fields to E-commerce Orders

  1. Schema Changes
    - Add `delivery_location` column to `ecommerce_orders` table (VARCHAR(100), nullable)
      - Stores the selected delivery location/district name
    - Add `delivery_charge` column to `ecommerce_orders` table (DECIMAL(10, 2), default 0)
      - Stores the delivery charge amount for the order
    - Add `notified_at` column to `ecommerce_orders` table (TIMESTAMP, nullable)
      - Tracks when the order was marked as notified in the admin system

  2. Performance
    - Add index on `notified_at` column for efficient querying of unnotified orders

  3. Notes
    - All columns are added conditionally to prevent errors if they already exist
    - Existing orders will have NULL for delivery_location and notified_at
    - Existing orders will have 0 for delivery_charge
    - These fields support the delivery charges feature for e-commerce orders
*/

-- Add delivery_location column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_location'
  ) THEN
    ALTER TABLE ecommerce_orders ADD COLUMN delivery_location VARCHAR(100);
  END IF;
END $$;

-- Add delivery_charge column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE ecommerce_orders ADD COLUMN delivery_charge DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Add notified_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'notified_at'
  ) THEN
    ALTER TABLE ecommerce_orders ADD COLUMN notified_at TIMESTAMP;
  END IF;
END $$;

-- Create index on notified_at for efficient querying of unnotified orders
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_notified_at ON ecommerce_orders(notified_at);
