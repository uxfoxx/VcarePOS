import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchActiveDeliveryCharges = async () => {
  const { data, error } = await supabase
    .from('delivery_charges')
    .select('*')
    .eq('is_active', true)
    .order('location_name');

  if (error) {
    console.error('Error fetching delivery charges:', error);
    throw error;
  }

  return data;
};
