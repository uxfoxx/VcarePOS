/*
  # Rollback: Initial Database Schema

  This migration rolls back the initial database schema creation.

  IMPORTANT: This will drop all core tables and data.
  Only use this if you want to completely reset the database.
*/

-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS audit_trail CASCADE;
DROP TABLE IF EXISTS goods_receive_note_items CASCADE;
DROP TABLE IF EXISTS goods_receive_notes CASCADE;
DROP TABLE IF EXISTS purchase_order_timeline CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS taxes CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS refund_items CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_addons CASCADE;
DROP TABLE IF EXISTS product_raw_materials CASCADE;
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
