import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const fetchFAQs = async () => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};

export const fetchTestimonials = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

export const fetchSiteSetting = async (key) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching site setting ${key}:`, error);
    return null;
  }
};

export const fetchAllSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;

    const settings = {};
    data?.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }
};

export const subscribeToNewsletter = async (email) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, is_active: true }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This email is already subscribed');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};
