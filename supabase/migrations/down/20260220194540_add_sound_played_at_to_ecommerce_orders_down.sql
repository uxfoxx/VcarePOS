/*
  # Rollback: add_sound_played_at_to_ecommerce_orders

  This file rolls back the changes made in the up migration.
*/

ALTER TABLE ecommerce_orders DROP COLUMN IF EXISTS sound_played_at;
