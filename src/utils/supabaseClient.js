/**
 * This file previously contained Supabase client configuration.
 * The application now uses a direct connection to PostgreSQL via the backend API.
 */

// Set supabase to null to ensure any accidental usage will fail explicitly
export const supabase = null;

// Helper functions for common operations
export const fetchData = async (table, options = {}) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const insertData = async (table, data) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const updateData = async (table, id, data) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export const deleteData = async (table, id) => {
  try {
    throw new Error(`Direct Supabase access is no longer supported. Please use the API endpoints instead.`);
  } catch (error) {
    console.error(`Error: Supabase is no longer used. Please use the API endpoints.`);
    throw error;
  }
};

export default supabase;