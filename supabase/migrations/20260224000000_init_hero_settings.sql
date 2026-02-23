/*
  # initialize_hero_settings

  1. Description
    - Initializes the hero section settings in the site_settings table.
    - Adds hero_is_slider and hero_slides keys.

  2. Changes
    - Inserts default values for hero_is_slider and hero_slides IF NOT EXISTS.
*/

INSERT INTO site_settings (key, value, description)
VALUES 
('hero_is_slider', 'false', 'Enable/disable slider mode for the hero section'),
('hero_slides', '[]', 'JSON array of hero section slides')
ON CONFLICT (key) DO NOTHING;
