/**
 * Modules that are always visible and accessible to all authenticated users
 * regardless of database permissions.
 *
 * These modules bypass the permission system and are available to everyone
 * who is logged in. Use this for features that should be universally accessible.
 */
export const ALWAYS_ACCESSIBLE_MODULES = [
  'dashboard',
  'quotations',
  'ecommerce-orders'
];
