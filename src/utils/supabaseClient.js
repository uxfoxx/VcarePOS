/**
 * This file previously contained Supabase client configuration.
 * The application now uses a direct connection to PostgreSQL via the backend API.
 */

// Set supabase to null to ensure any accidental usage will fail explicitly
export const supabase = null;

// Helper functions for common operations
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