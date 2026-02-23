/*
  # Rollback: initialize_hero_settings

  This file rolls back the changes made in the up migration by removing the hero settings keys.
*/

DELETE FROM site_settings WHERE key IN ('hero_is_slider', 'hero_slides');
