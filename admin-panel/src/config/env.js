/**
 * Centralized Application Environment Configuration
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derived server origin URL without '/api' suffix (useful for avatar uploads / static assets)
export const SERVER_ORIGIN =
  API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || SERVER_ORIGIN;

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
