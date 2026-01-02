/*
  # Rollback: Create E-commerce Content Tables

  This migration removes all e-commerce content tables:
  - newsletter_subscribers
  - site_settings
  - testimonials
  - faqs
*/

-- Drop all policies first
DROP POLICY IF EXISTS "Authenticated users can manage subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;

DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can view featured testimonials" ON testimonials;

DROP POLICY IF EXISTS "Authenticated users can manage FAQs" ON faqs;
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON faqs;

-- Drop tables
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
