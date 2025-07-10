import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Using mock data instead.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const fetchData = async (table, options = {}) => {
  try {
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return [];
  }
};

export const insertData = async (table, data) => {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    if (error) throw error;
    return result[0];
  } catch (error) {
    console.error(`Error inserting data into ${table}:`, error);
    throw error;
  }
};

export const updateData = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return result[0];
  } catch (error) {
    console.error(`Error updating data in ${table}:`, error);
    throw error;
  }
};

export const deleteData = async (table, id) => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting data from ${table}:`, error);
    throw error;
  }
};

export default supabase;