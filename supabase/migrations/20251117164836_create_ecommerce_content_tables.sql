/*
  # Create E-commerce Content Tables

  ## Tables Created
  
  1. **faqs**
     - `id` (uuid, primary key)
     - `question` (text, required)
     - `answer` (text, required)
     - `category` (text, optional for grouping FAQs)
     - `order_index` (integer, for display ordering)
     - `is_active` (boolean, for showing/hiding)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
  
  2. **testimonials**
     - `id` (uuid, primary key)
     - `customer_name` (text, required)
     - `role` (text, e.g., "Interior Designer", "Homeowner")
     - `content` (text, the testimonial text)
     - `image_url` (text, customer photo URL)
     - `rating` (integer, 1-5 stars)
     - `is_featured` (boolean, for homepage display)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
  
  3. **site_settings**
     - `id` (uuid, primary key)
     - `key` (text, unique, e.g., "youtube_video_id", "about_us_text")
     - `value` (text, the setting value)
     - `description` (text, what this setting is for)
     - `updated_at` (timestamp)
  
  4. **newsletter_subscribers**
     - `id` (uuid, primary key)
     - `email` (text, unique, required)
     - `is_active` (boolean, for managing subscriptions)
     - `subscribed_at` (timestamp)
  
  ## Security
  - Enable RLS on all tables
  - Allow public read access to active content
  - Restrict write access to authenticated admin users only
*/

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  role text,
  content text NOT NULL,
  image_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_featured = true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, order_index, is_active) VALUES
  ('What is your shipping policy?', 'We offer free shipping on all orders. Standard delivery takes 5-7 business days. Express delivery options are available at checkout for faster service.', 'Shipping', 1, true),
  ('Do you offer assembly services?', 'Yes! We offer professional assembly services for an additional fee. Our experienced team will assemble your furniture and ensure everything is perfect.', 'Services', 2, true),
  ('What is your return policy?', 'We accept returns within 30 days of delivery. Items must be in original condition with all packaging. Please contact our customer service team to initiate a return.', 'Returns', 3, true),
  ('Do you offer custom furniture?', 'Absolutely! We specialize in custom furniture design. Contact our design team to discuss your specific requirements, and we''ll create something unique for your space.', 'Custom Orders', 4, true),
  ('What materials do you use?', 'We use only premium, sustainable materials including solid wood, high-quality fabrics, and eco-friendly finishes. All materials are carefully selected for durability and beauty.', 'Products', 5, true),
  ('How do I care for my furniture?', 'Each piece comes with specific care instructions. Generally, dust regularly with a soft cloth, avoid direct sunlight, and use coasters for drinks. For detailed care guides, visit our Care & Maintenance page.', 'Maintenance', 6, true);

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, role, content, image_url, rating, is_featured) VALUES
  ('Sarah Johnson', 'Interior Designer', 'The quality of VCare furniture is exceptional. I recommend them to all my clients. The attention to detail and craftsmanship is outstanding!', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', 5, true),
  ('Michael Chen', 'Homeowner', 'Best furniture purchase I''ve ever made! The delivery was smooth, assembly was easy, and the final product exceeded my expectations.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', 5, true),
  ('Emily Rodriguez', 'Office Manager', 'We furnished our entire office with VCare furniture. The modern designs and ergonomic features have really improved our workspace. Highly recommended!', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', 5, true),
  ('David Thompson', 'Restaurant Owner', 'VCare helped us create the perfect ambiance for our restaurant. Their commercial-grade furniture is both beautiful and durable.', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400', 5, true);

-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('youtube_video_id', 'dQw4w9WgXcQ', 'YouTube video ID for Our Story section'),
  ('about_us_title', 'Our Story', 'Title for the about us section'),
  ('about_us_subtitle', 'Crafting Beautiful Spaces Since 2010', 'Subtitle for about us section'),
  ('about_us_text', 'VCare Furniture began with a simple mission: to create beautiful, durable furniture that transforms houses into homes. Over a decade later, we''re proud to serve thousands of happy customers with our handcrafted pieces.', 'About us description text');