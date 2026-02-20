/*
  # add_sound_played_at_to_ecommerce_orders

  1. Description
    - Adds the sound_played_at column to ecommerce_orders to track notification sounds natively and distinctly from overall visual notification presence.

  2. Changes
    - Add sound_played_at to ecommerce_orders table.
*/

ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS sound_played_at TIMESTAMPTZ DEFAULT NULL;
