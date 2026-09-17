/**
 * Central API utility for Agomoni.
 *
 * All fetch calls should use `apiUrl('/path')` so that in production the
 * correct backend host (VITE_API_URL) is used instead of the Vercel frontend
 * host, which does not serve the API.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Resolve an API path to a full URL.
 * @example apiUrl('/api/v1/music/playlists') → 'https://agomoni-api.onrender.com/api/v1/music/playlists'
 */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return `${BASE_URL}${path}`;
}

/**
 * Convenience wrapper around fetch that automatically prepends the API base URL.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
