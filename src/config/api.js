/**
 * TRACKIQ CENTRALIZED API CONFIGURATION & FETCH UTILITY
 * Standardizes backend API URL (Port 8011) across all frontend modules.
 */

const getDynamicApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8011`;
  }
  return 'http://127.0.0.1:8011';
};

export const API_BASE_URL = getDynamicApiBaseUrl();

/**
 * Standard fetch wrapper with automatic error handling, logging, and JSON parsing.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errDetail = '';
      try {
        const errJson = await response.json();
        errDetail = errJson.detail || errJson.error || JSON.stringify(errJson);
      } catch {
        errDetail = await response.text();
      }
      console.error(`[API Error] ${config.method || 'GET'} ${url} -> Status ${response.status}: ${errDetail}`);
      throw new Error(errDetail || `HTTP ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Network Error] ${config.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
}
