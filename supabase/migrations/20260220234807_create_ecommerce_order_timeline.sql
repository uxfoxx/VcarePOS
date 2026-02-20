-- Up Migration: create ecommerce order timeline tracking table
-- Description: Create ecommerce order timeline tracking table

CREATE TABLE IF NOT EXISTS ecommerce_order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
