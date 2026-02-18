import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration for realtime subscriptions only.
 * Direct data access should still use the backend API.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client for realtime subscriptions
export const supabaseRealtime = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Keep supabase as null for backward compatibility (direct access not allowed)
export const supabase = null;

// Helper functions for common operations (still disabled)
export const fetchData = async (_table, _options = {}) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const insertData = async (_table, _data) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const updateData = async (_table, _id, _data) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const deleteData = async (_table, _id) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export default supabase;